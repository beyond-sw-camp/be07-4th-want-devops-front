<template>
  <v-app-bar app color="white" elevate-on-scroll>
    <v-toolbar-title>
      <span class="text-primary font-weight-bold">WANT</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn stacked>여행지 추천</v-btn>
    <v-btn stacked>나의 일정</v-btn>

    <!--    v-if 를 사용하여 로그인 여부에 따라 다른 버튼을 보여줌-->
    <v-btn stacked v-if="!isLogin" @click="redirectToGoogle" >로그인</v-btn>

    <!--    로그인이 되어있을때만 보여지는 버튼-->
    <v-btn stacked v-if="isLogin">로그아웃</v-btn>
    <v-avatar stacked>
      <v-img src="https://randomuser.me/api/portraits" alt="avatar"></v-img>
    </v-avatar>

  </v-app-bar>
</template>

<script>
export default {
  name: 'HeaderComponent',
  methods: {
    redirectToGoogle() {
      const clientId = process.env.VUE_APP_GOOGLE_CLIENT_ID;
      const redirectUri = process.env.VUE_APP_GOOGLE_REDIRECT_URI;
      const responseType = 'code'; // 인가 코드 요청
      const scope = 'openid profile email';

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;

      window.location.href = googleAuthUrl;
    }
  }
};
</script>