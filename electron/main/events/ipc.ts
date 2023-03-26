import { BrowserWindow, ipcMain} from 'electron'
import {SET_MINI_WINDOW_POS} from "../../../src/utils/events/constants";


ipcMain.on(SET_MINI_WINDOW_POS, (evt, pos) => {
    const window = BrowserWindow.getFocusedWindow()
    window.setBounds(pos)
})
