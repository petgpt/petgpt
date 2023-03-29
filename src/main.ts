import { createApp } from 'vue'
import "./style.css"
import App from './App.vue'
import './samples/node-api'
import router from './router'
import { createPinia } from 'pinia'

createApp(App)
    .use(router)
    .use(createPinia())
    .mount('#app')
    .$nextTick(() => {
        postMessage({payload: 'removeLoading'}, '*')
    });
