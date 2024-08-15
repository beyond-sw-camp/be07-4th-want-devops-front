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

// axios 요청 인터셉터를 설정하여 모든 요청에 엑세스 토큰을 포함
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 해당 인터셉팅가 무시되고 사용자의 본인 요청인 화면으로 라우팅
    return Promise.reject(error);
  }
);

axios.interceptors.response.use( // 응답을 받기 전에 처리
    response => { // 응답이 성공적으로 왔을 때
        return response; // 응답을 반환
    },
    async error => {
        if (error.response && error.response.status === 401 ){
            const refreshToken = localStorage.getItem('refreshToken');
            try {
                localStorage.removeItem('token')
                alert('토큰이 만료되었습니다. 다시 로그인해주세요.1')
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URI}/refresh-token`, {refreshToken});
                localStorage.setItem('token', response.data.result.token);
                window.location.reload(); // 토큰이 갱신되었으므로 페이지 새로고침
            } catch (e) {
                localStorage.clear();
                alert('토큰이 만료되었습니다. 다시 로그인해주세요.2')
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
)

app.use(router);
app.use(vuetify);
app.use(store);
app.use(BootstrapVue3);

app.mount('#app');
