import PluginLoader from "../plugin/PluginLoader";
import {
    ipcMain,
    IpcMainEvent,
} from "electron";

export default {
    listen(pluginLoader: PluginLoader) {
        let fullList = pluginLoader.getAllPluginsNameList();
        // fullList.forEach(async (pluginName) => {
        //   let plugin = await pluginLoader.getPlugin(pluginName);
        //   console.log(`plugin: `, plugin)
        // plugin.config();
        // plugin.handle(DataType.Image).then(res => console.log(`handle res: `, res))
        // await plugin.stop()
        // });
        // ------------ plugin 测试 ------------

        // 获取插件的信息
        let allPluginsNameList = pluginLoader.getAllPluginsNameList();
        allPluginsNameList.forEach((pluginName) => {
            pluginLoader.getPlugin(pluginName).then(plugin => {
                console.log(`\n======================== ${plugin.name} ${plugin.version} ========================`)
                console.log(`plugin: `, plugin)

                // 获取需要渲染的配置页面
                let iPluginConfigs = plugin.config();
                console.log(`plugin needed config: `, iPluginConfigs)

                console.log(`slotMenu: `, plugin.slotMenu)
                console.log(`======================== ${plugin.name} ${plugin.version} ========================\n`)
            })
        })

        ipcMain.handle('plugin.getAllPluginName', (event: IpcMainEvent, pluginName: string) => {
            return pluginLoader.getAllPluginsNameList();
        })

        ipcMain.handle('plugin.getConfig', async (event: IpcMainEvent, pluginName: string) => {
            let plugin = await pluginLoader.getPlugin(pluginName);
            return plugin.config();
        })
    },
}
