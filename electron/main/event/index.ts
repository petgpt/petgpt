import {Mouse_Event_Click, Set_Main_Window_Pos} from "../../../src/utils/events/constants";
import {BrowserWindow, ipcMain, screen} from "electron";
import node_path from "node:path";

let window: BrowserWindow | null = null

function createMainDetailWin() {
    const serverUrl = process.env.VITE_DEV_SERVER_URL;
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

export function onMainWindowMouseClick() {
    ipcMain.on(Mouse_Event_Click, (evt, arg) => {
        console.log(`[${Mouse_Event_Click}] arg:`, arg)
        if (!window) {
            createMainDetailWin();
        }
    })
}

export function onMainWindowMove() {
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
        console.log(`isOverlappingScreen: ${isOverlappingScreen}, screenW: ${screenW}, screenH: ${screenH}, winW: ${winW}, winH: ${winH}, winX: ${x}, winY: ${y}`)

        if (isOverlappingScreen) {
            pos.x = x < 0 ? 0 : (x + winW > screenW ? screenW - winW : x);
            pos.y = y < 0 ? 0 : (y + winH > screenH ? screenH - winH : y);
            window.setBounds(pos);// TODO：后面改，现在会出现窗口闪一下的情况，Pet组件里如果能获取到屏幕的宽高，就不会出现这种情况了，传来的坐标就是正确的
        } else {
            window.setBounds(pos);
        }
    })
}
