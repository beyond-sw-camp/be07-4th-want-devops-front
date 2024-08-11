<template>
  <v-app>
    <!-- Header Section -->
    <HeaderComponent :isLogin="isLogin" :profileUrl="profileUrl" @logout="handleLogout" />

    <v-container>
      <!-- Project Detail -->
      <v-row v-if="projectDetail" class="header-row">
        <!-- 프로젝트 제목과 위치 -->
        <v-col cols="12" class="d-flex align-center">
          <div class="mr-3">
            <h2 class="project-title">{{ projectDetail.projectTitle || "Trip" }}</h2>
          </div>
          <div class="mr-3">
            <h4 class="project-location" v-if="projectDetail.projectStates.length">
              &lt;{{ projectDetail.projectStates[0].city }},
              {{ projectDetail.projectStates[0].country }}&gt;
            </h4>
            <h4 class="project-location" v-else>&lt;여행지: 미정&gt;</h4>
          </div>
          <v-avatar
            v-for="member in projectDetail.projectMembers"
            :key="member.userId"
            class="ma-2"
          >
            <img :src="member.userProfile" alt="User profile" />
          </v-avatar>
          <v-btn class="ml-3" color="primary">초대</v-btn>
        </v-col>
      </v-row>

      <!-- Scheduler -->
      <v-row class="scheduler-row">
        <v-col cols="9">
          <DxScheduler
            time-zone="Asia/Seoul"
            id="scheduler"
            :data-source="appointments"
            :current-date="currentDate"
            :views="views"
            :height="600"
            :start-day-hour="9"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import DxScheduler from "devextreme-vue/scheduler";
import HeaderComponent from "@/components/head_and_foot/HeaderComponent.vue";

// Vuex 스토어와 필요한 변수들 설정
const store = useStore();
const route = useRoute();
const projectId = route.params.projectId;
if (!projectId || isNaN(projectId)) {
  console.error("Invalid projectId:", projectId);
} else {
  console.log("Valid projectId:", projectId);
}
const views = ref([]);
const currentDate = ref(new Date());
const appointments = ref([]);
const projectDetail = ref(null);
const token = localStorage.getItem("token");
console.log("Authorization Token:", token);

const isLogin = ref(false);
const profileUrl = ref("");

onMounted(async () => {
  // Check if the user is logged in and fetch profile data

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn3.devexpress.com/jslib/24.1.4/css/dx.fluent.saas.light.css";
  document.head.appendChild(link);

  const token = localStorage.getItem("token");
  if (token) {
    isLogin.value = true;
    profileUrl.value = localStorage.getItem("profileUrl");
  }

  try {
    console.log("Fetching project details...");
    await store.dispatch("fetchProjectDetail", projectId); // projectId만 전달
    projectDetail.value = store.getters.projectDetail;
    console.log("Project Detail Data:", projectDetail.value);

    if (projectDetail.value) {
      const startTravel = new Date(projectDetail.value.startTravel);
      const endTravel = new Date(projectDetail.value.endTravel);
      const intervalCount = Math.ceil((endTravel - startTravel) / (1000 * 60 * 60 * 24));

      views.value = [
        { type: "day", intervalCount: intervalCount > 0 ? intervalCount : 1 },
      ];
      currentDate.value = startTravel;

      console.log("Project Detail Data:", projectDetail.value);
      console.log("Start Travel:", startTravel);
      console.log("End Travel:", endTravel);
    }
  } catch (error) {
    console.error("Error initializing data:", error);
  }
});

// Logout handler
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("profileUrl");
  isLogin.value = false;
  profileUrl.value = "";
  // Additional logout handling if necessary
}
</script>

<style scoped>
.header-row {
  margin-top: 40px;
  height: 80px;
}

.project-title {
  font-size: 50px;
}

.project-location {
  font-size: 20px;
}

.scheduler-row {
  margin-top: 30px;
}

#scheduler {
  max-width: calc(100% - 20px); /* 스케줄러 너비 조정 */
}
</style>
