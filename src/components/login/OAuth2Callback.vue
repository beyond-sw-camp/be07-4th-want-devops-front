<template>
  <div>
    <p>Processing your login...</p>
    <p v-if="tokenData"><strong>Token Data:</strong> {{ tokenData }}</p>
    <p v-if="error" style="color: red;"><strong>Error:</strong> {{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Named import

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
        // 1. 인가 코드를 백엔드로 전송하여 액세스 토큰 요청 및 사용자 정보 처리
        const validateResponse = await axios.post(`http://localhost:8088/auth/google`, {
          code: authorizationCode
        });

        // 서버의 응답 처리
        const accessToken = validateResponse.data.result.accessToken;
        const refreshToken = validateResponse.data.result.refreshToken;

        // 디코딩 전에 토큰을 로그로 출력하여 확인
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        // JWT 디코딩
        try {
          const decodedToken = jwtDecode(accessToken);
          console.log('Decoded Token:', decodedToken);
          alert('decodedToken: ' + decodedToken);

          // 필요한 데이터 추출
          const role = decodedToken.auth;
          const profileUrl = decodedToken.profileUrl;

          // UI 업데이트
          this.tokenData = validateResponse.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('role', role);
          localStorage.setItem('profileUrl', profileUrl);

          // 로그인 후 홈 페이지로 리디렉션
          this.$router.push('/').then(() => {
            window.location.reload();
          });

        } catch (decodeError) {
          console.error('Error decoding JWT:', decodeError);
          this.error = 'Error decoding JWT.';
        }
      } catch (error) {
        console.error('Error processing login:', error);
        this.error = 'Login failed!';
      }
    } else {
      this.error = 'Authorization code not found.';
    }
  }
}
</script>
