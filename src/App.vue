<template>
<!--  <div class="test" :style="{ color: variables['greenColor'] }">click to open detail window：{{ titleStore.title }}</div>-->
  <div class="main_app">
    <head-tools></head-tools>
  </div>
</template>

<script setup lang="ts">
import {useTitleStore} from './store';
import {computed} from "vue";
import variables from '../src/assets/css/variables.module.less';
import HeadTools from "./pages/HeadTools.vue"; // less变量，可以在脚本中获取

// ---------------- 全局状态 store的引入 ---------------- pinia使用更简单
const titleStore = useTitleStore()
// ---------------- 访问 ----------------
const computedTitle = computed(() => titleStore.title) // 引入后，可以直接通过store访问
// let title = store.getTitle;// 通过getters访问
// let title2 = store.getTitle2;// 通过getters访问

// ---------------- 更新 ----------------
titleStore.$patch({title: '新标题'}) // 可以通过patch直接修改store对象多个值
titleStore.$patch((state) => state.title = "新标题1") // 第二种方法修改，不用传整个store对象。
titleStore.$reset() // 重置store

// ---------------- 调用actions里的方法 ----------------
titleStore.changeTitle('新标题2') // 调用action，同步
titleStore.changeTitleAsync('新标题3').then(() => {}) // 调用action，异步

// ---------------- $subscribe 监听store的变化 ----------------
// mutation.events : 是这次state改变的具体数据，包括改变前的值和改变后的值等等数据.
// mutation.type : type表示这次变化是通过什么产生的。“direct” ：通过 action 变化的。”patch object“ ：通过 $patch 传递对象的方式改变的。“patch function” ：通过 $patch 传递函数的方式改变的
let unsubscribe = titleStore.$subscribe((mutation, state) => { // 监听store的变化
  console.log(`mutation:`, mutation)
  console.log(`state.title:`, state.title)
}, {});// 第二个参数是options，detached（默认组件卸载的时候取消订阅）。还有immediate、deep、flush等，对标watch
unsubscribe() // 可以在onBeforeUnmount里调用

// ---------------- $subscribe 监听actions里方法的调用 ----------------
const unsubscribeAction = titleStore.$onAction(({
  name, // action 函数的名称
  store, // store 实例，这里是 mainStore
  args, // action 函数参数数组
  after, // 钩子函数，在action函数执行完成返回或者resolves后执行
  onError, // 钩子函数，在action函数报错或者rejects后执行
}) => {
  console.log('action的函数名', name)
  console.log('参数数组', args)
  console.log('store实例', store)

  after((result) => {
    console.log('$onAction after函数', result)
  })

  onError(error => {
    console.log('错误捕获', error)
  })
}, false); // 可以监听action的动作及结果等，第二个参数如果是true，组件卸载时，订阅依然有效（默认false）
unsubscribeAction(); // 取消监听


// ---------------- 调用与测试 ----------------
setTimeout(()=> {
  titleStore.$patch({title: '2222'})
}, 2000) //调用mutations，修改store中的test的值

setTimeout(()=> {
  titleStore.changeTitleAsync('!!!').then(() => {
    titleStore.$reset();
  })
}, 5000) //调用mutations，修改store中的test的值

console.log("[App.vue]", `Hello world from Electron ${process.versions.electron}!`)

// ---------------- 使用preload里暴露的api ----------------
// window.electronAPI.loadPreferences().then(res => {})
</script>

<style lang="less">
.test{
  background-color: @red;// less测试代码
}
html,
body,
.main_app {
  display: inherit;
  height: 100%;
  width: 100%;
  /* 撑满整个空间 */
  margin: 0;
  overflow: auto;
  //text-align: center;
  font-size: 100%;
}

.layout {
  display: flex;
  /* layout占满整屏 */
  height: 100%;
  //overflow: hidden;
  flex-direction: column;
  //border: 1px solid #000000;
  &-right {
    flex: 1; // right占满整个右边
    display: flex; // 右边也是flex布局
    flex-direction: column; // 让right这部分，竖着布局！！！
    justify-content: flex-start;
  }
}

.el-main{
  padding: 0 !important;
}
</style>
