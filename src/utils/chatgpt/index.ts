import * as dotenv from 'dotenv'
import 'isomorphic-fetch'
import { ChatGPTAPI } from "./chatgpt-api";
import {ChatGPTUnofficialProxyAPI} from "./chatgpt-unofficial-proxy-api";
import axios from 'axios'
import { SocksProxyAgent } from 'socks-proxy-agent'
import httpsProxyAgent from 'https-proxy-agent'
// import fetch from 'node-fetch'
import {ApiModel, ChatGPTUnofficialProxyAPIOptions, ModelConfig, RequestOptions, ChatContext} from "../types/types";
import {isNotEmptyString, sendResponse} from "../common";
import * as types from "./types";
import {ChatGPTAPIOptions, ChatMessage, openai, SendMessageOptions} from "./types";

const { HttpsProxyAgent } = httpsProxyAgent

const ErrorCodeMessage: Record<string, string> = {
    401: '[OpenAI] 提供错误的API密钥 | Incorrect API key provided',
    403: '[OpenAI] 服务器拒绝访问，请稍后再试 | Server refused to access, please try again later',
    502: '[OpenAI] 错误的网关 |  Bad Gateway',
    503: '[OpenAI] 服务器繁忙，请稍后再试 | Server is busy, please try again later',
    504: '[OpenAI] 网关超时 | Gateway Time-out',
    500: '[OpenAI] 服务器繁忙，请稍后再试 | Internal Server Error',
}

dotenv.config()
const timeoutMs: number = !isNaN(+import.meta.env.VITE_TIMEOUT_MS) ? +import.meta.env.VITE_TIMEOUT_MS : 30 * 1000

let isInit = false
let apiModel: ApiModel
let api: ChatGPTAPI | ChatGPTUnofficialProxyAPI

if (!isNotEmptyString(import.meta.env.VITE_OPENAI_API_KEY) && !isNotEmptyString(import.meta.env.VITE_OPENAI_ACCESS_TOKEN)){
    throw new Error('Missing VITE_OPENAI_API_KEY or VITE_OPENAI_ACCESS_TOKEN environment variable')
}

function getMessageById(id:string): Promise<ChatMessage>{
    return new Promise((resolve, reject) => {
        resolve({
            id: '1',
            text: 'hello world',
            role: 'system'
        })
        // resolve(
        //     store.get(id)
        // )
    });
}

function upsertMessage(message: ChatMessage): Promise<void>{
    return new Promise((resolve, reject) => {
        // store.set(message.id, message)
    });
}

export async function initApi(completionParams: Partial<Omit<openai.CreateChatCompletionRequest, 'messages' | 'n' | 'stream'>>) {
    if(isInit) return
    // More Info: https://github.com/transitive-bullshit/chatgpt-api
    if (isNotEmptyString(import.meta.env.VITE_OPENAI_API_KEY)) {
        const VITE_OPENAI_API_BASE_URL = import.meta.env.VITE_OPENAI_API_BASE_URL
        const VITE_OPENAI_API_MODEL = import.meta.env.VITE_OPENAI_API_MODEL
        // 添加自定义model的支持
        if (!completionParams.model) {
            completionParams.model = isNotEmptyString(VITE_OPENAI_API_MODEL) ? VITE_OPENAI_API_MODEL : 'gpt-3.5-turbo'
        }

        const options: ChatGPTAPIOptions = {
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
            completionParams,
            debug: true,
        };

        // increase max token limit if use gpt-4
        if (completionParams.model.toLowerCase().includes('gpt-4')) {
            // if use 32k model
            if (completionParams.model.toLowerCase().includes('32k')) {
                options.maxModelTokens = 32768
                options.maxResponseTokens = 8192
            } else {
                options.maxModelTokens = 8192
                options.maxResponseTokens = 2048
            }
        }

        if (isNotEmptyString(VITE_OPENAI_API_BASE_URL))
            options.apiBaseUrl = `${VITE_OPENAI_API_BASE_URL}/v1`

        setupProxy(options)

        api = new ChatGPTAPI({...options})
        apiModel = 'ChatGPTAPI'
    } else {
        const VITE_OPENAI_API_MODEL = import.meta.env.VITE_OPENAI_API_MODEL
        const options: ChatGPTUnofficialProxyAPIOptions = {
            accessToken: import.meta.env.VITE_OPENAI_ACCESS_TOKEN,
            debug: true,
        }
        if (isNotEmptyString(VITE_OPENAI_API_MODEL))
            options.model = VITE_OPENAI_API_MODEL

        if (isNotEmptyString(import.meta.env.VITE_API_REVERSE_PROXY))
            options.apiReverseProxyUrl = import.meta.env.VITE_API_REVERSE_PROXY

        setupProxy(options)

        api = new ChatGPTUnofficialProxyAPI({...options})
        apiModel = 'ChatGPTUnofficialProxyAPI'
    }
    isInit = true
    return api;
}


/**
 * 调用chatgpt-api的sendMessage方法，向chatgpt发送消息
 * @param options 包含要发送的消息、上下文、进度回调函数、systemMessage
 */
async function chatReplyProcess(options: RequestOptions) {
    const { message, lastContext, process, systemMessage } = options
    try {
        let options: SendMessageOptions = { timeoutMs }

        if (apiModel === 'ChatGPTAPI') {
            if (isNotEmptyString(systemMessage))
                options.systemMessage = systemMessage
        }

        if (lastContext != null) {
            if (apiModel === 'ChatGPTAPI')
                options.parentMessageId = lastContext.parentMessageId
            else
                options = { ...lastContext }
        }

        let apiOptions: types.SendMessageOptions | types.SendMessageBrowserOptions = {
            ...options,
            onProgress: (partialResponse) => {
                process?.(partialResponse)
            },
        };
        const response = await api.sendMessage(message, apiOptions)

        return sendResponse({ type: 'Success', data: response })
    }
    catch (error: any) {
        const code = error.statusCode
        global.console.log(error)
        if (Reflect.has(ErrorCodeMessage, code))
            return sendResponse({ type: 'Fail', message: ErrorCodeMessage[code] })
        return sendResponse({ type: 'Fail', message: error.message ?? 'Please check the back-end console' })
    }
}

/**
 * 查询账号可用余额及有效期等信息
 */
async function fetchBalance() {
    const VITE_OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
    const VITE_OPENAI_API_BASE_URL = import.meta.env.VITE_OPENAI_API_BASE_URL

    if (!isNotEmptyString(VITE_OPENAI_API_KEY))
        return Promise.resolve('-')

    const API_BASE_URL = isNotEmptyString(VITE_OPENAI_API_BASE_URL)
        ? VITE_OPENAI_API_BASE_URL
        : 'https://api.openai.com'

    try {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${VITE_OPENAI_API_KEY}` }
        const response = await axios.get(`${API_BASE_URL}/dashboard/billing/credit_grants`, { headers })
        const balance = response.data.total_available ?? 0
        return Promise.resolve(balance.toFixed(3))
    }
    catch {
        return Promise.resolve('-')
    }
}

/**
 * 获取配置信息对象
 */
async function chatConfig() {
    const balance = await fetchBalance()
    const reverseProxy = import.meta.env.VITE_API_REVERSE_PROXY ?? '-'
    const httpsProxy = (import.meta.env.VITE_HTTPS_PROXY || import.meta.env.ALL_PROXY) ?? '-'
    const socksProxy = (import.meta.env.VITE_SOCKS_PROXY_HOST && import.meta.env.VITE_SOCKS_PROXY_PORT)
        ? (`${import.meta.env.VITE_SOCKS_PROXY_HOST}:${import.meta.env.VITE_SOCKS_PROXY_PORT}`)
        : '-'
    return sendResponse<ModelConfig>({
        type: 'Success',
        data: { apiModel, reverseProxy, timeoutMs, socksProxy, httpsProxy, balance },
    })
}

/**
 * 根据.env文件中配置的代理信息，设置代理为socks或http
 */
function setupProxy(options: ChatGPTAPIOptions | ChatGPTUnofficialProxyAPIOptions) {
    if (import.meta.env.VITE_SOCKS_PROXY_HOST && import.meta.env.VITE_SOCKS_PROXY_PORT) {
        const agent = new SocksProxyAgent({
            hostname: import.meta.env.VITE_SOCKS_PROXY_HOST,
            port: import.meta.env.VITE_SOCKS_PROXY_PORT,
        })
        options.fetch = (url: string, options: any) => {// 这里options的类型是什么？？暂时用的any
            return fetch(url, { agent, ...options })
        }
    }
    else {
        if (import.meta.env.VITE_HTTPS_PROXY || import.meta.env.ALL_PROXY) {
            const httpsProxy = import.meta.env.VITE_HTTPS_PROXY || import.meta.env.ALL_PROXY
            if (httpsProxy) {
                const agent = new HttpsProxyAgent(httpsProxy)
                options.fetch = (url: string, options: any) => {// 这里options的类型是什么？？暂时用的any
                    return fetch(url, { agent, ...options })
                }
            }
        }
    }
}

/**
 * 获取当前使用的ApiModel信息
 */
function currentModel(): ApiModel {
    return apiModel
}

export type { ChatContext, ChatMessage }

export { chatReplyProcess, chatConfig, currentModel }
