<template>
	<div style="background-color: red">功能演示, 平台{{ platform }}</div>
	<div>
		<button class="btn-info btn-xs btn" @click="pushRouter">跳转到Chatgpt页面</button>
		<div class="divider">divider</div>
		<div>
			获取全局状态title: {{ computedStoreTitle }}
			<div>
				持久化状态count(存放在localStorage): {{ persistStoreTestCount }}
				<button class="btn-info btn-xs btn" @click="addPersistStoreTest">点击+1 不受刷新影响</button>
			</div>
		</div>
		<div class="divider">divider</div>
		<div>
			main renderer线程通信：
			<button class="btn-info btn-xs btn" @click="ipcRenderInvokeTest">invoke</button>
			<button class="btn-info btn-xs btn" @click="ipcRenderSendTest">send</button>
		</div>
		<div class="divider">divider</div>
		<div>
			点击开始监听用户按下的组合键：
			<input
				v-model="shortcut"
				class="w-40"
				:placeholder="placeholder"
				@blur="inputBlur()"
				@keydown="getShortKeys"
				@clear="clearAllShortKey"
				maxlength="20"
			/>
		</div>
		<div class="divider">divider</div>
		<div>
			点击获取系统路径：{{ dirPath }}
			<button class="btn-info btn-xs btn" @click="getSystemDirPath">获取系统路径</button>
			<div>
				剪贴板内容类型:{{ clipBoardType }}
				<button class="btn-info btn-xs btn" @click="getClipBoardType">获取</button>
			</div>
			<div>
				<button class="btn-info btn-xs btn" @click="showSysNotification">弹系统通知</button>
				<button class="btn-info btn-xs btn" @click="changeImage">切换pet gif</button>
			</div>
		</div>
	</div>
	<div class="divider">divider</div>
	<div>
		<div>
			输入正确的cmd命令（提供了一个示例）：
			<button class="btn-info btn-xs btn" @click="executeCmd">执行cmd</button>
			<input v-model="cmd" class="w-72" />
		</div>
		<!--    输入参数数组(string[]，|号分隔)(TODO：有些参数没有效果)：<el-input v-model="parameters"></el-input>-->
	</div>
	<div class="divider">↓↓ 打开配置文件 ↓↓</div>
	<div>
		<button class="btn-info btn-xs btn" @click="openConfigFile">打开配置文件</button>
	</div>
	<div class="divider">↓↓ 配置文件的CRUD ↓↓</div>
	<div>
		<div>
			<div style="word-wrap: break-word">获取到的内容： {{ dbGetContent }}</div>
			<input class="w-16" placeholder="key" v-model="dbKey" />
			<button class="btn-info btn-xs btn" @click="dbGetKey">db-getByKey</button>
			<button class="btn-info btn-xs btn" @click="dbRead">db-readAll</button>
		</div>
		<div></div>
		<div>
			<input class="w-16" placeholder="key" v-model="key" />
			<input class="w-16" placeholder="value" v-model="value" />
			<button class="btn-info btn-xs btn" @click="dbSet">db-set</button>
		</div>
		<div>
			<input class="w-16" placeholder="value" v-model="keyToDelete" />
			<button class="btn-info btn-xs btn" @click="dbDelete">db-delete</button>
		</div>
		<div></div>
	</div>
	<div class="divider">↓↓ audio capture ↓↓</div>
	<div class="flex flex-row">
		<svg
			v-if="os && os === 'win32'"
			@click="startRecording"
			class="cursor-pointer"
			xmlns="http://www.w3.org/2000/svg"
			width="25"
			height="25"
			viewBox="0 0 24 24"
		>
			<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
				<rect width="6" height="11" x="9" y="3" rx="3" />
				<path d="M19 11a7 7 0 1 1-14 0m7 7v3" />
			</g>
		</svg>
		<svg
			v-if="os && os === 'win32'"
			@click="stopRecording"
			class="cursor-pointer"
			xmlns="http://www.w3.org/2000/svg"
			width="25"
			height="25"
			viewBox="0 0 24 24"
		>
			<g fill="none" fillRule="evenodd">
				<path
					d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
				></path>
				<path
					fill="currentColor"
					d="m12 13.414l5.657 5.657a1 1 0 0 0 1.414-1.414L13.414 12l5.657-5.657a1 1 0 0 0-1.414-1.414L12 10.586L6.343 4.929A1 1 0 0 0 4.93 6.343L10.586 12l-5.657 5.657a1 1 0 1 0 1.414 1.414L12 13.414Z"
				></path>
			</g>
		</svg>
	</div>
	<div class="divider">↓↓ drag ↓↓</div>
	<div
		@dragover.prevent="dragover = true"
		@drop.prevent="onDrop"
		@dragleave.prevent="dragover = false"
		class="upload-container"
		:class="dragover ? 'dragover' : ''"
	>
		拖拽文本、链接、文件到这里！
		<div style="pointer-events: none">测试子元素</div>
		<div class="dragover-border">将文件、链接、文本放到此处</div>
	</div>
	<div>识别到的东西：{{ dragContent }}</div>
	<h1 class="text-1xl font-bold underline underline-offset-4">Hello world! Tailwindcss</h1>
	<button
		class="btn-info btn-xs btn bg-violet-500 hover:bg-violet-600 focus:outline-none focus:ring focus:ring-violet-300 active:bg-violet-700"
	>
		原生tailwind
	</button>
</template>

<script setup lang="ts">
import { usePersistStoreTest, useTitleStore } from '../../store'
import { ipcRenderer, IpcRendererEvent } from 'electron'
import { sendToMain } from '../../utils/dataSender'
import { computed, onMounted, ref } from 'vue'

import { writeFile } from 'fs'
import { RecordRTCPromisesHandler } from 'recordrtc'
import { logger } from '../../utils/common'
import {
	Change_Image,
	Execute_Cmd,
	Get_ClipBoard_Type,
	Get_System_File_Path,
	Reset_Short_Key,
	Set_Short_Keys,
	Sys_Notification,
} from '../../../common/constants'
import { DBList, IWindowList } from '../../../common/enum'

const platform = computed(() => process.platform) // 获取当前的操作系统

// 【start】----------- 全局状态获取 -----------【start】
const titleStore = useTitleStore()
const computedStoreTitle = computed(() => titleStore.title)
const persistStoreTestCount = computed(() => persistStoreTest.state.count)
const storeClick = () => logger(titleStore.title)
// 【end】---------------------- 全局状态获取 ----------------------【end】

// 【start】----------- main线程与renderer线程通信 -----------【start】
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
// 【end】---------------------- main线程与renderer线程通信 ----------------------【end】

// 【start】----------- 全局数据持久化 -----------【start】
const persistStoreTest = usePersistStoreTest()
function addPersistStoreTest() {
	persistStoreTest.state.count++
}
// 【end】---------------------- 全局数据持久化 ----------------------【end】

// 【start】----------- 动态修改快捷键 -----------【start】
// TODO: 可能会与现有的快捷键冲突，例如：ctrl + shift + c 唤起了gif窗口的F12
const shortcut = ref('')
const placeholder = ref('点击input框按下快捷键')
const oldKeys = ref('')
function inputBlur() {
	placeholder.value = '点击设置快捷键'
	const formatKeys = shortcut.value.replace('\ue672', 'CommandOrControl')
	const keyArr = formatKeys.split('+')
	if (formatKeys && keyArr.slice(-1)[0].trim()) {
		// 将设置好的截图快捷键发送给主进程，让其重新设置
		let params = {
			new: formatKeys,
			old: oldKeys.value,
		}
		oldKeys.value = formatKeys
		ipcRenderer.send(Set_Short_Keys, params)

		// TODO: persist short key
		logger(`shortKey:`, params)
	}
}

function getShortKeys(e: KeyboardEvent) {
	e.preventDefault()
	// ====== 禁止上下左右按键 ===== start
	const list = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

	if (list.includes(e.key)) return

	// ====== 禁止上下左右按键 =====
	const str: string = shortcut.value
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
	if (platform.value === 'darwin' && e.altKey) {
		publicKey = ''
	}
	if (auxiliaryKey.length) {
		shortcut.value = auxiliaryKey.join('+') + '+' + publicKey
	} else {
		shortcut.value = str.substring(0, str.lastIndexOf('+') + 1) + publicKey
	}
}

function clearAllShortKey() {
	if (oldKeys.value !== '') ipcRenderer.send(Reset_Short_Key, oldKeys.value)
}
// 【end】--------------------- 动态修改快捷键 ----------------------【end】

// 【start】----------- 获取系统文件路径 -----------【start】
const dirPath = ref('')
function getSystemDirPath() {
	sendToMain(Get_System_File_Path)
	ipcRenderer.on(Get_System_File_Path, (event: IpcRendererEvent, arg: { path: string }) => {
		logger(`[renderer][on:${Get_System_File_Path}]获取到的文件夹路径:`, arg.path)
		dirPath.value = arg.path
	})
}
// 【end】---------------------- 获取系统文件路径 ----------------------【end】

// 【start】----------- 获取剪贴板内容 -----------【start】
const clipBoardType = ref('')
function getClipBoardType() {
	ipcRenderer
		.invoke(Get_ClipBoard_Type)
		.then(arg => {
			logger(`[renderer][on:Get_ClipBoard_Type]获取到的剪贴板信息:`, arg)
			clipBoardType.value = arg
		})
		.catch(err => {
			alert(`获取到的剪贴板信息 err:${JSON.stringify(err)}`)
		})
}
// 【end】---------------------- 获取剪贴板内容 ----------------------【end】

// 【start】----------- main与renderer线程的系统通知 -----------【start】
function showSysNotification() {
	ipcRenderer.send(Sys_Notification, {
		title: '系统通知',
		body: '这是一个main线程触发的通知',
	})

	const NOTIFICATION_TITLE = 'Title'
	const NOTIFICATION_BODY = 'Notification from the Renderer process. Click to log to console.'
	new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY })
}
// 【end】---------------------- main与renderer线程的系统通知 ----------------------【end】

// 【start】----------- 更改Pet的gif展示 -----------【start】
function changeImage() {
	ipcRenderer.send(Change_Image, '[from detail/send] from detail.vue send to main thread')
}
// 【end】---------------------- 更改Pet的gif展示 ----------------------【end】

// 【start】----------- 运行cmd -----------【start】
let cmd = ref(
	'"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" --chrome-frame --incognito --app=https://www.baidu.com'
)
function executeCmd() {
	ipcRenderer.send(Execute_Cmd, cmd.value)
}

// 下面是分离exe与params的写法，main线程用的child_process.execFile来运行
// let exePath = ref('C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe')
// let parameters = ref("--incognito");
// function openExecutableFile() {
//   let args = {
//     executablePath: exePath.value,
//     parameters: parameters.value.split("|")
//     // --incognito|--window-size="1080,1000"|--window-position="0,0" 为啥不行
//     // "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --chrome-frame --app=https://www.baidu.com
//   };
//   logger(`exe arg: `, args)
//   ipcRenderer.send('cmd', args)
// }
// 【end】----------- 运行cmd -----------【end】

// 【start】----------- 打开配置文件 -----------【start】
function openConfigFile() {
	ipcRenderer.send('open-file', 'data.json')
}
// 【end】----------- 打开配置文件 -----------【end】

// 【start】----------- 配置文件的CRUD -----------【start】
let dbGetContent = ref('')
let dbKey = ref('') // 要获取的db key对应的内容
function dbGetKey() {
	ipcRenderer.invoke('db-get', { db: DBList.Config_DB, key: dbKey.value }).then(res => {
		dbGetContent.value = JSON.stringify(res)
	})
}

function dbRead() {
	ipcRenderer.invoke('db-read', { db: DBList.Config_DB }).then(res => {
		dbGetContent.value = JSON.stringify(res)
	})
}

let key = ref('')
let value = ref('')
function dbSet() {
	ipcRenderer.send('db-set', { db: DBList.Config_DB, key: key.value, value: value.value })
}

let keyToDelete = ref('')
function dbDelete() {
	ipcRenderer.send('db-delete', { db: DBList.Config_DB, key: keyToDelete.value })
}
// 【end】----------- 配置文件的CRUD -----------【end】

// 【start】----------- audio capture -----------【start】

const os = ref('')
const select = ref('')
const options = ref<{ id: string; name: string }[]>([])
onMounted(async () => {
	// await initApi(completionParams); // 初始化api，如果修改了completionParams，需要重新初始化
	os.value = await ipcRenderer.invoke('getOperatingSystem')

	let types = [
		'video/webm',
		'audio/webm',
		'video/webm\;codecs=vp8',
		'video/webm\;codecs=daala',
		'video/webm\;codecs=h264',
		'audio/webm\;codecs=opus',
		'video/mpeg',
		'audio/mpeg-3',
	]

	for (let i in types) {
		logger(types[i] + '：' + (MediaRecorder.isTypeSupported(types[i]) ? '支持' : '不支持'))
	}
})

let chunks: any = [] //will be used later to record audio
let recorder: any = null

async function startRecording() {
	let stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
	recorder = new RecordRTCPromisesHandler(stream, {
		type: 'audio',
	})
	recorder.startRecording()
}

async function stopRecording() {
	await recorder.stopRecording()
	let blob = await recorder.getBlob()
	invokeSaveAsDialog(blob)
}

async function invokeSaveAsDialog(blob: any) {
	const buffer = Buffer.from(await blob.arrayBuffer())

	const { canceled, filePath } = await ipcRenderer.invoke('showSaveDialog')
	if (canceled) return

	if (filePath) {
		writeFile(filePath, buffer, () => logger('video saved successfully!'))
	}
}
// 【end】----------- audio capture -----------【end】

// 【start】
function pushRouter() {
	ipcRenderer.send('router', { window: IWindowList.PET_DETAIL_WINDOW, hash: 'chatgpt' })
}

// drag
const dragContent = ref('')
const dragover = ref(false)
function onDrop(e: DragEvent) {
	dragover.value = false
	const items = e.dataTransfer?.items!
	const files = e.dataTransfer?.files!

	if (files?.length) {
		console.log(`files: `, e.dataTransfer?.files!)
		dragContent.value = Object.keys(e.dataTransfer?.files!)
			.map((key: any) => `(${e.dataTransfer?.files![key].type})` + e.dataTransfer?.files![key].path)
			.join(', ')
	} else {
		if (items.length === 2 && items[0].type === 'text/uri-list') {
			// handleURLDrag(items, e.dataTransfer!)
			console.log(`e.dataTransfer!: `, e.dataTransfer!)
			dragContent.value = e.dataTransfer!.getData(items[0].type)
		} else if (items[0].type === 'text/plain') {
			const str = e.dataTransfer!.getData(items[0].type)
			console.log(`文本:`, str)
			dragContent.value = str
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
</script>

<style scoped>
.upload-container {
	position: relative;
	/* 其他样式 */
}

.dragover-border {
	display: none;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border: 3px dashed #29b9b9;
	z-index: 999;
	box-sizing: border-box;
	border-radius: 5px;
	background-color: #121212;
	color: #e1e1e1;
	pointer-events: none;
}

.upload-container.dragover .dragover-border {
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
