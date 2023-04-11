/**
 * 定义插件有哪些功能
 */
export interface IPetPluginInterface {
    name: string
    version: string
    description: string
    register: () => void
    unregister: () => void
    config?: (ctx: PetExpose) => IPluginConfig[]
    slotMenu?: SlotMenu[]
    handle: (data: PluginData) => Promise<IPluginHandlerResult> // 核心交互函数
    stop: () => Promise<void> // 停止handle的执行
    [propName: string]: any
}

/**
 * 暴露给plugin的功能
 */
export interface PetExpose {
    db: IDB
    baseDir: string
    emitter: IEventBus
    notify?: (title: string, body: string) => void
    logger?: ILogger
}

/**
 * 用于plugin与electron的event通信
 */
export interface IEventBus {
    on(event: string | symbol, listener: Function): void
    emit(event: string | symbol, ...args: any[]): void
    off(event: string | symbol, listener: Function): void
    once(event: string | symbol, listener: Function): void
    listeners(event: string | symbol): Function[]
    removeAllListeners(event?: string | symbol): void
}

/**
 * 暴露给plugin的logger能力
 */
export interface ILogger{

}

/**
 * 发送给plugin的数据
 */
export interface PluginData {
    type: DataType
    data: any
}
/**
 * 发送给插件的数据类型
 */
export enum DataType{
    Text = 'Text',
    Image = 'Image',
    MP3 = 'MP3',
}

/**
 * 本地db的操作接口
 */
export interface IDB{
    read(): any
    get(key: string): any
    has(key: string): boolean
    set(key:string, value: any): void
    flush(): void
    remove(key: string): void
}

/**
 * 预留的其他Menu位置
 */
export interface SlotMenu {
    slot: number // 在哪个位置
    name: string // 名称
    menu: SlotType // 类型
    description?: string // 描述 ==> 渲染为popover
    event?: SlotEvent
}

/**
 * 当前这个slot的类型
 */
export interface SlotType {
    type: 'switch' | 'select' | 'dialog', // 类型，例如switch、select、dialog
    // 'switch'的时候，boolean 默认是否开启 |
    // 'select'：[{label: "", value: ""}]，是一个数组label为展示的文字，value是选中的文字 |
    // 'dialog'：使用child来指定dialog的内容，和config里的一样
    value?: any,
    child?: IPluginConfig[]
}

/**
 * 当前这个slot的事件定义
 */
export interface SlotEvent {
    name: string // switch切换的时候，触发的事件 | select关闭的时候触发的事件 | dialog关闭的时候触发的事件
}

/**
 * 单个配置项定义
 */
export interface IPluginConfig {
    name: string
    type: string
    required: boolean
    value?: string // 用于config调用的时候，由插件返回最新的配置值，如果有的话
    default?: any
    alias?: string
    message?: string // TODO:用于popover的时候，显示的提示信息？
    [propName: string]: any
}

/**
 * 插件返回的结果
 */
export interface IPluginHandlerResult {
    id: string // 返回的id，用于update/insert信息
    decode?: string // 可以直接返回解析好的html
    success: boolean
    body: string // 返回的数据，默认是string，如果是json，需要自己解析。文字、图片连接都是string
}
