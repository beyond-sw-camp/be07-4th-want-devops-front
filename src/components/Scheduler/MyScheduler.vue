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

          <!-- 프로필 아바타와 메뉴 -->
          <v-menu min-width="200px" rounded>
            <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props">
                <v-avatar :src="user?.profileUrl || ''" size="large">
                  <span class="text-h5">{{ user?.initials || "" }}</span>
                </v-avatar>
              </v-btn>
            </template>

            <v-card v-if="user">
              <v-card-text>
                <div class="mx-auto text-center">
                  <v-avatar :src="user?.profileUrl || ''">
                    <span class="text-h5">{{ user?.initials || "" }}</span>
                  </v-avatar>
                  <h3>{{ user?.fullName || "Unknown User" }}</h3>
                  <p class="text-caption mt-1">
                    {{ user?.email || "No email provided" }}
                  </p>
                  <v-divider class="my-3"></v-divider>
                  <v-btn variant="text" rounded @click="goToMyPage"> 마이페이지 </v-btn>
                  <v-divider class="my-3"></v-divider>
                  <v-btn variant="text" rounded @click="openModal"> 탈퇴하기 </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>

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
                  <v-col cols="10"> 팀 탈퇴 </v-col>
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
            <img :src="member.userProfile" alt="User profile" />
          </v-avatar>

          <v-btn class="ml-3" color="primary" @click="showInviteModal = true">초대</v-btn>

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
                  >취소</v-btn
                >
                <v-btn color="blue darken-1" text @click="inviteMembers">초대</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
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
            :end-day-hour="23"
            :editing="true"
            :on-appointment-updated="onAppointmentUpdated"
            :show-all-day-panel="false"
          >
            <DxAppointmentDragging
              :group="draggingGroupName"
              :on-remove="onAppointmentRemove"
              :on-add="onAppointmentAdd"
            />
            <DxEditing :allow-updating="allowUpdating" />
            <DxScrolling mode="virtual" />
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
                time-zone="Asia/Seoul"
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
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

import axios from "axios";
import DxScheduler, {
  DxAppointmentDragging,
  DxScrolling,
} from "devextreme-vue/scheduler";
import DxDraggable from "devextreme-vue/draggable";
import DxScrollView from "devextreme-vue/scroll-view";

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

const isLogin = ref(false);
const profileUrl = ref("");

onMounted(async () => {
  try {
    console.log("Fetching project details...");
    try {
      await store.dispatch("fetchProjectDetail", projectId);
    } catch (error) {
      if (error.message === "Access Denied") {
        router.push({ name: "AccessDenied" });
      }
    } // projectId만 전달
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
    }
  } catch (error) {
    console.error("Error initializing data:", error);
  }
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
      startTime: block.startTime,
      endTime: block.endTime,
      // 필요한 경우 추가 필드를 매핑합니다
    }));
    console.log("tasks data : ", tasks.value);
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
      allDay: false, // 필요시 조건에 따라 설정
    }));
    console.log("Appointments data:", appointments.value);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
  }
}

onMounted(() => {
  fetchTasks();
  fetchAppointments();
  store.dispatch("fetchUser");
});

async function onAppointmentRemove({ itemData }) {
  console.log("Removing appointment:", itemData);

  const index = appointments.value.indexOf(itemData);

  if (index >= 0) {
    const blockId = itemData.id;
    console.log("blockId :", blockId);
    const originalStartTime = itemData.startDate.toISOString();
    const originalEndTime = itemData.endDate.toISOString();
    const blockTitle = itemData.title;

    console.log("Sending to server:", {
      blockId,
      originalStartTime,
      originalEndTime,
      blockTitle,
    });
    console.log("itemData: ", itemData);

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
      console.error("Failed to Remomve block:", error);
    }
  }
}

// 끌어다 놓기 O
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
        // tasks에 해당 task가 존재하면
        tasks.value = [...tasks.value]; // tasks를 복사하여 갱신
        tasks.value.splice(index, 1); // tasks에서 해당 task를 제거
        appointments.value = [...appointments.value, e.itemData]; // appointments에 추가
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
  const appoitnmentId = updatedAppointment.id;
  const updateStartTime = updatedAppointment.startDate.toISOString(); // 변경된 시작 시간
  const updateEndTime = updatedAppointment.endDate.toISOString(); // 변경된 시작 시간

  console.log("updatedAppointment : ", updatedAppointment);
  console.log("appoitnmentId : ", appoitnmentId);
  console.log("updateStartTime : ", updateStartTime);
  console.log("updateEndTime : ", updateEndTime);

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

async function confirmDeletion() {
  try {
    await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/project/${projectId}`);
    router.go(); // 현재 페이지를 새로고침
  } catch (e) {
    console.log(e);
  } finally {
    closeDialog(); // 모달 닫기
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

function goToMyPage() {
  // 마이페이지로 이동
  router.push({ name: "MyPage" });
}

function openModal() {
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
}

async function inviteMembers() {
  const newMemberEmail = inviteEmail.value;

  try {
    // 초대 요청을 서버에 보냄
    await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/project/invite`, {
      projectId: projectId, // 현재 프로젝트 ID
      otherMemberEmail: user.value.email, // 초대할 멤버의 이메일
      email: newMemberEmail, // 현재 로그인된 사용자의 이메일
    });

    // 성공 시 사용자에게 알림
    alert("초대가 성공적으로 완료되었습니다.");

    // 모달 닫기
    showInviteModal.value = false;
  } catch (error) {
    // 오류 발생 시 사용자에게 알림
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
  width: 900px;
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
