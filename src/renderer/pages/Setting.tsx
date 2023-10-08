import React, { CSSProperties, useEffect, useState } from 'react'
import { logger, sendToMain } from '../utils/common'
import { ipcRenderer } from 'electron'
import { PluginSettingSVG } from '../assets/svg/plugin/PluginSettingSVG'
import { PluginUpdateSVG } from '../assets/svg/plugin/PluginUpdateSVG'
import { PluginDeleteSVG } from '../assets/svg/plugin/PluginDeleteSVG'

interface ModalProperties extends CSSProperties {
	modalOpen: boolean
}

function PluginSettingBody(props: {
	info: PluginInfo
	onSettingClick: () => Promise<void>
	onUpdateClick: () => void
	onDeleteClick: () => void
	onPluginEnableClick: () => void
}) {
	return (
		<div className="card w-64 bg-base-100 shadow-md">
			<div className="card-body">
				<div className="tooltip tooltip-top" data-tip={`${props.info.name}-${props.info.version}`}>
					<div className="flex flex-row">
						<div className="card-title truncate">
							{props.info.name} - {props.info.version}
						</div>
					</div>
				</div>
				<div className="tooltip tooltip-top" data-tip={props.info.description}>
					<div className="flex flex-row">
						<div className="truncate">{props.info.description}</div>
					</div>
				</div>
				<div className="flex flex-row justify-start">
					<div className="tooltip tooltip-top" data-tip="设置">
						<div className="flex flex-row">
							<PluginSettingSVG onClick={props.onSettingClick} />
						</div>
					</div>
					<div className="tooltip tooltip-top" data-tip="更新插件">
						<div className="flex flex-row">
							<PluginUpdateSVG onClick={props.onUpdateClick} />
						</div>
					</div>
					<div className="tooltip tooltip-top" data-tip="删除插件">
						<div className="flex flex-row">
							<PluginDeleteSVG onClick={props.onDeleteClick} />
						</div>
					</div>
					<div className="tooltip tooltip-top" data-tip="是否开启插件">
						<div className="flex flex-row">
							<input
								onClick={() => {}}
								type="checkbox"
								className="toggle toggle-xs ml-1"
								onChange={e => {
									logger(`e.target.checked: `, e.target.checked)
									logger(`props.info.enabled: `, props.info.enabled)
									props.onPluginEnableClick()
								}}
								checked={props.info.enabled}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function ModalActions(props: { onClose: () => void; onConfirm: () => void }) {
	return (
		<div className="modal-action">
			<button className="btn" onClick={props.onClose}>
				Close
			</button>
			<button className="btn" onClick={props.onConfirm}>
				confirm
			</button>
		</div>
	)
}

function ModalConfigs(props: {
	configItem: IPluginConfig
	dialogModelData: Record<any, string>
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
	return (
		<div className="flex flex-row justify-start">
			<div className="form-control mt-1 w-full">
				<label className="input-group">
					<span className="w-full">{props.configItem.name}：</span>
					<input
						type="text"
						placeholder={props.configItem.name}
						className="input input-bordered input-xs w-full"
						value={props.dialogModelData[props.configItem.name]}
						onChange={props.onChange}
					/>
				</label>
			</div>
		</div>
	)
}

function SettingPluginInstaller(props: {
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	installPercentage: number
	installStatus: string
	onClick: () => void
}) {
	return (
		<div className="setting-actions flex">
			<div className="setting-actions-input flex w-5/6 flex-col">
				<input
					type="text"
					value={props.value}
					onChange={props.onChange}
					placeholder="plugin name to install, like: template/chatgpt"
					className="setting-actions-item input input-bordered w-full"
				/>
				{props.installPercentage !== 0 ? (
					<progress
						className={
							props.installStatus === ''
								? 'progress progress-info ml-1 w-56'
								: props.installStatus === 'success'
								? 'progress progress-success ml-1 w-56'
								: 'progress progress-error ml-1 w-56'
						}
						value={props.installPercentage}
						max="100"
					/>
				) : null}
			</div>
			<div className="ml-1 w-1/6">
				<button className="setting-actions-button setting-actions-item btn btn-info" onClick={props.onClick}>
					install
				</button>
			</div>
		</div>
	)
}

function PluginStateProgress(props: { progresses: Progress[]; index: number; installStatus: string }) {
	return (
		<>
			{props.progresses[props.index].percentage !== 0 ? (
				<progress
					className={
						props.progresses[props.index].status === ''
							? 'progress progress-info ml-1 w-56'
							: props.installStatus === 'success'
							? 'progress progress-success ml-1 w-56'
							: 'progress progress-error ml-1 w-56'
					}
					value={props.progresses[props.index].percentage}
					max="100"
				/>
			) : null}
		</>
	)
}

function Setting() {
	const [pluginNameToInstall, setPluginNameToInstall] = useState('')
	const [centerDialogVisible, setCenterDialogVisible] = useState(false)
	const [dialogConfigList, setDialogConfigList] = useState<IPluginConfig[]>([])
	const [dialogModelData, setDialogModelData] = useState<Record<any, string>>({})
	const [pluginsConfigList, setPluginsConfigList] = useState<PluginInfo[]>([])
	const [upOrDeleteProgress, setUpOrDeleteProgress] = useState<Progress[]>([])
	const [installPercentage, setInstallPercentage] = useState(0)
	const [installStatus, setInstallStatus] = useState('')
	const [currentConfigIndex, setCurrentConfigIndex] = useState(0)
	const [currentRules, setCurrentRules] = useState<Rule[]>([])

	useEffect(() => {
		;(async function getPluginInfo() {
			await getPluginsNameList()
		})()

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

		return () => {
			setPluginsConfigList([])
			setUpOrDeleteProgress([])
			ipcRenderer.removeAllListeners('installSuccess')
			ipcRenderer.removeAllListeners('uninstallSuccess')
			ipcRenderer.removeAllListeners('updateSuccess')
			ipcRenderer.removeAllListeners('failedProgress')
		}
	}, [])

	async function getPluginsNameList() {
		setPluginsConfigList([])
		setUpOrDeleteProgress([])

		const pluginInfoList = await ipcRenderer.invoke('plugin.getAllPluginName')
		const pluginsConfigList = pluginInfoList.map(
			(pluginInfo: { name: any; version: any; description: any; config: any; enabled: any }) => {
				return {
					name: pluginInfo.name,
					version: pluginInfo.version,
					description: pluginInfo.description,
					config: pluginInfo.config,
					enabled: pluginInfo.enabled,
				}
			}
		)
		setPluginsConfigList(pluginsConfigList)

		const upOrDeleteProgressList = pluginInfoList.map(
			(pluginInfo: { name: any; version: any; description: any; config: any; enabled: any }) => {
				return { percentage: 0, status: '' }
			}
		)
		setUpOrDeleteProgress(upOrDeleteProgressList)
	}

	function setProgressSuccess(type: 'install' | 'upOrDelete') {
		if (type === 'install') {
			setInstallPercentage(100)
			setInstallStatus('success')
		} else {
			upOrDeleteProgress.forEach((progress, index) => {
				if (progress.percentage > 0) {
					setUpOrDeleteProgress(prevState => {
						const updatedArray = [...prevState]
						updatedArray[index] = { percentage: 100, status: 'success' }
						return updatedArray
					})
				}
			})
		}
		setTimeout(() => {
			// clear progress status
			if (type === 'install') {
				setInstallPercentage(0)
				setInstallStatus('')
			} else {
				upOrDeleteProgress.forEach((progress, index) => {
					if (progress.percentage > 0) {
						setUpOrDeleteProgress(prevState => {
							const updatedArray = [...prevState]
							updatedArray[index] = { percentage: 0, status: '' }
							return updatedArray
						})
					}
				})
			}
		}, 1000)
	}

	function setProgressFailed(type: 'install' | 'upOrDelete', index: number) {
		if (type === 'install') {
			setInstallPercentage(100)
			setInstallStatus('exception')
		} else {
			setUpOrDeleteProgress(prevState => {
				const updatedArray = [...prevState]
				updatedArray[index] = { percentage: 100, status: 'exception' }
				return updatedArray
			})
		}
		setTimeout(() => {
			// clear progress status
			if (type === 'install') {
				setInstallPercentage(0)
				setInstallStatus('')
			} else {
				setUpOrDeleteProgress(prevState => {
					const updatedArray = [...prevState]
					updatedArray[index] = { percentage: 0, status: '' }
					return updatedArray
				})
			}
		}, 1000)
	}

	function closeHandler() {
		setCenterDialogVisible(false)
	}

	const getConfigByIndex = (index: number) => pluginsConfigList[index]

	function confirmHandler() {
		setCenterDialogVisible(false)

		const purePluginName = getConfigByIndex(currentConfigIndex).name
		// logger(`name:${purePluginName}, configData: `, dialogModelData)
		sendToMain(`plugin.${purePluginName}.config.update`, {
			name: purePluginName,
			data: dialogModelData,
		})

		setPluginsConfigList([])
		;(async function getPluginInfo() {
			await getPluginsNameList()
		})()
	}

	function setProgressBegin(index: number) {
		setUpOrDeleteProgress(prevArray => {
			// 复制原始数组
			const updatedArray = [...prevArray]
			// 根据索引更新值
			updatedArray[index] = { percentage: 10, status: '' }
			return updatedArray
		})
	}

	function installPlugin() {
		sendToMain('installPlugin', pluginNameToInstall)
		setInstallPercentage(10)
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
		const { name } = getConfigByIndex(index)
		console.log(`enablePlugin: ${name}, enabled: ${enabled}`)
		sendToMain('enablePlugin', { name, enabled })
	}

	async function configClickHandler(index: number) {
		setDialogModelData({})
		setCurrentRules([])

		setCurrentConfigIndex(index)
		setCenterDialogVisible(true)

		// 根据下标获取到某个插件的config信息
		const pluginConfigs = getConfigByIndex(index).config
		setDialogConfigList(pluginConfigs)
		pluginConfigs.forEach(config => {
			setCurrentRules(prevState => {
				return [
					...prevState,
					{
						required: config.required,
						message: config.required ? `${config.name}不能为空` : '',
						trigger: config.required ? 'blur' : 'none',
					},
				]
			})

			setDialogModelData(prevState => {
				return {
					...prevState,
					[config.name]: config.value ? config.value : config.default ? config.default : '',
				}
			})
		})
	}

	return (
		<div>
			<div className="setting flex-col p-4">
				<SettingPluginInstaller
					value={pluginNameToInstall}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPluginNameToInstall(e.target.value)}
					installPercentage={installPercentage}
					installStatus={installStatus}
					onClick={installPlugin}
				/>
				<div className="setting-container mt-4 flex flex-row flex-wrap">
					{pluginsConfigList.map((info, index) => {
						return (
							<div className="setting-container-item m-1" key={index}>
								<div className="w-full">
									<PluginSettingBody
										info={info}
										onSettingClick={() => configClickHandler(index)}
										onUpdateClick={() => updatePlugin(index)}
										onDeleteClick={() => deletePlugin(index)}
										onPluginEnableClick={() => enablePlugin(info.enabled, index)}
									/>
									<PluginStateProgress progresses={upOrDeleteProgress} index={index} installStatus={installStatus} />
								</div>
							</div>
						)
					})}
					{centerDialogVisible ? (
						<dialog className={centerDialogVisible ? 'modal modal-open' : 'modal'}>
							<form method="dialog" className="modal-box">
								<div>
									<h3 className="text-lg font-bold">参数设置</h3>
									{dialogConfigList?.map((configItem, index) => {
										return (
											<ModalConfigs
												key={index}
												configItem={configItem}
												dialogModelData={dialogModelData}
												onChange={event =>
													setDialogModelData(prevState => {
														return {
															...prevState,
															[configItem.name]: event.target.value,
														}
													})
												}
											/>
										)
									})}
								</div>
								<ModalActions onClose={closeHandler} onConfirm={confirmHandler} />
							</form>
						</dialog>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default Setting
