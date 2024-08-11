<template>
  <div class="container">
    <div class="map-container" ref="mapContainer"></div>
    <div class="search-container">
      <input id="country" type="text" placeholder="Enter a country code (e.g., tw)" v-model="country" @input="updateCountry" />
      <input id="place" type="text" placeholder="Enter a location" />
      <div v-if="placeInfo" class="place-info">
        <p><strong>Place Name:</strong> {{ placeInfo.name }}</p>
        <p><strong>Latitude:</strong> {{ placeInfo.lat }}</p>
        <p><strong>Longitude:</strong> {{ placeInfo.lng }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { loadGoogleMapsApi } from '@/plugins/google-maps'; // plugins 폴더의 경로에 맞게 수정

export default {
  setup() {
    const mapContainer = ref(null);
    const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY; // 환경 변수에서 API 키 가져오기
    const placeInfo = ref(null); // 핀의 정보를 저장할 변수
    const country = ref('kr'); // 기본 나라 코드
    let map, autocomplete, marker; // map, autocomplete, marker 변수 선언

    onMounted(async () => {
      try {
        // Google Maps API 로드
        const googleMaps = await loadGoogleMapsApi(apiKey);
        console.log('Google Maps API loaded:', googleMaps);

        // 지도 생성
        map = new googleMaps.Map(mapContainer.value, {
          center: { lat: 37.5665, lng: 126.9780 }, // 서울의 위도와 경도
          zoom: 10,
        });
        console.log('Map initialized:', map);

        // Places API 로드
        const Places = googleMaps.places;
        if (!Places) {
          throw new Error('Places library is not available.');
        }

        // Autocomplete 설정
        const input = document.getElementById('place');
        if (!input) {
          console.error('Input element not found');
          return;
        }

        const options = {
          types: ['establishment'], // 필요에 따라 다른 타입으로 변경 가능
          componentRestrictions: { country: country.value }, // 기본 나라 설정
          fields: ['address_components', 'geometry', 'icon', 'name'],
          strictBounds: false,
        };

        autocomplete = new Places.Autocomplete(input, options);
        console.log('Autocomplete instance:', autocomplete);

        // 장소 변경 이벤트 리스너 추가
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          console.log('Selected place:', place);

          if (place.geometry) {
            const location = place.geometry.location;
            const lat = location.lat();
            const lng = location.lng();

            // 위치를 중심으로 지도 이동
            map.setCenter(location);
            map.setZoom(15); // 확대

            // 마커가 존재하면 제거
            if (marker) {
              marker.setMap(null);
            }

            // 새 마커 생성 및 지도에 추가
            marker = new googleMaps.Marker({
              position: location,
              map: map,
              title: place.name,
            });

            // 핀의 정보 업데이트
            placeInfo.value = {
              name: place.name,
              lat: lat.toFixed(6), // 소수점 6자리까지 표시
              lng: lng.toFixed(6), // 소수점 6자리까지 표시
            };
          } else {
            console.error('No geometry for the selected place.');
            placeInfo.value = null;
          }
        });

      } catch (error) {
        console.error('Error loading Google Maps API:', error);
      }
    });

    // 나라 입력 시 변경하는 메소드
    const updateCountry = () => {
      if (autocomplete) {
        const options = {
          types: ['establishment'],
          componentRestrictions: { country: country.value }, // 사용자가 입력한 나라 코드로 변경
          fields: ['address_components', 'geometry', 'icon', 'name'],
          strictBounds: false,
        };

        autocomplete.setOptions(options);

        // 나라에 따라 지도의 중심 변경 (기본적으로 나라 코드에 따라 대표 도시의 위도를 설정해 줍니다.)
        const centers = {
          'kr': { lat: 37.5665, lng: 126.9780 }, // 서울
          'us': { lat: 37.7749, lng: -122.4194 }, // 샌프란시스코
          'jp': { lat: 35.6895, lng: 139.6917 }, // 도쿄
          'fr': { lat: 48.8566, lng: 2.3522 }, // 파리
          'tw': { lat: 25.0330, lng: 121.5654 }, // 타이베이
          // 필요에 따라 더 많은 나라의 위도를 추가할 수 있습니다.
        };

        if (centers[country.value]) {
          map.setCenter(centers[country.value]);
          map.setZoom(10); // 기본 줌 레벨 설정
        } else {
          console.warn('No center defined for the selected country.');
        }
      }
    };

    return { mapContainer, placeInfo, country, updateCountry };
  }
};
</script>

<style scoped>
.container {
  display: flex;
  align-items: flex-start;
}

.map-container {
  width: 70%;
  height: 500px;
}

.search-container {
  width: 30%;
  padding: 10px;
}

.place-info {
  margin-top: 20px;
}

input {
  margin-bottom: 10px;
  width: 100%;
  padding: 5px;
}
</style>
