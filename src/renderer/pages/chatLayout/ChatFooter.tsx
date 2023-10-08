import React, { forwardRef, ReactNode, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import SlashToPop from './SlashToPop'
import { ipcRenderer } from 'electron'
import { Get_ClipBoard_Type } from '../../../common/constants'
import domtoimage from 'dom-to-image'
import { sendToMain } from '../../utils/common'
import { v4 as uuidv4 } from 'uuid'
import { useLocalStorage } from '@uidotdev/usehooks'
import { FooterClearChatSVG } from '../../assets/svg/footer/FooterClearChatSVG'
import { FooterClipBoardSVG } from '../../assets/svg/footer/FooterClipBoardSVG'
import { FooterExportChatImageSVG } from '../../assets/svg/footer/FooterExportChatImageSVG'

type ChatFooterProps = {
	children?: ReactNode
	clearCurrentChat?: () => void
	upsertLatestText?: ({ id, type, text }: { id: string; type: string; text: string }) => void
	deleteLastMsg?: () => void
}

const ChatFooter = (
	props: ChatFooterProps,
	ref: Ref<
		| {
				reloadChat: () => void
				continueChat: () => void
		  }
		| undefined
	>
) => {
	const { children, clearCurrentChat, upsertLatestText, deleteLastMsg } = props
	const [userInput, setUserInput] = useState<string>('')
	const userInputCurrent = useRef<string>(userInput)
	const [placeHolder, setPlaceHolder] = useState('请输入聊天内容')
	const userInputRef = useRef(null)
	const clipBoardSvg = useRef(null)
	const [clipBoardData, setClipBoardData] = useState<{ type: string; data: string }[]>([])
	const isOpenModal = useRef(false)

	const [chatStore, setChatStore] = useLocalStorage<{
		activePluginIndex: string
		activePluginNameList: string[]
	}>('chatStore')

	useImperativeHandle(ref, () => ({
		// 暴露给父组件的方法
		reloadChat: () => {
			reloadChat()
		},
		continueChat: () => {
			continueChat()
		},
	}))

	useEffect(() => {
		userInputCurrent.current = userInput
		addOrRemoveTabListener()
		setTimeout(() => {
			const textarea = document.getElementById('input-textarea')!
			textarea.addEventListener('input', inputTextAreaListener)
		})
		return () => {
			removeKeyDownListener()
		}
	}, [userInput])

	useEffect(() => {
		;(async function beforeMount() {
			await getClipBoard()
			addOrRemoveTabListener()
		})()
		addOrRemoveTabListener()
		ipcRenderer.on('show', () => {
			;(async function setClipboardData() {
				await getClipBoard()
			})()
			addOrRemoveTabListener()
			setTimeout(() => {
				focusUserInput()
			})
		})

		ipcRenderer.on('clear', () => {
			clearChat()
			setTimeout(() => {
				focusUserInput()
			})
		})

		return () => {
			ipcRenderer.removeAllListeners('show')
			ipcRenderer.removeAllListeners('clear')
			removeAllListener()
		}
	}, [])

	function reloadChat() {
		deleteLastMsg?.()

		// 发送消息给插件
		let pluginPureName = chatStore?.activePluginNameList[+chatStore.activePluginIndex]
		let channel = `plugin.${pluginPureName}.func.handle`
		// 发往main线程，调用插件的handle函数, reload为true
		sendToMain(channel, {
			pluginName: pluginPureName,
			input: userInput, // TODO: 这里要获取之前用户输入的，也就是从新获取答案的input。现在暂时不支持改最新的input，只支持reload之前的input，尝试重新获取之前input的回复
			reload: true,
		})
	}

	function continueChat() {
		// setUserInput('continue/继续');
		userInputCurrent.current = 'continue/继续'
		chatTest(undefined)
	}

	function focusUserInput() {
		// @ts-ignore
		userInputRef.current?.focus()
	}

	async function getClipBoard() {
		let arg = await ipcRenderer.invoke(Get_ClipBoard_Type)
		setClipBoardData(arg)
		let clipSvg = document.getElementById('clipBoardSvg')
		if (arg.length > 0 && clipSvg) {
			clipSvg.setAttribute('fill', 'url(#gradient-horizontal)')
			setTimeout(() => {
				clipSvg!.setAttribute('fill', 'rgb(96, 96, 96, 1)')
			}, 8000)
		}
	}

	function addOrRemoveTabListener() {
		// 为空, 存在剪贴板数据
		if (userInput === '') {
			setPlaceHolder('TAB 粘贴剪贴板内容')
			addKeyDownListener()
		} else {
			removeKeyDownListener()
		}
	}

	function addKeyDownListener() {
		removeKeyDownListener()
		window.addEventListener('keydown', onTabKeyDown)
	}

	function removeKeyDownListener() {
		window.removeEventListener('keydown', onTabKeyDown)
	}

	const inputTextAreaListener = () => {
		const textarea = document.getElementById('input-textarea')!
		textarea.style.height = 'auto' // 先将高度设置为 auto
		textarea.style.height = textarea.scrollHeight + 3 > 350 ? '350px' : textarea.scrollHeight + 3 + 'px' // 再将高度设置为内容的高度
	}

	function removeAllListener() {
		const textarea = document.getElementById('input-textarea')!
		textarea.removeEventListener('input', inputTextAreaListener)
		removeKeyDownListener()
	}

	function onTabKeyDown(event: KeyboardEvent) {
		if (event.code === 'Tab') {
			// tab键的键码是9
			event.preventDefault()
			pasteToUserInput()
			setTimeout(() => {
				// textarea的高度自适应
				const textarea = document.getElementById('input-textarea')!
				textarea.style.height = 'auto' // 先将高度设置为 auto
				textarea.style.height = textarea.scrollHeight + 3 > 350 ? '350px' : textarea.scrollHeight + 3 + 'px' // 再将高度设置为内容的高度
				focusUserInput()
			})
		} else if (event.code === 'Slash') {
			event.preventDefault()
			// nextTick(() => userInputRef.value?.focus())
			openSlashPop('slash')
			// console.log(`slash!!!`)
		} else if (event.code === 'Escape') {
			openSlashPop('esc')
		}
	}

	function openSlashPop(action: 'esc' | 'slash') {
		let myModal = document.getElementById('my_modal_7')!
		if (isOpenModal.current) {
			if (action === 'slash') {
				// open && slash
				myModal.click() // to close
			} else {
				// open && esc
				myModal.click() // to close
			}
			// setIsOpen(false);
			isOpenModal.current = false
		} else {
			if (action === 'slash') {
				// close && slash
				myModal.click() // to open
				// setIsOpen(true);
				isOpenModal.current = true
				document.getElementById('tips-input')?.focus()
			} else {
				// close && esc
				// do nothing
			}
		}
	}

	function chatTest(event: React.KeyboardEvent | React.MouseEvent | undefined) {
		if (event) event.preventDefault()

		const message = userInputCurrent.current

		// 添加用户输入的文本
		upsertLatestText?.({
			id: uuidv4(),
			type: 'user',
			text: message, // set完Input，这里获取到的还是之前的状态......
		})

		// 发送消息给插件
		let pluginPureName = chatStore?.activePluginNameList[+chatStore.activePluginIndex]
		// console.log(`chatStore: `, chatStore, ` message: `, message)
		let channel = `plugin.${pluginPureName}.func.handle`
		// logger(`[renderer] plugin channel:`, channel, ` userInput:`, userInput.value)
		// 发往main线程，调用插件的handle函数
		const args = {
			pluginName: pluginPureName,
			input: message,
		}
		console.log(`[renderer] send to main: `, ` args:`, args)
		sendToMain(channel, args)

		setUserInput('')
		const textarea = document.getElementById('input-textarea')!
		textarea.style.height = 'auto'
	}

	function clearChat() {
		clearCurrentChat?.()

		// 发送消息给插件
		let pluginPureName = chatStore?.activePluginNameList[+chatStore.activePluginIndex]
		let channel = `plugin.${pluginPureName}.func.clear`
		sendToMain(channel)
		setUserInput('')
		const textarea = document.getElementById('input-textarea')!
		textarea.style.height = 'auto'
	}

	function pasteToUserInput() {
		let str = clipBoardData
			.filter(i => i.data?.trim())
			.map(item => item.data.trim())
			.join(', ')
		setUserInput(str)

		let clipSvg = document.getElementById('clipBoardSvg')
		if (clipSvg) {
			clipSvg.setAttribute('fill', 'rgb(96, 96, 96, 1)')
		}
	}

	function exportChatImage() {
		let ele = document.getElementById('image-wrapper')!
		domtoimage
			.toJpeg(ele, { quality: 0.95, height: ele.scrollHeight, width: ele.scrollWidth })
			.then(function (dataUrl: string) {
				var link = document.createElement('a')
				link.download = 'my-image-name.jpeg'
				link.href = dataUrl
				link.click()
			})
	}

	return (
		<>
			<div className="footer-first mb-2 mt-1">
				<div className="tooltip tooltip-top" data-tip="清除当前对话(ALT+X)">
					<FooterClearChatSVG onClick={clearChat} />
				</div>
				<FooterClipBoardSVG onClick={pasteToUserInput} />
				<FooterExportChatImageSVG onClick={exportChatImage} />
				<div className="footer-first-slot">{children}</div>
			</div>
			<div className="footer-second">
				<textarea
					id="input-textarea"
					value={userInput}
					onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
						if (e.code === 'Enter') {
							chatTest(e)
						}
					}}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserInput(e.target.value)}
					ref={userInputRef}
					className="textarea textarea-bordered textarea-xs w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded"
					placeholder={placeHolder}
				/>
				<button className="btn btn-info btn-md ml-1" onClick={e => chatTest(e)}>
					send
				</button>
			</div>
			<SlashToPop />
		</>
	)
}

export default forwardRef(ChatFooter)
