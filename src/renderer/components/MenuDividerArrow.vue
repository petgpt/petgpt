<script setup lang="ts">
import { defineAsyncComponent, ref, toRef } from "vue";

const props = defineProps(['rotate', 'initRotate'])
let hide = toRef(props, 'rotate')
let initRotate = toRef(props, 'initRotate')

const DoubleArrowSVG = defineAsyncComponent(() =>
  import("./DoubleArrowSVG.vue"),
);
</script>

<template>
  <div class="flex flex-col justify-center cursor-pointer">
    <div :class="!hide ? 'rotate-180' : 'rotate-0'">
      <DoubleArrowSVG :width="17" :height="17" :class="initRotate ? 'rotate-180' : ''"></DoubleArrowSVG>
    </div>
  </div>
</template>

<style scoped>

</style>
