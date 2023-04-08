<template>
  <div @mouseenter="toolsVisible = true" @mouseleave="toolsVisible = false">
    <div class="pet-actions" v-if="toolsVisible">
      <el-button type="primary" size="small" @click="openDetailWindow">details</el-button>
      <el-button type="primary" size="small" @click="openChatWindow">chat</el-button>
    </div>
    <div class="pet-container">
      <div class="gif" :style="{ background: 'transparent ' + 'url(' + imageUrl + ')' + ' no-repeat'}"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onBeforeMount, onBeforeUnmount, onMounted, ref} from 'vue'
import {
  Change_Image_Replay,
  Create_Window,
  Main_Window_Height,
  Main_Window_Width,
  Set_Main_Window_Pos
} from "../utils/events/constants";
import {sendToMain} from "../utils/dataSender";
import image from '../assets/gif/1.gif'
import image2 from '../assets/gif/2.gif'
import {ipcRenderer, IpcRendererEvent} from "electron";
import {DBList, IWindowList} from "../../electron/main/types/enum";

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
    console.log(`收到changeImage, args:`, args)
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
  ipcRenderer.invoke('db-get', {db: DBList.Config_DB, key: Main_Window_Width}).then(res => mainW.value = res)
  ipcRenderer.invoke('db-get', {db: DBList.Config_DB, key: Main_Window_Height}).then(res => mainH.value = res)
})

function handleMouseDown (e: MouseEvent) {
  dragging.value = true
  wX.value = e.pageX
  wY.value = e.pageY
  screenX.value = e.screenX
  screenY.value = e.screenY
}

function handleMouseMove (e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (dragging.value) {
    const xLoc = e.screenX - wX.value
    const yLoc = e.screenY - wY.value
    // console.log(`move`, xLoc, yLoc)
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

function handleMouseUp (e: MouseEvent) {
  dragging.value = false
  if (screenX.value === e.screenX && screenY.value === e.screenY) {
    if (e.button === 0) { // left mouse
      console.log("click", e)
      // sendToMain(Mouse_Event_Click, {
      //   test: 1
      // })
    } else {
      // openContextMenu()
    }
  }
}

const openDetailWindow = () => sendToMain(Create_Window, {window: IWindowList.PET_DETAIL_WINDOW, hash: 'petDetail'})

const openChatWindow = () => sendToMain(Create_Window, {window: IWindowList.PET_CHAT_WINDOW, hash: 'chatgpt'})

</script>

<style scoped>
.gif {
  height: 100px;
  width: 170px;
  /*background: transparent url("../assets/gif/1.gif") no-repeat;*/
  /*background-size: contain;*/
  /*position: absolute;*/
  /*top: 90px;*/
  /*left: 18px;*/
  /*border: 3px solid red;*/
}
.pet-actions{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-content: center;
}
.pet-container{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-content: center;
  margin-top: 10px;
}
</style>
