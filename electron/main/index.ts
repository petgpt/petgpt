import {app, BrowserWindow, globalShortcut} from 'electron'
import {release} from 'node:os'
import {join} from 'node:path'
import ipcList from './event/index'
import windowManger from "./window/windowManger";
import {DBList, IWindowList} from "./types/enum";
import {Main_Window_Height, Main_Window_Width} from "../../src/utils/events/constants";
import dbMap from "./data/db";
import config from '../main/data/config'
import PluginLoader from "./plugin/PluginLoader";
import {PetExpose} from "./plugin/share/types";
import {EventEmitter} from "events";
// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

class LifeCycle {
  private pluginLoader: PluginLoader;
  private emitter: EventEmitter;
  private ctx: PetExpose;
  private async beforeReady () {
    ipcList.listen()
  }

  private onReady () {
    app.whenReady().then(() => {
      config.setConfig()

      // ------------ plugin 测试 ------------
      this.emitter = new EventEmitter()
      this.ctx = {
        db: dbMap.get(DBList.Config_DB),
        baseDir: app.getPath('userData'), // 指定C:\\Users\\15275\\AppData\\Roaming\\petgpt
        emitter: this.emitter
      };
      this.pluginLoader = new PluginLoader(this.ctx);
      setTimeout(() => this.ctx.emitter.emit("eventFromElectron", 'data from electron main!!!!'), 1000)
      this.ctx.emitter.once('eventFromPlugin', (data) => console.log(`[electron main] ${data}`))

      this.pluginLoader.load()
      let fullList = this.pluginLoader.getFullList();
      fullList.forEach(async (pluginName) => {
        let plugin = await this.pluginLoader.getPlugin(pluginName);
        console.log(`pluginName: `, pluginName, ` plugin: `, plugin)
        // plugin.config();
        // plugin.handle(DataType.Image).then(res => console.log(`handle res: `, res))
        // await plugin.stop()
      });
      // ------------ plugin 测试 ------------

      windowManger.create(IWindowList.PET_WINDOW)
      globalShortcut.register('Control+shift+c', () => {
        if (windowManger.has(IWindowList.PET_WINDOW)) {
          let petWindow = windowManger.get(IWindowList.PET_WINDOW);
          let isDevToolsOpen = petWindow.webContents.isDevToolsOpened();
          if (isDevToolsOpen) {
            petWindow.webContents.closeDevTools();
            petWindow.setSize(dbMap.get(DBList.Config_DB).get(Main_Window_Width), dbMap.get(DBList.Config_DB).get(Main_Window_Height))
          } else {
            petWindow.webContents.openDevTools()
            petWindow.setSize(800, 600)
            petWindow.center();
          }
        }
      })
      console.log(globalShortcut.isRegistered('CommandOrControl+d'));
    })
  }

  private onRunning () {
    // Disable GPU Acceleration for Windows 7
    if (release().startsWith('6.1')) app.disableHardwareAcceleration()

    // Set application name for Windows 10+ notifications
    if (process.platform === 'win32') app.setAppUserModelId(app.getName())

    // 检查窗口是否已经存在，如果存在则将焦点聚焦在现有窗口上，而不是创建一个新的窗口。如果窗口已被最小化，则调用 restore() 方法将其还原
    app.on('second-instance', () => {
      if (windowManger.has(IWindowList.PET_WINDOW)) {
        let petWindow = windowManger.get(IWindowList.PET_WINDOW);
        // Focus on the main window if the user tried to open another
        if (petWindow.isMinimized()) petWindow.restore()
        petWindow.focus()
      }
    })
    app.on('activate', () => {
      const allWindows = BrowserWindow.getAllWindows()
      if (allWindows.length) {
        allWindows[0].focus()
      } else {
        if (!windowManger.has(IWindowList.PET_WINDOW)) {
          windowManger.create(IWindowList.PET_WINDOW);
        }
      }
    })
  }

  private onQuit () {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit()
    })
    app.on('will-quit', () => {
      globalShortcut.unregisterAll()
    })
  }


  async launchApp () {
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

lifeCycle.launchApp();
