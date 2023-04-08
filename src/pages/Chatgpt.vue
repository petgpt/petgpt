<template>
  <div>
    <h3>chatgpt功能测试<el-button type="primary" size="small" @click="pushRouter">跳转回detail页面</el-button></h3>
    <el-divider></el-divider>
    <div>
      <div style="background-color: aquamarine">ip info from cip.cc :</div>
      {{ipInfoFromCip}}
    </div>
    <div>
      <div style="background-color: aquamarine">ip info from ipinfo : </div>
      {{ipInfoFromIpInfo}}
    </div>
    <el-button type="primary" size="small" @click="proxyTest">click to get ip info</el-button>
    <el-divider></el-divider>
    <div style="background-color: aquamarine">config: {{configRes}}</div>

    <div style="background-color: darkseagreen">
      通过代理获取：
      <div>clash配置：TUN+global+env里配置ip2world原生ip => 可以的</div>
      <div>clash配置：系统代理+rule/global+env里配置127.0.0.1:1080 => 可以的</div>
      <el-button type="primary" size="small" @click="config(true)">getChatConfig(with proxy) | 最常用的就是系统代理+rule</el-button>
    </div>

    <div style="background-color: antiquewhite">
      <div>
        不通过代理获取：
        <div>clash配置：系统代理+rule+env里配置127.0.0.1:1080 => 获取不到</div>
      </div>
      <el-button type="primary" size="small" @click="config(false)">getChatConfig(no proxy)</el-button>
    </div>
    <el-divider></el-divider>
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
    <el-button type="primary" size="small" @click="chatTest">send</el-button>
    <el-button type="primary" size="small" @click="getMessageStoreIds">getMessageStoreIds</el-button>
    <div>
      <el-input :placeholder="'请输入聊天内容'" style="width:400px;" v-model="userInput" @keydown.enter="chatTest"></el-input>
      <el-input :placeholder="'parentMessageId'" style="width:200px;" v-model="options.parentMessageId" disabled></el-input>
    </div>
    <div>
      <el-divider>↓ 返回结果markdown渲染 ↓</el-divider>
      <div v-html="markdownToHtml"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ipcRenderer} from "electron";
import {IWindowList} from "../../electron/main/types/enum";
import {computed, onMounted, reactive, ref} from "vue";
import {chatConfig, chatReplyProcess, getMessageIds, initApi} from "../utils/chatgpt";
import {ChatMessage, openai} from "../utils/chatgpt/types";
import HttpsProxyAgent from 'https-proxy-agent'
// import HttpProxyAgent from 'http-proxy-agent'
import 'isomorphic-fetch'
import fetch from 'node-fetch'
// import * as types from "../utils/chatgpt/types";  // isomorphic-fetch 也是相同的设置

function pushRouter() {
  ipcRenderer.send('router', {window: IWindowList.PET_DETAIL_WINDOW, hash: 'petDetail'})
}

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

function chatTest() {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    alert("请先配置VITE_OPENAI_API_KEY")
    return
  }
  chatGptResText.value = 'waiting...'
  chatReplyProcess({
    message: userInput.value,
    lastContext: options,
    systemMessage: systemMessage.value,
    process: (chat: ChatMessage) => {
      chatGptResText.value = chat.text
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

// 【start】----------- ip信息获取 -----------【start】
const ipInfoFromCip = ref('')
const ipInfoFromIpInfo = ref('')
async function proxyTest() {
  getProxyIpInfoFromCip().then(res => {
    ipInfoFromCip.value = res
  })
  getProxyIpInfoFromIpInfo().then(res => {
    ipInfoFromIpInfo.value = JSON.stringify(res, null, 2)
  })
}
async function getProxyIpInfoFromIpInfo() {
  const fetchParam = {
    method: 'GET',
    agent: HttpsProxyAgent(import.meta.env.VITE_HTTPS_PROXY) // 短时间ip不会变，只能用HTTPS的Agent
  }
  const res = await fetch('https://ipinfo.io/json', fetchParam);
  if (!res.ok) {
    const reason = await res.text()
    const msg = `error ${
        res.status || res.statusText
    }: ${reason}`
    throw new Error(msg)
  }

  let response = await res.json();

  console.log(`response: `, response)
  return response
}
/**
 * 这个受clash规则的影响，也就是说rule模式，查出来是国内的ip。global就是和前面的ipinfo查出来一样
 */
async function getProxyIpInfoFromCip () {
  const fetchParam = {
    method: 'GET',
    agent: HttpsProxyAgent(import.meta.env.VITE_HTTPS_PROXY) // 短时间ip不会变，只能用HTTPS的Agent
  }
  const res = await fetch('http://cip.cc', fetchParam);
  if (!res.ok) {
    const reason = await res.text()
    const msg = `error ${
        res.status || res.statusText
    }: ${reason}`
    throw new Error(msg)
  }

  let response = await res.text();

  let first = response.indexOf("<pre>IP\t: ");
  let second = response.indexOf("</pre>");
  let ip = response.substring(first + 5, second);
  console.log(ip)
  return ip
}
// 【end】----------- ip信息获取 -----------【end】

// 【start】----------- 配置信息获取 -----------【start】
let configRes = ref('')
const config = (enableProxy: boolean) => {
  configRes.value = ''
  chatConfig(enableProxy).then((res) => {
    configRes.value = JSON.stringify(res.data, null, 2)
  }).catch((err) => {
    console.log(`chatConfig err: `, err)
  })
}
// 【end】----------- 配置信息获取 -----------【end】

// 【start】----------- mardown  -----------【start】
import { marked } from 'marked';
import hljs from "highlight.js";
import 'highlight.js/styles/base16/gruvbox-dark-hard.css';

// set highlighting
let mdOptions = {
  renderer: new marked.Renderer(),
  highlight: function(code: string) {
    return hljs.highlightAuto(code).value;
  },
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
};
marked.setOptions(mdOptions);
let testMd = '"Sure, here\'s an example of a short Python code:\n' +
    '\n' +
    '```python\n' +
    'print("Hello, World!")\n' +
    '```\n' +
    '\n' +
    'This code simply prints the string "Hello, World!" to the console when executed."';
let testTable = '| Fruit  | Color | Taste     |\n' +
    '|--------|-------|-----------|\n' +
    '| Apple  | Red   | Sweet     |\n' +
    '| Orange | Orange| Citrusy   |\n' +
    '| Lemon  | Yellow| Sour      |\n' +
    '| Banana | Yellow| Sweetish  |\n' +
    '| Grape  | Purple| Sweet/Sour| \n';
let markdownToHtml = computed(() => marked(chatGptResText.value))

// 【end】----------- mardown  -----------【end】
</script>

<style scoped lang="less">
.el-divider--horizontal{
  margin: 10px;
}
</style>
