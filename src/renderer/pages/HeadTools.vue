<template>
	<router-view v-if="routerLocation === '/'" />
	<div v-else class="flex flex-1 flex-row content-center justify-center rounded-md bg-base-200">
		<div class="flex flex-1 flex-col">
			<div
				class="flex h-6 flex-row justify-end rounded-md bg-base-300"
				v-if="os === 'win32'"
				style="-webkit-app-region: drag; -webkit-user-select: none"
			>
				<div class="flex-r-c pr-1" style="-webkit-app-region: no-drag">
					<div class="tooltip tooltip-bottom" data-tip="多开chat页面">
            <ADDSVG :width="'1em'" :height="'1em'" class="ml-0.5 mr-0.5 cursor-pointer" @click="openMultiChat"></ADDSVG>
          </div>
          <div class="tooltip tooltip-bottom" data-tip="窗口置顶">
            <svg
              id="pin-icon"
              @click="pinCurrentWindow"
              class="cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <g fill="none" fillRule="evenodd">
                <path
                  d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
                ></path>
                <path
                  fill="currentColor"
                  d="M8.867 2a2 2 0 0 0-1.98 1.717l-.515 3.605a9 9 0 0 1-1.71 4.128l-1.318 1.758c-.443.59-.265 1.525.528 1.82c.746.278 2.839.88 7.128.963V22a1 1 0 1 0 2 0v-6.01c4.29-.082 6.382-.684 7.128-.962c.793-.295.97-1.23.528-1.82l-1.319-1.758a9 9 0 0 1-1.71-4.128l-.514-3.605A2 2 0 0 0 15.133 2H8.867Zm0 2h6.266l.515 3.605c.261 1.83.98 3.565 2.09 5.045l.606.808C17.209 13.71 15.204 14 12 14s-5.21-.29-6.344-.542l.607-.808a11 11 0 0 0 2.09-5.045L8.866 4Z"
                ></path>
              </g>
            </svg>
          </div>
					<svg
						@click="minusWindow"
						class="cursor-pointer"
						xmlns="http://www.w3.org/2000/svg"
						width="1em"
						height="1em"
						viewBox="0 0 24 24"
					>
						<g fill="none" fillRule="evenodd">
							<path
								d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
							></path>
							<path fill="currentColor" d="M3 12a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z"></path>
						</g>
					</svg>
					<svg
						@click="closeWindow"
						class="cursor-pointer"
						xmlns="http://www.w3.org/2000/svg"
						width="1em"
						height="1em"
						viewBox="0 0 24 24"
					>
						<g fill="none" fillRule="evenodd">
							<path
								d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
							></path>
							<path
								fill="currentColor"
								d="m12 13.414l5.657 5.657a1 1 0 0 0 1.414-1.414L13.414 12l5.657-5.657a1 1 0 0 0-1.414-1.414L12 10.586L6.343 4.929A1 1 0 0 0 4.93 6.343L10.586 12l-5.657 5.657a1 1 0 1 0 1.414 1.414L12 13.414Z"
							></path>
						</g>
					</svg>
				</div>
			</div>
			<div class="flex-1 content-center justify-center overflow-auto rounded-md bg-base-200">
				<router-view />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Sider from '../components/Layout/Sider.vue'
import { nextTick, onBeforeMount, ref } from 'vue'
import { ipcRenderer } from 'electron'
import { logger } from '../utils/common'
import { sendToMain } from '../utils/dataSender'
import ADDSVG from '../components/ADDSVG.vue'

const os = ref('')
const routerLocation = ref('')

onBeforeMount(() => {
	nextTick(() => {
		ipcRenderer.invoke('getOperatingSystem').then(res => {
			os.value = res
		})
		ipcRenderer.invoke('get-router-location').then(fullLocation => {
			routerLocation.value = fullLocation ? fullLocation.split('#')[1] : '/'
		})
		logger(`routerLocation:`, routerLocation)
		console.log(`routerLocation:`, routerLocation)
	})
})

// -------- 窗口置顶 ------------
const isPin = ref(false)
function pinCurrentWindow() {
	// get pin icon by id, and rotate it
	const pinIcon = document.getElementById('pin-icon')
	// rotate icon 45 degree
	if (pinIcon) {
		pinIcon.style.transform = !isPin.value ? 'rotate(90deg)' : 'rotate(0deg)'
	}
	isPin.value = !isPin.value
	sendToMain('pinCurrentWindow', isPin)
}
function closeWindow() {
	sendToMain('close')
}

function minusWindow() {
	sendToMain('minus')
}

function openMultiChat() {

}
</script>

<style scoped></style>
