// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router/index.js'
import vuetify from "@/plugins/vuetify";
import axios from "axios";

const app = createApp(App);

// axios 요청 인터셉터를 설정하여 모든 요청에 엑세스 토큰을 포함
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        // 인터셉팅 오류 처리
        return Promise.reject(error);
    }
);

app.use(router);
app.use(vuetify); // Vuetify 플러그인 사용
app.mount('#app');
