<template>
  <v-app>
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
            :editing="true"
            :on-appointment-updated="onAppointmentUpdated"
          >
            <DxAppointmentDragging
              :group="draggingGroupName"
              :on-remove="onAppointmentRemove"
              :on-add="onAppointmentAdd"
            />
            <DxEditing :allow-updating="allowUpdating" />
          </DxScheduler>
        </v-col>
        <v-col cols="3" class="block-list-col">
          <DxScrollView id="scroll" class="task-scroll-view">
            <DxDraggable
              id="list"
              :group="draggingGroupName"
              :on-drag-start="onListDragStart"
              data="tasks.length > 0 ? 'dropArea' : 'emptyArea'"
            >
              <div v-if="tasks.length === 0" class="empty-list">
                Drop here to add to the list
              </div>
              <DxDraggable
                v-for="task in tasks"
                :key="task.blockId"
                :clone="true"
                :group="draggingGroupName"
                :data="task"
                :on-drag-start="onItemDragStart"
                :on-drag-end="onItemDragEnd"
                class="item dx-card"
              >
                {{ task.title }}
              </DxDraggable>
            </DxDraggable>
          </DxScrollView>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import DxScheduler, {
  DxAppointmentDragging,
  DxEditing, // 여기서 import
} from "devextreme-vue/scheduler";
import DxDraggable from "devextreme-vue/draggable";
import DxScrollView from "devextreme-vue/scroll-view";
import axios from "axios";

// Vuex 스토어와 필요한 변수들 설정
const store = useStore();
const route = useRoute();
const projectId = route.params.projectId;
const draggingGroupName = ref("appointmentsGroup");
const views = ref([]);
const currentDate = ref(new Date());
const appointments = ref([]);
const projectDetail = ref(null);
const tasks = ref([]);
const token = localStorage.getItem("token");
console.log("Authorization Token:", token);

const isLogin = ref(false);
const profileUrl = ref("");

onMounted(async () => {
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

    console.log("ProjectId before dispatch:", projectId);

    const fetchedTasks = await store.dispatch("fetchTasks", projectId);
    tasks.value = fetchedTasks;
    console.log("Tasks Data:", tasks.value);
  } catch (error) {
    console.error("Error initializing data:", error);
  }
});

async function onAppointmentRemove({ itemData }) {
  console.log("Removing appointment:", itemData);

  const index = appointments.value.indexOf(itemData);

  if (index >= 0) {
    const blockId = itemData.blockId;
    const originalStartTime = itemData.startDate.toISOString();
    const originalEndTime = itemData.endDate.toISOString();

    console.log("Sending to server:", { blockId, originalStartTime, originalEndTime });

    try {
      const response = await axios.patch(
        `${process.env.VUE_APP_API_BASE_URL}/api/v1/block/${blockId}/not/active`,
        {
          blockId: blockId,
          startTime: originalStartTime,
          endTime: originalEndTime,
        }
      );

      console.log("API Response:", response);

      appointments.value = [...appointments.value];
      appointments.value.splice(index, 1);
      tasks.value = [...tasks.value, itemData];
    } catch (error) {
      console.error("Failed to update block:", error);
    }
  }
}

async function onAppointmentAdd(e) {
  // console.log("itemData:", e.itemData);
  // console.log("startDate:", e.itemData.startDate);
  // console.log("endDate:", e.itemData.endDate);

  console.log("Before tv :", tasks.value);
  console.log("Before av :", appointments.value);
  if (e.fromData) {
    const index = tasks.value.indexOf(e.fromData);

    if (index >= 0) {
      const blockId = e.itemData.blockId;
      const originalStartTime = e.itemData.startDate.toISOString();
      const originalEndTime = e.itemData.endDate.toISOString();

      // console.log("Start DateTime:", originalStartTime);
      // console.log("End DateTime:", originalEndTime);

      // console.log(
      //   "list : " +
      //     {
      //       blockId: e.fromData.blockId,
      //       startTime: e.itemData.startDate,
      //       endTime: e.itemData.endDate,
      //     }
      // );

      // const updatedAppointment = await store.dispatch(
      //   "updateBlockDates",
      //   e.fromData.blockId,
      //   originalStartTime,
      //   originalEndTime
      // );

      const response = await axios.patch(
        `${process.env.VUE_APP_API_BASE_URL}/api/v1/block/addDate`,
        {
          blockId: blockId,
          startTime: originalStartTime,
          endTime: originalEndTime,
        }
      );

      console.log(response);

      if (index >= 0) {
        tasks.value = [...tasks.value];
        tasks.value.splice(index, 1);
        appointments.value = [...appointments.value, e.itemData];
      }
      console.log("after tv :", tasks.value);
      console.log("after av :", appointments.value);
    }
  } else {
    console.error("fromData is null or undefined in onAppointmentAdd");
  }
}

async function onAppointmentUpdated(e) {
  const updatedAppointment = e.appointmentData;
  const appoitnmentId = updatedAppointment.blockId;
  const updateStartTime = updatedAppointment.startDate.toISOString(); // 변경된 시작 시간
  const updateEndTime = updatedAppointment.endDate.toISOString(); // 변경된 시작 시간

  try {
    // 서버로 업데이트 된 데이터를 전송하여 DB에 반영
    await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/api/v1/block/addDate`, {
      blockId: appoitnmentId,
      startTime: updateStartTime,
      endTime: updateEndTime,
    });
    console.log("Success!");
  } catch (e) {
    console.error("Failed to update ", e);
  }
}

function onListDragStart(e) {
  console.log("onItemDragStart - itemData:", e.itemData);
  e.itemData = e.fromData;
  console.log("onItemDragStart - fromData:", e.fromData);
}

function onItemDragStart(e) {
  console.log("onItemDragStart - before:", e.itemData);
  e.itemData = e.fromData; // 여기서 fromData를 itemData로 설정
  console.log("onItemDragStart - after:", e.itemData);
}

function onItemDragEnd(e) {
  if (e.toData) {
    e.cancel = true;
  }
}

function loadStylesheet() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn3.devexpress.com/jslib/24.1.4/css/dx.fluent.saas.light.css";
  document.head.appendChild(link);
}

function checkLoginStatus() {
  const token = localStorage.getItem("token");
  if (token) {
    isLogin.value = true;
    profileUrl.value = localStorage.getItem("profileUrl");
  }
}

onMounted(() => {
  loadStylesheet();
  checkLoginStatus();
});
</script>

<style scoped>
.project-title {
  font-size: 40px;
}

.project-location {
  font-size: 20px;
}

.scheduler-row {
  margin-top: 30px;
}

#scheduler {
  width: 1000px;
}

.block-list-col {
  padding: 0;
  position: absolute;
  right: 0;
  top: 2px;
  bottom: 0;
  width: 300px; /* 고정된 너비 */
  background-color: #424242;
  overflow-y: auto; /* 스크롤 가능하도록 설정 */
}

.task-scroll-view {
  padding: 16px;
}

.item {
  width: 100%;
  height: 80px;
  color: var(--dx-color-text);
  background-color: var(--dx-component-color-bg);
  box-sizing: border-box;
  padding: 0px 0px;
  text-align: center;
}

.dx-draggable-source {
  opacity: 0.5;
}

.dx-draggable-dragging > * {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 6px 8px rgba(0, 0, 0, 0.2);
}

.empty-list {
  min-height: 100px; /* 높이를 늘려 더 큰 드롭 영역 확보 */
  background-color: #f5f5f5; /* 배경색을 추가하여 눈에 잘 띄게 */
  border: 2px dashed #ccc; /* 시각적인 구분을 위해 테두리 추가 */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 16px;
  color: #666;
  position: relative; /* 정적 위치를 유지하여 클릭해도 움직이지 않도록 */
  cursor: default; /* 기본 커서로 설정하여 드래그되지 않도록 */
  user-select: none; /* 텍스트가 선택되지 않도록 */
  pointer-events: none; /* 클릭 이벤트 무시 */
  -webkit-user-drag: none; /* 드래그 방지 */
}
</style>
