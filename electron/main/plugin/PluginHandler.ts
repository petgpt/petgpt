import spawn from 'cross-spawn'
import {IPluginHandlerOptions, IProcessEnv, IResult, Undefinable} from "./types";
import dbMap from "../data/db";
import {DBList} from "../types/enum";
import {IPluginHandlerResult, PetExpose} from "./share/types";
import {IPluginProcessResult} from "../../../src/utils/types/types";
import {getNormalPluginName, getProcessPluginName} from "./common";
import lifeCycle from "../index";
import {app} from "electron";


export async function execCommand (cmd: string, modules: string[], where: string, options: IPluginHandlerOptions = {}, env: IProcessEnv = {}): Promise<IResult> {
    const registry = options.registry || dbMap.get(DBList.Config_DB).get('settings.registry')
    const proxy = options.proxy || dbMap.get(DBList.Config_DB).get('settings.proxy')
    return await new Promise((resolve: any): void => {
        let args = [cmd].concat(modules).concat('--color=always').concat('--save')
        if (registry) {
            args = args.concat(`--registry=${registry}`)
        }
        if (proxy) {
            args = args.concat(`--proxy=${proxy}`)
        }
        try {
            const npm = spawn('yarn', args, { cwd: where, env: Object.assign({}, process.env, env) })

            let output = ''
            npm.stdout?.on('data', (data: string) => {
                output += data
            }).pipe(process.stdout)

            npm.stderr?.on('data', (data: string) => {
                output += data
            }).pipe(process.stderr)

            npm.on('close', (code: number) => {
                if (!code) {
                    resolve({ code: 0, data: output })
                } else {
                    resolve({ code: code, data: output })
                }
            })
            // for users who haven't installed node.js
            npm.on('error', (err: Error) => {
                console.error(err)
                console.error('NPM is not installed') // TODO: 测试
            })
        } catch (e) {
            console.error(e as Error)
        }
    })
}

export async function install (plugins: string[], options: IPluginHandlerOptions = {}, env?: IProcessEnv): Promise<IPluginHandlerResult<boolean>> {
    const installedPlugins: string[] = []
    const processPlugins = plugins
        .map((item: string) => handlePluginNameProcess(console, item))
        .filter((item) => {
            // detect if has already installed
            // or will cause error
            if (lifeCycle.getPluginLoader().hasPlugin(item.pkgName)) {
                installedPlugins.push(item.pkgName)
                console.log(`[main] [install] Petgpt has already installed ${item.pkgName}`)
                return false
            }
            // if something wrong, filter it out
            if (!item.success) {
                return false
            }
            return true
        })
    const fullNameList = processPlugins.map(item => item.fullName)
    const pkgNameList = processPlugins.map(item => item.pkgName)

    if (fullNameList.length > 0) {
        // install plugins must use fullNameList:
        // 1. install remote pacage
        // 2. install local pacage
        const result = await execCommand('add', fullNameList, app.getPath('userData'), options, env)
        if (!result.code) {
            pkgNameList.forEach((pluginName: string) => {
                lifeCycle.getPluginLoader().registerPlugin(pluginName)
            })
            console.log(`==== PLUGIN_HANDLER_PLUGIN_INSTALL_SUCCESS ====`)
            // this.ctx.emit('installSuccess', {
            //     title: this.ctx.i18n.translate<ILocalesKey>('PLUGIN_HANDLER_PLUGIN_INSTALL_SUCCESS'),
            //     body: [...pkgNameList, ...installedPlugins]
            // })
            const res: IPluginHandlerResult<true> = {
                success: true,
                body: [...pkgNameList, ...installedPlugins]
            }
            return res
        } else {
            // const err = this.ctx.i18n.translate<ILocalesKey>('PLUGIN_HANDLER_PLUGIN_INSTALL_FAILED_REASON', {
            //     code: `${result.code}`,
            //     data: result.data
            // })
            let errMsg = {code: `${result.code}`,
                data: result.data
            };
            console.error(errMsg)
            // this.ctx.emit('installFailed', {
            //     title: this.ctx.i18n.translate<ILocalesKey>('PLUGIN_HANDLER_PLUGIN_INSTALL_FAILED'),
            //     body: err
            // })
            const res: IPluginHandlerResult<false> = {
                success: false,
                body: JSON.stringify(errMsg)
            }
            return res
        }
    } else if (installedPlugins.length === 0) {
        const err = 'PLUGIN_HANDLER_PLUGIN_UNINSTALL_FAILED_VALID'
        console.error(err)
        // this.ctx.emit('installFailed', {
        //     title: 'PLUGIN_HANDLER_PLUGIN_INSTALL_FAILED',
        //     body: err
        // })
        const res: IPluginHandlerResult<false> = {
            success: false,
            body: err
        }
        return res
    } else {
        console.log('PLUGIN_HANDLER_PLUGIN_INSTALL_SUCCESS')
        // this.ctx.emit('installSuccess', {
        //     title: this.ctx.i18n.translate<ILocalesKey>('PLUGIN_HANDLER_PLUGIN_INSTALL_SUCCESS'),
        //     body: [...pkgNameList, ...installedPlugins]
        // })
        const res: IPluginHandlerResult<true> = {
            success: true,
            body: [...pkgNameList, ...installedPlugins]
        }
        return res
    }


    // const result = await execCommand('install', plugins, app.getPath('userData'), options, env)
    // if (!result.code) {
    //     console.log(`download success`)
    // } else {
    //     console.log(`download failed: `, {code: `${result.code}`, data: result.data})
    // }
    // return null;
}

export async function uninstall(plugins: string[]): Promise<IPluginHandlerResult<boolean>> {
    const processPlugins = plugins.map((item: string) => handlePluginNameProcess(console, item)).filter(item => item.success)
    const pkgNameList = processPlugins.map(item => item.pkgName)
    if (pkgNameList.length > 0) {
        // uninstall plugins must use pkgNameList:
        // npm uninstall will use the package.json's name
        const result = await execCommand('remove', pkgNameList, app.getPath('userData'))
        if (!result.code) {
            pkgNameList.forEach((pluginName: string) => {
                lifeCycle.getPluginLoader().unregisterPlugin(pluginName)
            })
            console.log('PLUGIN_HANDLER_PLUGIN_UNINSTALL_SUCCESS')
            // this.ctx.emit('uninstallSuccess', {
            //     title: this.ctx.i18n.translate<ILocalesKey>('PLUGIN_HANDLER_PLUGIN_UNINSTALL_SUCCESS'),
            //     body: pkgNameList
            // })
            const res: IPluginHandlerResult<true> = {
                success: true,
                body: pkgNameList
            }
            return res
        } else {
            const err = {
                code: `${result.code}`,
                data: result.data
            }
            console.error(err)
            // this.ctx.emit('uninstallFailed', {
            //     title: this.ctx.i18n.translate<ILocalesKey>('PLUGIN_HANDLER_PLUGIN_UNINSTALL_FAILED'),
            //     body: err
            // })
            const res: IPluginHandlerResult<false> = {
                success: false,
                body: JSON.stringify(err)
            }
            return res
        }
    } else {
        const err = 'PLUGIN_HANDLER_PLUGIN_UNINSTALL_FAILED_VALID'
        console.error(err)
        // this.ctx.emit('uninstallFailed', {
        //     title: this.ctx.i18n.translate<ILocalesKey>('PLUGIN_HANDLER_PLUGIN_UNINSTALL_FAILED'),
        //     body: err
        // })
        const res: IPluginHandlerResult<false> = {
            success: false,
            body: err
        }
        return res
    }
}

export async function update(plugins: string[], options: IPluginHandlerOptions = {}, env?: IProcessEnv): Promise<IPluginHandlerResult<boolean>> {
    const processPlugins = plugins.map((item: string) => handlePluginNameProcess(console, item)).filter(item => item.success)
    const pkgNameList = processPlugins.map(item => item.pkgName)
    console.log(`processPlugins: `, processPlugins, ` pkgNameList: `, pkgNameList)
    if (pkgNameList.length > 0) {
        // update plugins must use pkgNameList:
        // npm update will use the package.json's name
        pkgNameList.push('--latest')
        const result = await execCommand('upgrade', pkgNameList, app.getPath('userData'), options, env)
        if (!result.code) {
            console.log('PLUGIN_HANDLER_PLUGIN_UPDATE_SUCCESS')
            // this.ctx.emit('updateSuccess', {
            //     title: this.ctx.i18n.translate<ILocalesKey>('PLUGIN_HANDLER_PLUGIN_UPDATE_SUCCESS'),
            //     body: pkgNameList
            // })
            const res: IPluginHandlerResult<true> = {
                success: true,
                body: pkgNameList
            }
            return res
        } else {
            const err = {
                code: `${result.code}`,
                data: result.data
            }
            console.error(err)
            // this.ctx.emit('updateFailed', {
            //     title: this.ctx.i18n.translate<ILocalesKey>('PLUGIN_HANDLER_PLUGIN_UPDATE_FAILED'),
            //     body: err
            // })
            const res: IPluginHandlerResult<false> = {
                success: false,
                body: JSON.stringify(err)
            }
            return res
        }
    } else {
        const err = 'PLUGIN_HANDLER_PLUGIN_UPDATE_FAILED_VALID'
        console.error(err)
        // this.ctx.emit('updateFailed', {
        //     title: this.ctx.i18n.translate<ILocalesKey>('PLUGIN_HANDLER_PLUGIN_UPDATE_FAILED'),
        //     body: err
        // })
        const res: IPluginHandlerResult<false> = {
            success: false,
            body: err
        }
        return res
    }
}


/**
 * transform the input plugin name or path string to valid result
 * @param log
 * @param nameOrPath
 */
const handlePluginNameProcess = (log: Console, nameOrPath: string): IPluginProcessResult => {
    const res = {
        success: false,
        fullName: '',
        pkgName: ''
    }
    const result = getProcessPluginName(nameOrPath, log)
    if (!result) {
        return res
    }
    // first get result then do this process
    // or some error will log twice
    const pkgName = getNormalPluginName(result, log)
    if (!pkgName) {
        return res
    }
    return {
        success: true,
        fullName: result,
        pkgName
    }
}
