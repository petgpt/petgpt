import {
    Get_System_File_Path,
    Mouse_Event_Click,
    Reset_Short_Key,
    Set_Main_Window_Pos,
    Set_Short_Keys
}
// @ts-ignore
from "../../../src/utils/events/constants";

import {
    BrowserWindow,
    clipboard,
    dialog,
    globalShortcut,
    ipcMain,
    IpcMainEvent,
    IpcMainInvokeEvent,
    screen
} from "electron";
import node_path from "node:path";
import {INotification} from "../../../src/utils/types/types";
import {getFileType, isDirectory, showNotification} from "../utils";

const clipboardEx = require('electron-clipboard-ex');

import * as child_process from "child_process";

let window: BrowserWindow | null = null

function createMainDetailWin() {
    // const serverUrl = process.env.VITE_DEV_SERVER_URL;
    const indexHtml = node_path.join(process.env.DIST, "index.html");

    const winURL = process.env.VITE_DEV_SERVER_URL
        ? `http://localhost:5173`
        : `file://${__dirname}/index.html`
    const arg = 'petDetail';

    window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // 启用Node integration
            contextIsolation: false, // 禁用上下文隔离, 如果不设置这个新建的窗口里process信息获取不到
        }
    })

    if (process.env.VITE_DEV_SERVER_URL) {
        let winUrl = `${winURL}` + `#/${arg}`;

        window.loadURL(winUrl);
        window.webContents.openDevTools()
    } else {
        window.loadFile(indexHtml, { hash: arg });
    }

    // 在窗口关闭时清除window对象
    window.on('closed', () => {
        window = null
    })
}

export default {
    listen () {
        // 监听鼠标点击事件
        ipcMain.on(Mouse_Event_Click, (evt, arg) => {
            console.log(`[${Mouse_Event_Click}] arg:`, arg)
            if (!window) {
                createMainDetailWin();
            } else {
                window.show()
            }
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

        // main与renderer进程通信
        ipcMain.handle('ping', async (event: IpcMainInvokeEvent, ...args) => {
            console.log(`[ipcMain.handle]arg: `, args)
            // 处理异步调用请求
            return {msg: "[ipcMain.handle]pong"};
        })
        ipcMain.handle('Get_ClipBoard_Type', async (event: IpcMainInvokeEvent, ...args) => {
            let formats = clipboard.availableFormats();
            if (formats.includes('text/plain') || formats.includes('text/html')) {
                return [{type: 'text', data: clipboard.readText()}];// 剪贴板中包含文本数据
            }

            let paths = clipboardEx.readFilePaths();
            paths.forEach(path => {
                isDirectory(path).then(isDir => {
                    let fileType = getFileType(path);
                    dialog.showMessageBox({
                        title: '',
                        message: `path: ${path}, isDir: ${isDir}, hex: ${fileType.hex}, type:${fileType.type}`
                    })
                    // paths.push({type: fileType.type, path: path, isDir: isDir});
                })
            })
            return paths;
        })
        ipcMain.on('ping', (event: IpcMainEvent, args) => {
            console.log(`[ipcMain.on]arg:`, args); // 打印接收到的消息
            event.sender.send('ping-replay', {msg: "[event.sender.send]pong"});
        });

        // 快捷键
        ipcMain.on(Set_Short_Keys, (event: IpcMainEvent, args: {
            new: string,
            old: string
        }) => {
            console.log(`[ipcMain.on] old and new short key:`, args);
            if(args.old) globalShortcut.unregister(args.old)
            globalShortcut.register(args.new, () => {
                // 调用截图方法
                console.log(`[globalShortcut.registered] ${args.new} is pressed`) // 如果新绑定的按键被按下，就会在terminal打印出来！
            })
        });
        ipcMain.on(Reset_Short_Key, (event: IpcMainEvent, old) => {
            console.log(`old key:`, old)
            globalShortcut.unregister(old)
        });

        // 选择文件夹
        ipcMain.on(Get_System_File_Path, (event: IpcMainEvent, args) => {
            console.log(`[Get_System_File_Path] arg:`, args); // 打印接收到的消息

            dialog.showOpenDialog({
                properties: ['openDirectory']
            }).then(result => {
                console.log(`[ipcMain.on Get_System_File_Path]result`, result, ` result.filePaths: `, result.filePaths)
                if(!result.canceled) event.sender.send(Get_System_File_Path, {path: result.filePaths[0]});
            }).catch(err => {
                console.log(err)
                event.sender.send(Get_System_File_Path, {path: ''});
            })
        });

        // 通知
        ipcMain.on('notification', (event: IpcMainEvent, options: INotification) => {
            showNotification({
                ...options,
                // clickFn: () => console.log(`notification clicked!/closed!`),
            })
        });

        // 运行cmd
        ipcMain.on('cmd', (event: IpcMainEvent, cmd: string) => {
            let child = child_process.execFile;

            child_process.exec(cmd)
            // child(args.executablePath, ['--incognito', '--window-size=800,600'], function(err, data) {
            //     // dialog.showMessageBox({
            //     //     // message: `err: ${err}, data: ${data}`
            //     // })
            // });
        });
    }
}
