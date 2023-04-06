/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_OPENAI_ACCESS_TOKEN: string;
  readonly VITE_OPENAI_API_BASE_URL: string;
  readonly VITE_OPENAI_API_MODEL: string;
  readonly VITE_API_REVERSE_PROXY: string;
  readonly VITE_TIMEOUT_MS: string;
  readonly VITE_SOCKS_PROXY_HOST: string;
  readonly VITE_SOCKS_PROXY_PORT: string;
  readonly VITE_HTTPS_PROXY: string;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
