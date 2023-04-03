<template>
  <div>
    chatgpt页面
    <el-button type="primary" size="small" @click="pushRouter">跳转回detail页面</el-button>
  </div>
</template>

<script setup lang="ts">
import {ipcRenderer} from "electron";
import {IWindowList} from "../../electron/main/types/enum";

function pushRouter() {
  ipcRenderer.send('router', {window: IWindowList.PET_DETAIL_WINDOW, hash: 'petDetail'})
}
</script>

<style scoped lang="less">

</style>
