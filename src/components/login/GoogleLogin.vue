<template>
  <div>
    <v-btn class="start-button" @click="redirectToGoogle">Login with Google</v-btn>
  </div>
</template>

<script>
export default {
  methods: {
    redirectToGoogle() {
      window.location.href = `${process.env.VUE_APP_API_BASE_URL}/auth/google/start`;
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