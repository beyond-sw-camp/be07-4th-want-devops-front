<template>
  <v-app>
    <v-main>
      <v-container>
        <HeaderComponent/>
        <HomeComponent/>
        <router-view/>
        <FooterComponent/>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  components: {
    HeaderComponent: () => import('./components/head_and_foot/HeaderComponent.vue'),
    FooterComponent: () => import('./components/head_and_foot/FooterComponent.vue'),
    HomeComponent: () => import('./components/HomeComponent.vue')
  }
}
</script>

<style>

</style>
