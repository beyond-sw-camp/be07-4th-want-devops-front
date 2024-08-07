<template>
  <v-app>
    <HeaderComponent />

    <v-container class="fill-height d-flex justify-center align-center">
      <v-row>
        <v-col cols="12" md="6" class="content">
          <h1>기존에 경험하지 못한 새로운 여행 플래너</h1>
          <p class="content2">고민만 하던 여행 계획을 마이로드를 통해 뚝딱 한 번에 스케쥴링 해보세요.</p>
          <GoogleLogin /> <!-- 구글 로그인 컴포넌트 추가 -->
          <v-btn color="primary" @click="startMyRoad">마이로드 시작하기</v-btn>
        </v-col>
        <v-col cols="12" md="6" class="map">
          <img src="@/assets/test_back.png" class="backImage" alt="Map">
        </v-col>
      </v-row>
    </v-container>
    <FooterComponent />
  </v-app>
</template>

<script>
import GoogleLogin from '@/components/login/GoogleLogin.vue';
import HeaderComponent from '@/components/head_and_foot/HeaderComponent.vue';
import FooterComponent from '@/components/head_and_foot/FooterComponent.vue';

export default {
  name: 'TravelPlanner',
  components: {
    GoogleLogin,
    HeaderComponent,
    FooterComponent
  },
  methods: {
    startMyRoad() {
      alert('마이로드 시작하기 clicked!');
    }
  }
}
</script>

<style scoped>
.content {
  padding: 100px; /* 컨텐츠를 화면 중앙에 배치 */
  /* 글자 크기 */
  font-size: 1.5em;
}
.content2 {
  font-size: 0.9em;
}

.map img {
  width: 100%; /* 이미지를 화면에 꽉 차게 */
  height: auto; /* 이미지의 비율을 유지하면서 */
  border-radius: 4px; /* 이미지 모서리를 둥글게 */
}

.backImage {
  width: 100%; /* 이미지를 화면에 꽉 차게 */
  height: auto; /* 이미지의 비율을 유지하면서 */
}
</style>