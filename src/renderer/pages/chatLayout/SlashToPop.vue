<template>
  <!-- The button to open modal -->
  <label for="my_modal_7" class="btn hidden">open modal</label>

  <!-- Put this part before </body> tag -->
  <input type="checkbox" id="my_modal_7" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box h-4/5">
      <input id="tips-input" type="text" placeholder="输入指令" class="input input-bordered input-xs w-full" v-model="tips" autofocus />
    </div>
    <label class="modal-backdrop" for="my_modal_7">Close</label>
  </div>
</template>

<script setup lang="ts">

import {ref} from "vue";

const tips = ref('')
// 两个按键 slash esc、
const isOpen = ref(false) // open(true) close(false)
function openSlashPop(action: 'esc' | 'slash') {
  let myModal = document.getElementById('my_modal_7')!
  if (isOpen.value) {
    if (action === 'slash') {
      // open && slash
      myModal.click() // to close
    } else {
      // open && esc
      myModal.click() // to close
    }
    isOpen.value = false
  } else {
    if (action === 'slash') {
      // close && slash
      myModal.click() // to open
      isOpen.value = true
      document.getElementById('tips-input')?.focus()
    } else {
      // close && esc
      // do nothing
    }
  }
}
defineExpose({
  openSlashPop
})
</script>

<style scoped>

</style>