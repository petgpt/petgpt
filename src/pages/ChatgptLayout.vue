<template>
  <el-container class="chatgpt">
    <el-aside class="chatgpt-aside">
      <chatgpt-aside></chatgpt-aside>
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
    flex-direction: row;
    align-content: center;
    justify-content: center;
    align-items: center;
    border-top: 1px solid black;
  }
  &-aside{
    width: 100px;
    border-right: 1px solid black;
  }
}
</style>
