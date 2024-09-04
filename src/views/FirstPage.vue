<template>
  <v-container class="fill-height d-flex justify-center align-center" style="width: 70vw;">
    <v-row>
      <v-col cols="2" md="4" class="content">
        <h1 class="fade-in" style="font-weight: 700; margin-bottom: 20px">
          기존에 경험하지 못한<br /> 새로운 여행 플래너
        </h1>
        <p class="fade-in">
          고민만 하던 여행 계획을<br /><strong>WANT</strong> 를 통해 한 번에 스케줄링 해보세요 !
        </p>
        <v-btn v-if="isLogin" class="black-btn fade-in" @click="startMyRoad" to="/project/create">시작하기</v-btn>
        <v-btn v-if="!isLogin" class="black-btn fade-in" @click="redirectToGoogle">시작하기</v-btn>
      </v-col>
      <v-col cols="10" md="8" class="map">
        <img src="@/assets/img/main.gif" class="backImage" alt="Map" style="width: 800px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);">
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import gsap from 'gsap';

export default {
  name: 'TravelPlanner',
  data() {
    return {
      isLogin: false,
      profileUrl: null,
    };
  },
  created() {
    this.checkLoginStatus();
  },
  mounted() {
    this.animateContent();
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
      console.log('마이로드 시작하기');
    },
    animateContent() {
      const fadeEls = document.querySelectorAll('.fade-in');
      fadeEls.forEach(function (fadeEl, index) {
        gsap.to(fadeEl, {
          duration: 1,
          delay: (index + 1) * 0.9,
          opacity: 1,
        });
      });
    },
  },
};
</script>

<style scoped>
.content {
  margin: auto 0;
}

.fade-in {
  opacity: 0;
}

.black-btn {
  background-color: #000 !important;
  color: #fff !important;
  border: none !important;
  font-weight: bold;
}

.black-btn:hover {
  background-color: #333 !important;
  /* 호버 시 배경색 변경 */
}
</style>
