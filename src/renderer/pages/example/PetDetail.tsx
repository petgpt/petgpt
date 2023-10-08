import { useEffect, useState } from 'react'
import { ipcRenderer } from 'electron'
import { DBList, IWindowList } from '../../../common/enum'
import { logger, sendToMain } from '../../utils/common'
import {
	Change_Image,
	Execute_Cmd,
	Get_ClipBoard_Type,
	Get_System_File_Path,
	Reset_Short_Key,
	Set_Short_Keys,
	Sys_Notification,
} from '../../../common/constants'
import './PetDetail.css'
import { useLocalStorage } from '@uidotdev/usehooks'
import IpcRendererEvent = Electron.IpcRendererEvent

function StartRecordingSVG(props: { onClick: () => Promise<void> }) {
	return (
		<svg
			onClick={props.onClick}
			className="cursor-pointer"
			xmlns="http://www.w3.org/2000/svg"
			width="25"
			height="25"
			viewBox="0 0 24 24"
		>
			<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
				<rect width="6" height="11" x="9" y="3" rx="3" />
				<path d="M19 11a7 7 0 1 1-14 0m7 7v3" />
			</g>
		</svg>
	)
}

function StopRecordingSVG(props: { onClick: () => Promise<void> }) {
	return (
		<svg
			onClick={props.onClick}
			className="cursor-pointer"
			xmlns="http://www.w3.org/2000/svg"
			width="25"
			height="25"
			viewBox="0 0 24 24"
		>
			<g fill="none" fillRule="evenodd">
				<path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z" />
				<path
					fill="currentColor"
					d="m12 13.414l5.657 5.657a1 1 0 0 0 1.414-1.414L13.414 12l5.657-5.657a1 1 0 0 0-1.414-1.414L12 10.586L6.343 4.929A1 1 0 0 0 4.93 6.343L10.586 12l-5.657 5.657a1 1 0 1 0 1.414 1.414L12 13.414Z"
				/>
			</g>
		</svg>
	)
}

function PetDetail() {
	const [os, setOs] = useState<string>(process.platform)
	const [select, setSelect] = useState('')
	const [options, setOptions] = useState<{ id: string; name: string }[]>([])
	const [platform, setPlatform] = useState<string>(process.platform)
	const [computedStoreTitle, setComputedStoreTitle] = useState<string>()
	// const [persistStoreTestCount, setPersistStoreTestCount] = useState<string>();
	const [persistStoreTestCount, setPersistStoreTestCount] = useLocalStorage<string | undefined>('PersistStoreTest', '0')
	const [shortcut, setShortcut] = useState<string>('')
	const [oldKeys, setOldKeys] = useState('')
	const [placeholder, setPlaceholder] = useState<string>('')
	const [dirPath, setDirPath] = useState<string>('')
	const [clipBoardType, setClipBoardType] = useState<string>('')
	const [cmd, setCmd] = useState<string>(
		'"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" --chrome-frame --incognito --app=https://www.baidu.com'
	)
	const [dbGetContent, setDbGetContent] = useState<string>('')
	const [dbKey, setDbKey] = useState<string>('')
	const [key, setKey] = useState<string>('')
	const [value, setValue] = useState<string>('')
	const [keyToDelete, setKeyToDelete] = useState<string>('')
	const [dragContent, setDragContent] = useState<string>('')
	const [dragover, setDragover] = useState(false)

	useEffect(() => {
		;(async function getOs() {
			const os = await ipcRenderer.invoke('getOperatingSystem')
			setOs(os)
		})()

		const types = [
			'video/webm',
			'audio/webm',
			'video/webm;codecs=vp8',
			'video/webm;codecs=daala',
			'video/webm;codecs=h264',
			'audio/webm;codecs=opus',
			'video/mpeg',
			'audio/mpeg-3',
		]

		for (let i in types) {
			logger(types[i] + '：' + (MediaRecorder.isTypeSupported(types[i]) ? '支持' : '不支持'))
		}
	}, [])

	function pushRouter() {
		ipcRenderer.send('router', { window: IWindowList.PET_DETAIL_WINDOW, hash: 'chatgpt' })
	}

	function addPersistStoreTest() {
		setPersistStoreTestCount(prevCount => {
			const newCount = Number(prevCount) + 1
			return String(newCount)
		})
	}

	function ipcRenderInvokeTest() {
		// invoke方法会返回一个promise对象，可以通过then方法获取返回值。可以通过catch捕获主进程处理函数抛出的错误。
		ipcRenderer.invoke('ping', '[invoke]ping').then((arg: { msg: string }) => {
			logger(arg)
		})
	}

	function ipcRenderSendTest() {
		sendToMain('ping', '[send]ping') // 通过异步事件发送消息。只需要向主进程发送消息，可以使用ipcRenderer.send方法

		// send方法不会返回任何结果，send方法不提供错误处理机制
		ipcRenderer.on('ping-replay', (event: IpcRendererEvent, arg: { msg: string }) => {
			logger(arg)
		})
	}

	function inputBlur() {
		setPlaceholder('点击设置快捷键')
		const formatKeys = shortcut.replace('\ue672', 'CommandOrControl')
		const keyArr = formatKeys.split('+')
		if (formatKeys && keyArr.slice(-1)[0].trim()) {
			// 将设置好的截图快捷键发送给主进程，让其重新设置
			let params = {
				new: formatKeys,
				old: oldKeys,
			}
			setOldKeys(formatKeys)
			ipcRenderer.send(Set_Short_Keys, params)

			// TODO: persist short key
			logger(`shortKey:`, params)
		}
	}

	function getShortKeys(e: React.KeyboardEvent<HTMLInputElement>) {
		e.preventDefault()
		// ====== 禁止上下左右按键 ===== start
		const list = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

		if (list.includes(e.key)) return

		// ====== 禁止上下左右按键 =====
		const str: string = shortcut
		// 获取用户有没有按下特殊按键【'Control', 'Alt', 'Shift', 'Meta'】
		const auxiliaryKey = [
			e.ctrlKey ? 'Ctrl' : '',
			e.altKey ? 'Alt' : '',
			e.shiftKey ? 'Shift' : '',
			e.metaKey ? '\ue672' : '',
		].filter(t => t)

		const someKeys = ['Control', 'Alt', 'Shift', 'Meta']

		// mac下禁止使用快捷键option
		let publicKey = someKeys.indexOf(e.key) < 0 ? e.key.toLocaleUpperCase() : ''
		if (platform === 'darwin' && e.altKey) {
			publicKey = ''
		}
		if (auxiliaryKey.length) {
			setShortcut(auxiliaryKey.join('+') + '+' + publicKey)
		} else {
			setShortcut(str.substring(0, str.lastIndexOf('+') + 1) + publicKey)
		}
	}

	function clearAllShortKey() {
		if (oldKeys !== '') {
			ipcRenderer.send(Reset_Short_Key, oldKeys)
			setShortcut('')
		}
	}

	function getSystemDirPath() {
		sendToMain(Get_System_File_Path)
		ipcRenderer.on(Get_System_File_Path, (event: IpcRendererEvent, arg: { path: string }) => {
			logger(`[renderer][on:${Get_System_File_Path}]获取到的文件夹路径:`, arg.path)
			setDirPath(arg.path)
		})
	}

	function getClipBoardType() {
		ipcRenderer
			.invoke(Get_ClipBoard_Type)
			.then(arg => {
				logger(`[renderer][on:Get_ClipBoard_Type]获取到的剪贴板信息:`, arg)
				setClipBoardType(JSON.stringify(arg))
			})
			.catch(err => {
				alert(`获取到的剪贴板信息 err:${JSON.stringify(err)}`)
			})
	}

	function showSysNotification() {
		ipcRenderer.send(Sys_Notification, {
			title: '系统通知',
			body: '这是一个main线程触发的通知',
		})

		new Notification('Title', { body: 'Notification from the Renderer process. Click to log to console.' })
	}

	function changeImage() {
		ipcRenderer.send(Change_Image, '[from detail/send] from detail.vue send to main thread')
	}

	function executeCmd() {
		// 现在不知道为啥不行了，以前是可以的
		ipcRenderer.send(Execute_Cmd, cmd)
	}

	function openConfigFile() {
		ipcRenderer.send('open-file', 'data.json')
	}

	function dbGetKey() {
		ipcRenderer.invoke('db-get', { db: DBList.Config_DB, key: dbKey }).then(res => {
			setDbGetContent(JSON.stringify(res))
		})
	}

	function dbRead() {
		ipcRenderer.invoke('db-read', { db: DBList.Config_DB }).then(res => {
			setDbGetContent(JSON.stringify(res))
		})
	}

	function dbSet() {
		ipcRenderer.send('db-set', { db: DBList.Config_DB, key: key, value: value })
	}

	function dbDelete() {
		ipcRenderer.send('db-delete', { db: DBList.Config_DB, key: keyToDelete })
	}

	let chunks: any = [] //will be used later to record audio
	let recorder: any = null

	async function startRecording() {
		// let stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
		// recorder = new RecordRTCPromisesHandler(stream, {
		//   type: 'audio',
		// })
		// recorder.startRecording()
	}

	async function stopRecording() {
		// await recorder.stopRecording()
		// let blob = await recorder.getBlob()
		// invokeSaveAsDialog(blob)
	}

	async function invokeSaveAsDialog(blob: any) {
		// const buffer = Buffer.from(await blob.arrayBuffer())
		//
		// const { canceled, filePath } = await ipcRenderer.invoke('showSaveDialog')
		// if (canceled) return
		//
		// if (filePath) {
		//   writeFile(filePath, buffer, () => logger('video saved successfully!'))
		// }
	}

	function onDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault()
		setDragover(false)
		const items = e.dataTransfer?.items!
		const files = e.dataTransfer?.files!

		if (files?.length) {
			console.log(`files: `, e.dataTransfer?.files!)
			setDragContent(
				Object.keys(e.dataTransfer?.files!)
					.map((key: any) => `(${e.dataTransfer?.files![key].type})` + e.dataTransfer?.files![key].path)
					.join(', ')
			)
		} else {
			if (items.length === 2 && items[0].type === 'text/uri-list') {
				// handleURLDrag(items, e.dataTransfer!)
				console.log(`e.dataTransfer!: `, e.dataTransfer!)
				setDragContent(e.dataTransfer!.getData(items[0].type))
			} else if (items[0].type === 'text/plain') {
				const str = e.dataTransfer!.getData(items[0].type)
				console.log(`文本:`, str)
				setDragContent(str)
				// if (isUrl(str)) {
				//   sendToMain('uploadChoosedFiles', [{ path: str }])
				// } else {
				//   $message.error($T('TIPS_DRAG_VALID_PICTURE_OR_URL'))
				// }
			} else {
				console.log(`未知拖拽类型`)
			}
		}
	}

	return (
		<div>
			{platform != null ? (
				<div style={{ backgroundColor: 'red' }}>功能演示, 平台{platform}</div>
			) : (
				<div>process.platform不存在</div>
			)}
			<div>
				<button className="btn btn-info btn-xs" onClick={pushRouter}>
					跳转到Chatgpt页面
				</button>
				<div className="divider">divider</div>
				<div>
					获取全局状态title: {computedStoreTitle}
					<div>
						持久化状态count(存放在localStorage): {persistStoreTestCount}
						<button className="btn btn-info btn-xs" onClick={addPersistStoreTest}>
							点击+1 不受刷新影响
						</button>
					</div>
				</div>
				<div className="divider">divider</div>
				<div>
					main renderer线程通信：
					<button className="btn btn-info btn-xs" onClick={ipcRenderInvokeTest}>
						invoke
					</button>
					<button className="btn btn-info btn-xs" onClick={ipcRenderSendTest}>
						send
					</button>
				</div>
				<div className="divider">divider</div>
				<div>
					点击开始监听用户按下的组合键：
					<input
						value={shortcut}
						className="w-40"
						placeholder={placeholder}
						onBlur={inputBlur}
						onKeyDown={e => getShortKeys(e)}
						onChange={e => setShortcut(e.target.value)}
					/>
					<button className="btn btn-info btn-xs" onClick={clearAllShortKey}>
						X
					</button>
					{/* maxLength="20" */}
				</div>
				<div className="divider">divider</div>
				<div>
					点击获取系统路径：{dirPath}
					<button className="btn btn-info btn-xs" onClick={getSystemDirPath}>
						获取系统路径
					</button>
					<div>
						剪贴板内容类型:{clipBoardType}
						<button className="btn btn-info btn-xs" onClick={getClipBoardType}>
							获取
						</button>
					</div>
					<div>
						<button className="btn btn-info btn-xs" onClick={showSysNotification}>
							弹系统通知
						</button>
						<button className="btn btn-info btn-xs" onClick={changeImage}>
							切换pet gif
						</button>
					</div>
				</div>
			</div>
			<div className="divider">divider</div>
			<div>
				<div>
					输入正确的cmd命令（提供了一个示例）：
					<button className="btn btn-info btn-xs" onClick={executeCmd}>
						执行cmd
					</button>
					<input value={cmd} className="w-72" onChange={e => setCmd(e.target.value)} />
				</div>
				{/*   输入参数数组(string[]，|号分隔)(TODO：有些参数没有效果)：<el-input v-model="parameters"></el-input> */}
			</div>
			<div className="divider">↓↓ 打开配置文件 ↓↓</div>
			<div>
				<button className="btn btn-info btn-xs" onClick={openConfigFile}>
					打开配置文件
				</button>
			</div>
			<div className="divider">↓↓ 配置文件的CRUD ↓↓</div>
			<div>
				<div>
					<div style={{ wordWrap: 'break-word' }}>获取到的内容： {dbGetContent}</div>
					<input className="w-16" placeholder="key" value={dbKey} onChange={e => setDbKey(e.target.value)} />
					<button className="btn btn-info btn-xs" onClick={dbGetKey}>
						db-getByKey
					</button>
					<button className="btn btn-info btn-xs" onClick={dbRead}>
						db-readAll
					</button>
				</div>
				<div />
				<div>
					<input className="w-16" placeholder="key" value={key} onChange={e => setKey(e.target.value)} />
					<input className="w-16" placeholder="value" value={value} onChange={e => setValue(e.target.value)} />
					<button className="btn btn-info btn-xs" onClick={dbSet}>
						db-set
					</button>
				</div>
				<div>
					<input
						className="w-16"
						placeholder="value"
						value={keyToDelete}
						onChange={e => setKeyToDelete(e.target.value)}
					/>
					<button className="btn btn-info btn-xs" onClick={dbDelete}>
						db-delete
					</button>
				</div>
				<div />
			</div>
			<div className="divider">↓↓ audio capture ↓↓</div>
			<div>
				<div className="flex flex-row">
					{os && os === 'win32' ? (
						<>
							<StartRecordingSVG onClick={startRecording} />
							<StopRecordingSVG onClick={stopRecording} />
						</>
					) : null}
					{/* </div> */}
					{/*   <div className="divider">↓↓ drag ↓↓</div> */}
					{/*   <div */}
					{/* 		@dragover.prevent="dragover = true" */}
					{/*     @drop.prevent="onDrop" */}
					{/*     @dragleave.prevent="dragover = false" */}
					{/*     className="upload-container" */}
					{/*     :className="dragover ? 'dragover' : ''" */}
					{/*     > */}
					{/*     拖拽文本、链接、文件到这里！ */}
					{/* 		<div style="pointer-events: none">测试子元素</div> */}
					{/*   <div className="dragover-border">将文件、链接、文本放到此处</div> */}
					{/* </div> */}
				</div>
			</div>
			<div className="divider">↓↓ drag ↓↓</div>
			<div
				className={`upload-container ${dragover ? 'dragover' : ''}`}
				onDragOver={e => {
					e.preventDefault()
					setDragover(true)
				}}
				onDragLeave={e => {
					e.preventDefault()
					setDragover(false)
				}}
				onDrop={e => onDrop(e)}
			>
				拖拽文本、链接、文件到这里！
				<div style={{ pointerEvents: 'none' }}>测试子元素</div>
				<div className="dragover-border">将文件、链接、文本放到此处</div>
			</div>
			<div>识别到的东西：{dragContent}</div>
			<div className="divider">↓↓ tailwindcss ↓↓</div>
			<div>
				<h1 className="text-1xl font-bold underline underline-offset-4">Hello world! Tailwindcss</h1>
				<button className="btn btn-info btn-xs bg-violet-500 hover:bg-violet-600 focus:outline-none focus:ring focus:ring-violet-300 active:bg-violet-700">
					原生tailwind
				</button>
			</div>
		</div>
	)
}

export default PetDetail
