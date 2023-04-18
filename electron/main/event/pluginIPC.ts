import PluginLoader from "../plugin/PluginLoader";
import {app as APP, dialog, ipcMain, IpcMainEvent,} from "electron";
import {DataType, IPetPluginInterface, PetExpose} from "../plugin/share/types";
import windowManger from "../window/windowManger";
import {DBList, IWindowList} from "../types/enum";
import {showNotification} from "../utils";
import {install, uninstall, update} from "../plugin/PluginHandler";
import path from "path";
import {handleStreamlinePluginName} from "../plugin/common";
import {TextFileSync} from "@commonify/lowdb";
import logger from "../utils/logger";
import dbMap from "../data/db";

export default {
    listen(pluginLoader: PluginLoader, ctx: PetExpose) {
        let fullList = pluginLoader.getAllPluginsNameList();
        // fullList.forEach(async (pluginName) => {
        //   let plugin = await pluginLoader.getPlugin(pluginName);
        //   logger.info(`plugin: `, plugin)
        // plugin.config();
        // plugin.handle(DataType.Image).then(res => logger.info(`handle res: `, res))
        // await plugin.stop()
        // });
        // ------------ plugin 测试 ------------

        // 获取插件的信息
        let allPluginsNameList = pluginLoader.getAllPluginsNameList();
        allPluginsNameList.forEach((pluginName) => {
            pluginLoader.getPlugin(pluginName).then(plugin => {
                // logger.info(`\n======================== ${plugin.name} ${plugin.version} ========================`)
                // logger.info(`plugin: `, plugin)
                //
                // // 获取需要渲染的配置页面
                // let iPluginConfigs = plugin.config(ctx);
                // logger.info(`plugin needed config: `, iPluginConfigs)
                //
                // logger.info(`slotMenu: `, plugin.slotMenu)
                // logger.info(`======================== ${plugin.name} ${plugin.version} ========================\n`)
            })
        })

        ipcMain.handle('plugin.getAllPluginName', async (event: IpcMainEvent, pluginName: string) => {
            let list = await getPluginList();
            return list
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
                logger.info(`[ipcMain] plugin.${purePluginName}.config.update`, ` args:`, args)
                // 只用发送核心的config数据，不用发name
                ctx.emitter.emit(`plugin.${purePluginName}.config.update`, args.data)
            })

            // 监听插件的核心handle事件，调用插件的核心方法
            ipcMain.on(`plugin.${purePluginName}.func.handle`, (event: IpcMainEvent, args: {pluginName: string, input: any}) => {
                logger.info(`[ipcMain] plugin.${purePluginName}.func.handle`, ` args:`, args)
                pluginLoader.getPlugin("petgpt-plugin-" + args.pluginName).then((plugin) => {
                    // 调用插件的handle方法
                    plugin.handle({type: DataType.Text, data: args.input})
                })
            })

            // 监听renderer的插件的slot的push事件，推送到插件中，提醒插件slot的数据更新了
            ipcMain.on(`plugin.${purePluginName}.slot.push`, (event: IpcMainEvent, newSlotData) => {
                // logger.info(`[ipcMain] plugin.${purePluginName}.slot.push`, ` newSlotData(${typeof newSlotData})(len: ${newSlotData.length}):`, newSlotData)
                ctx.emitter.emit(`plugin.${purePluginName}.slot.push`, JSON.stringify(newSlotData))
            })

            // 调用clear方法
            ipcMain.on(`plugin.${purePluginName}.func.clear`, (event: IpcMainEvent, data) => {
                // logger.info(`[ipcMain] plugin.${purePluginName}.func.clear`, ` newSlotData(${typeof newSlotData})(len: ${newSlotData.length}):`, newSlotData)
                ctx.emitter.emit(`plugin.${purePluginName}.func.clear`)
            })
        })

        // 监听插件返回的应答数据
        ctx.emitter.on('upsertLatestText', (args: any) => {
            // logger.info(`[ipMain] from plugin upsertLatestText`, ` args:`, args)
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

        ipcMain.on('enablePlugin', async (event: IpcMainEvent, args: {name: string, enabled: boolean}) => {
            logger.info(`[ipcMain] enablePlugin`, ` args:`, args)
            const plugin: IPetPluginInterface = await pluginLoader.getPlugin(`petgpt-plugin-${args.name}`)
            if (args.enabled) {
                plugin.register()
                dbMap.get(DBList.Config_DB).set(`petPlugins.petgpt-plugin-${args.name}`, true);
            } else {
                plugin.unregister()
                dbMap.get(DBList.Config_DB).set(`petPlugins.petgpt-plugin-${args.name}`, false);
            }
        });

        ipcMain.on('updatePlugin', async (event: IpcMainEvent, fullName: string) => {
            const res = await update([fullName])
            if (res.success) {
                // TODO: 发送最新的插件信息，例如版本等
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
                const pluginPKG = JSON.parse(new TextFileSync(path.join(pluginPath, 'package.json')).read())

                let enabled = dbMap.get(DBList.Config_DB).get(`petPlugins.${pluginList[i]}`);
                const obj = {
                    name: handleStreamlinePluginName(pluginList[i]),
                    version: pluginPKG.version,
                    description: pluginPKG.description,
                    fullName: pluginList[i],
                    author: pluginPKG.author.name || pluginPKG.author,
                    logo: 'file://' + path.join(pluginPath, 'logo.png').split(path.sep).join('/'),
                    homepage: pluginPKG.homepage ? pluginPKG.homepage : '',
                    config: plugin.config(ctx),
                    enabled: enabled,
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
