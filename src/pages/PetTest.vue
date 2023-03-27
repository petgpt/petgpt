<template>
  <div class="gif"></div>
</template>

<script setup lang="ts">
import {onBeforeMount, ref} from 'vue'
import {SET_MAIN_WINDOW_POS} from "../utils/events/constants";
import {sendToMain} from "../utils/dataSender";

const dragging = ref(false)
const wX = ref(-1)
const wY = ref(-1)
const screenX = ref(-1)
const screenY = ref(-1)

onBeforeMount(() => {
  window.addEventListener('mousedown', handleMouseDown, false)
  window.addEventListener('mousemove', handleMouseMove, false)
  window.addEventListener('mouseup', handleMouseUp, false)
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
    console.log(`move`, xLoc, yLoc)
    sendToMain(SET_MAIN_WINDOW_POS, {
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
    // if (e.button === 0) { // left mouse
    //   openUploadWindow()
    // } else {
    //   openContextMenu()
    // }
  }
}

</script>

<style scoped>
.gif {
  height: 150px;
  width: 180px;
  background: transparent url("../assets/gif/1.gif") no-repeat;
  background-size: contain;
}
</style>
