<template>
  <div class="footer-first">
    <el-popover
        placement="top-start"
        title="chatgpt对话参数设置"
        :width="190"
        trigger="hover"
    >
      <template #reference>
        <el-icon @click="centerDialogVisible = true" style="cursor: pointer" :size="17"><Setting/></el-icon>
      </template>
    </el-popover>
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
  </div>
  <div class="footer-second">
    <el-input :placeholder="'请输入聊天内容'"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 15 }"
              v-model="userInput"
              @keydown.enter="chatTest"></el-input>
    <el-button type="primary" @click="chatTest" style="margin-left: 5px">send</el-button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import {ChatMessage, chatReplyProcess, initApi} from "../../utils/chatgpt";
import {openai} from "../../utils/chatgpt/types";
import {v4 as uuidv4} from "uuid";

let completionParams: Partial<Omit<openai.CreateChatCompletionRequest, 'messages' | 'n' | 'stream'>> = reactive({// 忽略了 message、n、stream 参数
  model: 'gpt-3.5-turbo',
  max_tokens: 100, // 最大2048，gpt3模型中，一次对话最多生成的token数量
  temperature: 1, // [0, 2], 默认1, 更低更精确，更高随机性增加
  // top_p: 1, // 官方建议temperature与top_p不要一起使用
  presence_penalty: 0, // [-2.0, 2.0], 默认0, 数值越大，越鼓励生成input中没有的文本
  frequency_penalty: 0 // [-2.0, 2.0], 默认0, 数值越大，降低生成的文本的重复率，更容易生成新的东西
})
const centerDialogVisible = ref(false)
const currentDate = new Date().toISOString().split('T')[0]
const enableChatContext = ref(false) // 是否启用对话上下文
const latestParentMessageId = ref<string | undefined>('')
const userInput = ref('');
const chatGptResText = ref('')
const systemMessage = ref(`You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${currentDate}`);
let firstChunk = true // 是否是第一次返回数据，如果是的话，不需要换行
let options = reactive({
  parentMessageId: ''
})
const chatText = ref()
const controller = new AbortController();
const signal = controller.signal;

const handleClose = async (done: () => void) => {
  console.log(`initApi, completionParams:`, completionParams)
  await initApi(completionParams);
  done()
}

onMounted(async () => {
  await initApi(completionParams); // 初始化api，如果修改了completionParams，需要重新初始化
})

function switchChatContext(enable: boolean) {
  if (enable) {
    options.parentMessageId = latestParentMessageId.value || ''
  } else {
    latestParentMessageId.value = options.parentMessageId
    options.parentMessageId = ''
  }
  console.log(`携带的parentMessageId：`, options.parentMessageId, ` , 记录的latestParentMessageId：`, latestParentMessageId.value)
}
function stopHandler() {// TODO: 暂时不行，后面fix
  controller.abort("stop generate manually")
}

const emits = defineEmits(['upsertLatestText'])

function chatTest() {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    alert("请先配置VITE_OPENAI_API_KEY")
    return
  }

  emits('upsertLatestText', {
    id: uuidv4(),
    type: 'user',
    text: userInput.value
  })

  chatReplyProcess({
    message: userInput.value,
    lastContext: options,
    systemMessage: systemMessage.value,
    abortSignal: signal,
    process: (chat: ChatMessage) => {
      chatGptResText.value = chat.text
      emits('upsertLatestText', {
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
      // firstChunk = false
    }});
}

</script>

<style scoped lang="less">

.footer-first{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  align-content: center;
}
.footer-second{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  align-content: center;
}
</style>
