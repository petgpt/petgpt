<template>
  <el-container class="chatgpt">
    <el-aside class="chatgpt-aside">
      <chatgpt-aside @changePlugin="changePluginHandler"></chatgpt-aside>
    </el-aside>
    <el-container>
      <el-header class="chatgpt-header">
        <chatgpt-header></chatgpt-header>
      </el-header>
      <el-main class="chatgpt-main">
        <chat-text ref="chatText"></chat-text>
      </el-main>
      <el-footer class="chatgpt-footer">
        <chatgpt-footer @upsertLatestText="upsertLatestText">
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
                    <div v-for="(dialogInfo, index) in slotData[index].value">
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
                <el-col v-if="slotInfo.menu.type === 'switch'" :span="2" style="display: flex;flex-direction: column;align-items: center;">
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
import ChatgptHeader from "./chatgpt/ChatgptHeader.vue";
import ChatgptFooter from "./chatgpt/ChatgptFooter.vue";
import ChatText from "./chatgpt/ChatText.vue";
import {onMounted, reactive, ref, watch} from "vue";
import {ipcRenderer, IpcRendererEvent} from "electron";
import {SlotMenu} from "../../electron/main/plugin/share/types";
import {useChatStore} from "../store";
import {sendToMain} from "../utils/dataSender";

let chatStore = useChatStore();
const pluginSlotInfoList = ref([])
const currentPluginSlotInfo = ref<SlotMenu[]>()
onMounted(async () => {
  await fetchSlotData()
  console.log(`pluginSlotInfo`, pluginSlotInfoList, ` currentPluginSlotInfo:`, currentPluginSlotInfo, ` slotData:`, slotData)

  ipcRenderer.on('updateSlotMenu', (event: IpcRendererEvent, args) => {
    fetchSlotData()
  })
})

/**
 * 根据插件的slotMenu定义，构建v-model绑定的slotData
 */
const slotData = reactive([
  {},{},{},{},{}
])


// 监听 slotData的变化，发送最新的slotdata到main线程，再到plugin中
watch(slotData, (newSlotData, oldSlotData) => {
  let pluginPureName = chatStore.getActivePluginNameList[+chatStore.getActivePluginIndex];
  let channel = `plugin.${pluginPureName}.slot.push`;
  console.log(`sendToMain:`, channel, ` data:`, newSlotData, ` oldData:`, oldSlotData)
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
    // console.log(`当前的slotMenu:`, slotMenu, `, index:${index}`)
    if (slotMenu.menu.type === 'switch') {
      slotData[index] = {
        type: 'switch',
        value: slotMenu.menu.value || false
      }
    } else if (slotMenu.menu.type === 'select') {
      slotData[index] = {
        type: 'select',
        options: slotMenu.menu.child?.map((child) => {// options是渲染select的数据
          return {label: child.name, value: child.value}
        }),
        value: slotMenu.menu.value || slotMenu.menu.child?.[0].value // 如果传来的value有东西，那么就是select默认选中的值，否则就是第一个
      }
    } else if (slotMenu.menu.type === 'dialog') {
      slotData[index] = {
        type: 'dialog',
        value: slotMenu.menu.child?.map((child) => {
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
    currentPluginSlotInfo.value = infoList[chatStore.state.activePluginIndex].menu
  })
}

const centerDialogVisible = ref(false)

function closeHandler() {
  centerDialogVisible.value = false;
}

function confirmHandler(data: any) {
  console.log(`click slot confirm, data:`, data)
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
    width: 100px;
    border-right: 1px solid black;
  }
}
</style>
