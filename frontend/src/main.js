import { createApp } from 'vue'
import App from './App.vue'
import router from './router'


//import api from './api'


const app = createApp(App)
//app.config.globalProperties.$api = api
app.use(router)

app.mount('#app')
