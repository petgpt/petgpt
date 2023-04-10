/**
 * 定义插件有哪些功能
 */
export interface IPetPluginInterface {
    name: string
    version: string
    description: string
    config?: () => IPluginConfig[]
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
    type: string // 类型
}

/**
 * 单个配置项定义
 */
export interface IPluginConfig {
    name: string
    type: string
    required: boolean
    default?: any
    alias?: string
    message?: string
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
