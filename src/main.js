// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router/index.js'
import vuetify from "@/plugins/vuetify";

const app = createApp(App);

app.use(router);
app.use(vuetify);
app.mount('#app');
