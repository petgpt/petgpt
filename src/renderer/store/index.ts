import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { sleep } from '../utils/common'

interface TitleState {
	title: string
}

interface PersistTestState {
	count: number
}
interface ChatState {
	activePluginIndex: string
	activePluginNameList: string[]
}

export const useTitleStore = defineStore('title', {
	state: (): TitleState => ({
		title: '',
	}),
	getters: {
		// 类似computed
		getTitle: (state): string => state.title,
		getTitle2(): string {
			return this.title // 可以使用 this 访问整个store实例
		},
	},
	actions: {
		// 同步异步都可以
		async changeTitleAsync(name: string): Promise<void> {
			this.title = name
			await sleep(1000)
		},
		changeTitle(name: string): void {
			this.title = name
		},
	},
})

// 组合式Api来写
export const usePersistStoreTest = defineStore(
	'persistTest',
	() => {
		// 定义state
		const state = reactive<PersistTestState>({
			count: 1,
		})

		// 定义getter
		const getCount = computed((): number => state.count)
		const getCount2 = computed((): number => state.count)

		// 定义action
		const changeTitleAsync = async (count: number): Promise<void> => {
			state.count = count
			await sleep(1000)
		}
		const changeTitle = (count: number): void => {
			state.count = count
		}
		return {
			state,
			getCount,
			getCount2,
			changeTitleAsync,
			changeTitle,
		}
	},
	{
		persist: {
			enabled: true,
			strategies: [
				{
					key: 'count', // 要持久化的属性
					storage: localStorage, // localStorage / sessionStorage
				},
			],
		},
	}
)

export const useChatStore = defineStore(
	'chat',
	() => {
		const state = reactive<ChatState>({
			activePluginIndex: '0',
			activePluginNameList: [],
		})

		const getActivePluginIndex = computed(() => {
			return state.activePluginIndex
		})
		const getActivePluginNameList = computed(() => state.activePluginNameList)
		const setActivePluginIndex = (active: string): void => {
			state.activePluginIndex = active
		}
		const setActivePluginNameList = (name: string[]): void => {
			state.activePluginNameList = name
		}
		return {
			state,
			getActivePluginIndex,
			getActivePluginNameList,
			setActivePluginIndex,
			setActivePluginNameList,
		}
	},
	{
		persist: {
			enabled: true,
			strategies: [
				{
					key: 'activePluginIndex', // 要持久化的属性
					storage: localStorage, // localStorage / sessionStorage
				},
			],
		},
	}
)
