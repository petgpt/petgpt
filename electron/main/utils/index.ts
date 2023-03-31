import {INotification} from "../../../src/utils/types/types";
import {Notification} from 'electron'

export function showNotification(options: INotification) {
    const notification = new Notification({
        title: options.title,
        body: options.body
        // icon: options.icon || undefined
    })

    const handleClick = () => { // TODO: main与renderer线程咋都不能触发click事件？？
        console.log(`handle click`)
        if (options.clickFn) {
            options.clickFn()
        }
    }

    notification.once('click', function (){
        handleClick()
    })
    notification.once('close', () => {
        notification.removeListener('click', handleClick)
    })
    notification.show()
}
