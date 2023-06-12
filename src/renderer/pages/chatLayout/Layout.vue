<template>
	<div class="flex h-full flex-row justify-start">
		<chat-aside @changePlugin="changePluginHandler" v-if="!hide" class="hover:bg-base-300"></chat-aside>
		<MenuDividerArrow :rotate="!hide" @click="hideMenuHandler"></MenuDividerArrow>
    <ChatMain ref="chatMain"></ChatMain>
		<MenuDividerArrow :init-rotate="true" @click="hideSideBarHandler"></MenuDividerArrow>
		<chat-side-bar></chat-side-bar>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineAsyncComponent } from 'vue'
import { ipcRenderer } from 'electron'
import ChatAside from './ChatAside.vue'

const ChatSideBar = defineAsyncComponent(() => import('./ChatSideBar.vue'))

const MenuDividerArrow = defineAsyncComponent(() => import('../../components/MenuDividerArrow.vue'))
const ChatMain = defineAsyncComponent(() => import('./ChatMain.vue'))

onMounted(() => {
	ipcRenderer.on('hideMenu', () => {
		hide.value = true
	})
})

// sidebar menu
const hide = ref(false)

function hideMenuHandler() {
	hide.value = !hide.value
}
function hideSideBarHandler() {
	let myDrawer = document.getElementById('my-drawer-4')
	myDrawer?.click()
}

const chatMain = ref()
function changePluginHandler(isClearContext: boolean) {
  chatMain.value.changePluginHandler(isClearContext)
}
</script>

<style scoped></style>
