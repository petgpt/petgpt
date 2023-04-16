// global
import type {ChatMessage} from '../chatgpt/types'
import {IPluginConfig} from "../../../electron/main/plugin/share/types";

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
export type IPluginNameType = 'simple' | 'scope' | 'normal' | 'unknown'

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

interface ChatItem {
  id: string,
  type: 'user' | 'system',
  text: string,
  time?: string
}

interface INotification {
    title: string
    body: string
    icon?: string
    clickFn?: () => void
}

interface BalanceResponse {
  total_usage: number
}

interface IStringKeyMap {
  [propName: string]: any
}

interface RequestOptions {
  message: string
  lastContext?: { conversationId?: string; parentMessageId?: string }
  process?: (chat: ChatMessage) => void
  systemMessage?: string
  abortSignal?: AbortSignal
}

interface SendResponseOptions<T = any> {
  type: 'Success' | 'Fail'
  message?: string
  data?: T
}

interface RequestProps {
  prompt: string
  options?: ChatContext
  systemMessage: string
}

interface ChatContext {
  conversationId?: string
  parentMessageId?: string
}

interface ChatGPTUnofficialProxyAPIOptions {
  accessToken: string
  apiReverseProxyUrl?: string
  model?: string
  debug?: boolean
  headers?: Record<string, string>
  fetch?: FetchFn
}

interface ModelConfig {
  apiModel?: ApiModel
  reverseProxy?: string
  timeoutMs?: number
  socksProxy?: string
  httpsProxy?: string
  balance?: string
}

export type ApiModel = 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI' | undefined
