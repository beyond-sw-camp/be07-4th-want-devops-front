<template>
  <div class="container">
    <div class="projectScheduler">
      <!-- Project Detail -->
      <div v-if="projectDetail" class="header-row">

        <div class="projectHeader">
          <div class="left-section">
            <h2 class="project-title">{{ projectDetail.projectTitle || "Trip" }}</h2>


            <div class="projectLocation" style="display: flex;">
              <div class="map-btn" elevation="0" variant="text" @click="showMapListModal = true"
                style="padding: 0; cursor: pointer">
                <img src="@/assets/img/googleMap.png" alt="Google Map" style="height: 25px; margin:  0 5px 0 15px">
              </div>
              <CustomModal v-model:modelValue="showMapListModal">
                <GoogleMapList :projectId="projectId" />
              </CustomModal>
              <div class="project-location" v-if="projectDetail.projectStates.length">
                {{ projectDetail.projectStates[0].city }},
                {{ projectDetail.projectStates[0].country }}
              </div>
              <div class="project-location" v-else>&lt;여행지: 미정&gt;</div>
            </div>
          </div>

          <div class="right-section">
            <v-avatar v-for="member in projectDetail.projectMembers" :key="member.userId" class="ma-2" size="large">
              <img :src="member.userProfile" alt="User profile" />
            </v-avatar>
            <span @click.stop="toggleMenu" ref="moreVertButton" class="material-symbols-outlined"
              style="margin: auto; cursor: pointer;">
              more_vert
            </span>
            <!-- More 메뉴 모달 -->
            <div v-if="menuOpen" class="modal-menu" ref="modalMenu">
              <div class="menu-item" @click="showInviteModal = true">
                <v-icon>mdi-account-plus</v-icon> 초대하기
              </div>
              <div class="menu-item" @click="openModal">
                <v-icon>mdi-account-remove</v-icon> 탈퇴하기
              </div>
            </div>
          </div>
        </div>


        <!-- 새롭게 태어난 팀 초대 창 -->
        <v-dialog v-model="showInviteModal" max-width="500">
          <v-card class="elevation-3" style="border-radius: 16px">
            <!-- 헤더 부분 -->
            <v-card-title class="text-h5" style="
                background-color: #37474f;
                color: white;
                border-top-left-radius: 16px;
                border-top-right-radius: 16px;
              ">
              <v-row align="center">
                <v-col cols="10"> 팀 초대 </v-col>
                <v-col cols="2" class="text-right">
                  <v-icon @click="closeInviteModal">mdi-close</v-icon>
                </v-col>
              </v-row>
            </v-card-title>
            <v-card-text style="padding: 24px">
              초대할 사용자의 이메일을 입력해주세요
              <v-text-field v-model="inviteEmail" label="이메일" required style="margin: 20px 0 0"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="showInviteModal = false">취소</v-btn>
              <v-btn color="blue darken-1" text @click="inviteMembers">초대</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>


        <!-- 탈퇴 모달창 -->
        <v-dialog v-model="dialog" max-width="500">
          <v-card class="elevation-3" style="border-radius: 16px">
            <!-- 헤더 부분 -->
            <v-card-title class="text-h5" style="
                background-color: #37474f;
                color: white;
                border-top-left-radius: 16px;
                border-top-right-radius: 16px;
              ">
              <v-row align="center">
                <v-col cols="10"> 팀 탈퇴 </v-col>
                <v-col cols="2" class="text-right">
                  <v-icon @click="closeDialog">mdi-close</v-icon>
                </v-col>
              </v-row>
            </v-card-title>

            <v-card-text style="padding: 24px">
              <!-- 경고 메시지 부분 -->
              <v-row class="align-center" style="background-color: #ffebee; padding: 16px; border-radius: 8px">
                <v-icon color="red" size="36">mdi-alert-circle-outline</v-icon>
                <p class="text-h6 ml-2" style="margin-top: 15px; color: #616161">
                  정말 팀을 <strong style="color: #d32f2f">탈퇴</strong>하시겠습니까?
                </p>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <!-- 주의사항 문구 부분 -->
              <v-row>
                <v-col>
                  <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px">
                    <v-row align="center">
                      <v-col cols="1" class="text-center">
                        <v-icon color=" #d32f2f">mdi-alert-outline</v-icon>
                      </v-col>
                      <v-col cols="11" class="d-flex align-center">
                        <p style="margin: 0; color: #616161">
                          팀원일 경우 생성했던 블록은 사라지지 않고,<br />
                          회원님의 프로필만 팀에서 사라지게 됩니다.
                        </p>
                      </v-col>
                    </v-row>
                    <v-row class="mt-2" align="center">
                      <v-col cols="1" class="text-center">
                        <v-icon color=" #d32f2f">mdi-alert-outline</v-icon>
                      </v-col>
                      <v-col cols="11" class="d-flex align-center">
                        <p style="margin: 0; color: #616161">
                          팀장일 경우 모든 프로젝트가 소멸되고, 타 팀원들도 프로젝트에서
                          탈퇴됩니다.
                        </p>
                      </v-col>
                    </v-row>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <p class="text-center" style="color: #757575">
                <strong>주의사항을 확인하셨으면 동의를 눌러주세요.</strong>
              </p>
            </v-card-text>

            <!-- 동의 버튼 부분 -->
            <v-card-actions class="justify-center" style="padding-bottom: 24px">
              <v-btn @click="confirmDeletion" style="
                  background-color: #d32f2f;
                  color: white;
                  font-size: 18px;
                  height: 56px;
                  width: 160px;
                  border-radius: 28px;">
                동의

              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </div>

    <!-- Scheduler and Block List -->

    <DxScheduler time-zone="Asia/Seoul" id="scheduler" :data-source="appointments" :current-date="currentDate"
      :views="views" :height="750" :start-day-hour="1" :end-day-hour="23" :editing="true"
      :on-appointment-updated="onAppointmentUpdated" :show-all-day-panel="false"
      @appointment-form-opening="onAppointmentFormOpening">
      <DxAppointmentDragging :group="draggingGroupName" :on-remove="onAppointmentRemove" :on-add="onAppointmentAdd" />
      <DxEditing :allow-updating="allowUpdating" />
      <DxScrolling mode="virtual" />
    </DxScheduler>
  </div>


  <div class="projectBlockList">
    <!-- 카테고리 버튼 : 누르면 해당 카테고리만, 다시 누르면 전체 조회. -->
    <div class="category-buttons-wrapper">
      <div class="category-buttons">
        <v-btn v-for="(color, category) in categoryColors" :key="category"
          :style="{ backgroundColor: `rgb(${color.join(',')})`, color: '#fff' }" @click="filterByCategory(category)">
          #{{ categoryMap[category] }}
        </v-btn>
      </div>
    </div>
    <hr>

    <!-- Block 생성 버튼 -->
    <v-btn @click="createBlock" color="#666" class="create-button">블럭 생성</v-btn>

    <div class="block-list" style="height: 80%">
      <DxScrollView id="scroll">
        <DxDraggable id="list" :group="draggingGroupName" :on-drag-start="onListDragStart" style="height: 90px;">
          <template v-if="tasks.length === 0">
            <div class="empty-list" style="width: 320px; height: 80px">
              📍 일정에서 제외하기
            </div>
          </template>
          <DxDraggable v-for="task in sortedFilteredDataSource" :style="getStyle(task.category, task.heartCount)"
            :key="task.blockId" :clone="true" :group="draggingGroupName" :data="task" :on-drag-start="onItemDragStart"
            :on-drag-end="onItemDragEnd" class="item">

            <div class="block-content">
              <div class="block-heart">
                <v-icon @click.stop="toggleLike(task)">
                  <template v-if="task.liked">mdi-heart</template>
                  <template v-else>mdi-heart-outline</template>
                </v-icon>
                <span class="heart-count">{{ task.heartCount }}&nbsp;&nbsp;</span>
              </div>


              <div class="block-info">
                <div class="block-title">
                  {{ task.title }}
                </div>

                <div class="block-location">
                  {{ task.placeName }}
                </div>
              </div>

              <span class="material-symbols-outlined edit-block" @click="() => goToBlockBoard(task.id)">
                edit_square
              </span>
            </div>



          </DxDraggable>
        </DxDraggable>
      </DxScrollView>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import DxScheduler, {
  DxAppointmentDragging,
  DxScrolling,
} from "devextreme-vue/scheduler";
import DxDraggable from "devextreme-vue/draggable";
import DxScrollView from "devextreme-vue/scroll-view";
import CustomModal from "@/components/CustomModal.vue";
import GoogleMapList from "@/components/GoogleMapList.vue";
import { EventSourcePolyfill } from "event-source-polyfill";

const store = useStore();
const route = useRoute();
const router = useRouter();
const dialog = ref(false);
const projectId = route.params.projectId;
const draggingGroupName = ref("appointmentsGroup");
const views = ref([]);
const currentDate = ref(new Date());
const projectDetail = ref(null);
const tasks = ref([]);
const appointments = ref([]);
const user = computed(() => store.getters.user);
const showInviteModal = ref(false);
const inviteEmail = ref("");
const selectedCategory = ref(null);
const maxHeartCount = ref(0);
const showMapListModal = ref(false);
// 카테고리와 관련된 데이터 정의
const categoryMap = ref({
  SPOT: "명소",
  RESTAURANT: "식당",
  CAFE: "카페",
  ETC: "기타",
});

const categoryColors = ref({
  SPOT: [255, 182, 193],
  CAFE: [255, 180, 110],
  RESTAURANT: [173, 216, 230],
  ETC: [192, 192, 192],
});

// Calculate max heart count
onMounted(() => {
  maxHeartCount.value = Math.max(...tasks.value.map((task) => task.heartCount), 1);
});

function getStyle(category, heartCount) {
  const baseColor = categoryColors.value[category] || categoryColors.value["ETC"];
  const minFactor = 0.9;
  const maxFactor = 1.3;
  const lightnessFactor =
    maxFactor - (heartCount / maxHeartCount.value) * (maxFactor - minFactor);
  const [r, g, b] = baseColor.map((c) => Math.round(c * lightnessFactor));
  return {
    backgroundColor: `rgb(${r}, ${g}, ${b})`,
    padding: "20px",
    margin: "10px 0",
    borderRadius: "10px",
    color: "#000",
  };
}

onMounted(async () => {
  try {
    console.log("Fetching project details...");
    await store.dispatch("fetchProjectDetail", projectId);
    projectDetail.value = store.getters.projectDetail;
    console.log("Project Detail Data:", projectDetail.value);

    if (projectDetail.value) {
      const startTravel = new Date(projectDetail.value.startTravel);
      const endTravel = new Date(projectDetail.value.endTravel);
      const intervalCount = Math.ceil(
        (endTravel - startTravel + 1) / (1000 * 60 * 60 * 24)
      );

      views.value = [
        { type: "day", intervalCount: intervalCount > 0 ? intervalCount : 1 },
      ];
      currentDate.value = startTravel;
    }
  } catch (error) {
    console.error("Error initializing data:", error);
    if (error.message === "Access Denied") {
      router.push({ name: "AccessDenied" });
    }
  }
  fetchTasks();
  fetchAppointments();
  store.dispatch("fetchUser");
});

async function fetchTasks() {
  try {
    const response = await axios.get(
      `http://localhost:8088/api/v1/project/${projectId}/not/active/block/list`
    );
    tasks.value = response.data.result.map((block) => ({
      id: block.blockId,
      title: block.title,
      content: block.content,
      placeName: block.placeName,
      startTime: block.startTime,
      endTime: block.endTime,
      heartCount: block.heartCount,
      liked: block.isHearted,
      category: block.category, // Assuming block.category exists
    }));
    console.log("tasks data : ", tasks.value);
    maxHeartCount.value = Math.max(...tasks.value.map((task) => task.heartCount), 1);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }
}

async function fetchAppointments() {
  try {
    const response = await axios.get(
      `http://localhost:8088/api/v1/project/${projectId}/active/block/list`
    );
    appointments.value = response.data.result.content.map((block) => ({
      id: block.blockId,
      text: block.title,
      startDate: new Date(block.startTime),
      endDate: new Date(block.endTime),
      allDay: false,
    }));
    console.log("Appointments data:", appointments.value);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
  }
}

async function onAppointmentRemove({ itemData }) {
  console.log("Removing appointment:", itemData);

  const index = appointments.value.indexOf(itemData);

  if (index >= 0) {
    const blockId = itemData.id;
    const originalStartTime = itemData.startDate.toISOString();
    const originalEndTime = itemData.endDate.toISOString();
    const blockTitle = itemData.title;

    try {
      const response = await axios.patch(
        `${process.env.VUE_APP_API_BASE_URL}/api/v1/block/${blockId}/not/active`,
        {
          blockId: blockId,
          text: blockTitle,
          startTime: originalStartTime,
          endTime: originalEndTime,
        }
      );

      console.log("API Response:", response);

      appointments.value = [...appointments.value];
      appointments.value.splice(index, 1);
      tasks.value = [...tasks.value, itemData];

      fetchTasks();
    } catch (error) {
      console.error("Failed to Remove block:", error);
    }
  }
}

async function onAppointmentAdd(e) {
  console.log("Before add tv :", tasks.value);
  console.log("Before add av :", appointments.value);
  console.log("e.itemData.blockId", e.itemData.id);

  if (e.fromData) {
    const index = tasks.value.indexOf(e.fromData);

    if (index >= 0) {
      const blockId = e.itemData.id;
      const originalStartTime = e.itemData.startDate;
      const originalEndTime = e.itemData.endDate;
      const title = e.itemData.title;

      const response = await axios.patch(
        `${process.env.VUE_APP_API_BASE_URL}/api/v1/block/addDate`,
        {
          blockId: blockId,
          title: title,
          startTime: originalStartTime.toISOString(),
          endTime: originalEndTime.toISOString(),
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
  const appointmentId = updatedAppointment.id;
  const updateStartTime = updatedAppointment.startDate.toISOString();
  const updateEndTime = updatedAppointment.endDate.toISOString();

  try {
    await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/api/v1/block/addDate`, {
      blockId: appointmentId,
      startTime: updateStartTime,
      endTime: updateEndTime,
    });
    console.log("Success!");
  } catch (e) {
    console.error("Failed to update ", e);
  }
}

async function confirmDeletion() {
  try {
    await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/project/${projectId}`);
    router.go();
  } catch (e) {
    console.log(e);
  } finally {
    closeDialog();
  }
}

function onListDragStart(e) {
  e.cancel = true;
}

function onItemDragStart(e) {
  e.itemData = e.fromData;
}

function onItemDragEnd(e) {
  if (e.toData) {
    e.cancel = true;
  }
}

function openModal() {
  dialog.value = true;

}
function closeDialog() {
  dialog.value = false;
}

function closeInviteModal() {
  showInviteModal.value = false;
}

async function inviteMembers() {
  const newMemberEmail = inviteEmail.value;
  const inviterName = user.value.userName;
  try {
    await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/project/invite`, {
      projectId: projectId,
      email: newMemberEmail,
      inviterName: inviterName,
    });

    alert("초대가 성공적으로 완료되었습니다.");
    showInviteModal.value = false;
  } catch (error) {
    if (
      error.response &&
      error.response.data.status_message === "Member already exists."
    ) {
      alert("이 사용자는 이미 프로젝트에 속해 있습니다.");
    } else {
      alert("초대 중 오류가 발생했습니다: " + error.response.data.status_message);
    }
  }

  console.log("Inviting:", newMemberEmail);
}

const sortedFilteredDataSource = computed(() => {
  let filteredTasks = tasks.value;

  // 필터링
  if (selectedCategory.value) {
    filteredTasks = filteredTasks.filter(
      (task) => task.category === selectedCategory.value
    );
  }

  // 정렬: 좋아요 수를 기준으로 내림차순
  return filteredTasks.sort((a, b) => b.heartCount - a.heartCount);
});

let originalTasks = [...tasks.value];

async function filterByCategory(category) {
  // 선택한 카테고리 업데이트
  if (selectedCategory.value === category) {
    selectedCategory.value = null;
  } else {
    selectedCategory.value = category;
  }

  // 클라이언트 측에서 필터링
  if (selectedCategory.value) {
    tasks.value = originalTasks.filter((task) => task.category === selectedCategory.value);
  } else {
    // 선택된 카테고리가 없으면 모든 태스크 표시
    await fetchTasks(); // 전체 데이터 다시 가져오기
    originalTasks = [...tasks.value];
  }
}

function toggleLike(block) {
  console.log("좋아요 토글 대상 블록:", block);
  block.liked = !block.liked;
  block.heartCount += block.liked ? 1 : -1;

  axios
    .post(
      `http://localhost:8088/api/v1/block/${block.id}/heart`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    .then((response) => {
      console.log("좋아요 업데이트 성공:", response);
    })
    .catch((error) => {
      console.error("좋아요 업데이트 중 오류 발생:", error);
      // API 호출 실패 시 로컬 상태를 원래대로 복구
      block.liked = !block.liked;
      block.heartCount += block.liked ? 1 : -1;
    });
}

async function createBlock() {
  try {
    // 선택된 카테고리 값을 사용하거나, 없으면 기본값 "ETC" 사용
    const categoryToUse = selectedCategory.value || 'ETC';

    // 요청 본문 데이터
    const requestBody = {
      projectId: projectId,
      category: categoryToUse,
    };

    const response = await axios.post('http://localhost:8088/api/v1/block/create', requestBody);

    // 성공 시 처리
    tasks.value.push(response.data);
    fetchTasks();
  } catch (error) {
    console.error('블럭 생성 중 에러 발생:', error);
  }
}


function onAppointmentFormOpening(e) {
  const blockId = e.appointmentData.id;

  // 해당 일정의 상세 페이지로 라우팅
  router.push({ name: "BlockBoard", params: { blockId: blockId } });

  // 폼 열림을 취소합니다.
  e.cancel = true;
}

function goToBlockBoard(blockId) {
  console.log("Navigating to block with ID:", blockId); // blockId 출력
  router.push({ name: "BlockBoard", params: { blockId: blockId } });
}


// SSE 연결 설정
let eventSource;

function connectSSE() {
  const eventSource = new EventSourcePolyfill(
    `${process.env.VUE_APP_API_BASE_URL}/api/notifications/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  eventSource.onopen = function () {
    console.log("SSE connection opened");
  };

  eventSource.addEventListener('connected', (event) => {
    console.log("SSE connected:", event);
  });

  eventSource.addEventListener('message', (event) => {
    const notificationMessage = event.data;
    displayNotification(notificationMessage);
    router.go(0);
  });

  // eventSource.onmessage = function (event) {
  //   const notificationMessage = event.data;
  //   displayNotification(notificationMessage);
  //
  //   window.location.reload();
  // };

  eventSource.onerror = function (error) {
    console.error("SSE connection error:", error);
    // 필요에 따라 재연결 로직을 추가할 수 있음
  };
}

// 알림을 표시하는 함수 (예시로 콘솔에 출력)
function displayNotification(message) {
  console.log("New notification received:", message);
  // 이곳에서 UI에 알림을 표시하는 로직을 추가할 수 있음
}

function handleBeforeUnload() {
  if (eventSource) {
    eventSource.close(); // 페이지가 언로드되기 전에 SSE 연결을 종료
    console.log("SSE connection closed due to page unload");
  }
}

function loadStylesheet() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn3.devexpress.com/jslib/24.1.4/css/dx.fluent.saas.light.css";
  document.head.appendChild(link);
}
onMounted(() => {
  connectSSE(); // 컴포넌트가 마운트될 때 SSE 연결 설정
  loadStylesheet();
});
onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close(); // 컴포넌트 언마운트 시에도 SSE 연결 종료
    console.log("SSE connection closed due to component unmount");
  }

  window.removeEventListener('beforeunload', handleBeforeUnload);
});

const menuOpen = ref(false);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

</script>

<style scoped>
.projectHeader {
  display: flex;
  justify-content: space-between;
  /* 제목과 버튼들을 양쪽 끝으로 정렬 */
  align-items: center;
  /* 수직 중앙 정렬 */
  padding: 20px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 58vw;
}

.left-section {
  display: flex;
  align-items: center;
  /* 왼쪽 요소들이 서로 붙어서 정렬되도록 설정 */
}

.right-section {
  position: relative;
  align-items: center;
}

.project-title {
  font-size: 40px;
  margin: 0;
}

.project-location {
  display: flex;
  align-items: center;
}

.scheduler-row {
  margin-top: 30px;
}

.avatar-container {
  display: flex;
  align-items: center;
}

.more-vert {
  cursor: pointer;
}

.modal-menu {
  position: absolute;
  top: 100%;
  /* 부모 요소의 아래쪽에 위치 */
  left: 0;
  /* 부모 요소와 왼쪽 정렬 */
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.modal-menu .menu-item {
  padding: 10px 20px;
  cursor: pointer;
}

.modal-menu .menu-item:hover {
  background-color: #f5f5f5;
}

#scheduler {
  width: 58vw;
}

.projectScheduler {
  flex: 1;
  margin: 20px 0;
}

.block-list {
  height: 50vh;
  background-color: white;
  /* 회색 배경을 흰색으로 변경 */
  overflow-y: auto;
}

.projectBlockList {
  display: flex;
  flex-direction: column;
  /* 세로 방향으로 정렬 */
  align-items: center;
  width: 450px;
  height: 100vh;
  position: absolute;
  top: 0;
  right: 0;
  background-color: white;
  padding: 100px 30px 0 30px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.item {
  position: relative;
  /* 부모 요소를 상대 위치로 설정 */
  width: 320px;
  height: 80px;
  color: #333;
  /* 텍스트 색상을 어두운 회색으로 변경 */
  background-color: #f5f5f5;
  /* 카드 배경을 밝은 회색으로 변경 */
  box-sizing: border-box;
  padding: 10px;
  margin-bottom: 10px;
  text-align: center;
  border-radius: 5px;
  cursor: grab;
}

.dx-draggable-source {
  opacity: 0.5;
}

.dx-draggable-dragging>* {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 6px 8px rgba(0, 0, 0, 0.2);
}

.category-buttons-wrapper {
  display: flex;
  justify-content: center;
  /* 수평 중앙 정렬 */
  align-items: center;
  /* 수직 중앙 정렬 */
}

.category-buttons {
  display: flex;
  /* 버튼들을 수평으로 배치 */
  gap: 5px;
  /* 버튼 간의 간격 */
}

.category-buttons .v-btn {
  margin: 0 5px;
}

.block-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.block-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.block-title {
  font-weight: bold;
  text-align: left;
  /* 왼쪽 정렬 */
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.block-location {
  font-size: 13px;
}

.block-heart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  /* block-heart와 block-title 사이의 간격 */
  width: auto;
  /* block-heart의 너비를 고정 */
}

.block-heart v-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  /* 아이콘 크기 조정 */
}

.heart-count {
  margin-top: 2px;
  /* 하트 아이콘과 카운트 사이의 간격 */
  font-size: 12px;
  color: #444;
  font-weight: bold;
  text-align: center;
  left: 2;
}

.create-button {
  margin-top: 10px;
  width: 80%;
}

.edit-block {
  color: #444;
  padding: 5px 5px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-left: auto;
}

.invite-btn,
.delete-btn {
  padding: 12px 24px;
  border-radius: 30px;
  background: linear-gradient(45deg, #42a5f5, #478ed1);
  color: white;
  font-weight: bold;
  font-size: 16px;
  transition: background 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.invite-btn:hover {
  background: linear-gradient(45deg, #1e88e5, #2979ff);
}

.delete-btn {
  background: linear-gradient(45deg, #e57373, #ef5350);
  /* 기본 빨간색 배경 */
}

.delete-btn:hover {
  background: linear-gradient(45deg, #d32f2f, #c62828);
}

.v-icon {
  margin-right: 8px;
}

.block-date {
  position: absolute;
  bottom: 5px;
  /* 하단에서 5px 위로 이동 */
  right: 10px;
  /* 우측에서 10px 왼쪽으로 이동 */
  font-size: 12px;
  /* 날짜 텍스트 크기를 작게 설정 */
  color: black;
  /* 날짜 텍스트 색상을 회색으로 설정 */
  white-space: nowrap;
  /* 텍스트가 줄바꿈되지 않도록 설정 */
  font-weight: bold;
}

.place-name {
  position: absolute;
  bottom: 27px;
  /* 하단에서 5px 위로 이동 */
  right: 10px;
  /* 우측에서 10px 왼쪽으로 이동 */
  font-size: 12px;
  /* 날짜 텍스트 크기를 작게 설정 */
  color: black;
  /* 날짜 텍스트 색상을 회색으로 설정 */
  white-space: nowrap;
  /* 텍스트가 줄바꿈되지 않도록 설정 */
  font-weight: bold;
}

.empty-list {
  min-height: 100px;
  /* 높이를 늘려 더 큰 드롭 영역 확보 */
  background-color: #f5f5f5;
  /* 배경색을 추가하여 눈에 잘 띄게 */
  border: 2px dashed #ccc;
  /* 시각적인 구분을 위해 테두리 추가 */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 16px;
  color: #666;
  position: relative;
  /* 정적 위치를 유지하여 클릭해도 움직이지 않도록 */
  cursor: default;
  /* 기본 커서로 설정하여 드래그되지 않도록 */
  user-select: none;
  /* 텍스트가 선택되지 않도록 */
  pointer-events: none;
  /* 클릭 이벤트 무시 */
  -webkit-user-drag: none;
  /* 드래그 방지 */
}
</style>
