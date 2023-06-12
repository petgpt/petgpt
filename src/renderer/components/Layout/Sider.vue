<template>
	<div class="w-auto min-w-[4rem] content-center rounded-md bg-base-200 max-md:hidden flex flex-col justify-start items-center">
		<div class="pt-2 pb-2 hover:bg-base-300 rounded-md" v-for="item in menus">{{item.label}}</div>
	</div>
</template>

<script setup lang="ts">
const menus = [
    {'label': 'sider'},
    {'label': 'sider1'},
    {'label': 'sider2'},
]
</script>

<style scoped></style>
