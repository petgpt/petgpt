// global
export enum IWindowList {
  PET_WINDOW = 'PET_WINDOW',
  PET_DETAIL_WINDOW = 'PET_DETAIL_WINDOW',
  PET_CHAT_WINDOW = 'PET_CHAT_WINDOW',
  PET_SETTING_WINDOW = 'PET_SETTING_WINDOW',
}
export enum DBList {
  Message_DB = 'Message_DB',
  Config_DB = 'Config_DB',
  Prompt_DB = 'Prompt_DB',
  History_DB = 'History_DB',
}
export interface IPluginConfig {
  name: string
  type: string //'input' | 'select' | 'upload'
  required: boolean
  value?: string // 用于config调用的时候，由插件返回最新的配置值，如果有的话. 用于select的时候，放的label（name）对应的value
  default?: any
  alias?: string
  message?: string // TODO:用于popover的时候，显示的提示信息？
  // @ts-ignore
  [propName: string]: any
}
export interface SlotMenu {
  slot: number // 在哪个位置
  name: string // 名称
  menu: SlotType // 类型
  description?: string // 描述 ==> 渲染为popover // TODO: 改成必填？不然popover要根据des是否渲染
}
export interface SlotType {
  type: 'switch' | 'select' | 'dialog' | 'upload', // 类型，例如switch、select(选择框)、dialog(弹出的表单框)、upload(上传文件)组件
  // 'switch'的时候，boolean 默认是否开启 |
  // 'select'：[{label: "", value: ""}]，是一个数组label为展示的文字，value是选中的文字 |
  // 'dialog'：使用child来指定dialog的内容，和config里的一样
  value?: any,
  child?: IPluginConfig[]
  // switch切换的时候，触发的事件 | select值变动的时候触发的事件 | dialog confirm的时候触发的事件 | upload完毕的时候触发的事件
  // 默认发送的事件是 `plugin.${pluginName}.slot.${event}`, event默认是push, 携带的数据：{slot: number, value: any}
  // main线程也监听一个slot更新的事件，`plugin.${pluginName}.slot.pull`, 携带的数据：{slot: number, value: any}
  event?: string
}
export interface IPluginConfig {
  name: string
  type: string //'input' | 'select' | 'upload'
  required: boolean
  value?: string // 用于config调用的时候，由插件返回最新的配置值，如果有的话. 用于select的时候，放的label（name）对应的value
  default?: any
  alias?: string
  message?: string // TODO:用于popover的时候，显示的提示信息？
  // @ts-ignore
  [propName: string]: any
}
export interface Progress {
  percentage: number,
  status: string
}
export interface Rule{
  required: boolean,
  message: string,
  trigger: string
}
export interface PluginInfo{ // plugin的基本信息
  name: string,
  version:string,
  description: string,
  config: IPluginConfig[] // plugin需要的config配置条目，例如key、token等的配置
}
export type IPluginNameType = 'simple' | 'scope' | 'normal' | 'unknown' // TODO: main线程还有一个一份，后面改成共用的（像这样的还有些）

export interface IPluginProcessResult {
  success: boolean
  /**
   * the package.json's name filed
   */
  pkgName: string
  /**
   * the plugin name or the fs absolute path
   */
  fullName: string
}
export interface ChatItem {
  id: string,
  type: 'user' | 'system',
  text: string,
  time?: string
}
