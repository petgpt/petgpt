import {app, BrowserWindow, shell, ipcMain, globalShortcut, Tray, Menu} from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'

import {SET_MAIN_WINDOW_POS} from "../../src/utils/events/constants";// 不知道为啥

ipcMain.on(SET_MAIN_WINDOW_POS, (evt, pos) => {
  const window = BrowserWindow.getFocusedWindow()
  window.setBounds(pos)
})


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

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
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
      label: '帮助',
      click: function () {
      }
    },
    {
      label: '关于',
      click: function () {
      }
    },
    {
      label: '退出',
      click: function () {
        app.quit();
        app.quit();//因为程序设定关闭为最小化，所以调用两次关闭，防止最大化时一次不能关闭的情况
      }
    }]);
  let tray = new Tray(join(process.env.PUBLIC, 'favicon.ico'))
  tray.setContextMenu(contextMenu)
  tray.setToolTip('PetGpt')
  tray.setTitle('PetGpt')

  tray.on('click',function(){
    win.show();
  })
  //右键
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu);
  });


  win = new BrowserWindow({
    title: 'Main window',
    skipTaskbar: true,
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    height: 170,
    width: 200,
    useContentSize: true,
    alwaysOnTop: true,
    fullscreenable: false, // 是否允许全屏
    center: true, // 是否出现在屏幕居中的位置
    backgroundColor: '#00000000', // 背景色，用于transparent和frameless窗口
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
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  win.webContents.closeDevTools() // dev的时候默认会打开控制台，这里关闭控制台

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(() => {
  createWindow()
  globalShortcut.register('CommandOrControl+d', () => {
    console.log('CommandOrControl+d is pressed')
  })
  console.log(globalShortcut.isRegistered('CommandOrControl+d'));
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
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

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
