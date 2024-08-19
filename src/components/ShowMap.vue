<!-- src/components/ShowMap.vue -->
<template>
  <div class="map-container" ref="mapContainer"></div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
import { loadGoogleMapsApi } from '@/plugins/google-maps'; // Google Maps API 로딩 함수

export default {
  props: {
    latitude: {
      type: Number,
      default: 37.5665 // 서울의 위도 (기본값)
    },
    longitude: {
      type: Number,
      default: 126.9780 // 서울의 경도 (기본값)
    },
    placeName: {
      type: String,
      default: 'Selected Place'
    }
  },
  setup(props) {
    const mapContainer = ref(null);
    const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY; // 환경 변수에서 API 키 가져오기
    let map, marker;

    onMounted(async () => {
      try {
        const googleMaps = await loadGoogleMapsApi(apiKey);
        map = new googleMaps.Map(mapContainer.value, {
          center: { lat: props.latitude, lng: props.longitude },
          zoom: 15,
        });

        marker = new googleMaps.Marker({
          position: { lat: props.latitude, lng: props.longitude },
          map: map,
          title: props.placeName,
        });
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
      }
    });

    watch(() => [props.latitude, props.longitude], ([newLat, newLng]) => {
      if (map && marker) {
        map.setCenter({ lat: newLat, lng: newLng });
        marker.setPosition({ lat: newLat, lng: newLng });
      }
    });

    return { mapContainer };
  }
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
}
</style>
