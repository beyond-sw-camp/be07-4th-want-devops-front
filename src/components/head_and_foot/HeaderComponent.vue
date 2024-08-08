<template>
  <v-app-bar app color="white" elevate-on-scroll>
    <v-toolbar-title>
      <span class="text-primary font-weight-bold">WANT</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn>여행지 추천</v-btn>
    <v-btn>나의 일정</v-btn>

    <!-- 로그인 여부에 따라 다른 버튼을 보여줌 -->
    <v-btn v-if="!isLogin" @click="redirectToGoogle">로그인</v-btn>

    <!-- 로그인이 되어있을 때만 보여지는 버튼과 프로필 이미지 -->
    <template v-if="isLogin">
      <v-btn @click="doLogout">로그아웃</v-btn>
      <v-avatar class="ml-2">
        <v-img :src="profileUrl"></v-img>
      </v-avatar>
    </template>
  </v-app-bar>
</template>

<script>
export default {
  name: 'HeaderComponent',
  props: {
    isLogin: {
      type: Boolean,
      required: true
    },
    profileUrl: {
      type: String,
      default: ''
    }
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
      this.$emit('logout');
    }
  }
};
</script>
