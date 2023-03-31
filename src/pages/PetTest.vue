<template>
  <div class="gif" :style="{ background: 'transparent ' + 'url(' + imageUrl + ')' + ' no-repeat'}"></div>
</template>

<script setup lang="ts">
import {onBeforeMount, onBeforeUnmount, onMounted, ref} from 'vue'
import {Mouse_Event_Click, Set_Main_Window_Pos} from "../utils/events/constants";
import {sendToMain} from "../utils/dataSender";
import image from '../assets/gif/1.gif'
import image2 from '../assets/gif/2.gif'
import {ipcRenderer, IpcRendererEvent} from "electron";

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

  ipcRenderer.on('changeImage-replay', (event: IpcRendererEvent, args) => {
    console.log(`收到changeImage, args:`, args)
    if (imageUrl.value === image2) {
      imageUrl.value = image
    } else {
      imageUrl.value = image2
    }
  })
})
onBeforeUnmount(() => {
  ipcRenderer.removeAllListeners('changeImage-replay')
  window.removeEventListener('mousedown', handleMouseDown)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})

onMounted(() => {})

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
      width: 200,
      height: 170,
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
      // console.log("click", e)
      sendToMain(Mouse_Event_Click, {
        test: 1
      })
    } else {
      // openContextMenu()
    }
  }
}

</script>

<style scoped>
.gif {
  height: 150px;
  width: 180px;
  /*background: transparent url("../assets/gif/1.gif") no-repeat;*/
  background-size: contain;
}
</style>
