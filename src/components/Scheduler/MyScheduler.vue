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


          <div class="d-flex align-center mr-3" >
            <v-btn class="map-btn" elevation="0" variant="text" @click="showMapListModal = true">
              <img src="@/assets/img/googleMap.png" alt="Google Map" style="height: 40px;">
            </v-btn>
            <CustomModal v-model:modelValue="showMapListModal">
              <GoogleMapList :projectId="projectId"/>
            </CustomModal>
            <h4 class="project-location" v-if="projectDetail.projectStates.length">
              &lt;{{ projectDetail.projectStates[0].city }},
              {{ projectDetail.projectStates[0].country }}&gt;
            </h4>
            <h4 class="project-location" v-else>&lt;여행지: 미정&gt;</h4>
            <!--            <button @click="showMapListModal = true">Show Google List Map</button>-->
          </div>

          <v-dialog v-model="dialog" max-width="500">
            <v-card class="elevation-3" style="border-radius: 16px">
              <!-- 헤더 부분 -->
              <v-card-title
                  class="text-h5"
                  style="
                  background-color: #37474f;
                  color: white;
                  border-top-left-radius: 16px;
                  border-top-right-radius: 16px;
                "
              >
                <v-row align="center">
                  <v-col cols="10"> 팀 탈퇴</v-col>
                  <v-col cols="2" class="text-right">
                    <v-btn
                        icon
                        @click="closeDialog"
                        class="white--text"
                        style="padding: 0"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-title>

              <v-card-text style="padding: 24px">
                <!-- 경고 메시지 부분 -->
                <v-row
                    class="align-center"
                    style="background-color: #ffebee; padding: 16px; border-radius: 8px"
                >
                  <v-icon color="red" size="36">mdi-alert-circle-outline</v-icon>
                  <p class="text-h6 ml-2" style="margin-top: 15px; color: #616161">
                    정말 팀을 <strong style="color: #d32f2f">탈퇴</strong> 하시겠습니까?
                  </p>
                </v-row>

                <v-divider class="my-4"></v-divider>

                <!-- 주의사항 문구 부분 -->
                <v-row>
                  <v-col>
                    <div
                        style="background-color: #f5f5f5; padding: 16px; border-radius: 8px"
                    >
                      <v-row align="center">
                        <v-col cols="1" class="text-center">
                          <v-icon color=" #d32f2f">mdi-alert-outline</v-icon>
                        </v-col>
                        <v-col cols="11" class="d-flex align-center">
                          <p style="margin: 0; color: #616161">
                            팀원일 경우 생성했던 블록은 사라지지 않고,<br/>
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
                  <strong>주의사항을 확인 하셨으면 동의를 눌러주세요.</strong>
                </p>
              </v-card-text>

              <!-- 동의 버튼 부분 -->
              <v-card-actions class="justify-center" style="padding-bottom: 24px">
                <v-btn
                    @click="confirmDeletion"
                    style="
                    background-color: #d32f2f;
                    color: white;
                    font-size: 18px;
                    height: 56px;
                    width: 160px;
                    border-radius: 28px;
                  "
                >
                  동의
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-avatar
              v-for="member in projectDetail.projectMembers"
              :key="member.userId"
              class="ma-2"
              size="large"
          >
            <img :src="member.userProfile" alt="User profile"/>
          </v-avatar>

          <v-btn
              class="ml-3 invite-btn"
              color="primary"
              @click="showInviteModal = true"
              elevation="5"
          >
            <v-icon left size="28">mdi-account-plus</v-icon>
            초대
          </v-btn>

          <v-btn
              class="ml-3 delete-btn"
              color="error"
              @click="openModal"
              elevation="5"
              style="margin-top: -20px"
          >
            <v-icon left size="28">mdi-account-remove</v-icon>
            탈퇴
          </v-btn>

          <!-- Invite Modal -->
          <v-dialog v-model="showInviteModal" persistent max-width="400px">
            <v-card>
              <v-card-title class="headline">사용자 초대</v-card-title>
              <v-card-text>
                초대할 사용자의 이메일을 입력해주세요
                <v-text-field
                    v-model="inviteEmail"
                    label="이메일"
                    required
                ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="showInviteModal = false"
                >취소
                </v-btn
                >
                <v-btn color="blue darken-1" text @click="inviteMembers">초대</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>

      <!-- Scheduler and Block List -->
      <v-row class="scheduler-row">
        <v-col cols="8">
          <DxScheduler
              time-zone="Asia/Seoul"
              id="scheduler"
              :data-source="appointments"
              :current-date="currentDate"
              :views="views"
              :height="600"
              :start-day-hour="1"
              :end-day-hour="23"
              :editing="true"
              :on-appointment-updated="onAppointmentUpdated"
              :show-all-day-panel="false"
              @appointment-form-opening="onAppointmentFormOpening"
          >
            <DxAppointmentDragging
                :group="draggingGroupName"
                :on-remove="onAppointmentRemove"
                :on-add="onAppointmentAdd"
            />
            <DxEditing :allow-updating="allowUpdating"/>
            <DxScrolling mode="virtual"/>
          </DxScheduler>
        </v-col>
        <v-col cols="4" class="block-list" style="height: 600px">
          <!-- 카테고리 버튼 : 누르면 해당 카테고리만, 다시 누르면 전체 조회. -->
          <div class="category-buttons-wrapper">
            <div class="category-buttons">
              <v-btn
                  v-for="(color, category) in categoryColors"
                  :key="category"
                  :style="{ backgroundColor: `rgb(${color.join(',')})`, color: '#fff' }"
                  @click="filterByCategory(category)"
              >
                #{{ categoryMap[category] }}
              </v-btn>
            </div>
          </div>

          <DxScrollView id="scroll">
            <DxDraggable
                id="list"
                :group="draggingGroupName"
                :on-drag-start="onListDragStart"
                style="height: 5px"
            >
              <DxDraggable
                  v-for="task in sortedFilteredDataSource"
                  :style="getStyle(task.category, task.heartCount)"
                  :key="task.blockId"
                  :clone="true"
                  :group="draggingGroupName"
                  :data="task"
                  :on-drag-start="onItemDragStart"
                  :on-drag-end="onItemDragEnd"
                  class="item"
              >
                <v-btn
                    icon="mdi-dots-horizontal"
                    variant="text"
                    class="enter-button"
                    color="black"
                    @click="() => goToBlockBoard(task.id)"
                ></v-btn>
                <div class="block-title">
                  {{ task.title }}
                </div>
                <div class="block-date">
                  {{ formatDate(task.startTime) }} ~ {{ formatDate(task.endTime) }}
                </div>
                <div class="place-name">
                  {{ task.placeName }}
                </div>
                <div class="block-heart">
                  <v-icon @click.stop="toggleLike(task)">
                    <template v-if="task.liked"> mdi-heart</template>
                    <template v-else> mdi-heart-outline</template>
                  </v-icon>
                  <span class="heart-count">{{ task.heartCount }}</span>
                </div>
              </DxDraggable>
            </DxDraggable>
          </DxScrollView>

          <!-- Block 생성 버튼 -->
          <v-btn @click="createTemporaryBlock" color="primary" class="create-button"
          >블럭 생성
          </v-btn
          >
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, computed} from "vue";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import axios from "axios";
import DxScheduler, {
  DxAppointmentDragging,
  DxScrolling,
} from "devextreme-vue/scheduler";
import DxDraggable from "devextreme-vue/draggable";
import DxScrollView from "devextreme-vue/scroll-view";
import CustomModal from "@/components/CustomModal.vue";
import GoogleMapList from "@/components/GoogleMapList.vue";
import {EventSourcePolyfill} from "event-source-polyfill";

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
        {type: "day", intervalCount: intervalCount > 0 ? intervalCount : 1},
      ];
      currentDate.value = startTravel;
    }
  } catch (error) {
    console.error("Error initializing data:", error);
    if (error.message === "Access Denied") {
      router.push({name: "AccessDenied"});
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

async function onAppointmentRemove({itemData}) {
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

async function filterByCategory(category) {
  // 선택한 카테고리 업데이트
  if (selectedCategory.value === category) {
    selectedCategory.value = null;
  } else {
    selectedCategory.value = category;
  }

  // 데이터 필터링
  if (!tasks.value.length) {
    await fetchTasks(); // 태스크가 없는 경우에만 데이터 가져오기
  }

  // 클라이언트 측에서 필터링
  if (selectedCategory.value) {
    tasks.value = tasks.value.filter((task) => task.category === selectedCategory.value);
  } else {
    // 선택된 카테고리가 없으면 모든 태스크 표시
    await fetchTasks(); // 전체 데이터 다시 가져오기
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

function createTemporaryBlock() {
  const newBlock = {
    id: `temp-${Date.now()}`,
    title: "새 블럭",
    projectId: projectId,
    category: "",
    heartCount: 0,
    liked: false,
  };
  tasks.value.push(newBlock);
}

function onAppointmentFormOpening(e) {
  const blockId = e.appointmentData.id;

  // 해당 일정의 상세 페이지로 라우팅
  router.push({name: "BlockBoard", params: {blockId: blockId}});

  // 폼 열림을 취소합니다.
  e.cancel = true;
}

function goToBlockBoard(blockId) {
  console.log("Navigating to block with ID:", blockId); // blockId 출력
  router.push({name: "BlockBoard", params: {blockId: blockId}});
}

function formatDate(dateTime) {
  const dateObj = new Date(dateTime);
  return dateObj.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
    eventSource.close();
    console.error("SSE connection error:", error);
    // 필요에 따라 재연결 로직을 추가할 수 있음
    connectSSE(); // Reconnect
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

onMounted(() => {
  connectSSE(); // 컴포넌트가 마운트될 때 SSE 연결 설정
});
onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close(); // 컴포넌트 언마운트 시에도 SSE 연결 종료
    console.log("SSE connection closed due to component unmount");
  }

  window.removeEventListener('beforeunload', handleBeforeUnload);
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
  width: 800px;
}

.block-list {
  padding: 20px;
  background-color: white; /* 회색 배경을 흰색으로 변경 */
  overflow-y: auto;
}

.item {
  position: relative; /* 부모 요소를 상대 위치로 설정 */
  width: 100%;
  height: 80px;
  color: #333; /* 텍스트 색상을 어두운 회색으로 변경 */
  background-color: #f5f5f5; /* 카드 배경을 밝은 회색으로 변경 */
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

.dx-draggable-dragging > * {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 6px 8px rgba(0, 0, 0, 0.2);
}

.category-buttons-wrapper {
  margin-bottom: 20px;
}

.category-buttons {
  display: inline-flex;
  justify-content: center;
}

.category-buttons .v-btn {
  margin: 0 5px;
}

.block-title {
  width: fit-content;
  font-weight: bold;
  margin-bottom: 5px;
}

.block-heart {
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5px;
}

.create-button {
  margin-top: 10px;
  width: 100%;
}

.enter-button {
  position: absolute; /* 버튼을 절대 위치로 설정 */
  top: -5px; /* 상단에서 10px 떨어진 위치 */
  right: 10px; /* 오른쪽에서 10px 떨어진 위치 */
  color: white; /* 버튼 텍스트 색상 */
  padding: 5px 5px; /* 버튼 패딩 */
  border: none; /* 버튼 테두리 제거 */
  border-radius: 3px; /* 버튼 모서리 둥글게 */
  cursor: pointer; /* 커서 포인터 설정 */
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
  background: linear-gradient(45deg, #e57373, #ef5350); /* 기본 빨간색 배경 */
}

.delete-btn:hover {
  background: linear-gradient(45deg, #d32f2f, #c62828);
}

.v-icon {
  margin-right: 8px;
}

.block-date {
  position: absolute;
  bottom: 5px; /* 하단에서 5px 위로 이동 */
  right: 10px; /* 우측에서 10px 왼쪽으로 이동 */
  font-size: 12px; /* 날짜 텍스트 크기를 작게 설정 */
  color: black; /* 날짜 텍스트 색상을 회색으로 설정 */
  white-space: nowrap; /* 텍스트가 줄바꿈되지 않도록 설정 */
  font-weight: bold;
}

.place-name {
  position: absolute;
  bottom: 27px; /* 하단에서 5px 위로 이동 */
  right: 10px; /* 우측에서 10px 왼쪽으로 이동 */
  font-size: 12px; /* 날짜 텍스트 크기를 작게 설정 */
  color: black; /* 날짜 텍스트 색상을 회색으로 설정 */
  white-space: nowrap; /* 텍스트가 줄바꿈되지 않도록 설정 */
  font-weight: bold;
}
</style>
