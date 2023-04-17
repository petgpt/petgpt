declare type BrowserWindow = import('electron').BrowserWindow

declare interface IWindowListItem {
    isValid: boolean
    multiple: boolean
    options: () => IBrowserWindowOptions,
    callback: (window: BrowserWindow, windowManager: IWindowManager) => void
    listen: (window: BrowserWindow, windowManager: IWindowManager) => void
}

declare interface IBrowserWindowOptions {
    height: number,
    width: number,
    show: boolean,
    fullscreenable: boolean,
    useContentSize: boolean,
    resizable: boolean,
    webPreferences: {
        preload?: string,
        nodeIntegration: boolean,
        nodeIntegrationInWorker?: boolean,
        contextIsolation: boolean,
        backgroundThrottling?: boolean
        webSecurity?: boolean
    },
    vibrancy?: string | any,
    frame?: boolean
    center?: boolean
    title?: string
    titleBarStyle?: string | any
    backgroundColor?: string
    autoHideMenuBar?: boolean
    transparent?: boolean
    icon?: string
    skipTaskbar?: boolean
    alwaysOnTop?: boolean
}

declare interface IWindowManager {
    create: (name: IWindowList) => BrowserWindow | null
    get: (name: IWindowList) => BrowserWindow | null
    has: (name: IWindowList) => boolean
    // delete: (name: IWindowList) => void
    deleteById: (id: number) => void
    getAvailableWindow: () => BrowserWindow
}
declare interface INotification {
    title: string
    body: string
    icon?: string
    clickFn?: () => void
}
declare interface IPluginProcessResult {
    success: boolean
    /**
     * the package.json's name filed
     */
    pkgName: string
    /**
     * the plugin name or the fs absolute path
     */
    fullName: string
}
declare type IPluginNameType = 'simple' | 'scope' | 'normal' | 'unknown'
declare enum IWindowList {
    PET_WINDOW = 'PET_WINDOW',
    PET_DETAIL_WINDOW = 'PET_DETAIL_WINDOW',
    PET_CHAT_WINDOW = 'PET_CHAT_WINDOW',
    PET_SETTING_WINDOW = 'PET_SETTING_WINDOW',
}
