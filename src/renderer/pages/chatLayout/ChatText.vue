<template>
	<div
		v-for="(item, index) in chatList"
		:key="index"
		class="chat"
		:class="item.type === 'user' ? 'chat-end' : 'chat-start'"
	>
		<div class="chat-bubble flex flex-col items-end justify-start">
			<div v-html="textToHtml(item.text)"></div>
			<span
				v-if="(index === chatList.length - 2 || index === chatList.length - 1) && item.type === 'user'"
				class="cursor-pointer pl-1 text-2xl text-white"
				@click="reloadCurrentChat"
			>
				&#10227;
			</span>
			<svg
				v-if="index === chatList.length - 1 && item.type === 'system'"
				class="cursor-pointer"
				@click="continueChat"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M12 12.575q-.2 0-.375-.062T11.3 12.3L6.7 7.7q-.275-.275-.288-.688T6.7 6.3q.275-.275.7-.275t.7.275l3.9 3.875L15.9 6.3q.275-.275.688-.287t.712.287q.275.275.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062Zm0 6q-.2 0-.375-.062T11.3 18.3l-4.6-4.6q-.275-.275-.288-.687T6.7 12.3q.275-.275.7-.275t.7.275l3.9 3.875l3.9-3.875q.275-.275.688-.288t.712.288q.275.275.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062Z"
				/>
			</svg>
		</div>
	</div>
</template>

<script setup lang="ts">
// 【start】----------- mardown  -----------【start】
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/base16/gruvbox-dark-hard.css'
import { onBeforeMount, reactive } from 'vue'
import katex from 'katex'
import { ipcRenderer } from 'electron'

// "marked-katex-extension": "^1.0.2" latex支持还可以用前面的这个marked插件，https://github.com/UziTech/marked-katex-extension
let marked_render = new marked.Renderer()
// @ts-ignore
marked_render.old_paragraph = marked_render.paragraph

marked_render.paragraph = function (text) {
	let isTeXInline = /\$(.*)\$/g.test(text) // isTeXInline - 该文本是否有行内公式
	let isTeXLine = /^\$\$(\s*.*\s*)\$\$$/.test(text) // isTeXLine - 该文本是否有行间公式

	if (!isTeXLine && isTeXInline) {
		// 如果不是行间公式，但是行内公式，则使用<span class="marked_inline_tex">包裹公式内容，消除$定界符
		text = text.replace(/(\$([^\$]*)\$)+/g, function ($1, $2) {
			if ($2.indexOf('<code>') >= 0 || $2.indexOf('</code>') >= 0) {
				// 避免和行内代码冲突
				return $2
			} else {
				return '<span class="marked_inline_tex">' + $2.replace(/\$/g, '') + '</span>'
			}
		})
	} else {
		// 如果是行间公式，则使用<div class='marked_tex'>包裹公式内容，消除$$定界符
		// 如果不是LaTex公式，则直接返回原文本
		text = isTeXLine ? '<div class="marked_tex">' + text.replace(/\$/g, '') + '</div>' : text
	}
	// 使用渲染器原有的`paragraph()`方法渲染整段文本
	// @ts-ignore
	text = marked_render.old_paragraph(text)
	return text
}

let mdOptions = {
	renderer: marked_render,
	highlight: function (code: string) {
		return hljs.highlightAuto(code).value
	},
	pedantic: false,
	gfm: true,
	tables: true,
	breaks: false,
	sanitize: false,
	smartLists: true,
	smartypants: false,
	xhtml: false,
}
marked.setOptions(mdOptions)
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
	//   text: `# Hello`,
	//   // time: getCurrentTime()
	// }
])

const textToHtml = (text: string) => {
	let html = marked(text)
	const parser = new DOMParser()
	const doc = parser.parseFromString(html, 'text/html')
	let markedInlineTexElList = doc.getElementsByClassName('marked_inline_tex')
	let markedTexElList = doc.getElementsByClassName('marked_tex')
	// 在这里处理HTML中<span class='marked_inline_tex'>和<span class='marked_tex'>中的文本，使用KaTex来渲染，最后显示为渲染后的LaTex公式（HTML）
	if (markedInlineTexElList) {
		for (let i = 0; i < markedInlineTexElList.length; i++) {
			let tex = markedInlineTexElList[i].innerHTML
			tex = tex.replace(/[^\\](%)/g, match => {
				return match[0] + '\\' + '%'
			})
			// 如果在`%`字符前没有`\`字符，则在`%`前添加`\`后再渲染
			let res = katex.renderToString(tex, {
				output: 'mathml', // 特别注意，这里的output如果不指定，会生成两个两个，一个mathml，一个html！！！！
				// 取消对中文内容渲染的警告
				strict: false,
			})
			markedInlineTexElList[i].innerHTML = res
		}
	}
	if (markedTexElList) {
		for (let i = 0; i < markedTexElList.length; i++) {
			let tex = markedTexElList[i].innerHTML
			tex = tex.replace(/[^\\](%)/g, match => {
				return match[0] + '\\' + '%'
			})
			// 如果在`%`字符前没有`\`字符，则在`%`前添加`\`后再渲染
			let res = katex.renderToString(tex, {
				output: 'mathml', // 特别注意，这里的output如果不指定，会生成两个两个，一个mathml，一个html！！！！
				// 取消对中文内容渲染的警告
				strict: false,
			})
			markedTexElList[i].innerHTML = res
		}
	}
	return doc.body.innerHTML
}

function deleteLastText() {
	// check chatList last item is user type
	if (chatList.length === 0) {
		return
	}

	if (chatList[chatList.length - 1].type === 'system') {
		chatList.pop()
	}
}

function reloadCurrentChat() {
	emits('onReloadLatestChat')
}

function continueChat() {
	emits('onContinueChat')
	// 把最后一条消息保存，然后模拟用户发出“继续/continue”，然后把新到来的消息头部加入之前保存的消息，然后更新最新的消息
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
	} else {
		if (chatList[chatList.length - 1].id === message.id) {
			// 如果和前面的id一样，就更新text就行
			chatList[chatList.length - 1].text = message.text
		} else {
			// 如果和前面的不一样，就push进去，代表第一次收到这个id的消息
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
	if (isClearContext) chatList.splice(0, chatList.length)
}

const emits = defineEmits(['onChatUpdate', 'onReloadLatestChat', 'onContinueChat'])
defineExpose({
	upsertLatestText,
	clearChatContext,
	deleteLastText,
})
</script>

<style scoped></style>
