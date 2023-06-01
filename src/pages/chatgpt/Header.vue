<template>
  <div>
<!--    <IpInfo></IpInfo>-->
  </div>
</template>

<script setup lang="ts">
import {ipcRenderer} from "electron";
import {IWindowList} from "../../utils/types/types";

function pushRouter() {
  ipcRenderer.send('router', {window: IWindowList.PET_DETAIL_WINDOW, hash: 'petDetail'})
}

</script>

<style scoped lang="less">

</style>
