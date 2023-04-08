<template>
  <div>config: {{configRes}}</div>

  <div style="background-color: darkseagreen">
    通过代理获取：
    <div>clash配置：TUN+global+env里配置ip2world原生ip => 可以的</div>
    <div>clash配置：系统代理+rule/global+env里配置127.0.0.1:1080 => 可以的</div>
    <el-button type="primary" size="small" @click="config(true)">getChatConfig(with proxy) | 最常用的就是系统代理+rule</el-button>
  </div>

  <div style="background-color: antiquewhite">
    <div>
      不通过代理获取：
      <div>clash配置：系统代理+rule+env里配置127.0.0.1:1080 => 获取不到</div>
    </div>
    <el-button type="primary" size="small" @click="config(false)">getChatConfig(no proxy)</el-button>
  </div>
</template>

<script setup lang="ts">
// 【start】----------- 配置信息获取 -----------【start】
import {ref} from "vue";
import {chatConfig} from "../../utils/chatgpt";

let configRes = ref('')
const config = (enableProxy: boolean) => {
  configRes.value = ''
  chatConfig(enableProxy).then((res) => {
    configRes.value = JSON.stringify(res.data, null, 2)
  }).catch((err) => {
    console.log(`chatConfig err: `, err)
  })
}
// 【end】----------- 配置信息获取 -----------【end】
</script>

<style scoped lang="less">

</style>
