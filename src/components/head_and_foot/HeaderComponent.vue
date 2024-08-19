<template>
  <v-app-bar app color="white" elevate-on-scroll>
    <v-toolbar-title>
      <router-link to="/" class="text-primary font-weight-bold logo">WANT</router-link>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn to="/popular/destinations">여행지 추천</v-btn>


    <!-- 로그인 여부에 따라 다른 버튼을 보여줌 -->
    <v-btn v-if="!isLogin" @click="redirectToGoogle">로그인</v-btn>

    <!-- 로그인이 되어있을 때만 보여지는 버튼과 프로필 이미지 -->
    <template v-if="isLogin">
      <v-btn @click="handleMyPageClick">
        나의 일정
        <v-badge
            v-if="hasInvite"
            color="red"
            dot
            offset-x="-15"
            offset-y="-13"
        ></v-badge>
      </v-btn>
      <v-btn @click="doLogout">로그아웃</v-btn>
      <v-avatar class="ml-2">
        <v-img :src="profileUrl"></v-img>
      </v-avatar>
    </template>
  </v-app-bar>
</template>

<script>
import {EventSourcePolyfill} from "event-source-polyfill";

export default {
  name: 'HeaderComponent',
  data() {
    return {
      isLogin: false,
      profileUrl: null,
      hasInvite: false // New state to track if there's an invite
    }
  },
  created() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLogin = true;
      this.userRole = localStorage.getItem('role');
      this.profileUrl = localStorage.getItem('profileUrl');
    }

    const connectSSE = () => {
      let sse = new EventSourcePolyfill(`${process.env.VUE_APP_API_BASE_URL}/api/subscribe`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      sse.addEventListener('subscribed', (event) => {
        console.log(event);
      });

      sse.addEventListener('invite', (event) => {
        this.hasInvite = true; // Set hasInvite to true when an invite is received
        console.log(event.data);
      });

      sse.onerror = (error) => {
        console.log('SSE connection error:', error);
        sse.close(); // Close the connection
      };
    };

    connectSSE(); // Initial connection
  },

  methods: {
    redirectToGoogle() {
      const clientId = process.env.VUE_APP_GOOGLE_CLIENT_ID;
      const redirectUri = process.env.VUE_APP_GOOGLE_REDIRECT_URI;
      const responseType = 'code'; // 인가 코드 요청
      const scope = 'openid profile email';

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;

      window.location.href = googleAuthUrl;
    },
    doLogout() {
      localStorage.clear();
      window.location.reload();
    },
    handleMyPageClick() {
      // '나의 일정' 버튼 클릭 시
      this.hasInvite = false;
      this.$router.push('/myPage');  // '/myPage'로 이동
    }
  }
};
</script>
<style>
.logo {
  text-decoration-line: none;
}
</style>