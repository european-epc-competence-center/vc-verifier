import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store';

import  Toast, { POSITION } from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";


import api from './api'


const toastOptions = {
    timeout: 5000,
    position: POSITION.BOTTOM_RIGHT
};

const app = createApp(App)
app.config.globalProperties.$api = api
app.use(router)
app.use(store);
app.use(Toast, toastOptions);
app.mount('#app')
