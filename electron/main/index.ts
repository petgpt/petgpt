import {app, BrowserWindow, shell, ipcMain, globalShortcut, Tray, Menu, dialog, IpcMainEvent} from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import pkg from '../../package.json'
import ipcList from './event/index'

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

/**
 * Check OS type
 * Possible os: 'aix' | 'android' | 'darwin' | 'freebsd' | 'haiku' | 'linux' | 'openbsd' | 'sunos' | 'win32' | 'cygwin' | 'netbsd';
 */
const os = process.platform

/**
 * Determin icon file
 * Using different icon format because macOS version vite don't support `ico` format
 * currently use `png` for macOS.
 */
const iconFile =
  os == 'darwin' ? 'favicon.png' :
  os == 'win32'  ? 'favicon.ico' :
  /* else */       'favicon.ico' ;

class LifeCycle {
  private async beforeReady () {
    ipcList.listen()
  }

  private onReady () {
    app.whenReady().then(() => {
      createWindow()
      globalShortcut.register('Control+shift+c', () => openMainWindowDevTool())
      console.log(globalShortcut.isRegistered('CommandOrControl+d'));
    })
  }

  private onRunning () {
    // Disable GPU Acceleration for Windows 7
    if (release().startsWith('6.1')) app.disableHardwareAcceleration()

    // Set application name for Windows 10+ notifications
    if (process.platform === 'win32') app.setAppUserModelId(app.getName())

    app.on('second-instance', () => {
      if (petWindow) {
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
        createWindow()
      }
    })
  }

  private onQuit () {
    app.on('window-all-closed', () => {
      petWindow = null
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

let petWindow: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '设置',
      click: function () {

      } //打开相应页面
    },
    {
      label: '切换皮肤',
      click: function () {

      }
    },
    {
      label: '关于',
      click: function () {
        dialog.showMessageBox({
          title: 'PetGpt',
          message: 'PetGpt',
          detail: `Version: ${pkg.version}\nAuthor: PetGpt\\nGithub: https://github.com/petgpt/petgpt/tree/vite-vue3-ts`
        })
      }
    },
    {
      label: '退出',
      click: function () {
        app.quit();
        app.quit();//因为程序设定关闭为最小化, 所以调用两次关闭, 防止最大化时一次不能关闭的情况
      }
    }]);
  let tray = new Tray(join(process.env.PUBLIC, iconFile))
  tray.setContextMenu(contextMenu)
  tray.setToolTip('PetGpt')
  tray.setTitle('PetGpt')

  tray.on('click',function(){
    petWindow.show();
  })
  //右键
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu);
  });


  petWindow = new BrowserWindow({
    title: 'Main window',
    skipTaskbar: true,
    icon: join(process.env.PUBLIC, iconFile),
    width: 220,
    height: 220,
    useContentSize: true,
    alwaysOnTop: true,
    fullscreenable: false, // 是否允许全屏
    center: true, // 是否出现在屏幕居中的位置
    backgroundColor: '#00000000', // 背景色, 用于transparent和frameless窗口
    frame: false, // 是否创建frameless窗口
    transparent: true, // 是否是透明窗口（仅macOS）
    // titleBarStyle: 'hidden',
    vibrancy: 'ultra-dark', // 窗口模糊的样式（仅macOS）
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    petWindow.loadURL(url)
    // Open devTool if the app is not packaged
    // petWindow.webContents.openDevTools() // dev的时候默认会打开控制台，可以用closeDevTools关闭
  } else {
    petWindow.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  petWindow.webContents.on('did-finish-load', () => {
    petWindow?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  petWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // petWindow.webContents.on('will-navigate', (event, url) => { }) #344
  // console.log(`petWindow.webContents.id: `, petWindow.webContents.id)

  // 监听渲染进程的消息，要发往petWindow，通过这样的方式来。试过mitt/pinia/sendTo都不行。这样是可以的！！！！// TODO: refactor
  ipcMain.on('changeImage', (event: IpcMainEvent, args) => {
    console.log(`main receive changeImage, args:`, args)
    event.sender.send('changeImage-replay', args)
    petWindow.webContents.send('changeImage-replay', args)
  })
}

function openMainWindowDevTool() {
  if (petWindow) {
    let isDevToolsOpen = petWindow.webContents.isDevToolsOpened();
    if (isDevToolsOpen) {
      petWindow.webContents.closeDevTools();
      petWindow.setSize(220, 220)
    } else {
      petWindow.webContents.openDevTools()
      petWindow.setSize(800, 600)
      petWindow.center();
    }
  }
}

const lifeCycle = new LifeCycle()

lifeCycle.launchApp();
