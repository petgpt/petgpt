<template>
  <router-view v-if="routerLocation === '/'"/>
  <el-container v-else direction="vertical" style="background: #ffffff; border-radius: 20px;">
    <el-header class="header" v-if="os === 'win32'" id="header">
      <el-icon style="cursor: pointer" :size="17" @click="closeWindow"><Close /></el-icon>
      <el-icon style="cursor: pointer" :size="17" @click="minusWindow"><Minus /></el-icon>
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

const os = ref('')
const routerLocation = ref('')

onMounted(async () => {
  os.value = await ipcRenderer.invoke('getOperatingSystem')
  let fullLocation = await ipcRenderer.invoke('get-router-location')
  routerLocation.value = fullLocation.split('#')[1]
  console.log(`routerLocation:`, routerLocation)
})
function closeWindow() {
  sendToMain('close')
}

function minusWindow() {
  sendToMain('minus')
}

</script>

<style scoped lang="less">
.el-header{
  height: 20px !important;
  padding: 3px !important;
}
.header {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  align-content: center;
  background-color: @backgroundColor;
  margin-right: 5px;
}
</style>
