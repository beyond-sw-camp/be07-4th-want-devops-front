<template>
  <div>
    <h1>접근 불가</h1>
    <p>이 프로젝트에 접근할 권한이 없습니다. 프로젝트 멤버가 아닐 수 있습니다.</p>
    <v-btn @click="goBack">돌아가기</v-btn>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function goBack() {
  router.push({ name: "MyPage" }); // 홈 페이지나 다른 페이지로 이동
}
</script>
