import { dialog, Notification, shell } from 'electron'
import { lstat } from 'node:fs/promises'
import clipboardEx from 'electron-clipboard-ex'
import fs from 'fs'
import logger from './logger'
import child_process from "child_process";
import pkg from '../../../../package.json'

export function showNotification(options: INotification) {
	const notification = new Notification({
		title: options.title,
		body: options.body,
		// icon: options.icon || undefined
	})

	const handleClick = () => {
		// TODO: main与renderer线程咋都不能触发click事件？？
		logger.info(`handle click`)
		if (options.clickFn) {
			options.clickFn()
		}
	}

	notification.once('click', function () {
		handleClick()
	})
	notification.once('close', () => {
		notification.removeListener('click', handleClick)
	})
	notification.show()
}

export const isDirectory = (value: string) =>
	new Promise<boolean>((resolve, reject) => {
		lstat(value)
			.then(stats => resolve(stats.isDirectory()))
			.catch(err => reject(err))
	})

export const hasImage = (value: string): boolean => clipboardEx.hasImage()

export function getFileType(filePath: string) {
	const buffer = Buffer.alloc(256)
	const fd = fs.openSync(filePath, 'r')
	fs.readSync(fd, buffer, 0, 256, 0)
	fs.closeSync(fd)
	return fileType(buffer)
}

function fileType(buffer: any) {
	const types: any = {
		ffd8ffe0: 'jpg',
		'89504e47': 'png',
		'47494638': 'gif',
		'25504446': 'pdf',
		'49492a00': 'tif',
		'4d4d002a': 'tiff',
		d0cf11e0: 'doc',
		'504b0304': 'docx',
		'3c68746d': 'html',
		'23232031': 'md',
		'23232032': 'md',
		'23206c6f': 'md',
		'55676c69': 'md',
		'23204672': 'md',
		'2320616e': 'md',
		'2320656c': 'md', // TODO: 为啥md这么多？
		'3c3f786d': 'xml',
		efbbbf3c: 'xml',
		'52494646': 'avi',
		'52617221': 'rar',
		'57415645': 'wav',
		'00000020': 'mp4',
		'464c5601': 'flv',
		'424d8e0a': 'bmp',
		'41433130': 'dwg',
		'2e524d46': 'rmvb',
		// '3c3f786d': 'psd', // 与xml冲突
	}
	let hex = buffer.toString('hex', 0, 4)
	return { hex: hex, type: types[hex] }
}

export function updateChecker() {
	// 获取是否有更新
	let fetchVersionCMD = "curl -sL \"https://api.github.com/repos/petgpt/petgpt/releases/latest\" | find \"tag_name\" | for /F \"delims=: tokens=2\" %a in ('more') do @echo %~a"
	let childProcess = child_process.exec(fetchVersionCMD);
	childProcess.stdout?.on('data', (data) => {
		let raw = data.trim();
		let version = raw.substring(1, raw.length - 2)
		if (version && version != 'v'+pkg.version) {
			dialog.showMessageBox({
				title: '检查到新版本',
				message: `检查到新版本: ${version}, 是否跳转下载地址`,
				detail: `下载地址：https://github.com/petgpt/petgpt/releases`,
				buttons: ['确定', '取消']
			}).then((response) => {
				if (response.response === 0) {
					shell.openExternal('https://github.com/petgpt/petgpt/releases');
				}
			}).catch((error) => {
				console.error(error);
			});
		}
	});
}
