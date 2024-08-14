<template>
  <v-app>
    <v-container>
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
import { ref, onMounted } from "vue";
import axios from "axios";
import DxScheduler, { DxAppointmentDragging } from "devextreme-vue/scheduler";
import DxDraggable from "devextreme-vue/draggable";
import DxScrollView from "devextreme-vue/scroll-view";

const draggingGroupName = ref("appointmentsGroup");
const views = ref([{ type: "day", intervalCount: 3 }]);
const currentDate = ref(new Date(2024, 7, 5));
const tasks = ref([]);
const appointments = ref([]);

const projectId = 1; // 여기에 실제 프로젝트 ID를 설정하세요

async function fetchTasks() {
  try {
    const response = await axios.get(
      `http://localhost:8088/api/v1/project/${projectId}/not/active/block/list`
    );
    tasks.value = response.data.result.content.map((block) => ({
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

onMounted(() => {
  loadStylesheet();
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
