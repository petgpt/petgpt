import {
    Execute_Cmd, Get_ClipBoard_Type,
    Get_System_File_Path,
    Mouse_Event_Click,
    Reset_Short_Key,
    Set_Short_Keys, Sys_Notification
}
// @ts-ignore
    from "../../../src/utils/events/constants";

import {
    clipboard,
    dialog,
    globalShortcut,
    ipcMain,
    IpcMainEvent,
    IpcMainInvokeEvent,
} from "electron";
import {INotification} from "../../../src/utils/types/types";
import {getFileType, isDirectory, showNotification} from "../utils";

const clipboardEx = require('electron-clipboard-ex');

import * as child_process from "child_process";
import windowManger from "../window/windowManger";
import {IWindowList} from "../types/enum";

export default {
    listen () {
        // 监听鼠标点击事件 -> 窗口PetDetail页面
        ipcMain.on(Mouse_Event_Click, (evt, arg) => {
            console.log(`[${Mouse_Event_Click}] arg:`, arg)
            if (!windowManger.has(IWindowList.PET_DETAIL_WINDOW)) {
                windowManger.create(IWindowList.PET_DETAIL_WINDOW)
            } else {
                windowManger.get(IWindowList.PET_DETAIL_WINDOW).show()
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
