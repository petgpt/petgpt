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
    app,
    clipboard,
    dialog,
    globalShortcut,
    ipcMain,
    IpcMainEvent,
    IpcMainInvokeEvent,
    shell,
    desktopCapturer,
    BrowserWindow
} from "electron";
import {getFileType, isDirectory, showNotification} from "../utils";
import * as child_process from "child_process";
import windowManger from "../window/windowManger";
import {DBList, IWindowList} from "../types/enum";
import path from "path";
import fs from "fs";
import dbMap from "../data/db";
import {join} from "node:path";
import logger from "../utils/logger";

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
        const STORE_PATH = app.getPath('userData')
        ipcMain.on('open-file', (event: IpcMainEvent, fileName: string) => {
            logger.info(`STORE_PATH:${STORE_PATH}`)
            const abFilePath = path.join(STORE_PATH, fileName)
            if (fs.existsSync(abFilePath)) {
                shell.openPath(abFilePath);
            } else {
                logger.info(`file not exists`)
                fs.writeFileSync(abFilePath, '{}')
                setTimeout(() => shell.openPath(abFilePath), 1000)
            }
        });

        // 配置文件CRUD
        ipcMain.handle('db-read', (event: IpcMainEvent, args: {db: DBList, key: string}) => {
            return dbMap.get(args.db).read();
        });
        ipcMain.handle('db-get', (event: IpcMainEvent, args: {db: DBList, key: string}) => {
            let value = dbMap.get(args.db).get(args.key);
            logger.debug(`[db-get] db:${args.db}, key:${args.key}, value: ${value}`)
            return value;
        })
        ipcMain.on('db-set', (event: IpcMainEvent, args: {db: DBList, key: string, value: string}) => {
            dbMap.get(args.db).set(args.key, args.value)
        })
        ipcMain.on('db-delete', (event: IpcMainEvent, args: {db: DBList, key: string}) => {
            dbMap.get(args.db).remove(args.key)
        })

        // 监听Create_Window事件 -> 创建窗口
        ipcMain.on(Create_Window, (evt, arg: {window: IWindowList, hash: string}) => {
            if (!windowManger.has(arg.window)) {
                logger.info(`create: `, arg.window)
                windowManger.create(arg.window);
            } else {
                logger.info(`show: `, arg.window)
                windowManger.get(arg.window).show();
            }
        })

        // main与renderer进程通信
        ipcMain.handle('ping', async (event: IpcMainInvokeEvent, ...args) => {
            logger.info(`[ipcMain.handle]arg: `, args)
            // 处理异步调用请求
            return {msg: "[ipcMain.handle]pong"};
        })
        ipcMain.on('ping', (event: IpcMainEvent, args) => {
            logger.info(`[ipcMain.on]arg:`, args); // 打印接收到的消息
            event.sender.send('ping-replay', {msg: "[event.sender.send]pong"});
        });
        ipcMain.handle(Get_ClipBoard_Type, async (event: IpcMainInvokeEvent, ...args) => {
            let formats = clipboard.availableFormats();
            if (formats.includes('text/plain') || formats.includes('text/html')) {
                return [{type: 'text', data: clipboard.readText()}];// 剪贴板中包含文本数据
            }

            let paths = clipboardEx.readFilePaths();
            let pathList = []
            for (let i = 0; i < paths.length; i++) {
                let path = paths[i];
                let isDir = await isDirectory(path);
                pathList.push({type: isDir ? 'directory' : 'file', data: path})
            }
            // paths.forEach(path => {
            //     isDirectory(path).then(isDir => {
            //         let fileType = getFileType(path);
            //         dialog.showMessageBox({
            //             title: '',
            //             message: `path: ${path}, isDir: ${isDir}, hex: ${fileType.hex}, type:${fileType.type}`
            //         })
            //         // paths.push({type: fileType.type, path: path, isDir: isDir});
            //     })
            // })
            return pathList;
        })

        // 快捷键
        ipcMain.on(Set_Short_Keys, (event: IpcMainEvent, args: {
            new: string,
            old: string
        }) => {
            logger.info(`[ipcMain.on] old and new short key:`, args);
            if(args.old) globalShortcut.unregister(args.old)
            globalShortcut.register(args.new, () => {
                // 调用截图方法
                logger.info(`[globalShortcut.registered] ${args.new} is pressed`) // 如果新绑定的按键被按下，就会在terminal打印出来！
            })
        });
        ipcMain.on(Reset_Short_Key, (event: IpcMainEvent, old) => {
            logger.info(`old key:`, old)
            globalShortcut.unregister(old)
        });

        // 选择文件夹
        ipcMain.on(Get_System_File_Path, (event: IpcMainEvent, args) => {
            logger.info(`[Get_System_File_Path] arg:`, args); // 打印接收到的消息

            dialog.showOpenDialog({
                properties: ['openDirectory']
            }).then(result => {
                logger.info(`[ipcMain.on Get_System_File_Path]result`, result, ` result.filePaths: `, result.filePaths)
                if(!result.canceled) event.sender.send(Get_System_File_Path, {path: result.filePaths[0]});
            }).catch(err => {
                logger.info(err)
                event.sender.send(Get_System_File_Path, {path: ''});
            })
        });

        // 通知
        ipcMain.on(Sys_Notification, (event: IpcMainEvent, options: INotification) => {
            showNotification({
                ...options,
                // clickFn: () => logger.info(`notification clicked!/closed!`),
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

        // 获取操作系统
        ipcMain.handle('getOperatingSystem', () => {
            return process.platform
        })

        ipcMain.handle('getSources', async () => {
            return await desktopCapturer.getSources({ types: ['window', 'screen'] })
        })

        // 保存音频 => 选择路径
        ipcMain.handle('showSaveDialog', async () => {
            return await dialog.showSaveDialog({
                buttonLabel: 'Save video',
                defaultPath: `vid-${Date.now()}.webm`
            });
        })

        // header的模拟关闭与最小化
        ipcMain.on('close', () => {
            BrowserWindow.getFocusedWindow().close();
        })
        ipcMain.on('minus', () => {
            BrowserWindow.getFocusedWindow().minimize();
        })

        // 获取路由信息
        ipcMain.handle('get-router-location', () => {
            const window = BrowserWindow.getFocusedWindow()
            if (window) {
                // logger.info(`${new Date().getMilliseconds()}, focusedWindow.getURL():`, window.webContents.getURL())
                return window.webContents.getURL()
            }
        })

        // pin current window
        ipcMain.on('pinCurrentWindow', (event: IpcMainEvent, pin: boolean) => {
            const window = BrowserWindow.getFocusedWindow()
            if (window) {
                window.setAlwaysOnTop(pin)
            }
        })

        ipcMain.on('RELOAD_APP', () => {
            app.relaunch()
            app.exit(0)
        })

        ipcMain.on('logger', (event: IpcMainEvent, args: string) => {
            logger.info(args)
        })
    }
}
