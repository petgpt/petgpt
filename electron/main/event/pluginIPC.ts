import PluginLoader from "../plugin/PluginLoader";
import {app as APP, dialog, ipcMain, IpcMainEvent, shell,} from "electron";
import {DataType, IPetPluginInterface, PetExpose} from "../plugin/share/types";
import windowManger from "../window/windowManger";
import {IWindowList} from "../types/enum";
import {showNotification} from "../utils";
import {install, uninstall, update} from "../plugin/PluginHandler";
import path from "path";
import {handleStreamlinePluginName} from "../plugin/common";

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

        ipcMain.handle('plugin.getSlotMenu', async (event: IpcMainEvent, args) => {
            let pluginSlotMenuList = []
            let allPluginsNameList = pluginLoader.getAllPluginsNameList();
            for (const name of allPluginsNameList) {
                let plugin: IPetPluginInterface = await pluginLoader.getPlugin(name);
                pluginSlotMenuList.push({
                    name: name, // pluginName
                    menu: plugin.slotMenu(ctx)
                })
            }
            return pluginSlotMenuList;
        });

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

            // 监听renderer的插件的slot的push事件，推送到插件中，提醒插件slot的数据更新了
            ipcMain.on(`plugin.${purePluginName}.slot.push`, (event: IpcMainEvent, newSlotData) => {
                // console.log(`[ipcMain] plugin.${purePluginName}.slot.push`, ` newSlotData(${typeof newSlotData})(len: ${newSlotData.length}):`, newSlotData)
                ctx.emitter.emit(`plugin.${purePluginName}.slot.push`, JSON.stringify(newSlotData))
            })
        })

        // 监听插件返回的应答数据
        ctx.emitter.on('upsertLatestText', (args: any) => {
            console.log(`[ipMain] from plugin upsertLatestText`, ` args:`, args)
            windowManger.get(IWindowList.PET_CHAT_WINDOW).webContents.send('upsertLatestText', args)
        });

        // 监听插件返回的更新slotMenu事件
        ctx.emitter.on('updateSlotMenu', (args: any) => {
            windowManger.get(IWindowList.PET_CHAT_WINDOW).webContents.send('updateSlotMenu', args)
        })

        // =========== plugin install or uninstall or update ===========
        ipcMain.on('installPlugin', async (event: IpcMainEvent, fullName: string) => {
            const res = await install([fullName])
            // TODO: 根据res里的信息，进行通知
            windowManger.get(IWindowList.PET_SETTING_WINDOW).webContents.send('installSuccess', {
                success: res.success,
                body: fullName,
                errMsg: res.success ? '' : res.body
            })
            if (res.success) {
                // shortKeyHandler.registerPluginShortKey(res.body[0])
            } else {
                showNotification({
                    title: 'PLUGIN_INSTALL_FAILED',
                    body: res.body as string
                })
            }
        })

        ipcMain.on('uninstallPlugin', async (event: IpcMainEvent, fullName: string) => {
            const res = await uninstall([fullName])
            if (res.success) {
                windowManger.get(IWindowList.PET_SETTING_WINDOW).webContents.send('uninstallSuccess', res.body[0])
                // shortKeyHandler.unregisterPluginShortKey(res.body[0])
            } else {
                showNotification({
                    title: 'PLUGIN_UNINSTALL_FAILED',
                    body: res.body as string
                })
            }
        });

        ipcMain.on('updatePlugin', async (event: IpcMainEvent, fullName: string) => {
            const res = await update([fullName])
            if (res.success) {
                windowManger.get(IWindowList.PET_SETTING_WINDOW).webContents.send('updateSuccess', res.body[0])
            } else {
                showNotification({
                    title: 'PLUGIN_UPDATE_FAILED',
                    body: res.body as string
                })
            }
        });

        const getPluginList = async () => {
            const pluginList = pluginLoader.getAllPluginsNameList()
            const list = []
            for (const i in pluginList) {
                const plugin: IPetPluginInterface = await pluginLoader.getPlugin(pluginList[i])
                const pluginPath = path.join(APP.getPath('userData'), `/node_modules/${pluginList[i]}`)
                const pluginPKG = await import(path.join(pluginPath, 'package.json'))

                const obj = {
                    name: handleStreamlinePluginName(pluginList[i]),
                    fullName: pluginList[i],
                    author: pluginPKG.author.name || pluginPKG.author,
                    description: pluginPKG.description,
                    logo: 'file://' + path.join(pluginPath, 'logo.png').split(path.sep).join('/'),
                    version: pluginPKG.version,
                    homepage: pluginPKG.homepage ? pluginPKG.homepage : '',
                    config: plugin.config(ctx)
                }
                list.push(obj)
            }
            return list
        }

        ipcMain.on('importLocalPlugin', async (event: IpcMainEvent) => {
            const settingWindow = windowManger.get(IWindowList.PET_SETTING_WINDOW)

            // 获取到文件路径
            const res = await dialog.showOpenDialog(settingWindow, {
                properties: ['openDirectory']
            })

            const filePaths = res.filePaths
            if (filePaths.length > 0) {
                const res = await install(filePaths)
                if (res.success) {
                    try {
                        const list = getPluginList()
                        windowManger.get(IWindowList.PET_SETTING_WINDOW).webContents.send('pluginList', list)
                    } catch (e: any) {
                        windowManger.get(IWindowList.PET_SETTING_WINDOW).webContents.send('pluginList', [])
                        showNotification({
                            title: 'TIPS_GET_PLUGIN_LIST_FAILED',
                            body: e.message
                        })
                    }
                    showNotification({
                        title: 'PLUGIN_IMPORT_SUCCEED',
                        body: ''
                    })
                } else {
                    showNotification({
                        title: 'PLUGIN_IMPORT_FAILED',
                        body: res.body as string
                    })
                }
            }
            windowManger.get(IWindowList.PET_SETTING_WINDOW).webContents.send('hideLoading')
        })
    },
}
