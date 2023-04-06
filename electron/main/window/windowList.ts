import {join} from "node:path";
import {app, BrowserWindow, dialog, ipcMain, IpcMainEvent, Menu, screen, Tray} from "electron";
import {IWindowList} from "../types/enum";
import {IBrowserWindowOptions, IWindowListItem} from "../types/types";
import pkg from '../../../package.json'
import {Change_Image, Change_Image_Replay, Set_Main_Window_Pos} from "../../../src/utils/events/constants";
import { configDB } from "../data/db";

const windowList = new Map<IWindowList, IWindowListItem>()

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
const preload = join(__dirname, '../preload/index.js')

windowList.set(IWindowList.PET_WINDOW, {
    isValid: process.platform !== 'linux',
    multiple: false,
    options () {
        const options: IBrowserWindowOptions = {
            title: 'Main window',
            skipTaskbar: true,
            icon: join(process.env.PUBLIC, iconFile),
            width: 220,
            height: 220,
            show: true,
            useContentSize: true,
            alwaysOnTop: true,
            resizable: true,
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
        }
        return options
    },
    callback (petWindow) {
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

        if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
            petWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
        } else {
            petWindow.loadFile(join(process.env.DIST, 'index.html'))
        }

        // 初始化的时候获取屏幕宽高，写入配置
        let screenWorkAreaSize = screen.getPrimaryDisplay().workAreaSize;
        let screenW = screenWorkAreaSize.width
        let screenH = screenWorkAreaSize.height
        configDB.set("screenW", screenW);
        configDB.set("screenH", screenH);
        // Test actively push message to the Electron-Renderer
        // window.webContents.on('did-finish-load', () => {
        //     window?.webContents.send('main-process-message', new Date().toLocaleString())
        // })
        // Make all links open with the browser, not with the application
        // window.webContents.setWindowOpenHandler(({ url }) => {
        //     if (url.startsWith('https:')) shell.openExternal(url)
        //     return { action: 'deny' }
        // })
        // window.webContents.on('will-navigate', (event, url) => { }) #344
        // console.log(`window.webContents.id: `, window.webContents.id)
    },
    listen(petWindow){
        // 监听渲染进程的消息，要发往PetTest里的监听，通过这样的方式来。试过mitt/pinia/sendTo都不行。这样是可以的！！！！
        ipcMain.on(Change_Image, (event: IpcMainEvent, args) => {
            console.log(`main receive changeImage, args:`, args)
            // event.sender.send('changeImage-replay', args)
            petWindow.webContents.send(Change_Image_Replay, args)
        })

        // 设置main窗口的位置
        ipcMain.on(Set_Main_Window_Pos, (evt, pos) => {
            const window = BrowserWindow.getFocusedWindow();
            let screenWorkAreaSize = screen.getPrimaryDisplay().workAreaSize;
            let screenW = screenWorkAreaSize.width
            let screenH = screenWorkAreaSize.height

            let bounds = window.getBounds();
            let x = bounds.x;// 当前窗口的x
            let y = bounds.y;// 当前窗口的y
            let winW = bounds.width
            let winH = bounds.height

            let isOverlappingScreen = x < 0 || y < 0 || x + winW > screenW || y + winH > screenH;
            // console.log(`isOverlappingScreen: ${isOverlappingScreen}, screenW: ${screenW}, screenH: ${screenH}, winW: ${winW}, winH: ${winH}, winX: ${x}, winY: ${y}`)

            if (isOverlappingScreen) {
                pos.x = x < 0 ? 0 : (x + winW > screenW ? screenW - winW : x);
                pos.y = y < 0 ? 0 : (y + winH > screenH ? screenH - winH : y);
                window.setBounds(pos);// TODO：后面改，现在会出现窗口闪一下的情况，Pet组件里如果能获取到屏幕的宽高，就不会出现这种情况了，传来的坐标就是正确的
            } else {
                window.setBounds(pos);
            }
        })
    }
})

windowList.set(IWindowList.PET_DETAIL_WINDOW, {
    isValid: process.platform !== 'linux',
    multiple: false,
    options () {
        const options: IBrowserWindowOptions = {
            width: 800,
            height: 600,
            show: true,
            fullscreenable: true,
            useContentSize: true,
            resizable: true,
            webPreferences: {
                nodeIntegration: true, // 启用Node integration
                contextIsolation: false, // 禁用上下文隔离, 如果不设置这个新建的窗口里process信息获取不到
            }
        }
        return options;
    },
    callback (petDetailWindow) {
        if (process.env.VITE_DEV_SERVER_URL) {
            let winUrl = `http://localhost:5173` + `#/petDetail`;

            petDetailWindow.loadURL(winUrl);
            petDetailWindow.webContents.openDevTools()
        } else {
            petDetailWindow.loadFile(join(process.env.DIST, 'index.html'), { hash: 'petDetail' });
        }

        // 在窗口关闭时清除window对象
        petDetailWindow.on('closed', () => {
            petDetailWindow = null
        })
    },
    listen(petDetailWindow){
    }
});

export default windowList
