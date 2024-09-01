<template>
  <div class="container">
    <div class="map-container" ref="mapContainer"></div>
    <div class="search-container">
      <input class="form-control" id="place" type="text" placeholder="🔎 장소를 입력하세요" />
      
      <div v-if="placeInfo" class="place-info">
        <p>📍 {{ placeInfo.name }}</p>
      </div>

      <v-btn color="secondary" @click="savePlace" class="save-btn">SAVE</v-btn>
    </div>
    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" timeout="3000" color="success">
      장소가 저장되었습니다.
    </v-snackbar>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { loadGoogleMapsApi } from '@/plugins/google-maps'; // plugins 폴더의 경로에 맞게 수정
import axios from 'axios';

export default {
  emits: ['place-selected'],
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const mapContainer = ref(null);
    const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY; // 환경 변수에서 API 키 가져오기
    const placeInfo = ref(null); // 핀의 정보를 저장할 변수
    const country = ref('kr'); // 기본 나라 코드 (기본값으로 'kr' 설정)
    let map, autocomplete, marker; // map, autocomplete, marker 변수 선언
    const snackbar = ref(false); // 스낵바의 상태 관리

    // 국가명을 2자리 국가 코드로 변환하는 매핑 객체
    const countryMapping = {
      'KOREA': 'kr',
      'JAPAN': 'jp',
      'USA': 'us',
      'FRANCE': 'fr',
      'TAIWAN': 'tw',
      // 필요한 다른 국가들도 여기에 추가
    };

    // 국가에 대한 위치
    const centers = {
      'kr': { lat: 37.5665, lng: 126.9780 }, // 서울
      'us': { lat: 37.7749, lng: -122.4194 }, // 샌프란시스코
      'jp': { lat: 35.6895, lng: 139.6917 }, // 도쿄
      'fr': { lat: 48.8566, lng: 2.3522 }, // 파리
      'tw': { lat: 25.0330, lng: 121.5654 }, // 타이베이
      // 필요에 따라 더 많은 나라의 위도를 추가할 수 있습니다.
    };

    onMounted(async () => {
      await loadState(); // 상태를 먼저 불러옴
      try {
        // Google Maps API 로드
        const googleMaps = await loadGoogleMapsApi(apiKey);
        console.log('Google Maps API loaded:', googleMaps);

        // 지도 생성 (state에서 설정된 국가 코드로 중심 위치 변경)
      const center = centers[country.value] || centers['kr']; // country 값이 없는 경우 기본 서울로 설정
      map = new googleMaps.Map(mapContainer.value, {
        center: center, // 국가에 맞는 중심 좌표 설정
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

        // Autocomplete 옵션 설정
        const options = {
          types: ['establishment'], // 필요에 따라 다른 타입으로 변경 가능
          componentRestrictions: { country: country.value }, // loadState 함수에서 설정한 나라 코드 사용
          fields: ['address_components', 'geometry', 'icon', 'name'],
          strictBounds: false,
        };

        autocomplete = new googleMaps.places.Autocomplete(input, options);
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

    // 프로젝트 상태를 로드하여 country 값을 설정하는 함수
    const loadState = async () => {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/project/${props.projectId}/detail`);
        const projectCountry = response.data.result.projectStates[0].country;

        // 국가명을 2자리 코드로 변환
        const countryCode = countryMapping[projectCountry.toUpperCase()];
        if (countryCode) {
          country.value = countryCode; // 변환된 코드로 country 값 설정
          updateCountry(); // country 값을 설정한 후, 지도와 자동완성 옵션을 업데이트
        } else {
          console.error('No matching country code found for:', projectCountry);
        }
      } catch (error) {
        console.error('Failed to load project state:', error);
      }
    };

    // 나라 입력 시 변경하는 메소드
    const updateCountry = () => {
      if (autocomplete) {
        const options = {
          types: ['establishment'],
          componentRestrictions: { country: country.value }, // 서버에서 가져온 나라 코드로 변경
          fields: ['address_components', 'geometry', 'icon', 'name'],
          strictBounds: false,
        };

        autocomplete.setOptions(options);

        // 나라에 따라 지도의 중심 변경
        const centers = {
          'kr': {lat: 37.5665, lng: 126.9780}, // 서울
          'us': {lat: 37.7749, lng: -122.4194}, // 샌프란시스코
          'jp': {lat: 35.6895, lng: 139.6917}, // 도쿄
          'fr': {lat: 48.8566, lng: 2.3522}, // 파리
          'tw': {lat: 25.0330, lng: 121.5654}, // 타이베이
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

    const savePlace = () => {
      if (placeInfo.value) {
        emit('place-selected', placeInfo.value);
        snackbar.value = true; // 스낵바 표시
      }
    };

    return { mapContainer, placeInfo, country, updateCountry, savePlace, snackbar };
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
  width: 50%;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  height: 500px;
}

.search-container input {
  margin-bottom: 10px;
}

.place-info {
  color: #333;
  font-size: 16px;
}

input {
  width: 100%;
}

.save-btn {
  margin-top: auto; /* SAVE 버튼을 아래쪽에 배치 */
}

.v-snackbar {
  bottom: 20px;
}
</style>
