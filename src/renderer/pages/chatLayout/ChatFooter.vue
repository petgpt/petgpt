<template>
	<div class="footer-first mb-1 mt-1">
		<svg
			@click="clearChat"
			style="cursor: pointer"
			t="1681655238478"
			class="icon"
			viewBox="0 0 1024 1024"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			p-id="907"
			width="18"
			height="18"
		>
			<path
				d="M448 448H224a32 32 0 0 0-32 32v64a32 32 0 0 0 32 32h576a32 32 0 0 0 32-32v-64a32 32 0 0 0-32-32h-224V160a32 32 0 0 0-32-32h-64a32 32 0 0 0-32 32v288z m-64-64V128a64 64 0 0 1 64-64h128a64 64 0 0 1 64 64v256h192a64 64 0 0 1 64 64v128a64 64 0 0 1-64 64v256a64 64 0 0 1-64 64H256a64 64 0 0 1-64-64v-256a64 64 0 0 1-64-64v-128a64 64 0 0 1 64-64h192z m384 256H256v224a32 32 0 0 0 32 32h448a32 32 0 0 0 32-32v-224z m-96 64a32 32 0 0 1 32 32v160h-64v-160a32 32 0 0 1 32-32z m-128 64a32 32 0 0 1 32 32v96h-64v-96a32 32 0 0 1 32-32z m-128 64a32 32 0 0 1 32 32v32h-64v-32a32 32 0 0 1 32-32z"
				fill="#000000"
				p-id="908"
			></path>
		</svg>
		<svg
			ref="clipBoardSvg"
			id="clipBoardSvg"
			@click="pasteToUserInput"
			fill="url(#gradient-horizontal)"
			style="cursor: pointer"
			t="1681979539030"
			class="icon"
			viewBox="0 0 1024 1024"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			p-id="4501"
			width="17"
			height="17"
		>
			<defs>
				<linearGradient id="gradient-horizontal" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="var(--color-stop-1)" />
				</linearGradient>
			</defs>
			<path
				d="M241.664 93.090909C241.664 93.090909 139.636364 93.090909 139.636364 194.280727c0 292.910545 0 728.529455 0 728.529455C139.636364 1024 241.664 1024 241.664 1024l540.672 0c0 0 102.027636 0 102.027636-101.189818L884.363636 194.280727C884.363636 93.090909 782.336 93.090909 782.336 93.090909l-82.804364 0 0 95.790545c0 15.080727-12.474182 27.322182-27.601455 27.322182L352.069818 216.203636c-15.220364 0-27.554909-12.241455-27.554909-27.322182L324.514909 93.090909 241.664 93.090909z"
				p-id="4502"
			></path>
			<path
				d="M605.090909 186.181818c0 0 46.545455 3.304727 46.545455-45.335273 0-48.64-46.545455-47.383273-46.545455-47.383273S606.813091 0 512 0C417.186909 0 418.909091 93.463273 418.909091 93.463273S372.363636 95.464727 372.363636 140.846545C372.363636 186.181818 418.909091 186.181818 418.909091 186.181818L605.090909 186.181818zM512 46.545455c25.693091 0 46.545455 20.852364 46.545455 46.545455S537.693091 139.636364 512 139.636364 465.454545 118.784 465.454545 93.090909 486.306909 46.545455 512 46.545455z"
				p-id="4503"
				fill="#515151"
			></path>
		</svg>
    <svg
      style="cursor: pointer"
      @click="exportChatImage"
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"><g fill="none"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="currentColor" d="M20 15a1 1 0 0 1 1 1v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a1 1 0 1 1 2 0v4h14v-4a1 1 0 0 1 1-1ZM12 2a1 1 0 0 1 1 1v10.243l2.536-2.536a1 1 0 1 1 1.414 1.414l-4.066 4.066a1.25 1.25 0 0 1-1.768 0L7.05 12.121a1 1 0 1 1 1.414-1.414L11 13.243V3a1 1 0 0 1 1-1Z"/></g></svg>
		<slot
			v-for="(slot, index) in slotChildData"
			:name="slot.name"
			:data="slotChildData[index]"
			class="footer-first-slot"
		></slot>
	</div>
	<div class="footer-second">
		<textarea
      id="input-textarea"
			v-model="userInput"
			@keydown.enter="chatTest"
			ref="userInputRef"
			class="textarea-bordered textarea textarea-xs w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded"
			:placeholder="placeHolder"
		></textarea>
		<!--    <input :autosize="{ minRows: 1, maxRows: 15 }" autofocus clearable>-->
		<button class="btn-info btn-md btn ml-1" @click="chatTest">send</button>
	</div>
</template>

<script setup lang="ts">
import domtoimage from 'dom-to-image';
import {nextTick, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { sendToMain } from '../../utils/dataSender'
import { useChatStore } from '../../store'
import { ipcRenderer } from 'electron'
import { Get_ClipBoard_Type } from '../../../common/constants'

// 可以通过这样的方式，把子组件的数据传递给父组件
const slotChildData = reactive([
	{ name: 'slot1' },
	{ name: 'slot2' },
	{ name: 'slot3' },
	{ name: 'slot4' },
	{ name: 'slot5' },
])

const userInput = ref('')

const emits = defineEmits(['upsertLatestText', 'clearCurrentChat', 'deleteLastMsg'])
const chatStore = useChatStore()
function chatTest(event: Event | undefined) {
  if(event) event.preventDefault()
	// 添加用户输入的文本
	emits('upsertLatestText', {
		id: uuidv4(),
		type: 'user',
		text: userInput.value,
	})

	// 发送消息给插件
	let pluginPureName = chatStore.getActivePluginNameList[+chatStore.getActivePluginIndex]
	let channel = `plugin.${pluginPureName}.func.handle`
	// logger(`[renderer] plugin channel:`, channel, ` userInput:`, userInput.value)
	// 发往main线程，调用插件的handle函数
	sendToMain(channel, {
		pluginName: pluginPureName,
		input: userInput.value,
	})

	userInput.value = ''
  const textarea = document.getElementById('input-textarea')!;
  textarea.style.height = 'auto';
}

// TODO: 如果这里快速点击两次，会发送两次reload的chat请求
function reloadChat() {
	emits('deleteLastMsg')

	// 发送消息给插件
	let pluginPureName = chatStore.getActivePluginNameList[+chatStore.getActivePluginIndex]
	let channel = `plugin.${pluginPureName}.func.handle`
	// 发往main线程，调用插件的handle函数, reload为true
	sendToMain(channel, {
		pluginName: pluginPureName,
		input: userInput.value, // TODO: 这里要获取之前用户输入的，也就是从新获取答案的input。现在暂时不支持改最新的input，只支持reload之前的input，尝试重新获取之前input的回复
		reload: true,
	})
}

function continueChat() {
	userInput.value = 'continue/继续'
	chatTest(undefined)
}

function clearChat() {
	emits('clearCurrentChat')

	// 发送消息给插件
	let pluginPureName = chatStore.getActivePluginNameList[+chatStore.getActivePluginIndex]
	let channel = `plugin.${pluginPureName}.func.clear`
	sendToMain(channel)
	userInput.value = ''
  const textarea = document.getElementById('input-textarea')!;
  textarea.style.height = 'auto';
}

const clipBoardData = ref<{ type: string; data: string }[]>([])
const clipBoardSvg = ref()
async function getClipBoard() {
	let arg = await ipcRenderer.invoke(Get_ClipBoard_Type)
	clipBoardData.value = arg
	let clipSvg = document.getElementById('clipBoardSvg')
	if (arg.length > 0 && clipSvg) {
		clipSvg.setAttribute('fill', 'url(#gradient-horizontal)')
		setTimeout(() => {
			clipSvg!.setAttribute('fill', 'rgb(96, 96, 96, 1)')
		}, 8000)
	}
}
const userInputRef = ref()

onBeforeMount(async () => {
	await getClipBoard()
	addOrRemoveTabListener()
})
onMounted(() => {
	ipcRenderer.on('show', () => {
		getClipBoard()
		addOrRemoveTabListener()
		nextTick(() => userInputRef.value?.focus())
	})

	ipcRenderer.on('clear', () => {
		clearChat()
		nextTick(() => userInputRef.value?.focus())
	})
})
function pasteToUserInput() {
	let str = clipBoardData.value.map(item => item.data).join(', ')
	userInput.value += str

	let clipSvg = document.getElementById('clipBoardSvg')
	if (clipSvg) {
		clipSvg.setAttribute('fill', 'rgb(96, 96, 96, 1)')
	}
}

async function exportChatImage() {
  let ele = document.getElementById('image-wrapper')!;
  domtoimage.toJpeg(ele, { quality: 0.95, height: ele.scrollHeight, width: ele.scrollWidth })
      .then(function (dataUrl) {
        var link = document.createElement('a');
        link.download = 'my-image-name.jpeg';
        link.href = dataUrl;
        link.click();
      });
}

const inputTextAreaListener = () => {
  const textarea = document.getElementById('input-textarea')!;
  textarea.style.height = 'auto';  // 先将高度设置为 auto
  textarea.style.height = (textarea.scrollHeight + 3) > 350 ? '350px' : textarea.scrollHeight + 3 + 'px'; // 再将高度设置为内容的高度
};
const placeHolder = ref('请输入聊天内容')
watch(
	userInput,
	(newVal, oldVal) => {
		addOrRemoveTabListener()
    nextTick(() => {
      const textarea = document.getElementById('input-textarea')!;
      textarea.addEventListener('input', inputTextAreaListener);
    })
	},
	{
		immediate: true,
	}
)

onBeforeUnmount(() => {
  removeAllListener()
})

function removeAllListener() {
  const textarea = document.getElementById('input-textarea')!;
  textarea.removeEventListener('input', inputTextAreaListener);
  removeKeyDownListener()
}

function addOrRemoveTabListener() {
	// 为空, 存在剪贴板数据
	if (userInput.value === '') {
		placeHolder.value = 'TAB 粘贴剪贴板内容'
		addKeyDownListener()
	} else {
		removeKeyDownListener()
	}
}

function onTabKeyDown(event: KeyboardEvent) {
	if (event.code === 'Tab') {
		// tab键的键码是9
		event.preventDefault()
		pasteToUserInput()
		nextTick(() => userInputRef.value?.focus())
	}
}

function addKeyDownListener() {
	removeKeyDownListener()
	window.addEventListener('keydown', onTabKeyDown)
}

function removeKeyDownListener() {
	window.removeEventListener('keydown', onTabKeyDown)
}

defineExpose({
	reloadChat,
	continueChat,
})
</script>

<style scoped>
.footer-first {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	align-content: center;
}

.footer-first-slot {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.footer-second {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	align-content: center;
}

#gradient-horizontal {
	--color-stop-1: rgb(96, 96, 96, 1);
	animation: colorFlow 2s ease-in-out infinite;
}

@keyframes colorFlow {
	from {
		--color-stop-1: rgb(96, 96, 96, 1);
		transform: translate(0%);
	}
	to {
		--color-stop-1: #309aa9ff;
		transform: translate(100%);
	}
}
</style>
