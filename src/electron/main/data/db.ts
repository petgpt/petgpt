import fs from 'fs-extra'
import { app } from 'electron'
import path from 'path'
import { JSONFile, Low, TextFileSync } from '@commonify/lowdb'
import lodash from 'lodash'
import { DBList } from '../../../common/enum'
import { IDB } from '../plugin/share/types'

type Data = {
	count: number
	[propName: string]: any
	// petPlugins?: {},
	// Main_Window_Width?: number,
	// Main_Window_Height?: number,
	// Detail_Window_Width?: number,
	// Detail_Window_Height?: number,
	// baseDir?: string,
	// screenW?: number,
	// screenH?: number
}
// Extend Low class with a new `chain` field
class LowWithLodash<T> extends Low<T> {
	chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}
const APP: Electron.App = app
const STORE_PATH: string = APP.getPath('userData')
const configFilePath = path.join(STORE_PATH, 'data.json')
const nodeModulesPath = path.join(STORE_PATH, 'node_modules/')

class DB implements IDB {
	private db: LowWithLodash<Data>
	public constructor(STORE_PATH: string, configFilePath: string) {
		// In production mode, during the first open application
		// APP.getPath('userData') gets the path nested and the datastore.js is loaded.
		// if it doesn't exist, create it.
		if (process.type !== 'renderer') {
			if (!fs.pathExistsSync(STORE_PATH)) {
				// TODO: 测试这里
				fs.mkdirpSync(STORE_PATH)
			}

			if (!fs.pathExistsSync(nodeModulesPath)) {
				fs.mkdirpSync(nodeModulesPath)
			}
		}

		if (!fs.pathExistsSync(configFilePath)) {
			fs.writeFileSync(configFilePath, '{}')
		}
		const adapter = new JSONFile<Data>(configFilePath)
		this.db = new LowWithLodash(adapter)
		let jsonStr = new TextFileSync(configFilePath).read() || '{count: 0}'
		// logger.info(`this.db:`, JSON.stringify(this.db), ` jsonStr:`, jsonStr)
		this.db.data ||= JSON.parse(jsonStr)
	}
	public read() {
		return this.db.chain.value()
	}
	public get(key: string) {
		return this.db.chain.get(key).value()
	}

	public has(key: string): boolean {
		return this.db.chain.has(key).value()
	}

	public set(key: string, value: any) {
		this.db.chain.set(key, value).value()
		this.db.write().then(r => {})
	}

	public flush() {
		this.db.write().then(r => {})
	}

	public remove(key: string) {
		this.db.chain.unset(key).value()
		this.db.write().then(r => {})
	}

	// public find<T>(getKey, find){
	//     return this.db.chain.get(getKey).findKey(find).value()
	// }

	// public filter<T>(getKey:string, filter): T {
	//     return this.db.chain.get(getKey).filter(filter).value()
	// }

	// public unset<T>(key: string):T {
	//     return this.db.chain.unset(key).write()
	// }

	// public pull<T>(key:string, value): T {
	//     return this.db.chain.get(key).pull(value).write()
	// }
}

// 写 & 更新
// db.get('posts').push({id:1,name:'好好学习'}).write()
// db.update('count', n => n+1).write();
// db.get('posts').find({id:1}).assign({name:'天天向上'})
//
// 查询
// db.get('posts').map("name").value()//获取name列表
//排序 sortBy , orderBy
// db.get('posts').filter({name:'xxxx'}).sortBy('id').value();
// db.get('posts').filter({name:'xxxx'}).orderBy('id','desc').value()

const message = new DB(STORE_PATH, path.join(STORE_PATH, 'message.json'))
const config = new DB(STORE_PATH, configFilePath) // 配置文件
const prompt = new DB(STORE_PATH, path.join(STORE_PATH, 'prompt.json')) // 本地prompt
const history = new DB(STORE_PATH, path.join(STORE_PATH, 'history.json')) // 历史对话

const dbMap = new Map<DBList, IDB>()
dbMap.set(DBList.Message_DB, message)
dbMap.set(DBList.Config_DB, config)
dbMap.set(DBList.Prompt_DB, prompt)
dbMap.set(DBList.History_DB, history)

export default dbMap
