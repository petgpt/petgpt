<template>
  <div>
    <el-divider>↓ Plugins ↓</el-divider>

    <el-row class="setting">
      <div class="setting-actions">
        <el-input v-model="pluginNameToInstall" :placeholder="'plugin name to install'" class="setting-actions-item"></el-input>
        <el-button class="setting-actions-item" @click="installPlugin">install</el-button>
      </div>
      <div class="setting-container">
        <el-row v-for="(info, index) in pluginsConfigList" class="setting-container-item">
          <el-col :span="24">
            <el-card :body-style="{ padding: '8px', width: '300px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}">
              <div>name: {{info.name}}</div>
              <div>version: {{info.version}}</div>
              <div>description: {{info.description}}</div>
              <div>
                <el-tooltip
                    class="box-item"
                    effect="light"
                    content="设置"
                    placement="top">
                  <el-icon @click="configClickHandler(index)" style="cursor: pointer" :size="17"><Setting/></el-icon>
                </el-tooltip>
                <el-tooltip
                    class="box-item"
                    effect="light"
                    content="更新插件"
                    placement="top">
                  <el-icon @click="updatePlugin(index)" style="cursor: pointer" :size="17"><Refresh /></el-icon>
                </el-tooltip>
                <el-tooltip
                    class="box-item"
                    effect="light"
                    content="删除插件"
                    placement="top">
                  <el-icon @click="deletePlugin(index)" style="cursor: pointer" :size="17"><Delete /></el-icon>
                </el-tooltip>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-dialog v-model="centerDialogVisible" title="参数设置" width="60%" top="5vh" :show-close="false"
                   :close-on-click-modal="false" center>
          <el-row v-for="(configItem, index) in dialogConfigList">
            <el-col :span="1" style="margin-top: 5px">
              <span v-show="configItem.required" style="color: red">*</span>
            </el-col>
            <el-col :span="23" style="margin-bottom: 10px">
              <el-row style="display: flex; align-items: center; flex-wrap: nowrap">
                {{configItem.name}}:&nbsp
                <el-input v-if="configItem.type === 'input'" :placeholder=configItem.name v-model="dialogModelData[configItem.name]"></el-input>
              </el-row>
              <!--              <span v-show="configItem.required && !dialogModelData[configItem.name]" style="color: red; font-size: 10px;">{{-->
              <!--                  currentRules[currentConfigIndex]-->
              <!--                  ? currentRules[currentConfigIndex].message: 'required'}}</span>-->
            </el-col>
          </el-row>
          <el-col style="display: flex; flex-direction: row; justify-content: space-evenly">
            <el-button type="primary" @click="closeHandler">close</el-button>
            <el-button type="primary" @click="confirmHandler">confirm</el-button>
          </el-col>
        </el-dialog>
      </div>
    </el-row>
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

function closeHandler() {
  centerDialogVisible.value = false;
}
const confirmHandler = async (done: () => void) => {
  centerDialogVisible.value = false;
  let configByIndex = getConfigByIndex(currentConfigIndex.value);
  let purePluginName = configByIndex.name.slice(14);
  // console.log(`name:${purePluginName}, configData: `, dialogModelData)
  sendToMain(`plugin.${purePluginName}.config.update`, {name: purePluginName, data: dialogModelData})

  pluginsConfigList.value = []
  getPluginsNameList()
}

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

const pluginNameToInstall = ref('')

function installPlugin() {
  // [main]线程：
  // const result = await execCommand('install', ["petgpt-plugin-template"], app.getPath('userData'), {}, {})
  // if (!result.code) {
  //   console.log(`download success`)
  // } else {
  //   console.log(`download failed: `, {code: `${result.code}`, data: result.data})
  // }
}

function updatePlugin(index: number) {
}

function deletePlugin(index: number) {
}


onMounted(async () => {
  await getPluginsNameList()
  console.log(`pluginsConfigList:`, pluginsConfigList)
})
</script>

<style scoped lang="less">
.setting{
  padding: 20px;
  flex-direction: column;
  &-container{
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    &-item {
      margin: 5px
    }
  }

  &-actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    &-item {
      margin-left: 5px;
    }
  }
}
</style>
