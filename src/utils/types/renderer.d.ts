export interface IElectronAPI {
    loadPreferences: () => Promise<void>,
}

declare global { // 扩展全局变量
    interface Window {
        electronAPI: IElectronAPI // 扩展window下的electronAPI属性
    }
}
