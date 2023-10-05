import fs from 'fs-extra'
import path from 'path'
import resolve from 'resolve'
import { IPetPlugin, IPluginLoader } from './types'
import { IEventBus, IPetPluginInterface, PetExpose } from './share/types'
import logger from '../utils/logger'

/**
 * Local plugin loader, file system is required
 */
export class PluginLoader implements IPluginLoader {
	private readonly ctx: PetExpose
	private readonly baseDir: string
	private enabledPluginList: string[] = []
	private readonly allPluginsNameSet: Set<string> = new Set()
	private emitter: IEventBus
	private readonly pluginMap: Map<string, IPetPluginInterface> = new Map()
	constructor(ctx: PetExpose) {
		this.ctx = ctx
		this.baseDir = ctx.baseDir
		this.emitter = ctx.emitter
		this.init()
	}

	private init(): void {
		const packagePath = path.join(this.baseDir, 'package.json')
		if (!fs.existsSync(packagePath)) {
			const pkg = {
				name: 'petgpt-plugins',
				description: 'petgpt-plugins',
				repository: 'https://github.com/petgpt/petgpt',
				license: 'MIT',
			}
			fs.writeFileSync(packagePath, JSON.stringify(pkg), 'utf8')
		}
	}

	// get plugin entry
	private resolvePlugin(name: string): string {
		try {
			return resolve.sync(name, { basedir: this.baseDir })
		} catch (err) {
			return path.join(this.baseDir, 'node_modules', name)
		}
	}

	// load all third party plugin
	load(): boolean {
		const packagePath = path.join(this.baseDir, 'package.json')
		const pluginDir = path.join(this.baseDir, 'node_modules/')
		// Thanks to hexo -> https://github.com/hexojs/hexo/blob/master/lib/hexo/load_plugins.js
		if (!fs.existsSync(pluginDir)) {
			logger.info(`${pluginDir} not exist`)
			return false
		}
		const json = fs.readJSONSync(packagePath)
		// 从app.getPath('userData')/package.json中读取依赖，看有没有petgpt-plugin-开头的，就加载本地的插件
		const deps = Object.keys(json.dependencies || {})
		const devDeps = Object.keys(json.devDependencies || {})
		const modules = deps.concat(devDeps).filter((name: string) => {
			if (!/^petgpt-plugin-|^@[^/]+\/petgpt-plugin-/.test(name)) return false
			const path = this.resolvePlugin(name)
			return fs.existsSync(path)
		})
		for (const module of modules) {
			this.registerPlugin(module)
		}
		return true
	}

	registerPlugin(name: string, plugin?: IPetPlugin): void {
		if (!name || typeof name !== 'string') {
			console.warn('Please provide valid plugin')
			return
		}
		this.allPluginsNameSet.add(name)
		try {
			// register local plugin
			if (!plugin) {
				if (this.ctx.db.get(`petPlugins.${name}`) === true || this.ctx.db.get(`petPlugins.${name}`) === undefined) {
					this.enabledPluginList.push(name)
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					this.getPlugin(name).then(p => p?.register())
					const plugin = `petPlugins[${name}]`
					this.ctx.db.set(plugin, true) // config中这样的："petPlugins": {"petgpt-plugin-test": true },
				}
			} else {
				// register provided plugin
				// && won't write config to files
				this.enabledPluginList.push(name)
				const pluginInterface = plugin(this.ctx)
				this.pluginMap.set(name, pluginInterface)
				pluginInterface.register()
			}
		} catch (e) {
			this.pluginMap.delete(name)
			this.enabledPluginList = this.enabledPluginList.filter((item: string) => item !== name)
			this.allPluginsNameSet.delete(name)
			console.error(e as Error)
		}
	}

	unregisterPlugin(name: string): void {
		this.pluginMap?.get(name)?.unregister()
		this.enabledPluginList = this.enabledPluginList.filter((item: string) => item !== name)
		this.allPluginsNameSet.delete(name)
		this.pluginMap.delete(name)
		this.ctx.db.remove(`petPlugins[${name}]`)
	}

	// get plugin by name
	async getPlugin(name: string): Promise<IPetPluginInterface | undefined> {
		if (this.pluginMap.has(name)) {
			return this.pluginMap.get(name)
		}
		let winPluginAbsolutePath = 'file://' + this.resolvePlugin(name)
		// 动态加载 ==> export default的东西
		const { default: pluginFunction } = await import(winPluginAbsolutePath)
			.then(m => m)
			.catch(e => {
				logger.info(`plugin import error: `, e)
			})
		const plugin: IPetPluginInterface = pluginFunction(this.ctx) // 动态引入后调用函数，返回IPetPluginInterface对象
		this.pluginMap.set(name, plugin)
		return plugin
		// logger.info(`plugin: `, plugin)
		// return undefined
	}

	/**
	 * Get the list of enabled plugins
	 */
	getEnabledPluginList(): string[] {
		return this.enabledPluginList
	}

	hasPlugin(name: string): boolean {
		return this.allPluginsNameSet.has(name)
	}

	/**
	 * Get the full list of plugins, whether it is enabled or not
	 */
	getAllPluginsNameList(): string[] {
		return Array.from(this.allPluginsNameSet)
	}
}
export default PluginLoader
