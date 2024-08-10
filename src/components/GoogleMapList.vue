<template>
  <div class="container">
    <div class="map-container" ref="mapContainer"></div>
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="list-container">
      <ul>
        <li v-for="(location, index) in locations" :key="index">
          {{ location.name }}: {{ location.lat }}, {{ location.lng }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { loadGoogleMapsApi } from '@/plugins/google-maps.js';  // 플러그인 import

export default {
  setup() {
    const locations = ref([
      { lat: 37.5665, lng: 126.9780, name: '위치1' },  // 위치 1
      { lat: 37.5651, lng: 126.9760, name: '위치2' },  // 위치 2
      { lat: 37.5640, lng: 126.9750, name: '위치3' }   // 위치 3
    ]);

    const initMap = (maps) => {
      const map = new maps.Map(document.getElementById('map'), {
        center: { lat: 37.5651, lng: 126.9760 }, // 중앙 위치
        zoom: 14
      });

      const bounds = new maps.LatLngBounds();

      locations.value.forEach(location => {
        const marker = new maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
          title: location.name
        });
        bounds.extend(marker.getPosition());
      });

      map.fitBounds(bounds);

      const polyline = new maps.Polyline({
        path: locations.value.map(loc => ({ lat: loc.lat, lng: loc.lng })),
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
      });

      // Example: Add an event listener to the polyline
      polyline.addListener('click', () => {
        alert('Polyline clicked!');
      });
    };

    onMounted(() => {
      const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY; // 환경 변수에서 API 키 가져오기
      loadGoogleMapsApi(apiKey)
          .then(maps => {
            initMap(maps);
          })
          .catch(error => {
            console.error('Error loading Google Maps API:', error);
          });
    });

    return {locations};
  }
}
</script>

<style>
.container {
  display: flex;
}

.map-container {
  width: 70%;
  height: 500px;
}

.list-container {
  width: 30%;
  padding: 10px;
}

#map {
  width: 100%;
  height: 100%;
}
</style>
