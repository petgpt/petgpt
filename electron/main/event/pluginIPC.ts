import PluginLoader from "../plugin/PluginLoader";
import {
    ipcMain,
    IpcMainEvent,
} from "electron";
import {IPetPluginInterface, PetExpose} from "../plugin/share/types";

export default {
    listen(pluginLoader: PluginLoader, ctx: PetExpose) {
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
                let iPluginConfigs = plugin.config(ctx);
                console.log(`plugin needed config: `, iPluginConfigs)

                console.log(`slotMenu: `, plugin.slotMenu)
                console.log(`======================== ${plugin.name} ${plugin.version} ========================\n`)
            })
        })

        ipcMain.handle('plugin.getAllPluginName', async (event: IpcMainEvent, pluginName: string) => {
            let pluginInfoList = []
            let allPluginsNameList = pluginLoader.getAllPluginsNameList();
            for (const name of allPluginsNameList) {
                let plugin: IPetPluginInterface = await pluginLoader.getPlugin(name);
                pluginInfoList.push({
                    name: name,
                    version: plugin.version,
                    description: plugin.description
                })
            }
            return pluginInfoList
        })

        ipcMain.handle('plugin.getConfig', async (event: IpcMainEvent, pluginName: string) => {
            let plugin = await pluginLoader.getPlugin(pluginName);
            return plugin.config(ctx);
        })

        let listenPluginTypes = ['config']
        let listenPluginActions = ['update']
        let pluginsNameList = pluginLoader.getAllPluginsNameList();
        pluginsNameList.forEach((name) => {
            let pureName = name.slice(14)
            listenPluginTypes.forEach((type) => {
                listenPluginActions.forEach((action) => {
                    ipcMain.on(`plugin.${pureName}.${type}.${action}`, (event: IpcMainEvent, args: {name: string, data: any}) => {
                        console.log(`[ipcMain] plugin.${pureName}.${type}.${action}`, `, data:`, args.data)
                        ctx.emitter.emit(`plugin.${pureName}.${type}.${action}`, args.data)
                    })
                })
            });
        })
    },
}
