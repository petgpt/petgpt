<template>
  <router-view v-if="routerLocation === '/'"/>
  <el-container v-else direction="vertical" style="background: #ffffff; border-radius: 20px;">
    <el-header class="header" v-if="os === 'win32'">
      <div class="header-btns">
        <svg id="pin-icon" @click="pinCurrentWindow" style="cursor: pointer" t="1681655634099" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="905" width="20" height="20"><path d="M648.728381 130.779429a73.142857 73.142857 0 0 1 22.674286 15.433142l191.561143 191.756191a73.142857 73.142857 0 0 1-22.137905 118.564571l-67.876572 30.061715-127.341714 127.488-10.093714 140.239238a73.142857 73.142857 0 0 1-124.684191 46.445714l-123.66019-123.782095-210.724572 211.699809-51.833904-51.614476 210.846476-211.821714-127.926857-128.024381a73.142857 73.142857 0 0 1 46.299428-124.635429l144.237715-10.776381 125.074285-125.220571 29.379048-67.779048a73.142857 73.142857 0 0 1 96.207238-38.034285z m-29.086476 67.120761l-34.913524 80.530286-154.087619 154.331429-171.398095 12.751238 303.323428 303.542857 12.044191-167.399619 156.233143-156.428191 80.384-35.59619-191.585524-191.73181z" p-id="906" fill="#515151"></path></svg>
        <el-icon style="cursor: pointer" :size="17" @click="minusWindow"><Minus /></el-icon>
        <el-icon style="cursor: pointer" :size="17" @click="closeWindow"><Close /></el-icon>
      </div>
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
import {onBeforeMount, ref} from "vue";
import {ipcRenderer} from "electron";
import {sendToMain} from "../utils/dataSender";
import {logger} from "../utils/common";

const os = ref('')
const routerLocation = ref('')

onBeforeMount(() => {
  ipcRenderer.invoke('getOperatingSystem').then(res => {
    os.value = res
  })
  ipcRenderer.invoke('get-router-location').then(fullLocation => {
    routerLocation.value = fullLocation ? fullLocation.split('#')[1] : '/'
  })
  logger(`routerLocation:`, routerLocation)
})


function closeWindow() {
  sendToMain('close')
}

function minusWindow() {
  sendToMain('minus')
}

// -------- 窗口置顶 ------------
const isPin = ref(false)
function pinCurrentWindow() {
  // get pin icon by id, and rotate it
  const pinIcon = document.getElementById('pin-icon')
  // rotate icon 45 degree
  if (pinIcon) {
    pinIcon.style.transform = !isPin.value ? 'rotate(-45deg)' : 'rotate(45deg)';
  }
  isPin.value = !isPin.value

  sendToMain('pinCurrentWindow', isPin)
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
  -webkit-app-region: drag;
  -webkit-user-select: none;
  &-btns {
    -webkit-app-region: no-drag;
  }
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
