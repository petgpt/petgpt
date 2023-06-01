<template>
<!--  <el-scrollbar view-style="height:100%;">-->
  <el-menu :collapse="isCollapse" :default-active="defaultActiveMenu" v-if="!isHide">
    <el-menu-item v-for="(info, index) in pluginsConfigList" :index="`${index}`" @click="onPluginClick(index)">
      <span>{{info.name}}</span>
    </el-menu-item>
  </el-menu>
  <!--  </el-scrollbar>-->
</template>

<script setup lang="ts">
import {ipcRenderer} from "electron";
import {nextTick, onMounted, ref, toRef} from "vue";
import {useChatStore} from "../../store";
import {PluginInfo} from "../../utils/types/types";
import {logger} from "../../utils/common";


const defaultActiveMenu = ref('0')
const isCollapse = ref(false)
let pluginsConfigList = ref<PluginInfo[]>([])
const chatStore = useChatStore()
async function getPluginsNameList() {
  let pluginInfoList = await ipcRenderer.invoke('plugin.getAllPluginName')
  for (const pluginInfo of pluginInfoList) {
    if (pluginInfo.enabled) {
      pluginsConfigList.value.push({
        name: pluginInfo.name,
        version: pluginInfo.version,
        description: pluginInfo.description,
        config: pluginInfo.config,
        enabled: pluginInfo.enabled
      });
    }
  }
  // logger(`aside, pluginInfoList：`, pluginInfoList, ` pluginsConfigList:`, pluginsConfigList.value)
}

const emits = defineEmits(['changePlugin'])
function onPluginClick(index: number) {
  logger(`click: `, index)
  chatStore.state.activePluginIndex = index+""
  emits('changePlugin', true)
}

onMounted(() => {
  defaultActiveMenu.value = chatStore.getActivePluginIndex
  // logger(`defaultActiveMenu:`, defaultActiveMenu.value)
  getPluginsNameList().then(() => {
    let purePluginNameList = pluginsConfigList.value.map(info => info.name);
    nextTick(() => {
      chatStore.state.activePluginNameList = purePluginNameList
    })
  })
})

const props = defineProps(["isHide"]);
let isHide = toRef(props, 'isHide')
</script>

<style scoped lang="less">
.el-menu-item{
  padding: 2px !important;
  justify-content: center;
}
</style>
