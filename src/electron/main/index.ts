import { app, BrowserWindow, dialog, globalShortcut, Menu, Tray } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import ipcList from './event/index'
import pluginIPC from './event/pluginIPC'
import windowManger from './window/windowManger'
import WindowManger from './window/windowManger'
import { DBList, IWindowList } from '../../common/enum'
import { Main_Window_Height, Main_Window_Width } from '../../common/constants'
import dbMap from './data/db'
import config from '../main/data/config'
import PluginLoader from './plugin/PluginLoader'
import { PetExpose } from './plugin/share/types'
import { EventEmitter } from 'events'
import logger from './utils/logger'
import pkg from '../../../package.json'

process.env.DIST_ELECTRON = join(__dirname, '../')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, '../public') : process.env.DIST

let canQuitNow = false
class LifeCycle {
	// @ts-ignore
	private pluginLoader: PluginLoader
	// @ts-ignore
	private emitter: EventEmitter
	// @ts-ignore
	private ctx: PetExpose
	private async beforeReady() {
		ipcList.listen()

		this.emitter = new EventEmitter()
		this.ctx = {
			db: dbMap.get(DBList.Config_DB)!,
			baseDir: app.getPath('userData'), // 指定C:\\Users\\15275\\AppData\\Roaming\\petgpt
			emitter: this.emitter,
			logger: logger,
		}
		this.pluginLoader = new PluginLoader(this.ctx)
		this.pluginLoader.load() // 加载本地的插件
	}
	public getPluginLoader() {
		return this.pluginLoader
	}

	public getEmitter() {
		return this.emitter
	}

	public getCtx() {
		return this.ctx
	}

	private onReady() {
		// 闪烁问题：
		// https://github.com/electron/electron/issues/12130#issuecomment-627198990
		app.commandLine.appendSwitch('wm-window-animations-disabled')

		app.whenReady().then(() => {
			config.setConfig()

			if (dbMap?.get(DBList.Config_DB)?.get('openPetOnReady')) windowManger.create(IWindowList.PET_WINDOW)
			const contextMenu = Menu.buildFromTemplate([
				{
					label: '重启应用',
					click: function () {
						app.relaunch()
						app.exit(0)
					},
				},
				{
					label: '设置',
					click: function () {
						WindowManger.get(IWindowList.PET_SETTING_WINDOW)?.show()
					},
				},
				{
					label: 'chat',
					click: function () {
						WindowManger.get(IWindowList.PET_CHAT_WINDOW)?.show()
					},
				},
				{
					label: '启动时打开pet',
					type: 'checkbox',
					checked: dbMap?.get(DBList.Config_DB)?.get('openPetOnReady'),
					click: function () {
						let openPetOnReady = dbMap?.get(DBList.Config_DB)?.get('openPetOnReady')
						dbMap?.get(DBList.Config_DB)?.set('openPetOnReady', !openPetOnReady)
					},
				},
				{
					label: '关于',
					click: function () {
						dialog.showMessageBox({
							title: 'PetGpt',
							message: 'PetGpt',
							detail: `Version: ${pkg.version}\nAuthor: PetGpt\nGithub: https://github.com/petgpt/petgpt/tree/vite-vue3-ts`,
						})
					},
				},
				{
					label: '退出',
					click: function () {
						canQuitNow = true
						app.quit()
						app.quit() //因为程序设定关闭为最小化, 所以调用两次关闭, 防止最大化时一次不能关闭的情况
					},
				},
			])

			let tray = new Tray(join(process.env.PUBLIC!, process.platform == 'darwin' ? 'favicon.png' : 'favicon.ico'))
			tray.setContextMenu(contextMenu)
			tray.setToolTip('PetGpt')
			tray.setTitle('PetGpt')

			tray.on('click', function () {
				windowManger.get(IWindowList.PET_WINDOW)?.show()
			})
			//右键
			tray.on('right-click', () => {
				tray.popUpContextMenu(contextMenu)
			})

			// windowManger.get(IWindowList.PET_CHAT_WINDOW)
			globalShortcut.register('Control+shift+c', () => {
				if (windowManger.has(IWindowList.PET_WINDOW)) {
					let petWindow = windowManger.get(IWindowList.PET_WINDOW)
					let isDevToolsOpen = petWindow?.webContents.isDevToolsOpened()
					if (isDevToolsOpen) {
						petWindow?.webContents.closeDevTools()
						petWindow?.setSize(
							dbMap?.get(DBList.Config_DB)?.get(Main_Window_Width),
							dbMap?.get(DBList.Config_DB)?.get(Main_Window_Height)
						)
					} else {
						petWindow?.webContents.openDevTools()
						petWindow?.setSize(800, 600)
						petWindow?.center()
					}
				}
			})

			globalShortcut.register('alt+c', () => {
				let browserWindow = windowManger.get(IWindowList.PET_CHAT_WINDOW)
				if (windowManger.has(IWindowList.PET_CHAT_WINDOW) && browserWindow?.isFocused()) {
					browserWindow?.hide()
					logger.debug(`hide`)
				} else {
					logger.debug(`show`)
					browserWindow?.show()
					browserWindow?.webContents.send('show')
					if (process.env.VITE_DEV_SERVER_URL) {
						browserWindow?.webContents.openDevTools()
					}
				}
			})
			globalShortcut.register('alt+x', () => {
				let chatWindow = windowManger.get(IWindowList.PET_CHAT_WINDOW)
				chatWindow?.webContents.send('clear')
			})
		})
		pluginIPC.listen(this.pluginLoader, this.ctx)
	}

	private onRunning() {
		// Disable GPU Acceleration for Windows 7
		if (release().startsWith('6.1')) app.disableHardwareAcceleration()

		// Set application name for Windows 10+ notifications
		if (process.platform === 'win32') app.setAppUserModelId(app.getName())

		// 检查窗口是否已经存在，如果存在则将焦点聚焦在现有窗口上，而不是创建一个新的窗口。如果窗口已被最小化，则调用 restore() 方法将其还原
		app.on('second-instance', () => {
			if (windowManger.has(IWindowList.PET_WINDOW)) {
				let petWindow = windowManger.get(IWindowList.PET_WINDOW)
				// Focus on the main window if the user tried to open another
				if (petWindow?.isMinimized()) petWindow.restore()
				petWindow?.focus()
			}
		})
		app.on('activate', () => {
			const allWindows = BrowserWindow.getAllWindows()
			if (allWindows.length) {
				allWindows[0].focus()
			} else {
				if (!windowManger.has(IWindowList.PET_WINDOW)) {
					windowManger.create(IWindowList.PET_WINDOW)
				}
			}
		})
	}

	private onQuit() {
		app.on('window-all-closed', (e: Electron.Event) => {
			if (process.platform !== 'darwin') {
				if (!canQuitNow) {
					e.preventDefault()
				} else {
					app.quit()
				}
			}
		})
		app.on('will-quit', e => {
			if (!canQuitNow) {
				e.preventDefault()
			} else {
				globalShortcut.unregisterAll()
				app.quit()
			}
		})
	}

	async launchApp() {
		const gotTheLock = app.requestSingleInstanceLock()
		if (!gotTheLock) {
			app.quit()
			process.exit(0)
		} else {
			await this.beforeReady()
			this.onReady()
			this.onRunning()
			this.onQuit()
		}
	}
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const lifeCycle = new LifeCycle()

lifeCycle.launchApp()

export default lifeCycle
