import { getRawData } from './common'
import { ipcRenderer } from 'electron'

export function sendToMain(channel: string, ...args: any[]) {
	const data = getRawData(args)
	ipcRenderer.send(channel, ...data)
}
