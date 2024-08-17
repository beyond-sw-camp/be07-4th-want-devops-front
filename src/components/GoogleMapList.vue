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
      <div class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 0">Previous</button>
        <button @click="nextPage" :disabled="currentPage === dateList.length - 1">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { loadGoogleMapsApi } from '@/plugins/google-maps.js';

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

    // Initialize and render Google Map with blocks
    const initMap = () => {
      console.log("Initializing map...");
      loadGoogleMapsApi(apiKey)
          .then(maps => {
            console.log("Google Maps API loaded successfully.");
            const map = new maps.Map(document.getElementById('map'), {
              center: {lat: 37.5651, lng: 126.9760},
              zoom: 14,
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
              console.log(`Adding marker for block: ${block.title}, position:`, position);

              // Create a marker for each block
              new maps.Marker({
                position,
                map,
                title: block.title,
              });

              path.push(position);
              bounds.extend(position);
            });

            // Draw a polyline connecting the blocks if there are multiple blocks
            if (path.length > 1) {
              console.log("Drawing polyline with path:", path);
              new maps.Polyline({
                path,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map,
              });
            }

            // Adjust the map view to fit all markers
            if (!bounds.isEmpty()) {
              console.log("Fitting map to bounds:", bounds);
              map.fitBounds(bounds);
            }
          })
          .catch(error => {
            console.error('Error loading Google Maps API:', error);
          });
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

    return {blocks, prevPage, nextPage, dateList, currentPage};
  },
};
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

.pagination-controls {
  margin-top: 10px;
}

.pagination-controls button {
  margin-right: 5px;
}
</style>
