<template>
  <div>
    Setting！！
    <el-divider>↓ Plugins ↓</el-divider>
    <div style="display: flex; flex-direction: row;">
      <el-row v-for="(info, index) in pluginsConfigList">
        <el-col :span="24">
          <el-card :body-style="{ padding: '8px', width: '300px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}">
            <div>name: {{info.name}}</div>
            <div>version: {{info.version}}</div>
            <div>description: {{info.description}}</div>
            <el-icon @click="configClickHandler(index)" style="cursor: pointer" :size="17"><Setting/></el-icon>
          </el-card>
        </el-col>
      </el-row>
      <el-dialog v-model="centerDialogVisible" title="参数设置" width="60%" top="5vh"
                 :close-on-click-modal="false" :before-close="handleClose" center>
        <el-row v-for="(configItem, index) in dialogConfigList">
          <el-col :span="1" style="margin-top: 5px">
            <span v-show="configItem.required" style="color: red">*</span>
          </el-col>
          <el-col :span="23" style="margin-bottom: 10px">
            <el-row style="display: flex; align-items: center; flex-wrap: nowrap">
              {{configItem.name}}:&nbsp
              <el-input v-if="configItem.type === 'input'" :placeholder=configItem.name v-model="dialogModelData[configItem.name]"></el-input>
            </el-row>
            <span v-show="configItem.required && !dialogModelData[configItem.name]" style="color: red; font-size: 10px;">{{currentRules[currentConfigIndex].message}}</span>
          </el-col>
        </el-row>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import { ipcRenderer } from  "electron";
import {IPluginConfig} from "../../electron/main/plugin/share/types";
import {sendToMain} from "../utils/dataSender";

interface Rule{
  required: boolean,
  message: string,
  trigger: string
}
export interface PluginInfo{ // plugin的基本信息
  name: string,
  version:string,
  description: string,
  config: IPluginConfig[] // plugin需要的config配置条目，例如key、token等的配置
}

let currentRules = reactive<Rule[]>([])
let currentConfigIndex = ref(0)
const centerDialogVisible = ref(false)
let pluginsConfigList = ref<PluginInfo[]>([])
const getConfigByIndex = (index: number) => pluginsConfigList.value[index]
let dialogConfigList = reactive<IPluginConfig[]>([])
let dialogModelData = reactive({})
async function configClickHandler(index: number) {
  dialogModelData = reactive({})
  currentRules = reactive<Rule[]>([])

  currentConfigIndex.value = index
  centerDialogVisible.value = true
  dialogConfigList = getConfigByIndex(index).config // 根据下标获取到某个插件的config信息
  dialogConfigList.forEach(config => {
    currentRules.push({
      required: config.required,
      message: config.required ? config.name + '不能为空' : '',
      trigger: config.required ? 'blur' : 'none'
    });

    // @ts-ignore
    dialogModelData[config.name] = config.value ? config.value : (config.default ? config.default : '');
  })
}

const handleClose = async (done: () => void) => {
  centerDialogVisible.value = false;
  let configByIndex = getConfigByIndex(currentConfigIndex.value);
  let purePluginName = configByIndex.name.slice(14);
  // console.log(`name:${purePluginName}, configData: `, dialogModelData)
  sendToMain(`plugin.${purePluginName}.config.update`, {name: purePluginName, data: dialogModelData})

  pluginsConfigList.value = []
  getPluginsNameList()
  done()
}

function getPluginsNameList() {
  ipcRenderer.invoke('plugin.getAllPluginName').then(pluginInfoList => {
    pluginInfoList.forEach((pluginInfo: {name:string, version: string, description: string}) => {
      getPluginInfoByName(pluginInfo)
    })
  })
}

function getPluginInfoByName(pluginInfo: { name: string, version: string, description: string}) {
  ipcRenderer.invoke('plugin.getConfig', pluginInfo.name).then(config => {
    // console.log(`pluginInfo return config: `, config)
    pluginsConfigList.value.push({
      name: pluginInfo.name,
      version: pluginInfo.version,
      description: pluginInfo.description,
      config
    })
  })
}

onMounted(() => {
  getPluginsNameList()
})
</script>

<style scoped lang="less">

</style>
