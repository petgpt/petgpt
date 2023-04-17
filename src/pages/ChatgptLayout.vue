<template>
  <el-container class="chatgpt">
<!--    <el-aside class="chatgpt-aside">-->
    <chatgpt-aside @changePlugin="changePluginHandler" :is-hide="hide"></chatgpt-aside>
    <div style="display: flex;flex-direction: column;justify-content: center;" @click="hideMenuHandler">
      <svg v-if="!hide" style="cursor: pointer" t="1681638156613" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2207" width="19" height="19"><path d="M825.6 179.2 467.2 537.6c-12.8 12.8-25.6 12.8-38.4 0L422.4 531.2c-12.8-12.8-12.8-25.6 0-38.4l358.4-358.4c12.8-12.8 25.6-12.8 38.4 0l6.4 6.4C838.4 153.6 838.4 166.4 825.6 179.2z" p-id="2208" fill="#515151"></path><path d="M467.2 486.4l358.4 358.4c12.8 12.8 12.8 25.6 0 38.4l-6.4 6.4c-12.8 12.8-25.6 12.8-38.4 0L422.4 531.2c-12.8-12.8-12.8-25.6 0-38.4l6.4-6.4C441.6 473.6 454.4 473.6 467.2 486.4z" p-id="2209" fill="#515151"></path><path d="M627.2 179.2 268.8 537.6C256 550.4 243.2 550.4 230.4 537.6L224 531.2c-12.8-12.8-12.8-25.6 0-38.4l358.4-358.4c12.8-12.8 25.6-12.8 38.4 0l6.4 6.4C640 153.6 640 166.4 627.2 179.2z" p-id="2210" fill="#515151"></path><path d="M268.8 486.4l358.4 358.4c12.8 12.8 12.8 25.6 0 38.4l-6.4 6.4c-12.8 12.8-25.6 12.8-38.4 0L224 531.2c-12.8-12.8-12.8-25.6 0-38.4l6.4-6.4C243.2 473.6 256 473.6 268.8 486.4z" p-id="2211" fill="#515151"></path></svg>
      <svg v-else style="cursor: pointer" t="1681640074672" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2408" width="19" height="19"><path d="M224 844.8l358.4-358.4c12.8-12.8 25.6-12.8 38.4 0l6.4 6.4c12.8 12.8 12.8 25.6 0 38.4l-358.4 358.4c-12.8 12.8-25.6 12.8-38.4 0l-6.4-6.4C211.2 870.4 211.2 857.6 224 844.8z" p-id="2409" fill="#515151"></path><path d="M582.4 537.6 224 179.2c-12.8-12.8-12.8-25.6 0-38.4l6.4-6.4c12.8-12.8 25.6-12.8 38.4 0l358.4 358.4c12.8 12.8 12.8 25.6 0 38.4L620.8 537.6C608 550.4 588.8 550.4 582.4 537.6z" p-id="2410" fill="#515151"></path><path d="M422.4 844.8l358.4-358.4c12.8-12.8 25.6-12.8 38.4 0l6.4 6.4c12.8 12.8 12.8 25.6 0 38.4l-358.4 358.4c-12.8 12.8-25.6 12.8-38.4 0l-6.4-6.4C409.6 870.4 409.6 857.6 422.4 844.8z" p-id="2411" fill="#515151"></path><path d="M780.8 537.6 422.4 179.2c-12.8-12.8-12.8-25.6 0-38.4l6.4-6.4c12.8-12.8 25.6-12.8 38.4 0l358.4 358.4c12.8 12.8 12.8 25.6 0 38.4l-6.4 6.4C806.4 550.4 793.6 550.4 780.8 537.6z" p-id="2412" fill="#515151"></path></svg>
    </div>
<!--    </el-aside>-->
    <el-container>
<!--      <el-header class="chatgpt-header">-->
<!--        <chatgpt-header></chatgpt-header>-->
<!--      </el-header>-->
      <el-main class="chatgpt-main">
        <chat-text ref="chatText"></chat-text>
      </el-main>
      <el-footer class="chatgpt-footer">
        <chatgpt-footer @upsertLatestText="upsertLatestText" @clearCurrentChat="clearChatHandler">
          <template v-for="(slotInfo, index) in currentPluginSlotInfo" v-slot:[`slot`+slotInfo.slot]="{ data }">
            <el-popover
                placement="top-start"
                :title="slotInfo.description"
                :width="190"
                trigger="hover">
              <template #reference>
                <el-col v-if="slotInfo.menu.type === 'dialog'" :span="2" style="display: flex;flex-direction: column;align-items: center;">
                  <el-icon v-if="slotInfo.menu.type === 'dialog'" @click="centerDialogVisible = true" style="cursor: pointer" :size="17"><Setting/></el-icon>
                  <el-dialog v-model="centerDialogVisible" :title="slotInfo.description" width="60%" :show-close="false"
                             :close-on-click-modal="false" center>
                    <div v-for="dialogInfo in slotData[index].value">
                      <el-popover
                          placement="top-start"
                          title="systemMessage"
                          :width="300"
                          trigger="hover"
                          :content="dialogInfo.message"
                      >
                        <template #reference>
                          {{dialogInfo.name}}:
                        </template>
                      </el-popover>
                      <el-input v-model="dialogInfo.value" :placeholder="dialogInfo.name"></el-input>
                    </div>
                    <el-col style="display: flex; flex-direction: row; justify-content: space-evenly; margin-top: 5px">
                      <el-button type="primary" @click="closeHandler">close</el-button>
                      <el-button type="primary" @click="confirmHandler(slotData)">confirm</el-button>
                    </el-col>
                  </el-dialog>
                </el-col>
                <el-col v-if="slotInfo.menu.type === 'switch'" :span="3" style="display: flex;flex-direction: column;align-items: center;">
                  <el-switch v-if="slotInfo.menu.type === 'switch'" v-model="slotData[index].value" />
                </el-col>
                <el-col v-if="slotInfo.menu.type === 'select'" :span="4" style="display: flex;flex-direction: column;align-items: center; margin-left: 10px">
                  <el-select v-model="slotData[index].value" :size="'small'">
                    <el-option
                        v-for="item in slotData[index].options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                  </el-select>
                </el-col>
<!--                <el-col v-if="slotInfo.menu.type === 'upload'" :span="4" style="display: flex;flex-direction: column; align-items: center;">-->
<!--                  <el-upload-->
<!--                      ref="upload"-->
<!--                      class="upload-demo"-->
<!--                      action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"-->
<!--                      :limit="1"-->
<!--                      :auto-upload="false" style="display: flex; flex-direction: row"-->
<!--                  >-->
<!--                    <template #trigger>-->
<!--                      <el-button type="primary" size="small">select file</el-button>-->
<!--                    </template>-->
<!--                  </el-upload>-->
<!--                </el-col>-->
              </template>
            </el-popover>
          </template>
        </chatgpt-footer>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import ChatgptAside from "./chatgpt/ChatgptAside.vue";
import ChatgptFooter from "./chatgpt/ChatgptFooter.vue";
import ChatText from "./chatgpt/ChatText.vue";
import {onMounted, reactive, ref, watch} from "vue";
import {ipcRenderer, IpcRendererEvent} from "electron";
import {useChatStore} from "../store";
import {SlotMenu} from "../utils/types/types";

import {sendToMain} from "../utils/dataSender";
import {logger} from "../utils/common";

let chatStore = useChatStore();
const pluginSlotInfoList = ref([])
const currentPluginSlotInfo = ref<SlotMenu[]>()
onMounted(async () => {
  await fetchSlotData()
  // logger(`pluginSlotInfo`, pluginSlotInfoList, ` currentPluginSlotInfo:`, currentPluginSlotInfo, ` slotData:`, slotData)

  ipcRenderer.on('updateSlotMenu', (event: IpcRendererEvent, args) => {
    fetchSlotData()
  })

  ipcRenderer.on('hideMenu', () => {
    hide.value = true
  })
})

/**
 * 根据插件的slotMenu定义，构建v-model绑定的slotData
 */
const slotData = reactive<any[]>([
  {},{},{},{},{}
])


// 监听 slotData的变化，发送最新的slotdata到main线程，再到plugin中
watch(slotData, (newSlotData, oldSlotData) => {
  let pluginPureName = chatStore.getActivePluginNameList[+chatStore.getActivePluginIndex];
  let channel = `plugin.${pluginPureName}.slot.push`;
  // logger(`sendToMain:`, channel, ` data:`, newSlotData, ` oldData:`, oldSlotData)
  sendToMain(channel, newSlotData)
})

/**
 * 重新获取插件的slotMenu定义
 */
async function fetchSlotData() {
  // 从main线程获取slot的信息
  await getPluginSlotMenu()
  buildSlotData(currentPluginSlotInfo.value)
}

// switch的slot: {value: boolean}。默认值：如果menu.value有值，那么就是默认值
// select: {value: string}, 选中的就是当前的label对应的value。默认值：第一个label的value
// dialog: {value: [{name: string, value: string}]}。默认值：name为menu.child[x].name, value为menu.child[x].default
// TODO:upload?: {value: string}。默认值：menu.value
function buildSlotData(currentPluginSlotMenuList: SlotMenu[] | undefined) {
  slotData.forEach((slot, index) => {
    slotData[index] = {}
  })

  currentPluginSlotMenuList?.forEach((slotMenu, index) => {
    // logger(`当前的slotMenu:`, slotMenu, `, index:${index}`)
    if (slotMenu.menu.type === 'switch') {
      slotData[index] = {
        type: 'switch',
        value: slotMenu.menu.value || false
      }
    } else if (slotMenu.menu.type === 'select') {
      slotData[index] = {
        type: 'select',
        options: slotMenu.menu.child?.map((child: any) => {// options是渲染select的数据
          return {label: child.name, value: child.value}
        }),
        value: slotMenu.menu.value || slotMenu.menu.child?.[0].value // 如果传来的value有东西，那么就是select默认选中的值，否则就是第一个
      }
    } else if (slotMenu.menu.type === 'dialog') {
      slotData[index] = {
        type: 'dialog',
        value: slotMenu.menu.child?.map((child: any) => {
          return {name: child.name, value: child.default, message: child.message}
        })
      };
    } else if (slotMenu.menu.type === 'upload') {
      // slotData[index] = {value: slotMenu.menu.value}
    }
  })
}

async function getPluginSlotMenu() {
  await ipcRenderer.invoke("plugin.getSlotMenu").then((infoList) => {
    pluginSlotInfoList.value = infoList
    currentPluginSlotInfo.value = infoList[chatStore.state.activePluginIndex]?.menu
  })
}

const centerDialogVisible = ref(false)

function closeHandler() {
  centerDialogVisible.value = false;
}

function confirmHandler(data: any) {
  logger(`click slot confirm, data:`, data)
  centerDialogVisible.value = false;
}

const chatText = ref();
function upsertLatestText(arg: any) {
  chatText.value.upsertLatestText(arg)
}

function changePluginHandler(isClearContext: boolean) {
  fetchSlotData()
  chatText.value.clearChatContext(isClearContext)
}

const hide = ref(false)
function hideMenuHandler() {
  hide.value = !hide.value
}

// clear chat
function clearChatHandler() {
  chatText.value.clearChatContext(true)
}
</script>

<style scoped lang="less">
.el-container{
  height: 100%;
}
.el-main{
  padding-top: 0px;
  padding-bottom: 0px;
}
.chatgpt{
  &-header{
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: center;
    align-items: center;
  }
  &-main{
    display: flex;
    /* layout占满整屏 */
    height: 95%;
    //overflow: hidden;
    flex-direction: column;
    //border: 1px solid #000000;
    margin: 10px;
  }
  &-footer{
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: flex-end;
    //align-items: flex-start;
    //border-top: 1px solid black;
    padding-bottom: 5px;
    padding-top: 5px;
    --el-footer-height: 70px;
  }
  &-aside{
    width: auto;
    //border-right: 1px solid black;
  }
}
.el-footer{
  padding: 2px 15px 5px 0;
}
</style>
