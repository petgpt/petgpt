<template>
  <el-container class="chatgpt">
    <el-aside class="chatgpt-aside">
      <chatgpt-aside @changePlugin="changePluginHandler"></chatgpt-aside>
    </el-aside>
    <el-container>
      <el-header class="chatgpt-header">
        <chatgpt-header></chatgpt-header>
      </el-header>
      <el-main class="chatgpt-main">
        <chat-text ref="chatText"></chat-text>
      </el-main>
      <el-footer class="chatgpt-footer">
        <chatgpt-footer @upsertLatestText="upsertLatestText"></chatgpt-footer>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import ChatgptAside from "./chatgpt/ChatgptAside.vue";
import ChatgptHeader from "./chatgpt/ChatgptHeader.vue";
import ChatgptFooter from "./chatgpt/ChatgptFooter.vue";
import ChatText from "./chatgpt/ChatText.vue";
import {ref} from "vue";

const chatText = ref();
function upsertLatestText(arg: any) {
  chatText.value.upsertLatestText(arg)
}

function changePluginHandler(isClearContext: boolean) {
  chatText.value.clearChatContext(isClearContext)
}
</script>

<style scoped lang="less">
.el-container{
  height: 100%;
}
.el-main{
  padding-top: 0px;
  padding-bottom: 0px;
}
.chatgpt{
  &-header{
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: center;
    align-items: center;
  }
  &-main{
    display: flex;
    /* layout占满整屏 */
    height: 95%;
    //overflow: hidden;
    flex-direction: column;
    //border: 1px solid #000000;
  }
  &-footer{
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    //align-items: flex-start;
    //border-top: 1px solid black;
    padding-bottom: 5px;
    padding-top: 5px;
    --el-footer-height: 70px;
  }
  &-aside{
    width: 100px;
    border-right: 1px solid black;
  }
}
</style>
