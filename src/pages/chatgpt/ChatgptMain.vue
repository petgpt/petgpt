<template>
  <div>
    <el-divider></el-divider>
    <IpInfo></IpInfo>
    <el-divider></el-divider>
<!--    <chatgpt-config></chatgpt-config>-->
<!--    <el-divider></el-divider>-->
    <el-button type="primary" size="small" text :bg="true" @click="centerDialogVisible = true">
      Click to set chatgpt config
    </el-button>
    <el-dialog v-model="centerDialogVisible" title="Chatgpt对话参数设置" width="60%"
               :close-on-click-modal="false" :before-close="handleClose" center>
      <div>
        <el-popover
            placement="top-start"
            title="systemMessage"
            :width="300"
            trigger="hover"
            content="The system message helps set the behavior of the assistant. 例如：You are a helpful assistant."
        >
          <template #reference>
            systemMessage:
          </template>
        </el-popover>
        <el-input :placeholder="'systemMessage'" v-model="systemMessage"></el-input>
      </div>
      <div>
        <el-popover
            placement="top-start"
            title="temperature"
            :width="300"
            trigger="hover"
            content="[0, 2], 默认1, 更低更精确，更高随机性增加."
        >
          <template #reference>
            temperature: {{completionParams.temperature}}
          </template>
        </el-popover>
        <el-slider v-model="completionParams.temperature" :step="0.1" :max="2" />
      </div>
      <div>
        <el-popover
            placement="top-start"
            title="presence_penalty"
            :width="300"
            trigger="hover"
            content="[-2.0, 2.0], 默认0, 数值越大，越鼓励生成input中没有的文本."
        >
          <template #reference>
            presence_penalty: {{completionParams.presence_penalty}}
          </template>
        </el-popover>
        <el-slider v-model="completionParams.presence_penalty" :step="0.1" :max="2" :min="-2" />
      </div>
      <div>
        <el-popover
            placement="top-start"
            title="frequency_penalty"
            :width="300"
            trigger="hover"
            content="[-2.0, 2.0], 默认0, 数值越大，降低生成的文本的重复率，更容易生成新的东西"
        >
          <template #reference>
            frequency_penalty: {{completionParams.frequency_penalty}}
          </template>
        </el-popover>
        <el-slider v-model="completionParams.frequency_penalty" :step="0.1" :max="2" :min="-2" />
      </div>
    </el-dialog>
    <span>
      <el-popover
          placement="top-start"
          title="开启连续对话"
          :width="120"
          trigger="hover"
      >
          <template #reference>
            <el-switch v-model="enableChatContext" @change="switchChatContext" />
          </template>
        </el-popover>
    </span>

<!--    <el-button type="primary" size="small" @click="getMessageStoreIds">getMessageStoreIds</el-button>-->
    <div>
      <el-input :placeholder="'请输入聊天内容'" style="width:400px;" v-model="userInput" @keydown.enter="chatTest"></el-input>
      <el-button type="primary" size="small" @click="chatTest">send</el-button>
<!--      <el-button type="primary" size="small" @click="stopHandler">stopGenerate</el-button>-->
<!--      <el-input :placeholder="'parentMessageId'" style="width:200px;" v-model="options.parentMessageId" disabled></el-input>-->
    </div>
    <div>
      <el-divider>↓ 返回结果markdown渲染 ↓</el-divider>
      <chat-text ref="chatText"></chat-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import IpInfo from "../example/IpInfo.vue";
import ChatText from "./ChatText.vue";
import {computed, onMounted, reactive, ref} from "vue";
import {ChatMessage, openai} from "../../utils/chatgpt/types";
import {chatReplyProcess, getMessageIds, initApi} from "../../utils/chatgpt";

// 【start】----------- chatgpt api 测试 -----------【start】
const centerDialogVisible = ref(false)
const userInput = ref('');
const chatGptResText = ref('')
const currentDate = new Date().toISOString().split('T')[0]
const systemMessage = ref(`You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${currentDate}`);
let firstChunk = true // 是否是第一次返回数据，如果是的话，不需要换行
let options = reactive({
  parentMessageId: ''
})
const enableChatContext = ref(false) // 是否启用对话上下文
const latestParentMessageId = ref<string | undefined>('')

function switchChatContext(enable: boolean) {
  if (enable) {
    options.parentMessageId = latestParentMessageId.value || ''
  } else {
    latestParentMessageId.value = options.parentMessageId
    options.parentMessageId = ''
  }
  console.log(`携带的parentMessageId：`, options.parentMessageId, ` , 记录的latestParentMessageId：`, latestParentMessageId.value)
}
// 其他的自定义参加见：https://platform.openai.com/docs/api-reference/completions/create
// 或者：https://github.com/transitive-bullshit/chatgpt-api/blob/main/docs/interfaces/openai.CreateChatCompletionRequest.md#properties
let completionParams: Partial<Omit<openai.CreateChatCompletionRequest, 'messages' | 'n' | 'stream'>> = reactive({// 忽略了 message、n、stream 参数
  model: 'gpt-3.5-turbo',
  max_tokens: 100, // 最大2048，gpt3模型中，一次对话最多生成的token数量
  temperature: 1, // [0, 2], 默认1, 更低更精确，更高随机性增加
  // top_p: 1, // 官方建议temperature与top_p不要一起使用
  presence_penalty: 0, // [-2.0, 2.0], 默认0, 数值越大，越鼓励生成input中没有的文本
  frequency_penalty: 0 // [-2.0, 2.0], 默认0, 数值越大，降低生成的文本的重复率，更容易生成新的东西
})

const controller = new AbortController();
const signal = controller.signal;
function stopHandler() {// TODO: 暂时不行，后面fix
  controller.abort("stop generate manually")
}

import { v4 as uuidv4 } from 'uuid'
const chatText = ref()

function chatTest() {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    alert("请先配置VITE_OPENAI_API_KEY")
    return
  }
  chatText.value.upsertLatestText({
    id: uuidv4(),
    type: 'user',
    text: userInput.value
  })

  chatGptResText.value = 'waiting...'

  chatReplyProcess({
    message: userInput.value,
    lastContext: options,
    systemMessage: systemMessage.value,
    abortSignal: signal,
    process: (chat: ChatMessage) => {
      chatGptResText.value = chat.text
      chatText.value.upsertLatestText({
        id: chat.id,
        type: 'system',
        text: chat.text
      })
      latestParentMessageId.value = chat.id; // 记录下最新的parentMessageId
      if (enableChatContext.value) {
        options.parentMessageId = chat.id // 如果开启着的，就把最新的parentMessageId携带上去
      }
      // let resMessage = JSON.stringify(chat, null, 2);
      // console.log(firstChunk ? resMessage : `\n${resMessage}`)
      firstChunk = false
    }}
  );
}

const ids = ref('')
function getMessageStoreIds() {
  let messageIds = getMessageIds();
  console.log(`messageIds: `, messageIds)
}
const handleClose = async (done: () => void) => {
  console.log(`initApi, completionParams:`, completionParams)
  await initApi(completionParams);
  done()
}

onMounted(async () => {
  await initApi(completionParams); // 初始化api，如果修改了completionParams，需要重新初始化
})
// 【end】----------- chatgpt api 测试 -----------【end】


</script>

<style scoped lang="less">
.el-divider--horizontal{
  margin: 10px;
}
</style>
