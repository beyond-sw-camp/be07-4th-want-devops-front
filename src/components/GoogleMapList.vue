<template>
  <div class="container">
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="list-container">
      <div class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 0" class="pagination-button prev-button">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button @click="nextPage" :disabled="currentPage === dateList.length - 1" class="pagination-button next-button">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <h2 v-html="currentDate"></h2>
      <ul style="margin-top: 20px">
        <li v-for="(block, index) in blocks" :key="index" class="block-item">
          <div class="block-marker-info">
            <div class="block-marker">{{ index + 1 }}</div>
            <div v-if="index < blocks.length - 1" class="material-symbols-outlined" style="margin-top: 8px">
              more_vert
            </div>
          </div>
          <div class="block-info">
            <div class="block-title">{{ block.title }}</div>
          </div>
        </li>
      </ul>
    </div>
    
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { loadGoogleMapsApi } from '@/plugins/google-maps.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default {
  props: {
    projectId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const blocks = ref([]);
    const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY;
    const dateList = ref([]);
    const currentPage = ref(0);

    const currentDate = computed(() => {
      if (dateList.value.length === 0) return '';

      const date = new Date(dateList.value[currentPage.value]);

      // Format the date as MM-DD
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${month}-${day}`;

      // Day number
      const dayNumber = currentPage.value + 1;

      // Return HTML string with line breaks and smaller text
      return `${dayNumber}일차<br><span class="date-text">${formattedDate}</span>`;
    });

    const countryMapping = {
      'KOREA': 'kr',
      'JAPAN': 'jp',
      'USA': 'us',
      'FRANCE': 'fr',
      'TAIWAN': 'tw',
    };

    const centers = {
      'kr': { lat: 37.5665, lng: 126.9780 },
      'us': { lat: 37.7749, lng: -122.4194 },
      'jp': { lat: 35.6895, lng: 139.6917 },
      'fr': { lat: 48.8566, lng: 2.3522 },
      'tw': { lat: 25.0330, lng: 121.5654 },
    };

    // Fetches project date range and initialize dates
    const fetchDates = async () => {
      try {
        console.log("Fetching project details...");

        const projectResponse = await axios.get(`http://localhost:8088/api/v1/project/${props.projectId}/detail`);
        console.log("Project details response:", projectResponse.data);
        const {startTravel, endTravel} = projectResponse.data.result;

        // Generate the date range between startDate and endDate
        dateList.value = getDateRange(new Date(startTravel), new Date(endTravel));
        console.log("Generated date range:", dateList.value);

        // Load blocks for the initial page
        if (dateList.value.length > 0) {
          await fetchBlocksForDate(dateList.value[currentPage.value]);
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    // Generates an array of dates between startDate and endDate
    const getDateRange = (startTravel, endTravel) => {
      const dateList = [];
      let currentDate = startTravel;

      while (currentDate <= endTravel) {
        dateList.push(currentDate.toISOString().split('T')[0]); // 'YYYY-MM-DD' format
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dateList;
    };

    // Fetch blocks for a specific date
    const fetchBlocksForDate = async (date) => {
      try {
        console.log(`Fetching blocks for date: ${date}`);
        const apiUrl = `http://localhost:8088/api/v1/project/${props.projectId}/block/list/date?date=${date}`;
        const response = await axios.get(apiUrl);
        console.log(`Blocks fetched for date ${date}:`, response.data.result);
        blocks.value = response.data.result;
        initMap();
      } catch (error) {
        console.error(`Error fetching blocks for date ${date}:`, error);
      }
    };

    const loadProjectCenter = async () => {
      try {
        const response = await axios.get(`http://localhost:8088/api/v1/project/${props.projectId}/detail`);
        const projectCountry = response.data.result.projectStates[0].country;

        const countryCode = countryMapping[projectCountry.toUpperCase()];
        return centers[countryCode] || centers['kr'];
      } catch (error) {
        console.error('Failed to load project state:', error);
        return centers['kr'];
      }
    };

    // Initialize and render Google Map with blocks
    const initMap = async () => {
      console.log("Initializing map...");
      const googleMaps = await loadGoogleMapsApi(apiKey);

      let center = centers['kr']; // Default to Seoul

      if (blocks.value.length > 0) {
        const firstBlock = blocks.value[0];
        const lat = parseFloat(firstBlock.latitude);
        const lng = parseFloat(firstBlock.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          center = { lat, lng };
        }
      } else {
        center = await loadProjectCenter();
      }

      const map = new googleMaps.Map(document.getElementById('map'), {
        center,
        zoom: 14, 
      });

      const bounds = new googleMaps.LatLngBounds();
      const path = [];

      blocks.value.forEach(block => {
        const lat = parseFloat(block.latitude);
        const lng = parseFloat(block.longitude);
        if (isNaN(lat) || isNaN(lng)) {
          console.error('Invalid coordinates for block:', block);
          return;
        }

        const position = { lat, lng };
        console.log(`Adding marker for block: ${block.title}, position:`, position);

        new googleMaps.Marker({
          position,
          map,
          title: block.title,
        });

        path.push(position);
        bounds.extend(position);
      });

      // 선 그리기
      if (path.length > 1) {
        console.log("Drawing polyline with path:", path);
        new googleMaps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2,
          map,
        });
      }
      // 지도 범위
      if (!bounds.isEmpty()) {
        console.log("Fitting map to bounds:", bounds);
        map.fitBounds(bounds);
      }
    };

    // Change page to the previous date
    const prevPage = async () => {
      if (currentPage.value > 0) {
        currentPage.value--;
        await fetchBlocksForDate(dateList.value[currentPage.value]);
      }
    };

    // Change page to the next date
    const nextPage = async () => {
      if (currentPage.value < dateList.value.length - 1) {
        currentPage.value++;
        await fetchBlocksForDate(dateList.value[currentPage.value]);
      }
    };

    // Watch for changes in currentPage to update blocks
    watch(currentPage, async (newPage) => {
      if (dateList.value.length > 0) {
        await fetchBlocksForDate(dateList.value[newPage]);
      }
    });

    onMounted(() => {
      console.log("Component mounted, fetching dates...");
      fetchDates(); // Fetch dates when the component is mounted
    });

    return {blocks, prevPage, nextPage, dateList, currentPage,currentDate};
  },
};
</script>

<style scoped>
.container {
  display: flex;
  height: 500px;
  width: 100%;
  position: relative; /* Added to position pagination controls */
}

.map-container {
  flex: 3;
  height: 100%;
  width: 100%;
}

.list-container {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  border-left: 1px solid #ccc;
  height: 100%;
  width: 100%;
  position: relative; /* Added to position pagination controls */
}

#map {
  width: 100%;
  height: 100%;
}

h2 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
}

.block-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  text-align: left;
}
.block-marker-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 10px;
}
.block-marker {
  width: 24px;
  height: 24px;
  background-color: rgb(0, 168, 206);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  font-weight: 700;
}

.block-info {
  flex-grow: 1;
}

.block-title {
  font-weight: bold;
}

.block-address {
  font-size: 0.9em;
  color: #666;
}
.material-symbols-outlined .more-icon {
  font-weight: 300;
  font-size: 24px;
  color: #666;
  margin-top: 10px; /* 아이콘과 마커 사이의 간격 */
}

.date-text {
  display: block; /* Make sure the date appears on a new line */
  font-size: 0.9em; /* Adjust font size to make it smaller */
  color: #333; /* Adjust color if needed */
}

.pagination-controls {
  display: flex;
  justify-content: center; /* 가운데 정렬 */
  align-items: center;
  margin-bottom: 10px; /* Controls와 상단 요소 사이 간격 */
  gap: 5px
}

.pagination-button {
  background-color: rgb(254, 223, 24);
  border: none;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-button i {
  margin: 0;
}

</style>