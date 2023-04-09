import {IDB} from "../data/db";

export type Nullable<T> = T | null
export type Undefinable<T> = T | undefined
export interface PetExpose { // 暴露给plugin的功能
    db: IDB
    notify?: (title: string, body: string) => void
    baseDir: string
}
export type IPetPlugin = (ctx: any) => IPetPluginInterface
export interface IPetPluginInterface {
    name: string
    version: string
    description: string
    config?: () => IPluginConfig[]
    slotMenu?: SlotMenu[]
    handle: (data: DataType) => Promise<IPluginHandlerResult<boolean>> // 核心交互函数
    decode?: () => Promise<string> // 可以直接返回解析好的html
    stop: () => Promise<void> // 停止handle的执行
    [propName: string]: any
}
// 用户端的发来的数据类型
export enum DataType{
    Text = 'Text',
    Image = 'Image',
    MP3 = 'MP3',
}
export interface IPluginLoader {

}
// 预留的其他Menu位置
export interface SlotMenu {
    slot: number // 在哪个位置
    name: string // 名称
    type: string // 类型
}
// 单个配置项定义
export interface IPluginConfig {
    name: string
    type: string
    required: boolean
    default?: any
    alias?: string
    message?: string
    [propName: string]: any
}
export interface IPluginHandlerOptions {
    proxy?: string
    registry?: string
}
export interface IResult {
    code: number
    data: string
}
export interface IProcessEnv {
    [propName: string]: Undefinable<string>
}
export interface IPluginHandlerResult<T> {
    success: T
    body: T extends true ? string[] : string
}
