<template>
  <v-app>
    <v-main>
      <v-container>
        <HeaderComponent/>
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
  }
}
</script>

<style>

</style>
