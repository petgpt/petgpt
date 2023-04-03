/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;//定义提示信息 数据是只读的无法被修改
  readonly VITE_OPENAI_ACCESS_TOKEN: string;//定义提示信息 数据是只读的无法被修改
  readonly VITE_OPENAI_API_BASE_URL: string;//定义提示信息 数据是只读的无法被修改
  readonly VITE_OPENAI_API_MODEL: string;//定义提示信息 数据是只读的无法被修改
  readonly VITE_API_REVERSE_PROXY: string;//定义提示信息 数据是只读的无法被修改
  readonly VITE_TIMEOUT_MS: string;//定义提示信息 数据是只读的无法被修改
  readonly VITE_SOCKS_PROXY_HOST: string;//定义提示信息 数据是只读的无法被修改
  readonly VITE_SOCKS_PROXY_PORT: string;//定义提示信息 数据是只读的无法被修改
  readonly VITE_HTTPS_PROXY: string;//定义提示信息 数据是只读的无法被修改
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
