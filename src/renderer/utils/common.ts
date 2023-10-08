import { ipcRenderer } from 'electron'

export const getRawData = (args: any): any => {
	if (Array.isArray(args)) {
		return args.map((item: any) => {
			return getRawData(item)
		})
	}
	if (typeof args === 'object') {
		const data = {} as any
		Object.keys(args).forEach(key => {
			const item = args[key]
			data[key] = getRawData(item)
		})
		return data
	}
	return args
}

export const sleep = (ms: number) =>
	new Promise(resolve => {
		setTimeout(resolve, ms)
	})

export function isNumber<T extends number>(value: T | unknown): value is number {
	return Object.prototype.toString.call(value) === '[object Number]'
}

export function isString<T extends string>(value: T | unknown): value is string {
	return Object.prototype.toString.call(value) === '[object String]'
}

export function isNotEmptyString(value: any): boolean {
	return typeof value === 'string' && value.length > 0
}

export function isBoolean<T extends boolean>(value: T | unknown): value is boolean {
	return Object.prototype.toString.call(value) === '[object Boolean]'
}

export function isFunction<T extends (...args: any[]) => any | void | never>(value: T | unknown): value is T {
	return Object.prototype.toString.call(value) === '[object Function]'
}

export function sendToMain(channel: string, ...args: any[]) {
	const data = getRawData(args)
	ipcRenderer.send(channel, ...data)
}

export function logger(...args: any[]) {
	sendToMain('log', JSON.stringify({ ...args }))
}
