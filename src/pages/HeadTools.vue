<template>
  <router-view v-if="routerLocation === '/'"/>
  <el-container v-else direction="vertical" style="background: #ffffff; border-radius: 20px;">
    <el-header class="header" v-if="os === 'win32'" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp">
      <div>
        <el-icon style="cursor: pointer" :size="17" @click="minusWindow"><Minus /></el-icon>
        <el-icon style="cursor: pointer" :size="17" @click="closeWindow"><Close /></el-icon>
      </div>
<!--      <el-col :span="4" class="tool-move">-->
<!--        <div v-if="!showMoveIcon">-->
<!--          <svg t="1681635948199" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1654" width="17" height="17"><path d="M872.6 476h-632l232.2-224.2c14.3-13.8 14.7-36.6 0.9-50.9-13.8-14.3-36.6-14.7-50.9-0.9l-294 283.9c-1.1 0.9-2.2 1.9-3.2 3-6.6 6.8-9.9 15.6-10.1 24.4v1.4c0.2 8.8 3.5 17.6 10.1 24.4 1 1.1 2.1 2 3.2 3l294 283.9c14.3 13.8 37.1 13.4 50.9-0.9 13.8-14.3 13.4-37.1-0.9-50.9L240.6 548h632c19.9 0 36-16.1 36-36s-16.1-36-36-36z" fill="#515151" p-id="1655"></path></svg>-->
<!--        </div>-->
<!--        <div v-if="showMoveIcon" @click="moveIconClickHandler">-->
<!--          <svg t="1681635451194" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1828" width="17" height="17"><path d="M476.5 924V100c0-19.8 16.2-36 36-36s36 16.2 36 36v824c0 19.8-16.2 36-36 36s-36-16.2-36-36z" fill="#515151" p-id="1829"></path><path d="M100.5 476h824c19.8 0 36 16.2 36 36s-16.2 36-36 36h-824c-19.8 0-36-16.2-36-36s16.2-36 36-36zM690.1 797.6L538.4 949.3c-14.3 14.3-37.4 14.3-51.7 0L334.2 796.8c-14.3-14.3-14.6-37.9 0-52 14.1-13.5 36.5-13.4 50.4 0.5l117.6 117.6c5.8 5.8 15.1 5.8 20.8 0l115.6-115.6c14.3-14.3 37.9-14.6 52 0 13.5 14.1 13.4 36.5-0.5 50.3zM333.7 226.4L485.4 74.7c14.3-14.3 37.4-14.3 51.7 0l152.5 152.5c14.3 14.3 14.6 37.9 0 52-14.1 13.5-36.5 13.4-50.4-0.5L521.6 161.1c-5.8-5.8-15.1-5.8-20.8 0L385.1 276.7c-14.3 14.3-37.9 14.6-52 0-13.4-14.1-13.3-36.5 0.6-50.3z" fill="#515151" p-id="1830"></path><path d="M226.7 690.1L75.1 538.4c-14.3-14.3-14.3-37.4 0-51.7l152.5-152.5c14.3-14.3 37.9-14.6 52 0 13.5 14.1 13.4 36.5-0.5 50.4L161.5 502.2c-5.8 5.8-5.8 15.1 0 20.8l115.6 115.6c14.3 14.3 14.6 37.9 0 52-14.1 13.5-36.5 13.4-50.4-0.5zM798.1 333.7l151.7 151.7c14.3 14.3 14.3 37.4 0 51.7L797.3 689.6c-14.3 14.3-37.9 14.6-52 0-13.5-14.1-13.4-36.5 0.5-50.4l117.6-117.6c5.8-5.8 5.8-15.1 0-20.8L747.8 385.1c-14.3-14.3-14.6-37.9 0-52 14.1-13.4 36.5-13.3 50.3 0.6z" fill="#515151" p-id="1831"></path></svg>-->
<!--        </div>-->
<!--        <div v-if="!showMoveIcon">-->
<!--          <svg t="1681635971130" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1852" width="17" height="17"><path d="M151.4 548h632L551.2 772.2c-14.3 13.8-14.7 36.6-0.9 50.9 13.8 14.3 36.6 14.7 50.9 0.9l294-283.9c1.1-0.9 2.2-1.9 3.2-3 6.6-6.8 9.9-15.6 10.1-24.4v-0.7-0.7c-0.2-8.8-3.5-17.6-10.1-24.4-1-1.1-2.1-2-3.2-3L601.2 200c-14.3-13.8-37.1-13.4-50.9 0.9-13.8 14.3-13.4 37.1 0.9 50.9L783.4 476h-632c-19.9 0-36 16.1-36 36s16.1 36 36 36z" fill="#515151" p-id="1853"></path></svg>-->
<!--        </div>-->
<!--      </el-col>-->
    </el-header>
    <el-main>
      <div class="layout">
        <div class="layout-right">
          <router-view />
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
// ---------------- header ----------------
import {onMounted, ref} from "vue";
import {ipcRenderer} from "electron";
import {sendToMain} from "../utils/dataSender";
import {
  Detail_Window_Height,
  Detail_Window_Width,
  Set_Detail_Window_Pos,
} from "../utils/events/constants";
import {DBList} from "../../electron/main/types/enum";

const os = ref('')
const routerLocation = ref('')

onMounted(async () => {
  os.value = await ipcRenderer.invoke('getOperatingSystem')
  let fullLocation = await ipcRenderer.invoke('get-router-location')
  routerLocation.value = fullLocation ? fullLocation.split('#')[1] : '/'
  console.log(`routerLocation:`, routerLocation)

  ipcRenderer.invoke('db-get', {db: DBList.Config_DB, key: Detail_Window_Width}).then(res => mainW.value = res)
  ipcRenderer.invoke('db-get', {db: DBList.Config_DB, key: Detail_Window_Height}).then(res => mainH.value = res)
})


function closeWindow() {
  sendToMain('close')
}

function minusWindow() {
  sendToMain('minus')
}

// -------- 拖动 ------------
const dragging = ref(false)
const wX = ref(-1)
const wY = ref(-1)
const screenX = ref(-1)
const screenY = ref(-1)
const mainW = ref<number>()
const mainH = ref<number>()
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

    if (xLoc < 0 || yLoc < 0) {
      return
    }

    sendToMain(Set_Detail_Window_Pos, {
      x: xLoc,
      y: yLoc,
      width: mainW.value, // 移动的时候可以改变窗口大小的
      height: mainH.value,
    })
  }
}

function handleMouseUp (e: MouseEvent) {
  dragging.value = false
  if (screenX.value === e.screenX && screenY.value === e.screenY) {
    if (e.button === 0) { // left mouse
      console.log("click", e)
    } else {
    }
  }
}

const showMoveIcon = ref(true)

function moveIconClickHandler() {
  showMoveIcon.value = !showMoveIcon.value
}
</script>

<style scoped lang="less">
.el-header{
  height: 30px !important;
  padding: 3px !important;
}
.header {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  align-content: center;
  background-color: @backgroundColor;
  justify-content: space-between;
  margin-right: 5px;
  margin-left: 5px;
}
.tool-move{
  cursor: pointer;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: space-around;
  align-items: center;
}
</style>
