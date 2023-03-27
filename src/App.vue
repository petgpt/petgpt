<script setup lang="ts">
  // import {useStore} from 'vuex'
  // import {computed} from "vue";
  //
  // const store = useStore()
  //
  // const msg = computed(()=>store.state.test)
  //
  // setTimeout(()=>{store.commit('setTest',2)},2000) //调用mutations，修改store中的test的值

  console.log("[App.vue]", `Hello world from Electron ${process.versions.electron}!`)
</script>

<template>
<!--  <div class="test">vuex测试代码{{store.state.test}}</div>-->
  <router-view />
</template>

<style lang="less">
//.test{
//  background-color: @red;// less测试代码
//}
</style>
