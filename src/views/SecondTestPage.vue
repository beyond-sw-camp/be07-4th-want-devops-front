<!-- src/views/SecondView.vue -->
<template>
  <div>
    <button @click="showMapModal = true">Show Google Map</button>
    <CustomModal v-model:modelValue="showMapModal">
      <GoogleMap />
    </CustomModal>
    <br><br><br>
    <button @click="showMapListModal = true">Show Google List Map</button>
    <CustomModal v-model:modelValue="showMapListModal">
      <GoogleMapList />
    </CustomModal>
  </div>
</template>

<script>
import { ref } from 'vue';
import GoogleMap from '@/components/GoogleMap.vue';
import CustomModal from '@/components/CustomModal.vue';
import GoogleMapList from '@/components/GoogleMapList.vue';

export default {
  components: {
    GoogleMap,
    GoogleMapList,
    CustomModal,
  },
  setup() {
    const showMapModal = ref(false);
    const showMapListModal = ref(false);

    return {
      showMapModal,
      showMapListModal,
    };

  },
};
</script>
