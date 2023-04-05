<template>
  <div>
    <h3>chatgpt功能测试</h3>
    <el-button type="primary" size="small" @click="pushRouter">跳转回detail页面</el-button>
    <el-input :placeholder="'systemMessage'" v-model="systemMessage"></el-input>
    <el-input :placeholder="'请输入聊天内容'" v-model="userInput"></el-input>
  </div>
</template>

<script setup lang="ts">
import {ipcRenderer} from "electron";
import {IWindowList} from "../../electron/main/types/enum";
import {onMounted, ref} from "vue";
import {chatReplyProcess, initApi} from "../utils/chatgpt";
import {ChatMessage, openai} from "../utils/chatgpt/types";

function pushRouter() {
  ipcRenderer.send('router', {window: IWindowList.PET_DETAIL_WINDOW, hash: 'petDetail'})
}

const userInput = ref('');
const systemMessage = ref('');

// 【start】----------- chatgpt api 测试 -----------【start】
let firstChunk = true // 是否是第一次返回数据，如果是的话，不需要换行
let options = {}

// 其他的自定义参加见：https://platform.openai.com/docs/api-reference/completions/create
// 或者：https://github.com/transitive-bullshit/chatgpt-api/blob/main/docs/interfaces/openai.CreateChatCompletionRequest.md#properties
let completionParams: Partial<Omit<openai.CreateChatCompletionRequest, 'messages' | 'n' | 'stream'>> = {// 忽略了 message、n、stream 参数
  model: 'gpt-turbo-3.5',
  max_tokens: 100, // 最大2048，gpt3模型中，一次对话最多生成的token数量
  temperature: 1, // [0, 2], 默认1, 更低更精确，更高随机性增加
  // top_p: 1, // 官方建议temperature与top_p不要一起使用
  presence_penalty: 0, // [-2.0, 2.0], 默认0, 数值越大，越鼓励生成input中没有的文本
  frequency_penalty: 0 // [-2.0, 2.0], 默认0, 数值越大，降低生成的文本的重复率，更容易生成新的东西
}
onMounted(async () => {
  await initApi(completionParams)
  // let promise = chatReplyProcess({
  //   message: '',
  //   lastContext: options,
  //   process: (chat: ChatMessage) => {
  //     let resMessage = JSON.stringify(chat);
  //     console.log(firstChunk ? resMessage : `\n${resMessage}`)
  //     firstChunk = false
  //   }}
  // );
})
// 【end】----------- chatgpt api 测试 -----------【end】


</script>

<style scoped lang="less">

</style>
