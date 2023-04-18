<template>
  <div class="chat">
    <el-row v-for="(item, index) in chatList" :key="index" :class="`chat-${item.type} chat-item`">
      <el-col :span="20">
        <el-card :body-style="{ padding: '8px', background: item.type === 'user' ? 'linear-gradient(to right, rgb(241, 242, 181), rgb(19 80 88 / 64%))' : 'none' }">
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
import {marked} from 'marked';
import hljs from "highlight.js";
import 'highlight.js/styles/base16/gruvbox-dark-hard.css';
import {onBeforeMount, reactive} from "vue";
import {ChatItem} from "../../utils/types/types";
import katex from "katex";
import {ipcRenderer} from "electron";

// "marked-katex-extension": "^1.0.2" latex支持还可以用前面的这个marked插件，https://github.com/UziTech/marked-katex-extension
let marked_render = new marked.Renderer()
// @ts-ignore
marked_render.old_paragraph = marked_render.paragraph

marked_render.paragraph = function(text) {
  let isTeXInline = /\$(.*)\$/g.test(text) // isTeXInline - 该文本是否有行内公式
  let isTeXLine = /^\$\$(\s*.*\s*)\$\$$/.test(text) // isTeXLine - 该文本是否有行间公式

  if (!isTeXLine && isTeXInline) {
    // 如果不是行间公式，但是行内公式，则使用<span class="marked_inline_tex">包裹公式内容，消除$定界符
    text = text.replace(/(\$([^\$]*)\$)+/g, function($1, $2) {
      if ($2.indexOf('<code>') >= 0 || $2.indexOf('</code>') >= 0) {// 避免和行内代码冲突
        return $2
      } else {
        return "<span class=\"marked_inline_tex\">" + $2.replace(/\$/g, "") + "</span>"
      }
    })
  } else {
    // 如果是行间公式，则使用<div class='marked_tex'>包裹公式内容，消除$$定界符
    // 如果不是LaTex公式，则直接返回原文本
    text = (isTeXLine) ? "<div class=\"marked_tex\">" + text.replace(/\$/g, "") +"</div>": text
  }
  // 使用渲染器原有的`paragraph()`方法渲染整段文本
  // @ts-ignore
  text = marked_render.old_paragraph(text)
  return text
}

let mdOptions = {
  renderer: marked_render,
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
//   text: testLatex,
//   // time: getCurrentTime()
// }
])

const textToHtml = (text: string) => {
  let html = marked(text);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  let markedInlineTexElList = doc.getElementsByClassName('marked_inline_tex');
  let markedTexElList = doc.getElementsByClassName('marked_tex');
  // 在这里处理HTML中<span class='marked_inline_tex'>和<span class='marked_tex'>中的文本，使用KaTex来渲染，最后显示为渲染后的LaTex公式（HTML）
  if (markedInlineTexElList) {
    for (let i = 0; i < markedInlineTexElList.length; i++) {
      let tex = markedInlineTexElList[i].innerHTML;
      tex = tex.replace(/[^\\](%)/g, (match) => {
        return match[0] + '\\' + '%'
      })
      // 如果在`%`字符前没有`\`字符，则在`%`前添加`\`后再渲染
      let res = katex.renderToString(tex, {
        output: 'mathml', // 特别注意，这里的output如果不指定，会生成两个两个，一个mathml，一个html！！！！
        // 取消对中文内容渲染的警告
        strict: false
      });
      markedInlineTexElList[i].innerHTML = res;
    }
  }
  if (markedTexElList) {
    for (let i = 0; i < markedTexElList.length; i++) {
      let tex = markedTexElList[i].innerHTML;
      tex = tex.replace(/[^\\](%)/g, (match) => {
        return match[0] + '\\' + '%'
      })
      // 如果在`%`字符前没有`\`字符，则在`%`前添加`\`后再渲染
      let res = katex.renderToString(tex, {
        output: 'mathml', // 特别注意，这里的output如果不指定，会生成两个两个，一个mathml，一个html！！！！
        // 取消对中文内容渲染的警告
        strict: false
      });
      markedTexElList[i].innerHTML = res;
    }
  }
  return doc.body.innerHTML
}

function deleteLastText() {
  chatList.pop()
}

onBeforeMount(() => {
  ipcRenderer.on('upsertLatestText', (event, message: ChatItem) => {
    upsertLatestText(message)
  })
})

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
    // 对外emit事件，返回信息来了
    emits('onChatUpdate')
  }
}

function clearChatContext(isClearContext: boolean) {
  // clear chatList
  if(isClearContext) chatList.splice(0, chatList.length)
}

const emits = defineEmits(['onChatUpdate']);
defineExpose({
  upsertLatestText,
  clearChatContext
})
</script>

<style scoped lang="less">
.chat{
  display: flex;
  flex-direction: column;
  margin-right: 10px;
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
