import PluginLoader from "../plugin/PluginLoader";
import {ipcMain, IpcMainEvent,} from "electron";
import {DataType, IPetPluginInterface, PetExpose} from "../plugin/share/types";
import windowManger from "../window/windowManger";
import {IWindowList} from "../types/enum";

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
                // console.log(`\n======================== ${plugin.name} ${plugin.version} ========================`)
                // console.log(`plugin: `, plugin)
                //
                // // 获取需要渲染的配置页面
                // let iPluginConfigs = plugin.config(ctx);
                // console.log(`plugin needed config: `, iPluginConfigs)
                //
                // console.log(`slotMenu: `, plugin.slotMenu)
                // console.log(`======================== ${plugin.name} ${plugin.version} ========================\n`)
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

        let pluginListenList = [
            {
                type: 'config',
                action: 'update'
            },
            {
                type: 'func',
                action: 'handle'
            }
        ]
        let pluginsNameList = pluginLoader.getAllPluginsNameList();
        pluginsNameList.forEach((name) => {
            let purePluginName = name.slice(14)
            // 监听插件的config的update事件
            ipcMain.on(`plugin.${purePluginName}.config.update`, (event: IpcMainEvent, args: {name: string, data: any}) => {
                console.log(`[ipcMain] plugin.${purePluginName}.config.update`, ` args:`, args)
                // 只用发送核心的config数据，不用发name
                ctx.emitter.emit(`plugin.${purePluginName}.config.update`, args.data)
            })

            // 监听插件的核心handle事件，调用插件的核心方法
            ipcMain.on(`plugin.${purePluginName}.func.handle`, (event: IpcMainEvent, args: {pluginName: string, input: any}) => {
                console.log(`[ipcMain] plugin.${purePluginName}.func.handle`, ` args:`, args)
                pluginLoader.getPlugin("petgpt-plugin-" + args.pluginName).then((plugin) => {
                    // 调用插件的handle方法
                    plugin.handle({type: DataType.Text, data: args.input})
                })
            })
        })

        ctx.emitter.on('upsertLatestText', (args: any) => {
            console.log(`[ipMain] from plugin upsertLatestText`, ` args:`, args)
            windowManger.get(IWindowList.PET_CHAT_WINDOW).webContents.send('upsertLatestText', args)
        });
    },
}
