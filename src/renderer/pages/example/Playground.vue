<script setup lang="ts">
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/base16/gruvbox-dark-hard.css'
import { ref } from 'vue'
import katex from 'katex'

let markdown = ref('# Hello World\n - const count = 1;\n\n ```js\n const c = 1;\n```\n## Title 2\n')
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
</script>

<template>
	<div class="">
		<div>
			<button class="btn">Button</button>
			<button class="btn-primary btn">Button</button>
			<button class="btn w-64 rounded-full">Button</button>
		</div>
		<article class="prose" v-html="textToHtml(markdown)"></article>
	</div>
</template>

<style scoped></style>
