<!-- src/views/SecondView.vue -->
<template>
  <div>
    <button @click="showMapModal = true">Show Google Map</button>
    <CustomModal v-model:modelValue="showMapModal">
      <GoogleMap />
    </CustomModal>
  </div>
</template>

<script>
import { ref } from 'vue';
import GoogleMap from '@/components/GoogleMap.vue';
import CustomModal from '@/components/CustomModal.vue';

export default {
  components: {
    GoogleMap,
    CustomModal,
  },
  setup() {
    const showMapModal = ref(false);
    return { showMapModal };
  },
};
</script>
