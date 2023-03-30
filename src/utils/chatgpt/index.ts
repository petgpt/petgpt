import * as dotenv from 'dotenv'
import 'isomorphic-fetch'
import type { ChatGPTAPIOptions, ChatMessage, SendMessageOptions } from 'chatgpt'
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt'
import axios from 'axios'
import { SocksProxyAgent } from 'socks-proxy-agent'
import httpsProxyAgent from 'https-proxy-agent'
// import fetch from 'node-fetch'
import {ApiModel, ChatGPTUnofficialProxyAPIOptions, ModelConfig, RequestOptions, ChatContext} from "../types/types";
import {isNotEmptyString, sendResponse} from "../common";

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
const timeoutMs: number = !isNaN(+import.meta.env.TIMEOUT_MS) ? +import.meta.env.TIMEOUT_MS : 30 * 1000

let apiModel: ApiModel
let api: ChatGPTAPI | ChatGPTUnofficialProxyAPI

if (!isNotEmptyString(import.meta.env.OPENAI_API_KEY) && !isNotEmptyString(import.meta.env.OPENAI_ACCESS_TOKEN)){
    throw new Error('Missing OPENAI_API_KEY or OPENAI_ACCESS_TOKEN environment variable')
}

(async () => {
    // More Info: https://github.com/transitive-bullshit/chatgpt-api

    if (isNotEmptyString(import.meta.env.OPENAI_API_KEY)) {
        const OPENAI_API_BASE_URL = import.meta.env.OPENAI_API_BASE_URL
        const OPENAI_API_MODEL = import.meta.env.OPENAI_API_MODEL
        const model = isNotEmptyString(OPENAI_API_MODEL) ? OPENAI_API_MODEL : 'gpt-3.5-turbo'

        const options: ChatGPTAPIOptions = {
            apiKey: import.meta.env.OPENAI_API_KEY,
            completionParams: {model},
            debug: true,
        }

        // increase max token limit if use gpt-4
        if (model.toLowerCase().includes('gpt-4')) {
            // if use 32k model
            if (model.toLowerCase().includes('32k')) {
                options.maxModelTokens = 32768
                options.maxResponseTokens = 8192
            } else {
                options.maxModelTokens = 8192
                options.maxResponseTokens = 2048
            }
        }

        if (isNotEmptyString(OPENAI_API_BASE_URL))
            options.apiBaseUrl = `${OPENAI_API_BASE_URL}/v1`

        setupProxy(options)

        api = new ChatGPTAPI({...options})
        apiModel = 'ChatGPTAPI'
    } else {
        const OPENAI_API_MODEL = import.meta.env.OPENAI_API_MODEL
        const options: ChatGPTUnofficialProxyAPIOptions = {
            accessToken: import.meta.env.OPENAI_ACCESS_TOKEN,
            debug: true,
        }
        if (isNotEmptyString(OPENAI_API_MODEL))
            options.model = OPENAI_API_MODEL

        if (isNotEmptyString(import.meta.env.API_REVERSE_PROXY))
            options.apiReverseProxyUrl = import.meta.env.API_REVERSE_PROXY

        setupProxy(options)

        api = new ChatGPTUnofficialProxyAPI({...options})
        apiModel = 'ChatGPTUnofficialProxyAPI'
    }
})();


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

        const response = await api.sendMessage(message, {
            ...options,
            onProgress: (partialResponse) => {
                process?.(partialResponse)
            },
        })

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
    const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY
    const OPENAI_API_BASE_URL = import.meta.env.OPENAI_API_BASE_URL

    if (!isNotEmptyString(OPENAI_API_KEY))
        return Promise.resolve('-')

    const API_BASE_URL = isNotEmptyString(OPENAI_API_BASE_URL)
        ? OPENAI_API_BASE_URL
        : 'https://api.openai.com'

    try {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` }
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
    const reverseProxy = import.meta.env.API_REVERSE_PROXY ?? '-'
    const httpsProxy = (import.meta.env.HTTPS_PROXY || import.meta.env.ALL_PROXY) ?? '-'
    const socksProxy = (import.meta.env.SOCKS_PROXY_HOST && import.meta.env.SOCKS_PROXY_PORT)
        ? (`${import.meta.env.SOCKS_PROXY_HOST}:${import.meta.env.SOCKS_PROXY_PORT}`)
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
    if (import.meta.env.SOCKS_PROXY_HOST && import.meta.env.SOCKS_PROXY_PORT) {
        const agent = new SocksProxyAgent({
            hostname: import.meta.env.SOCKS_PROXY_HOST,
            port: import.meta.env.SOCKS_PROXY_PORT,
        })
        options.fetch = (url: string, options: any) => {// 这里options的类型是什么？？暂时用的any
            return fetch(url, { agent, ...options })
        }
    }
    else {
        if (import.meta.env.HTTPS_PROXY || import.meta.env.ALL_PROXY) {
            const httpsProxy = import.meta.env.HTTPS_PROXY || import.meta.env.ALL_PROXY
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
