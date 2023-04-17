<template>
  <div>
    <el-row class="setting">
      <el-row class="setting-actions">
        <el-col :span="20" class="setting-actions-input">
          <el-input v-model="pluginNameToInstall" :placeholder="'plugin name to install, like: petgpt-plugin-template/petgpt-plugin-chatgpt'" class="setting-actions-item"></el-input>
          <el-progress v-show="installPercentage !== 0"  :percentage="installPercentage" :status="installStatus" style="margin-left: 5px" :text-inside="true" :show-text="false" />
        </el-col>
        <el-col :span="4">
          <el-button class="setting-actions-button setting-actions-item" @click="installPlugin">install</el-button>
        </el-col>
      </el-row>
      <div class="setting-container">
        <el-row v-for="(info, index) in pluginsConfigList" class="setting-container-item">
          <el-col :span="24">
            <el-card :body-style="{ padding: '8px', width: '300px', display: 'flex', flexDirection: 'column'}">
              <el-row>
                <el-text tag="b">{{info.name}} - {{info.version}}</el-text>
              </el-row>
              <el-row style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
                <el-text truncated>{{info.description}}</el-text>
              </el-row>
              <el-row class="setting-tooltips">
                <el-tooltip
                    class="box-item"
                    effect="light"
                    content="设置"
                    placement="top">
                  <el-icon @click="configClickHandler(index)" class="setting-tooltips-item" style="cursor: pointer" :size="17"><Setting/></el-icon>
                </el-tooltip>
                <el-tooltip
                    class="box-item setting-tooltips-item"
                    effect="light"
                    content="更新插件"
                    placement="top">
                  <el-icon @click="updatePlugin(index)" class="setting-tooltips-item" :size="17"><Refresh /></el-icon>
                </el-tooltip>
                <el-tooltip
                    class="box-item setting-tooltips-item"
                    effect="light"
                    content="删除插件"
                    placement="top">
                  <el-icon @click="deletePlugin(index)" class="setting-tooltips-item" :size="17"><Delete /></el-icon>
                </el-tooltip>
                <el-tooltip
                    class="box-item setting-tooltips-item"
                    effect="light"
                    content="启用插件"
                    placement="top">
                  <el-icon @click="enablePlugin(index)" class="setting-tooltips-item" :size="17"><Open /></el-icon>
                </el-tooltip>
              </el-row>
            </el-card>
            <el-progress v-show="upOrDeleteProgress[index].percentage !== 0" :percentage="upOrDeleteProgress[index].percentage" :status="upOrDeleteProgress[index].status" :text-inside="true" :show-text="false" />
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
import {ipcRenderer} from "electron";
import {IPluginConfig, PluginInfo, Progress, Rule} from "../utils/types/types";
import {sendToMain} from "../utils/dataSender";
import {logger} from "../utils/common";


let currentRules = reactive<Rule[]>([])
let currentConfigIndex = ref(0)
const centerDialogVisible = ref(false)
let pluginsConfigList = ref<PluginInfo[]>([])
const getConfigByIndex = (index: number) => pluginsConfigList.value[index]
let dialogConfigList = reactive<IPluginConfig[]>([])
let dialogModelData = reactive<any>({})
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
  let purePluginName = configByIndex.name;
  // logger(`name:${purePluginName}, configData: `, dialogModelData)
  sendToMain(`plugin.${purePluginName}.config.update`, {name: purePluginName, data: dialogModelData})

  pluginsConfigList.value = []
  getPluginsNameList()
}

async function getPluginsNameList() {
  pluginsConfigList.value = []
  upOrDeleteProgress.splice(0, upOrDeleteProgress.length)

  let pluginInfoList = await ipcRenderer.invoke('plugin.getAllPluginName')
  for (const pluginInfo of pluginInfoList) {
    pluginsConfigList.value.push({
      name: pluginInfo.name,
      version: pluginInfo.version,
      description: pluginInfo.description,
      config: pluginInfo.config
    })
    upOrDeleteProgress.push({percentage: 0, status: ''})
  }
}

const pluginNameToInstall = ref('')

const upOrDeleteProgress = reactive<Progress[]>([])
const installPercentage = ref(0)
const installStatus = ref('')
function installPlugin() {
  sendToMain('installPlugin', pluginNameToInstall.value)
  installPercentage.value = 10
}

function updatePlugin(index: number) {
  sendToMain('updatePlugin', getConfigByIndex(index).name)
  setProgressBegin(index)
}

function deletePlugin(index: number) {
  sendToMain('uninstallPlugin', getConfigByIndex(index).name)
  setProgressBegin(index)
}

function enablePlugin(index: number) {

}

function setProgressBegin(index: number) {
  upOrDeleteProgress[index] = {percentage: 10, status: ''}
}

function setProgressSuccess(type: 'install' | 'upOrDelete') {
  if (type === 'install') {
    installPercentage.value = 100
    installStatus.value = 'success'
  } else {
    upOrDeleteProgress.forEach((progress, index) => {
      if (progress.percentage > 0) {
        upOrDeleteProgress[index] = {
          percentage: 100,
          status: 'success'
        }
      }
    })
  }
  setTimeout(() => {
    // clear progress status
    if (type === 'install') {
      installPercentage.value = 0
      installStatus.value = ''
    } else {
      upOrDeleteProgress.forEach((progress, index) => {
        if (progress.percentage > 0) {
          upOrDeleteProgress[index] = {percentage: 0, status: ''}
        }
      })
    }
  }, 1000)
}

function setProgressFailed(type: 'install' | 'upOrDelete', index: number) {
  if (type === 'install') {
    installPercentage.value = 100
    installStatus.value = 'exception'
  } else {
    upOrDeleteProgress[index] = {percentage: 100, status: 'exception'}
  }
  setTimeout(() => {
    // clear progress status
    if (type === 'install') {
      installPercentage.value = 0
      installStatus.value = ''
    } else {
      upOrDeleteProgress[index] = {percentage: 0, status: ''}
    }
  }, 1000)
}

onMounted(async () => {
  await getPluginsNameList()
  logger(`pluginsConfigList:`, pluginsConfigList)

  ipcRenderer.on('installSuccess', (event, data) => {
    logger(`installSuccess: `, data, ` pluginsConfigList:`, pluginsConfigList)
    getPluginsNameList()
    logger(`[after install success] pluginsConfigList:`, pluginsConfigList)
    setProgressSuccess('install')
  });

  ipcRenderer.on('uninstallSuccess', (event, data) => {
    logger(`uninstallSuccess: `, data, ` pluginsConfigList:`, pluginsConfigList)
    setProgressSuccess('upOrDelete')
    getPluginsNameList()
    logger(`[after install success] pluginsConfigList:`, pluginsConfigList)
  });

  ipcRenderer.on('updateSuccess', (event, data) => {
    logger(`updateSuccess: `, data)
    setProgressSuccess('upOrDelete')
    getPluginsNameList()
  });

  // update \ delete 失败的时候，设置失败的进度条
  ipcRenderer.on('failedProgress', () => {
    upOrDeleteProgress.forEach((progress, index) => {
      if (progress.percentage > 0) {
        setProgressFailed('upOrDelete', index)
      }
    })
  })
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
    flex-wrap: wrap;
    &-item {
      margin: 5px
    }
  }

  &-actions {
    display: flex;
    &-item {
      margin-left: 5px;
    }
    &-input {
      display: flex;
      flex-direction: column;
    }
    &-button {

    }
  }
}
.setting-tooltips{
  margin-top: 4px;
  &-item:nth-child(n + 2) {
    margin-left: 4px;
    cursor: pointer;
  }
}
</style>
