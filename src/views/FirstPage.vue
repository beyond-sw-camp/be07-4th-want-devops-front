<template>
  <v-app>

    <v-container class="fill-height d-flex justify-center align-center">
      <v-row>
        <v-col cols="12" md="6" class="content">
          <h1>기존에 경험하지 못한 새로운 여행 플래너</h1>
          <p class="content2">고민만 하던 여행 계획을 마이로드를 통해 뚝딱 한 번에 스케쥴링 해보세요.</p>
          <v-btn v-if="isLogin" color="primary" @click="startMyRoad">마이로드 시작하기</v-btn>
          <v-btn v-if="!isLogin" color="primary" @click="redirectToGoogle">마이로드 시작하기</v-btn>
        </v-col>
        <v-col cols="12" md="6" class="map">
          <img src="@/assets/test_back.png" class="backImage" alt="Map">
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>

export default {
  name: 'TravelPlanner',
  data() {
    return {
      isLogin: false,
      profileUrl: null
    }
  },
  created() {
    this.checkLoginStatus();
  },
  methods: {
    async checkLoginStatus() {
      const token = localStorage.getItem('token');
      if (token) {
        this.isLogin = true;
        this.profileUrl = localStorage.getItem('profileUrl');
      }
    },
    redirectToGoogle() {
      const clientId = process.env.VUE_APP_GOOGLE_CLIENT_ID;
      const redirectUri = process.env.VUE_APP_GOOGLE_REDIRECT_URI;
      const responseType = 'code'; // 인가 코드 요청
      const scope = 'openid profile email';

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;

      window.location.href = googleAuthUrl;
    },
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('profileUrl');
      this.isLogin = false;
      this.profileUrl = null;
    },
    startMyRoad() {
      // 마이로드 시작하기 로직
      console.log("마이로드 시작하기");
    }
  },
};
</script>
