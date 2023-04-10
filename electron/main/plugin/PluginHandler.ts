import spawn from 'cross-spawn'
import {IPluginHandlerOptions, IProcessEnv, IResult, Undefinable} from "./types";
import dbMap from "../data/db";
import {DBList} from "../types/enum";

async function execNpmCommand (cmd: string, modules: string[], where: string, options: IPluginHandlerOptions = {}, env: IProcessEnv = {}): Promise<IResult> {
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
            const npm = spawn('npm', args, { cwd: where, env: Object.assign({}, process.env, env) })

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
                console.error('NPM is not installed')
            })
        } catch (e) {
            console.error(e as Error)
        }
    })
}

// async function install (plugins: string[], options: IPluginHandlerOptions = {}, env?: IProcessEnv): Promise<IPluginHandlerResult<boolean>> {
//     const installedPlugins: string[] = []
//
// }
