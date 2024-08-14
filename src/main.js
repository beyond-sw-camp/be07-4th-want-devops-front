import "devextreme/dist/css/dx.light.css";
// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router/index.js";
import vuetify from "@/plugins/vuetify";
import store from "./store";
import BootstrapVue3 from 'bootstrap-vue-3'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import '@vuepic/vue-datepicker/dist/main.css'
import axios from "axios";

const app = createApp(App);

//axios 요청 인터셉터를 설정하여 모든 요청에 엑세스 토큰을 포함
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
        
    },
    error => {
        // 해당 인터셉팅가 무시되고 사용자의 본인 요청인 화면으로 라우팅
        return Promise.reject(error);
    }
)

app.use(router);
app.use(vuetify);
app.use(store);
app.use(BootstrapVue3);

app.mount('#app');
