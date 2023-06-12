<template>
	<div>
		<div class="setting flex-col p-4">
			<div class="setting-actions flex">
				<div class="setting-actions-input flex w-5/6 flex-col">
					<input
						type="text"
						v-model="pluginNameToInstall"
						placeholder="plugin name to install, like: template/chatgpt"
						class="setting-actions-item input-bordered input w-full"
					/>
					<progress
						v-show="installPercentage !== 0"
						class="progress ml-1 w-56"
						:class="
							installStatus === ''
								? 'progress-info'
								: installStatus === 'success'
								? 'progress-success'
								: 'progress-error'
						"
						:value="installPercentage"
						max="100"
					></progress>
				</div>
				<div class="ml-1 w-1/6">
					<button class="setting-actions-button setting-actions-item btn-info btn" @click="installPlugin">
						install
					</button>
				</div>
			</div>
			<div class="setting-container mt-4 flex flex-row flex-wrap">
				<div v-for="(info, index) in pluginsConfigList" class="setting-container-item m-1">
					<div class="w-full">
						<div class="card w-64 bg-base-100 shadow-md">
							<div class="card-body">
								<h3 class="card-title">{{ info.name }} - {{ info.version }}</h3>
								<div class="tooltip tooltip-top" :data-tip="info.description">
                  <div class="flex flex-row">
                    <div class="truncate">{{ info.description }}</div>
                  </div>
                </div>
								<div class="flex flex-row justify-start">
									<svg
										@click="configClickHandler(index)"
										class="cursor-pointer"
										xmlns="http://www.w3.org/2000/svg"
										width="17px"
										height="17px"
										viewBox="0 0 24 24"
									>
										<g fill="none">
											<path
												d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
											></path>
											<path
												fill="currentColor"
												d="M14.41 2.293a9.947 9.947 0 0 1 2.75 1.14a1 1 0 0 1 .47 1.019c-.113.689.058 1.216.38 1.538c.322.322.85.493 1.538.38a1 1 0 0 1 1.019.47a9.945 9.945 0 0 1 1.14 2.75a1 1 0 0 1-.388 1.054c-.567.407-.82.9-.82 1.356c0 .456.253.95.82 1.357a1 1 0 0 1 .388 1.053a9.947 9.947 0 0 1-1.14 2.75a1 1 0 0 1-1.019.47c-.689-.113-1.216.059-1.538.38c-.322.322-.493.85-.38 1.538a1 1 0 0 1-.47 1.02a9.948 9.948 0 0 1-2.75 1.14a1 1 0 0 1-1.054-.388c-.407-.568-.9-.82-1.356-.82c-.456 0-.95.252-1.357.82a1 1 0 0 1-1.053.388a9.948 9.948 0 0 1-2.75-1.14a1 1 0 0 1-.47-1.02c.113-.688-.059-1.215-.38-1.537c-.323-.322-.85-.494-1.538-.38a1 1 0 0 1-1.02-.47a9.948 9.948 0 0 1-1.14-2.752a1 1 0 0 1 .388-1.053c.568-.406.82-.9.82-1.356c0-.455-.252-.95-.82-1.356a1 1 0 0 1-.388-1.053a9.947 9.947 0 0 1 1.14-2.751a1 1 0 0 1 1.02-.47c.688.113 1.215-.058 1.537-.38c.322-.322.494-.85.38-1.538a1 1 0 0 1 .47-1.019a9.946 9.946 0 0 1 2.751-1.14a1 1 0 0 1 1.053.388c.407.567.901.82 1.357.82c.455 0 .95-.253 1.356-.82a1 1 0 0 1 1.053-.388ZM12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6a3 3 0 0 1 0-6Z"
											></path>
										</g>
									</svg>
									<svg
										@click="updatePlugin(index)"
										class="ml-1 cursor-pointer"
										xmlns="http://www.w3.org/2000/svg"
										width="17px"
										height="17px"
										viewBox="0 0 24 24"
									>
										<g fill="none">
											<path
												d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
											/>
											<path
												fill="currentColor"
												d="M2 12.08c-.006-.862.91-1.356 1.618-.975l.095.058l2.678 1.804c.972.655.377 2.143-.734 2.007l-.117-.02l-1.063-.234a8.002 8.002 0 0 0 14.804.605a1 1 0 0 1 1.82.828c-1.987 4.37-6.896 6.793-11.687 5.509A10.003 10.003 0 0 1 2 12.08Zm.903-4.228C4.89 3.482 9.799 1.06 14.59 2.343a10.002 10.002 0 0 1 7.414 9.581c.007.863-.91 1.358-1.617.976l-.096-.058l-2.678-1.804c-.972-.655-.377-2.143.734-2.007l.117.02l1.063.234A8.002 8.002 0 0 0 4.723 8.68a1 1 0 1 1-1.82-.828Z"
											/>
										</g>
									</svg>
									<svg
										@click="deletePlugin(index)"
										class="ml-1 cursor-pointer"
										xmlns="http://www.w3.org/2000/svg"
										width="17px"
										height="17px"
										viewBox="0 0 24 24"
									>
										<g fill="none" fill-rule="evenodd">
											<path
												d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
											/>
											<path
												fill="currentColor"
												d="M14.28 2a2 2 0 0 1 1.897 1.368L16.72 5H20a1 1 0 1 1 0 2l-.003.071l-.867 12.143A3 3 0 0 1 16.138 22H7.862a3 3 0 0 1-2.992-2.786L4.003 7.07A1.01 1.01 0 0 1 4 7a1 1 0 0 1 0-2h3.28l.543-1.632A2 2 0 0 1 9.721 2h4.558ZM9 10a1 1 0 0 0-.993.883L8 11v6a1 1 0 0 0 1.993.117L10 17v-6a1 1 0 0 0-1-1Zm6 0a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1Zm-.72-6H9.72l-.333 1h5.226l-.334-1Z"
											/>
										</g>
									</svg>
									<input
										@change="enablePlugin(info.enabled, index)"
										type="checkbox"
										class="toggle toggle-xs ml-1"
										v-model="info.enabled"
									/>
								</div>
							</div>
						</div>
						<progress
							v-show="upOrDeleteProgress[index].percentage !== 0"
							class="progress ml-1 w-56"
							:class="
								upOrDeleteProgress[index].status === ''
									? 'progress-info'
									: installStatus === 'success'
									? 'progress-success'
									: 'progress-error'
							"
							:value="upOrDeleteProgress[index].percentage"
							max="100"
						></progress>
					</div>
				</div>
				<dialog class="modal" :class="{ 'modal-open': centerDialogVisible }">
					<form method="dialog" class="modal-box">
						<div>
							<h3 class="text-lg font-bold">参数设置</h3>
							<div v-for="(configItem, index) in dialogConfigList" class="flex flex-row justify-start">
                <div class="form-control mt-1 w-full">
                  <label class="input-group">
                    <span class="w-full">{{ configItem.name }}：</span>
                    <input type="text" :placeholder="configItem.name"
                           class="input input-bordered input-xs w-full" v-model="dialogModelData[configItem.name]" />
                  </label>
                </div>
							</div>
						</div>
						<div class="modal-action">
							<button class="btn" @click="closeHandler">Close</button>
							<button class="btn" @click="confirmHandler">confirm</button>
						</div>
					</form>
				</dialog>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ipcRenderer } from 'electron'
import { sendToMain } from '../utils/dataSender'
import { logger } from '../utils/common'

let currentRules = reactive<Rule[]>([])
let currentConfigIndex = ref(0)
const centerDialogVisible = ref(false)
let pluginsConfigList = ref<PluginInfo[]>([])
const getConfigByIndex = (index: number) => pluginsConfigList.value[index]
let dialogConfigList = reactive<IPluginConfig[]>([])
let dialogModelData = reactive<any>({})
async function configClickHandler(index: number) {
	dialogModelData = reactive({})
	currentRules = reactive<Rule[]>([])

	currentConfigIndex.value = index
	centerDialogVisible.value = true

	dialogConfigList = getConfigByIndex(index).config // 根据下标获取到某个插件的config信息
	dialogConfigList.forEach(config => {
		currentRules.push({
			required: config.required,
			message: config.required ? config.name + '不能为空' : '',
			trigger: config.required ? 'blur' : 'none',
		})

		// @ts-ignore
		dialogModelData[config.name] = config.value ? config.value : config.default ? config.default : ''
	})
}

function closeHandler() {
	centerDialogVisible.value = false
}
const confirmHandler = async () => {
	centerDialogVisible.value = false

	let configByIndex = getConfigByIndex(currentConfigIndex.value)
	let purePluginName = configByIndex.name
	// logger(`name:${purePluginName}, configData: `, dialogModelData)
	sendToMain(`plugin.${purePluginName}.config.update`, { name: purePluginName, data: dialogModelData })

	pluginsConfigList.value = []
	getPluginsNameList()
}

async function getPluginsNameList() {
	pluginsConfigList.value = []
	upOrDeleteProgress.splice(0, upOrDeleteProgress.length)

	let pluginInfoList = await ipcRenderer.invoke('plugin.getAllPluginName')
	for (const pluginInfo of pluginInfoList) {
		pluginsConfigList.value.push({
			name: pluginInfo.name,
			version: pluginInfo.version,
			description: pluginInfo.description,
			config: pluginInfo.config,
			enabled: pluginInfo.enabled,
		})
		upOrDeleteProgress.push({ percentage: 0, status: '' })
	}
}

const pluginNameToInstall = ref('')

const upOrDeleteProgress = reactive<Progress[]>([])
const installPercentage = ref(0)
const installStatus = ref('')
function installPlugin() {
	sendToMain('installPlugin', pluginNameToInstall.value)
	installPercentage.value = 10
}

function updatePlugin(index: number) {
	sendToMain('updatePlugin', getConfigByIndex(index).name)
	setProgressBegin(index)
}

function deletePlugin(index: number) {
	sendToMain('uninstallPlugin', getConfigByIndex(index).name)
	setProgressBegin(index)
}

function enablePlugin(enabled: boolean, index: number) {
	let name = getConfigByIndex(index).name
	console.log(`enablePlugin: ${name}, enabled: ${enabled}`)
	sendToMain('enablePlugin', { name, enabled })
}

function setProgressBegin(index: number) {
	upOrDeleteProgress[index] = { percentage: 10, status: '' }
}

function setProgressSuccess(type: 'install' | 'upOrDelete') {
	if (type === 'install') {
		installPercentage.value = 100
		installStatus.value = 'success'
	} else {
		upOrDeleteProgress.forEach((progress, index) => {
			if (progress.percentage > 0) {
				upOrDeleteProgress[index] = {
					percentage: 100,
					status: 'success',
				}
			}
		})
	}
	setTimeout(() => {
		// clear progress status
		if (type === 'install') {
			installPercentage.value = 0
			installStatus.value = ''
		} else {
			upOrDeleteProgress.forEach((progress, index) => {
				if (progress.percentage > 0) {
					upOrDeleteProgress[index] = { percentage: 0, status: '' }
				}
			})
		}
	}, 1000)
}

function setProgressFailed(type: 'install' | 'upOrDelete', index: number) {
	if (type === 'install') {
		installPercentage.value = 100
		installStatus.value = 'exception'
	} else {
		upOrDeleteProgress[index] = { percentage: 100, status: 'exception' }
	}
	setTimeout(() => {
		// clear progress status
		if (type === 'install') {
			installPercentage.value = 0
			installStatus.value = ''
		} else {
			upOrDeleteProgress[index] = { percentage: 0, status: '' }
		}
	}, 1000)
}

onMounted(async () => {
	await getPluginsNameList()
	// logger(`pluginsConfigList:`, pluginsConfigList)

	ipcRenderer.on('installSuccess', (event, data) => {
		logger(`installSuccess: `, data, ` pluginsConfigList:`, pluginsConfigList)
		getPluginsNameList()
		logger(`[after install success] pluginsConfigList:`, pluginsConfigList)
		setProgressSuccess('install')
	})

	ipcRenderer.on('uninstallSuccess', (event, data) => {
		logger(`uninstallSuccess: `, data, ` pluginsConfigList:`, pluginsConfigList)
		setProgressSuccess('upOrDelete')
		getPluginsNameList()
		logger(`[after install success] pluginsConfigList:`, pluginsConfigList)
	})

	ipcRenderer.on('updateSuccess', (event, data) => {
		logger(`updateSuccess: `, data)
		setProgressSuccess('upOrDelete')
		getPluginsNameList()
	})

	// update \ delete 失败的时候，设置失败的进度条
	ipcRenderer.on('failedProgress', () => {
		upOrDeleteProgress.forEach((progress, index) => {
			if (progress.percentage > 0) {
				setProgressFailed('upOrDelete', index)
			}
		})
	})
})
</script>

<style scoped></style>
