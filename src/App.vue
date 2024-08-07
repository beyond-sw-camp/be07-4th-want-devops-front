<template>
  <v-app>
    <v-main>
        <HeaderComponent/>
        <router-view/>
        <!-- <FooterComponent/> -->
    </v-main>
  </v-app>
</template>

<script>

import HeaderComponent from './components/head_and_foot/HeaderComponent.vue'



export default {
  name: 'App',
  components: {
    HeaderComponent,
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
#app {
  font-family: "Montserrat", "IBM Plex Sans KR";
  font-optical-sizing: auto;
  font-style: normal;
  
}
</style>
