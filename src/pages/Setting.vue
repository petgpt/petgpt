<template>
  <div>
    Setting！！
    <el-divider></el-divider>
    <div v-for="(info, index) in pluginsConfigList">
      <div style="background-color: #fdb9cc">
        name: {{info.name}}
      </div>
      <div>
        config: {{info.config}}
      </div>
      <el-divider></el-divider>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive} from "vue";
import { ipcRenderer } from  "electron";
import {IPluginConfig} from "../../electron/main/plugin/share/types";

interface PluginInfo{
  name: string,
  config: IPluginConfig[]
}
const pluginsConfigList = reactive<PluginInfo[]>([])
function getPluginsNameList() {
  ipcRenderer.invoke('plugin.getAllPluginName').then(nameList => {
    nameList.forEach((name: string) => {
      ipcRenderer.invoke('plugin.getConfig', name).then(config => {
        pluginsConfigList.push({
          name,
          config
        })
      })
    })
  })
}

onMounted(() => {
  getPluginsNameList()
})
</script>

<style scoped lang="less">

</style>
