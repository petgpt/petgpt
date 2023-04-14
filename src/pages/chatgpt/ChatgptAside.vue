<template>
  <el-scrollbar>
    <el-menu :collapse="isCollapse" :default-active="defaultActiveMenu">
      <el-menu-item v-for="(info, index) in pluginsConfigList" :index="`${index}`" @click="onPluginClick(index)">
        <span>{{info.name.slice(14)}}</span>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</template>

<script setup lang="ts">
import {ipcRenderer} from "electron";
import {nextTick, onMounted, ref} from "vue";
import {PluginInfo} from "../Setting.vue";
import {useChatStore} from "../../store";

const defaultActiveMenu = ref('0')
const isCollapse = ref(false)
let pluginsConfigList = ref<PluginInfo[]>([])
const chatStore = useChatStore()
async function getPluginsNameList() {
  let pluginInfoList = await ipcRenderer.invoke('plugin.getAllPluginName')
  for (const pluginInfo of pluginInfoList) {
    let config = await ipcRenderer.invoke('plugin.getConfig', pluginInfo.name)
    pluginsConfigList.value.push({
      name: pluginInfo.name,
      version: pluginInfo.version,
      description: pluginInfo.description,
      config
    })
  }
}

const emits = defineEmits(['changePlugin'])
function onPluginClick(index: number) {
  console.log(`click: `, index)
  chatStore.state.activePluginIndex = index+""
  emits('changePlugin', true)
}

onMounted(() => {
  defaultActiveMenu.value = chatStore.getActivePluginIndex
  // console.log(`defaultActiveMenu:`, defaultActiveMenu.value)
  getPluginsNameList().then(() => {
    let purePluginNameList = pluginsConfigList.value.map(info => info.name.slice(14));
    nextTick(() => {
      chatStore.state.activePluginNameList = purePluginNameList
    })
  })
})
</script>

<style scoped lang="less">
.el-menu-item{
  padding: 2px !important;
  justify-content: center;
}
</style>
