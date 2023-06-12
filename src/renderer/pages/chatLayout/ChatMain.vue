<template>
  <div class="main-and-footer-container flex w-fit flex-1 flex-col pb-1">
    <div
      class="el-main m-1 flex h-full w-[70] flex-col overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded"
      ref="scrollBar"
    >
      <div class="el-scrollbar">
        <ChatText
          ref="chatText"
          @on-chat-update="onChatUpdateScrollHandler"
          @on-reload-latest-chat="onReloadLatestChatHandler"
          @on-continue-chat="onContinueChatHandler"
        ></ChatText>
      </div>
    </div>
    <div class="el-footer flex flex-col content-center justify-end">
      <chat-footer
        @upsertLatestText="upsertLatestText"
        @clearCurrentChat="clearChatHandler"
        @delete-last-msg="deleteLastMsgHandler"
        ref="chatFooter"
      >
        <template v-for="(slotInfo, index) in currentPluginSlotInfo" v-slot:[`slot`+slotInfo.slot]="{ data }">
          <div class="tooltip" :data-tip="slotInfo.description">
            <div v-if="slotInfo.menu.type === 'dialog'" class="flex w-full flex-col items-center">
              <svg
                v-if="slotInfo.menu.type === 'dialog'"
                @click="centerDialogVisible = true"
                class="cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
              >
                <g fill="none">
                  <path
                    d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
                  ></path>
                  <path
                    fill="currentColor"
                    d="M14.41 2.293a9.947 9.947 0 0 1 2.75 1.14a1 1 0 0 1 .47 1.019c-.113.689.058 1.216.38 1.538c.322.322.85.493 1.538.38a1 1 0 0 1 1.019.47a9.945 9.945 0 0 1 1.14 2.75a1 1 0 0 1-.388 1.054c-.567.407-.82.9-.82 1.356c0 .456.253.95.82 1.357a1 1 0 0 1 .388 1.053a9.947 9.947 0 0 1-1.14 2.75a1 1 0 0 1-1.019.47c-.689-.113-1.216.059-1.538.38c-.322.322-.493.85-.38 1.538a1 1 0 0 1-.47 1.02a9.948 9.948 0 0 1-2.75 1.14a1 1 0 0 1-1.054-.388c-.407-.568-.9-.82-1.356-.82c-.456 0-.95.252-1.357.82a1 1 0 0 1-1.053.388a9.948 9.948 0 0 1-2.75-1.14a1 1 0 0 1-.47-1.02c.113-.688-.059-1.215-.38-1.537c-.323-.322-.85-.494-1.538-.38a1 1 0 0 1-1.02-.47a9.948 9.948 0 0 1-1.14-2.752a1 1 0 0 1 .388-1.053c.568-.406.82-.9.82-1.356c0-.455-.252-.95-.82-1.356a1 1 0 0 1-.388-1.053a9.947 9.947 0 0 1 1.14-2.751a1 1 0 0 1 1.02-.47c.688.113 1.215-.058 1.537-.38c.322-.322.494-.85.38-1.538a1 1 0 0 1 .47-1.019a9.946 9.946 0 0 1 2.751-1.14a1 1 0 0 1 1.053.388c.407.567.901.82 1.357.82c.455 0 .95-.253 1.356-.82a1 1 0 0 1 1.053-.388ZM12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6a3 3 0 0 1 0-6Z"
                  ></path>
                </g>
              </svg>
              <dialog class="modal" :class="{ 'modal-open': centerDialogVisible }">
                <form method="dialog" class="modal-box">
                  <h3 class="text-lg font-bold">{{ slotInfo.description }}</h3>
                  <div class="flex flex-col content-start items-start">
                    <div v-for="dialogInfo in slotData[index].value" class="tooltip w-full tooltip-bottom" :data-tip="dialogInfo.message">
                      <div class="form-control mt-1 w-full">
                        <label class="input-group">
                          <span class="w-full">{{ dialogInfo.name }}：</span>
                          <input type="text" :placeholder="dialogInfo.name" class="input input-bordered input-xs w-full" v-model="dialogInfo.value" />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="modal-action">
                    <button class="btn-info btn-sm btn" @click="closeHandler">close</button>
                    <button class="btn-info btn-sm btn" @click="confirmHandler(slotData)">confirm</button>
                  </div>
                </form>
              </dialog>
            </div>
            <div v-if="slotInfo.menu.type === 'switch'" class="flex w-full flex-col items-center">
              <input
                v-if="slotInfo.menu.type === 'switch'"
                @change="slotUpdateHandler"
                type="checkbox"
                class="toggle toggle-xs ml-1"
                v-model="slotData[index].value"
              />
            </div>
            <div v-if="slotInfo.menu.type === 'select'" class="ml-2 flex w-full flex-col items-center">
              <select class="select select-bordered select-xs w-full max-w-xs" v-model="slotData[index].value" @change="slotUpdateHandler">
                <option v-for="item in slotData[index].options" >{{item.value}}</option>
              </select>
            </div>
            <!--                <el-col v-if="slotInfo.menu.type === 'upload'" :span="4" style="display: flex;flex-direction: column; align-items: center;">-->
            <!--                 ref="upload"-->
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
          </div>
        </template>
      </chat-footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatFooter from "./ChatFooter.vue";
import { useChatStore } from "../../store";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { sendToMain } from "../../utils/dataSender";
import { logger } from "../../utils/common";
import { computed, defineAsyncComponent, nextTick, onMounted, reactive, ref } from "vue";

const ChatText = defineAsyncComponent(() => import('./ChatText.vue'))

let chatStore = useChatStore()
const pluginSlotInfoList = ref([])
const currentPluginSlotInfo = ref<SlotMenu[]>()
onMounted(async () => {
  await fetchSlotData()

  ipcRenderer.on('updateSlotMenu', (event: IpcRendererEvent, args) => {
    fetchSlotData()
  })
  if (pluginPureName.value) initCurrentPluginClient()
})

// 暂时调用的是插件的register方法，因为api的初始化都是在register里，插件设计的时候没有单独提供init的方法
function initCurrentPluginClient() {
  sendToMain('plugin.init', pluginPureName.value)
}

/**
 * 根据插件的slotMenu定义，构建v-model绑定的slotData
 */
const slotData = reactive<any[]>([{}, {}, {}, {}, {}])

const pluginPureName = computed(() => chatStore.getActivePluginNameList[+chatStore.getActivePluginIndex])

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
        value: slotMenu.menu.value || false,
      }
    } else if (slotMenu.menu.type === 'select') {
      slotData[index] = {
        type: 'select',
        options: slotMenu.menu.child?.map((child: any) => {
          // options是渲染select的数据
          return { label: child.name, value: child.value }
        }),
        value: slotMenu.menu.value || slotMenu.menu.child?.[0].value, // 如果传来的value有东西，那么就是select默认选中的值，否则就是第一个
      }
    } else if (slotMenu.menu.type === 'dialog') {
      slotData[index] = {
        type: 'dialog',
        value: slotMenu.menu.child?.map((child: any) => {
          return { name: child.name, value: child.default, message: child.message }
        }),
      }
    } else if (slotMenu.menu.type === 'upload') {
      // slotData[index] = {value: slotMenu.menu.value}
    }
  })
}

async function getPluginSlotMenu() {
  await ipcRenderer.invoke('plugin.getSlotMenu').then(infoList => {
    pluginSlotInfoList.value = infoList
    currentPluginSlotInfo.value = infoList[chatStore.state.activePluginIndex]?.menu
  })
}

const centerDialogVisible = ref(false)

function closeHandler() {
  centerDialogVisible.value = false
}

function slotUpdateHandler() {
  let channel = `plugin.${pluginPureName.value}.slot.push`
  // console.log(`sendToMain:`, channel, ` slotData:`, slotData)
  sendToMain(channel, slotData)
}
function confirmHandler(data: any) {
  logger(`click slot confirm, data:`, data)
  centerDialogVisible.value = false

  slotUpdateHandler()
}

const chatText = ref()
function upsertLatestText(arg: any) {
  chatText.value.upsertLatestText(arg)
}

function changePluginHandler(isClearContext: boolean) {
  fetchSlotData()
  chatText.value.clearChatContext(isClearContext)
  initCurrentPluginClient()
}

// clear chat
function clearChatHandler() {
  chatText.value.clearChatContext(true)
}

function deleteLastMsgHandler() {
  chatText.value.deleteLastText()
}

const scrollBar = ref()
function onChatUpdateScrollHandler() {
  nextTick(() => (scrollBar.value.scrollTop = scrollBar.value.scrollHeight))
}

const chatFooter = ref()
function onReloadLatestChatHandler() {
  chatFooter.value.reloadChat()
}

function onContinueChatHandler() {
  chatFooter.value.continueChat()
}

defineExpose({
  changePluginHandler
})
</script>

<style scoped></style>
