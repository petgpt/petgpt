import windowList from './windowList'
import { BrowserWindow } from 'electron'
import { IWindowList } from '../../../common/enum'

class WindowManager implements IWindowManager {
	private windowMap: Map<IWindowList | string, BrowserWindow> = new Map()
	private windowIdMap: Map<number, IWindowList | string> = new Map()

	create(name: IWindowList) {
		const windowConfig: IWindowListItem = windowList.get(name)!
		if (windowConfig.isValid) {
			if (!windowConfig.multiple) {
				if (this.has(name)) return this.windowMap.get(name)!
			}
			const window = new BrowserWindow(windowConfig.options())
			const id = window.id
			if (windowConfig.multiple) {
				this.windowMap.set(`${name}_${window.id}`, window)
				this.windowIdMap.set(window.id, `${name}_${window.id}`)
			} else {
				this.windowMap.set(name, window)
				this.windowIdMap.set(window.id, name)
			}
			windowConfig.callback(window, this)
			windowConfig.listen(window, this) // 如果监听鼠标左键点击事件放到这里的listen里，又因为没有调用DetailWindow的create，所以没有listen，所以就无法监听左键单击。总结：这里面listen的监听依赖先create window// TODO: refactor
			window.on('close', () => {
				this.deleteById(id)
			})
			return window
		} else {
			return null
		}
	}

	get(name: IWindowList) {
		if (this.has(name)) {
			return this.windowMap.get(name)!
		} else {
			const window = this.create(name)
			return window
		}
	}

	has(name: IWindowList) {
		return this.windowMap.has(name)
	}

	deleteById = (id: number) => {
		const name = this.windowIdMap.get(id)
		if (name) {
			this.windowMap.delete(name)
			this.windowIdMap.delete(id)
		}
	}

	getAvailableWindow() {
		const petWindow = this.windowMap.get(IWindowList.PET_WINDOW)
		if (petWindow && petWindow.isVisible()) {
			return petWindow
		} else {
			// const settingWindow = this.windowMap.get(IWindowList.SETTING_WINDOW)
			// const trayWindow = this.windowMap.get(IWindowList.TRAY_WINDOW)
			// return settingWindow || trayWindow || this.create(IWindowList.SETTING_WINDOW)!
			return null
		}
	}
}

export default new WindowManager()
