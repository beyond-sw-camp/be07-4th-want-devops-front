import {createRouter, createWebHistory} from 'vue-router'
import {practiceRouter} from "@/router/practiceRouter";
import {projectRouter} from "@/router/projectRouter";
// import HomeComponent from "@/components/HomeComponent";
// import GoogleLogin from "@/components/login/GoogleLogin";
import Oauth2Callback from '@/components/login/OAuth2Callback.vue';
import FirstPage from "@/views/FirstPage";
//@는 src 디렉토리를 의미한다.
//파일 내부에 export default 있는 경우에는 {} 가 필요없고, 그러지 않으면 {}가 필요하다.
// import 하는 요소가 여러개 있을때에도 {}를 사용한다.
// import HomeComponent from '@/components/HomeComponent.vue'
// import TestComponent from '@/components/TestComponent.vue'



const routes = [
    // {
    //     //path로도 라우팅이 가능라고 name으로도 라우팅이 가능하다.
    //     //name으로 라우팅하는 경우는 js 코드 내에서 직접적으로 라우팅을 할 때 사용한다.
    //     path: '/home',
    //     name: 'Home',
    //     component: HomeComponent
    // },
    {
        path: '/',
        name: 'Home',
        component: FirstPage
    },
    // {
    //     path: '/',
    //     name: 'GoogleLogin',
    //     component: GoogleLogin
    // },
    {
        path: '/oauth2/callback',
        name: 'Oauth2Callback',
        component: Oauth2Callback
    },
    ...practiceRouter,
    ...projectRouter


]

const router = new createRouter(
    {
        //vue-router는 내부적으로 2가지 방식의 히스토리 관리를 지원한다.
        //1. createHashHistory 모드 : 기본값으로 url에 #이 붙는다.
        //2.  createWebHistory 모드 : url에 #이 붙지 않는다.
        // 주로 createWebHistory 모드를 사용한다.
        history: createWebHistory(),
        routes
    }
);

export default router;
