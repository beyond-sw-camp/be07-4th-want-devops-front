<template>
<!-- 프로필 이미지 + 닉네임 + 프로필 수정 버튼 -->
<!-- 나의 일정 / 받은 초대 목록 라우터 링크와 라우터 뷰 추가-->
<h1>This is MyPage</h1>
<v-btn>
    <router-link to="myProject">My Project</router-link>
</v-btn>
<v-btn>
    <router-link to="myInvitation">My Invitation</router-link>
</v-btn>
<router-view/>

</template>
<script>

</script>
<style>

</style>