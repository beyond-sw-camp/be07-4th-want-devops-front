<template>
  <div>
    <p>Processing your login...</p>
    <p v-if="tokenData"><strong>Token Data:</strong> {{ tokenData }}</p>
    <p v-if="error" style="color: red;"><strong>Error:</strong> {{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

export default {
  data() {
    return {
      tokenData: null,
      error: null
    };
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get('code');

    if (authorizationCode) {
      try {
        // 1. 인가 코드로 액세스 토큰 요청
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
          code: authorizationCode,
          redirect_uri: 'http://localhost:3000/oauth2/callback',
          client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID,
          client_secret: process.env.VUE_APP_GOOGLE_CLIENT_SECRET,
          grant_type: 'authorization_code'
        });

        const { access_token, id_token, expires_in, scope, token_type } = tokenResponse.data;

        console.log('Access Token:', access_token);
        console.log('ID Token:', id_token);
        console.log('Expires In:', expires_in);
        console.log('Scope:', scope);
        console.log('Token Type:', token_type);

        // 2. 액세스 토큰을 서버의 인증 엔드포인트로 전송
        const validateResponse = await axios.post('http://localhost:8088/auth/google', {
          idToken: id_token
        });

        // 서버의 응답 처리
        const accessToken = validateResponse.data.result.accessToken;
        console.log('Access Token:', accessToken);
        const refreshToken = validateResponse.data.result.refreshToken;
        console.log('Refresh Token:', refreshToken);
        const role = jwtDecode(accessToken).auth;
        console.log('Role:', role);

        this.tokenData = validateResponse.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('role', role);


        // 로그인 후 홈 페이지로 리디렉션
        this.$router.push('/');
      } catch (error) {
        console.error('Error processing login:', error);
        this.error = 'Login failed!';
      }
    } else {
      alert('Authorization code not found.');
    }
  }
}
</script>
