// src/components/GoogleLogin.vue

<template>
  <div>
    <v-btn class="start-button" @click="redirectToGoogle">Login with Google</v-btn>
  </div>
</template>

<script>
export default {
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
}
</script>

<style scoped>
.start-button {
  background-color: #4285F4;
  color: white;
}

</style>