import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persist'
const app = createApp(App)

app.use(router).use(createPinia().use(piniaPluginPersist)).mount('#app')
