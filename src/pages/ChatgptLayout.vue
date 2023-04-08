<template>
  <el-container>
    <el-aside width="100px">
      <chatgpt-aside class="chatgpt-aside"></chatgpt-aside>
    </el-aside>
    <el-container>
      <el-header class="chatgpt-header">
        <chatgpt-header></chatgpt-header>
      </el-header>
      <el-main class="chatgpt-main">
        <chatgpt-main></chatgpt-main>
      </el-main>
      <el-footer class="chatgpt-footer">
        <chatgpt-footer></chatgpt-footer>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import ChatgptAside from "./chatgpt/ChatgptAside.vue";
import ChatgptHeader from "./chatgpt/ChatgptHeader.vue";
import ChatgptMain from "./chatgpt/ChatgptMain.vue";
import ChatgptFooter from "./chatgpt/ChatgptFooter.vue";
</script>

<style scoped lang="less">
.el-container{
  height: 100%;
}
.el-main{
  padding-top: 0px;
  padding-bottom: 0px;
}
.chatgpt-header{
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: center;
  align-items: center;
}
.chatgpt-main{
  display: flex;
  /* layout占满整屏 */
  height: 95%;
  //overflow: hidden;
  flex-direction: column;
  //border: 1px solid #000000;
}
.chatgpt-footer{
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: center;
  align-items: center;
}
.chatgpt-aside{
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
}
</style>
