import {
    Execute_Cmd, Get_ClipBoard_Type,
    Get_System_File_Path,
    Create_Window,
    Reset_Short_Key,
    Set_Short_Keys, Sys_Notification
}
// @ts-ignore
    from "../../../src/utils/events/constants";

import {
    app as APP,
    clipboard,
    dialog,
    globalShortcut,
    ipcMain,
    IpcMainEvent,
    IpcMainInvokeEvent,
    shell,
} from "electron";
import {INotification} from "../../../src/utils/types/types";
import {getFileType, isDirectory, showNotification} from "../utils";
import * as child_process from "child_process";
import windowManger from "../window/windowManger";
import {IWindowList} from "../types/enum";
import path from "path";
import fs from "fs";
import { configDB } from "../data/db";
import {join} from "node:path";

const clipboardEx = require('electron-clipboard-ex');

export default {
    listen () {
        // 路由跳转
        ipcMain.on('router', (event: IpcMainEvent, arg: {window: IWindowList, hash: string}) => {
            let window = windowManger.get(arg.window);
            if (window) {
                if (process.env.VITE_DEV_SERVER_URL) {
                    let winUrl = `http://localhost:5173` + `#/${arg.hash}`;

                    window.loadURL(winUrl);
                    window.webContents.openDevTools();
                } else {
                    window.loadFile(join(process.env.DIST, 'index.html'), { hash: `${arg.hash}` });
                }
            }
        })

        // 配置文件打开
        const STORE_PATH = APP.getPath('userData')
        ipcMain.on('open-file', (event: IpcMainEvent, fileName: string) => {
            console.log(`STORE_PATH:${STORE_PATH}`)
            const abFilePath = path.join(STORE_PATH, fileName)
            if (fs.existsSync(abFilePath)) {
                shell.openPath(abFilePath);
            } else {
                console.log(`file not exists`)
                fs.writeFileSync(abFilePath, '{}')
                setTimeout(() => shell.openPath(abFilePath), 1000)
            }
        });

        // 配置文件CRUD
        // TODO: 修改这里的param，可以实现多个配置文件的读写，现在只能读configDB
        ipcMain.handle('db-read', (event: IpcMainEvent, key: string) => {
            return configDB.read();
        });
        ipcMain.handle('db-get', (event: IpcMainEvent, key: string) => {
            return configDB.get(key);
        })
        ipcMain.on('db-set', (event: IpcMainEvent, args: {key: string, value: string}) => {
            configDB.set(args.key, args.value)
        })
        ipcMain.on('db-write', (event: IpcMainEvent, key: string) => {
            configDB.flush()
        })
        ipcMain.on('db-delete', (event: IpcMainEvent, key: string) => {
            configDB.remove(key)
        })

        // 监听Create_Window事件 -> 创建窗口
        ipcMain.on(Create_Window, (evt, arg: {window: IWindowList, hash: string}) => {
            if (!windowManger.has(arg.window)) {
                windowManger.create(arg.window);
            } else {
                windowManger.get(arg.window).show();
            }
        })

        // main与renderer进程通信
        ipcMain.handle('ping', async (event: IpcMainInvokeEvent, ...args) => {
            console.log(`[ipcMain.handle]arg: `, args)
            // 处理异步调用请求
            return {msg: "[ipcMain.handle]pong"};
        })
        ipcMain.on('ping', (event: IpcMainEvent, args) => {
            console.log(`[ipcMain.on]arg:`, args); // 打印接收到的消息
            event.sender.send('ping-replay', {msg: "[event.sender.send]pong"});
        });
        ipcMain.handle(Get_ClipBoard_Type, async (event: IpcMainInvokeEvent, ...args) => {
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
        ipcMain.on(Sys_Notification, (event: IpcMainEvent, options: INotification) => {
            showNotification({
                ...options,
                // clickFn: () => console.log(`notification clicked!/closed!`),
            })
        });

        // 运行cmd
        ipcMain.on(Execute_Cmd, (event: IpcMainEvent, cmd: string) => {
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
