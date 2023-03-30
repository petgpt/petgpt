<template>
  <div style="background-color: red">功能演示</div>
  <el-row>
    <el-col>
      <el-button @click="storeClick">获取全局状态title: {{computedStoreTitle}}</el-button>
    </el-col>
    <el-col>
      <div>main线程与renderer线程通信</div>
      <el-button @click="ipcRenderInvokeTest">异步函数调用 invoke</el-button>
      <el-button @click="ipcRenderSendTest">ipcRenderer.send</el-button>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import {useTitleStore} from "../store";
import {ipcRenderer, IpcRendererEvent} from "electron";
import {sendToMain} from "../utils/dataSender";
import {computed} from "vue";
const title = useTitleStore()

const computedStoreTitle = computed(() => title.title)
const storeClick = () => console.log(title.title)

function ipcRenderInvokeTest() {
  // invoke方法会返回一个promise对象，可以通过then方法获取返回值。可以通过catch捕获主进程处理函数抛出的错误。
  ipcRenderer.invoke('ping', '[invoke]ping').then((arg: {msg: string}) => {
    console.log(arg)
  })
}

function ipcRenderSendTest() {
  sendToMain('ping', '[send]ping') // 通过异步事件发送消息。只需要向主进程发送消息，可以使用ipcRenderer.send方法

  // send方法不会返回任何结果，send方法不提供错误处理机制
  ipcRenderer.on('ping-replay', (event: IpcRendererEvent, arg: {msg: string}) => {
    console.log(arg)
  })
}

</script>

<style scoped lang="less">

</style>
