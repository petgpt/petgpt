<template>
	<ul id="aside-menu" class="menu border-r-2 border-r-neutral-content">
		<li v-for="(info, index) in pluginsConfigList">
			<a @click="onPluginClick(index)" :class="{ active: defaultActiveMenu === index + '' }">{{ info.name }}</a>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron'
import { nextTick, onMounted, ref, toRef } from 'vue'
import { useChatStore } from '../../store'
import { logger } from '../../utils/common'

const defaultActiveMenu = ref('0')
let pluginsConfigList = ref<PluginInfo[]>([])
const chatStore = useChatStore()
async function getPluginsNameList() {
	let pluginInfoList = await ipcRenderer.invoke('plugin.getAllPluginName')
	for (const pluginInfo of pluginInfoList) {
		if (pluginInfo.enabled) {
			pluginsConfigList.value.push({
				name: pluginInfo.name,
				version: pluginInfo.version,
				description: pluginInfo.description,
				config: pluginInfo.config,
				enabled: pluginInfo.enabled,
			})
		}
	}
	// logger(`aside, pluginInfoList：`, pluginInfoList, ` pluginsConfigList:`, pluginsConfigList.value)
}

const emits = defineEmits(['changePlugin'])
function onPluginClick(index: number) {
	if (chatStore.state.activePluginIndex !== index + '') {
		// remove chatStore.state.activePluginIndex active class and add to index
		let activePluginIndex = document.querySelector(`#aside-menu .active`)
		if (activePluginIndex) {
			activePluginIndex.classList.remove('active')
		}
		let activePluginIndexEle = document.querySelector(`#aside-menu li:nth-child(${index + 1}) a`)
		if (activePluginIndexEle) {
			activePluginIndexEle.classList.add('active')
		}
	}
	logger(`click: `, index)
	chatStore.state.activePluginIndex = index + ''
	emits('changePlugin', true)
}

onMounted(() => {
	defaultActiveMenu.value = chatStore.getActivePluginIndex
	// logger(`defaultActiveMenu:`, defaultActiveMenu.value)
	getPluginsNameList().then(() => {
		let purePluginNameList = pluginsConfigList.value.map(info => info.name)
		nextTick(() => {
			chatStore.state.activePluginNameList = purePluginNameList
		})
	})
})

const props = defineProps(['isHide'])
let isHide = toRef(props, 'isHide')
</script>

<style scoped></style>
