<template>
  <div class="container">
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="list-container">
      <ul>
        <li v-for="(block, index) in blocks" :key="index">
          {{ block.title }}: {{ block.latitude }}, {{ block.longitude }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { loadGoogleMapsApi } from '@/plugins/google-maps.js';  // 플러그인 import

export default {
  setup() {
    const blocks = ref([]);
    const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY; // 환경 변수에서 API 키 가져오기
    const projectId = 1; // 사용할 프로젝트 ID
    const date = '2024-08-01'; // 날짜 예시
    const apiUrl = `http://localhost:8088/api/v1/project/${projectId}/block/list/date?date=${date}`;

    const fetchBlocks = async () => {
      try {
        const response = await axios.get(apiUrl);
        blocks.value = response.data.result; // API 응답 구조 확인 필요
        initMap(); // 데이터 로드 후 지도 초기화
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    };

    const initMap = () => {
      loadGoogleMapsApi(apiKey)
          .then(maps => {
            const map = new maps.Map(document.getElementById('map'), {
              center: {lat: 37.5651, lng: 126.9760},
              zoom: 14
            });

            const bounds = new maps.LatLngBounds();
            const path = [];

            blocks.value.forEach(block => {
              const lat = parseFloat(block.latitude);
              const lng = parseFloat(block.longitude);
              if (isNaN(lat) || isNaN(lng)) {
                console.error('Invalid coordinates for block:', block);
                return;
              }

              const position = {lat, lng};

              new maps.Marker({
                position: position,
                map: map,
                title: block.title
              });

              path.push(position);
              bounds.extend(position);
            });

            if (path.length > 1) {
              new maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map: map
              });
            }

            if (!bounds.isEmpty()) {
              map.fitBounds(bounds);
            }
          })
          .catch(error => {
            console.error('Error loading Google Maps API:', error);
          });
    };

    onMounted(() => {
      fetchBlocks();
    });    return {blocks};
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
