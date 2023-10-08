import { ReactNode, useState } from 'react'
import HeadMultiChatSvg from '../assets/svg/head/HeadMultiChatSvg'
import { sendToMain } from '../utils/common'
import { HeadPinSVG } from '../assets/svg/head/HeadPinSVG'
import { HeadMinusSVG } from '../assets/svg/head/HeadMinusSVG'
import { HeadCloseSVG } from '../assets/svg/head/HeadCloseSVG'

function HeadTools(os: string, children: ReactNode) {
	const [isPin, setIsPin] = useState(false)
	if (os !== 'win32') {
		return null
	}

	const style = {
		WebkitAppRegion: 'drag',
		WebkitUserSelect: 'none',
	}

	function pinCurrentWindow() {
		// get pin icon by id, and rotate it
		const pinIcon = document.getElementById('pin-icon')
		// rotate icon 45 degree
		if (pinIcon) {
			pinIcon.style.transform = !isPin ? 'rotate(90deg)' : 'rotate(0deg)'
		}
		setIsPin(!isPin)
		sendToMain('pinCurrentWindow', !isPin) // 注意这里要取反, 因为实时更新的isPin还没有更新
	}

	function closeWindow() {
		sendToMain('close')
	}

	function minusWindow() {
		sendToMain('minus')
	}

	return (
		<>
			<div className="flex flex-1 flex-row content-center justify-center rounded-md bg-base-200">
				<div className="flex flex-1 flex-col">
					<div
						className="flex h-6 flex-row justify-end rounded-md bg-base-300"
						// @ts-ignore
						style={style}
					>
						<div
							className="flex-r-c pr-1"
							// @ts-ignore
							style={{ WebkitAppRegion: 'no-drag' }}
						>
							<div className="tooltip tooltip-bottom" data-tip="多开chat页面">
								{HeadMultiChatSvg({
									width: '1em',
									height: '1em',
								})}
							</div>
							<div className="tooltip tooltip-bottom" data-tip="窗口置顶">
								<HeadPinSVG onClick={pinCurrentWindow} />
							</div>
							<HeadMinusSVG onClick={minusWindow} />
							<HeadCloseSVG onClick={closeWindow} />
						</div>
					</div>
					<div className="flex-1 content-center justify-center overflow-auto rounded-md bg-base-200">{children}</div>
				</div>
			</div>
		</>
	)
}

export default HeadTools
