<template>
  <div>
    <button @click="showMapModal = true">Search Google Map</button>
    <CustomModal v-model:modelValue="showMapModal">
      <GoogleMap />
    </CustomModal>
    <br><br><br>
    <button @click="showMapListModal = true">Show Google List Map</button>
    <CustomModal v-model:modelValue="showMapListModal">
      <GoogleMapList project-id="3"/>
    </CustomModal>
    <br><br>
    <button @click="showMap = true">Show Google Map</button>
    <CustomModal v-model:modelValue="showMap">
      <ShowMap
          :latitude="latitude"
          :longitude="longitude"
          placeName="Your Place Name"
      />
    </CustomModal>
  </div>
</template>

<script>
import { ref } from 'vue';
import GoogleMap from '@/components/GoogleMap.vue';
import CustomModal from '@/components/CustomModal.vue';
import GoogleMapList from '@/components/GoogleMapList.vue';
import ShowMap from '@/components/ShowMap.vue';

export default {
  components: {
    GoogleMap,
    GoogleMapList,
    ShowMap,
    CustomModal,
  },
  setup() {
    const showMapModal = ref(false);
    const showMapListModal = ref(false);
    const showMap = ref(false);

    // 예제 위도와 경도
    const latitude = ref(37.488904); // 서울의 위도
    const longitude = ref(126.910034); // 서울의 경도

    return {
      showMapModal,
      showMapListModal,
      showMap,
      latitude,
      longitude,
    };
  },
};
</script>
