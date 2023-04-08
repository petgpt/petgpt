<template>
  <el-button @click="addOneMessageTest('123', true)">addOneUserMessageTest</el-button>
  <el-button @click="addOneMessageTest('456', false)">addOneSysMessageTest</el-button>
  <el-button @click="deleteLastText">deleteLastText</el-button>
  <div class="chat">
    <el-row v-for="(item, index) in chatList" :key="index" :class="`chat-${item.type} chat-item`">
      <el-col :span="20">
        <el-card :body-style="{ padding: '8px', background: item.type === 'user' ? 'linear-gradient(to right, rgb(0 225 255 / 20%), rgb(0 255 189 / 20%), rgb(150 0 0 / 20%))' : 'none' }">
<!--          <div :class="`chat-${item.type}-info`">-->
<!--            {{item.time}}-->
<!--          </div>-->
          <div class="chat-content">
            <div v-html="textToHtml(item.text)"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>

</template>

<script setup lang="ts">
// 【start】----------- mardown  -----------【start】
import { marked } from 'marked';
import hljs from "highlight.js";
import 'highlight.js/styles/base16/gruvbox-dark-hard.css';
import {computed, reactive, ref} from "vue";
import {sleep} from "../../utils/common";
import {ChatItem} from "../../utils/types/types";


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
// 【end】----------- mardown  -----------【end】

const getCurrentTime = () => new Date().toLocaleString()

const chatList = reactive<ChatItem[]>([
//     {
//   id: '',
//   type: 'user',
//   text: 'Give me javascript code example.',
//   // time: getCurrentTime()
// }, {
//   id: '',
//   type: 'system',
//   text: testMd,
//   // time: getCurrentTime()
// }
])

const textToHtml = (text: string) => marked(text)

function deleteLastText() {
  chatList.pop()
}

async function addOneMessageTest(id: string, isUser: boolean) {
  for (let i = 0; i < 10; i++) {
    upsertLatestText({
      id: id,
      type: isUser ? 'user' : 'system',
      text: `${i}`
    })
    await sleep(200)
  }
}
function upsertLatestText(message: ChatItem) {
  if (chatList.length === 0) {
    chatList.push({
      id: message.id,
      type: message.type,
      text: message.text,
      // time: getCurrentTime()
    })
  }else {
    if (chatList[chatList.length - 1].id === message.id) { // 如果和前面的id一样，就更新text就行
      chatList[chatList.length - 1].text = message.text
    }else {// 如果和前面的不一样，就push进去，代表第一次收到这个id的消息
      chatList.push({
        id: message.id,
        type: message.type,
        text: message.text,
        // time: getCurrentTime()
      })
    }
  }
}
defineExpose({
  upsertLatestText
})
</script>

<style scoped lang="less">
.chat{
  display: flex;
  flex-direction: column;
  &-item{
    margin-top: 10px;
  }
  &-user{
    display: flex;
    flex-direction: row-reverse;
    &-info{
      text-align: end;
      font-size: 14px;
    }
  }
  &-system {
    display: flex;
    flex-direction: row;
    &-info{
      text-align: left;
      font-size: 14px;
    }
  }
  &-content{
    text-align: left;
  }
}
</style>
