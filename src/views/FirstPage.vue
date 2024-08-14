<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-row>
      <v-col cols="12" md="4" class="content">
        <h1 style="font-weight: 700; margin-bottom: 20px">기존에 경험하지 못한<br/> 새로운 여행 플래너</h1>
        <p>고민만 하던 여행 계획을<br/> 원트를 통해 한 번에 스케줄링 해보세요</p>
        <v-btn v-if="isLogin" class="black-btn" @click="startMyRoad" to="/project/create">시작하기</v-btn>
        <v-btn v-if="!isLogin" class="black-btn" @click="redirectToGoogle">시작하기</v-btn>
      </v-col>
      <v-col cols="12" md="8" class="map" style="right: 0">
        <img src="@/assets/img/file.png" class="backImage" alt="Map">
      </v-col>
    </v-row>
  </v-container>
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

<style>
.content {
  margin: auto 0;
}

.black-btn {
  background-color: #000 !important; /* 검정색 배경 */
  color: #fff !important; /* 흰색 글자 */
  border: none !important; /* 기본 테두리 제거 */
  font-weight: bold; /* 글자 두께 조절 */
  text-transform: uppercase; /* 대문자 변환 */
}

.black-btn:hover {
  background-color: #333 !important; /* 호버 시 배경색 변경 */
}
</style>
