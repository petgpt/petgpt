<template>
	<div @mouseenter="toolsVisible = true" @mouseleave="toolsVisible = false" class="pet h-fit">
		<div class="pet-container flex-r-c m-4">
			<div class="gif h-20 w-40" :style="{ background: 'transparent ' + 'url(' + imageUrl + ')' + ' no-repeat' }"></div>
		</div>
		<div class="pet-actions flex flex-row content-center items-center justify-center" v-if="toolsVisible">
			<button class="btn-xs btn" @click="openDetailWindow">details</button>
			<button class="btn-xs btn" @click="openChatWindow">chat</button>
			<button class="btn-xs btn" @click="openSettingWindow">setting</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue'
import image from '../assets/gif/1.gif'
import image2 from '../assets/gif/2.gif'

import { ipcRenderer, IpcRendererEvent } from 'electron'
import {
	Change_Image_Replay,
	Create_Window,
	Main_Window_Height,
	Main_Window_Width,
	Set_Main_Window_Pos,
} from '../../common/constants'
import { DBList, IWindowList } from '../../common/enum'
import { sendToMain } from '../utils/dataSender'
import { logger } from '../utils/common'

const toolsVisible = ref(false)
const dragging = ref(false)
const wX = ref(-1)
const wY = ref(-1)
const screenX = ref(-1)
const screenY = ref(-1)

const imageUrl = ref(image)

onBeforeMount(() => {
	window.addEventListener('mousedown', handleMouseDown, false)
	window.addEventListener('mousemove', handleMouseMove, false)
	window.addEventListener('mouseup', handleMouseUp, false)

	ipcRenderer.on(Change_Image_Replay, (event: IpcRendererEvent, args) => {
		logger(`收到changeImage, args:`, args)
		if (imageUrl.value === image2) {
			imageUrl.value = image
		} else {
			imageUrl.value = image2
		}
	})
})
onBeforeUnmount(() => {
	ipcRenderer.removeAllListeners(Change_Image_Replay)
	window.removeEventListener('mousedown', handleMouseDown)
	window.removeEventListener('mousemove', handleMouseMove)
	window.removeEventListener('mouseup', handleMouseUp)
})

const mainW = ref<number>()
const mainH = ref<number>()
onMounted(() => {
	ipcRenderer.invoke('db-get', { db: DBList.Config_DB, key: Main_Window_Width }).then(res => (mainW.value = res))
	ipcRenderer.invoke('db-get', { db: DBList.Config_DB, key: Main_Window_Height }).then(res => (mainH.value = res))
})

function handleMouseDown(e: MouseEvent) {
	dragging.value = true
	wX.value = e.pageX
	wY.value = e.pageY
	screenX.value = e.screenX
	screenY.value = e.screenY
}

function handleMouseMove(e: MouseEvent) {
	e.preventDefault()
	e.stopPropagation()
	if (dragging.value) {
		const xLoc = e.screenX - wX.value
		const yLoc = e.screenY - wY.value
		// logger(`xLoc: ${xLoc}, yLoc: ${yLoc}, wX: ${wX.value}, wY: ${wY.value}, screen.w:${window.screen.width}, screen.h:${window.screen.height}, screenX: ${e.screenX}, screenY: ${e.screenY}`)

		// if current window is edge of screen, then can't move out of screen
		// TODO: 这里的减去的值，和初始化的时候设置的PetWindow的大小有关。弄成配置项？
		if (xLoc < 0 || yLoc < 0 || xLoc > window.screen.width - 260 || yLoc > window.screen.height - 250) {
			// logger(`return`)
			return
		}

		sendToMain(Set_Main_Window_Pos, {
			x: xLoc,
			y: yLoc,
			width: mainW.value, // 移动的时候可以改变窗口大小的
			height: mainH.value,
		})
		// remote.BrowserWindow.getFocusedWindow()!.setBounds({
		//   x: xLoc,
		//   y: yLoc,
		//   width: 64,
		//   height: 64
		// })
	}
}

function handleMouseUp(e: MouseEvent) {
	dragging.value = false
	if (screenX.value === e.screenX && screenY.value === e.screenY) {
		if (e.button === 0) {
			// left mouse
			logger('click', e)
			// sendToMain(Mouse_Event_Click, {
			//   test: 1
			// })
		} else {
			// openContextMenu()
		}
	}
}

const openDetailWindow = () => sendToMain(Create_Window, { window: IWindowList.PET_DETAIL_WINDOW, hash: 'petDetail' })

const openChatWindow = () => sendToMain(Create_Window, { window: IWindowList.PET_CHAT_WINDOW, hash: 'chatgpt' })

const openSettingWindow = () => sendToMain(Create_Window, { window: IWindowList.PET_SETTING_WINDOW, hash: 'setting' })
</script>

<style scoped></style>
