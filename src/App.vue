<template>
  <v-app>
    <v-main>
        <HeaderComponent/>
        <!-- <HomeComponent/> -->
        <router-view/>
        <!-- <FooterComponent/> -->
    </v-main>
  </v-app>
</template>

<script>
// export default {
//   name: 'App',
//   components: {
//     HeaderComponent: () => import('./components/head_and_foot/HeaderComponent.vue'),
//     // FooterComponent: () => import('./components/head_and_foot/FooterComponent.vue'),
//     // HomeComponent: () => import('./components/HomeComponent.vue')
//   }
// }
import HeaderComponent from './components/head_and_foot/HeaderComponent.vue'
// import FooterComponent from './components/head_and_foot/FooterComponent.vue'
// import HomeComponent from './components/HomeComponent.vue'



export default {
  name: 'App',
  components: {
    HeaderComponent,
    // FooterComponent,
    // HomeComponent

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
