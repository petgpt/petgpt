<template>
  <div class="footer-first">
    <svg @click="clearChat" style="cursor: pointer" t="1681655238478" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="907" width="18" height="18"><path d="M448 448H224a32 32 0 0 0-32 32v64a32 32 0 0 0 32 32h576a32 32 0 0 0 32-32v-64a32 32 0 0 0-32-32h-224V160a32 32 0 0 0-32-32h-64a32 32 0 0 0-32 32v288z m-64-64V128a64 64 0 0 1 64-64h128a64 64 0 0 1 64 64v256h192a64 64 0 0 1 64 64v128a64 64 0 0 1-64 64v256a64 64 0 0 1-64 64H256a64 64 0 0 1-64-64v-256a64 64 0 0 1-64-64v-128a64 64 0 0 1 64-64h192z m384 256H256v224a32 32 0 0 0 32 32h448a32 32 0 0 0 32-32v-224z m-96 64a32 32 0 0 1 32 32v160h-64v-160a32 32 0 0 1 32-32z m-128 64a32 32 0 0 1 32 32v96h-64v-96a32 32 0 0 1 32-32z m-128 64a32 32 0 0 1 32 32v32h-64v-32a32 32 0 0 1 32-32z" fill="#000000" p-id="908"></path></svg>
    <slot v-for="(slot, index) in slotChildData" :name="slot.name" :data="slotChildData[index]" class="footer-first-slot"></slot>
  </div>
  <div class="footer-second">
    <el-input :placeholder="'请输入聊天内容'"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 15 }"
              v-model="userInput"
              @keydown.enter="chatTest" autofocus></el-input>
    <el-button type="primary" @click="chatTest" style="margin-left: 5px">send</el-button>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {v4 as uuidv4} from "uuid";
import {sendToMain} from "../../utils/dataSender";
import {useChatStore} from "../../store";

// 可以通过这样的方式，把子组件的数据传递给父组件
const slotChildData = reactive([
  {name: 'slot1'},
  {name: 'slot2'},
  {name: 'slot3'},
  {name: 'slot4'},
  {name: 'slot5'}
])


const userInput = ref('');

const emits = defineEmits(['upsertLatestText', 'clearCurrentChat'])
const chatStore = useChatStore()
function chatTest(event: KeyboardEvent){
  event.preventDefault()
  // 添加用户输入的文本
  emits('upsertLatestText', {
    id: uuidv4(),
    type: 'user',
    text: userInput.value
  })

  // 发送消息给插件
  let pluginPureName = chatStore.getActivePluginNameList[+chatStore.getActivePluginIndex];
  let channel = `plugin.${pluginPureName}.func.handle`;
  // log.info(`[renderer] plugin channel:`, channel, ` userInput:`, userInput.value)
  // 发往main线程，调用插件的handle函数
  sendToMain(channel, {
    pluginName: pluginPureName,
    input: userInput.value
  })
}

function clearChat() {
  emits('clearCurrentChat')

  // 发送消息给插件
  let pluginPureName = chatStore.getActivePluginNameList[+chatStore.getActivePluginIndex];
  let channel = `plugin.${pluginPureName}.func.clear`;
  sendToMain(channel)
}

</script>

<style scoped lang="less">

.footer-first{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  align-content: center;
  &-slot{
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
.footer-second{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  align-content: center;
}
</style>
