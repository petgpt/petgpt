<template>
	<div class="drawer drawer-end w-0 p-0">
		<input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
		<div class="drawer-side rounded-md">
			<label for="my-drawer-4" class="drawer-overlay m-2 rounded-md "></label>
			<ul class="menu mr-2 mt-12 h-4/5 w-60 rounded-md bg-base-200 p-4 text-base-content">
				<!-- Sidebar content here -->
				<button class="btn btn-outline btn-sm rounded-btn" @click="captureCurrentPlugin">capture</button>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
function captureCurrentPlugin() {
  // 用户输入一个名字，保存当前的插件的配置快照到本地，可以在用户命名面板进行快速设置与调用

}  
</script>

<style scoped lang="less"></style>
