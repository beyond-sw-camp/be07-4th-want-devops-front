<template>
  <div id="demo-container">
    <DxScrollView id="scroll">
      <DxDraggable
          id="list"
          :group="draggingGroupName"
          :on-drag-start="onListDragStart"
          data="dropArea"
      >
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

    <DxScheduler
        time-zone="America/Los_Angeles"
        id="scheduler"
        :data-source="appointments"
        :current-date="currentDate"
        :views="views"
        :height="600"
        :start-day-hour="9"
        :editing="true"
    >
      <DxAppointmentDragging
          :group="draggingGroupName"
          :on-remove="onAppointmentRemove"
          :on-add="onAppointmentAdd"
      />
    </DxScheduler>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import axios from 'axios';
import DxScheduler, {DxAppointmentDragging} from 'devextreme-vue/scheduler';
import DxDraggable from 'devextreme-vue/draggable';
import DxScrollView from 'devextreme-vue/scroll-view';

const draggingGroupName = ref('appointmentsGroup');
const views = ref([{type: 'day', intervalCount: 3}]);
const currentDate = ref(new Date(2021, 3, 26));
const tasks = ref([]);
const appointments = ref([]);

const projectId = 1;  // 여기에 실제 프로젝트 ID를 설정하세요

async function fetchTasks() {
  try {
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/project/${projectId}/not/active/block/list`);
    tasks.value = response.data.result.content.map(block => ({
      blockId: block.blockId,
      title: block.title,
      content: block.content,
      startTime: block.startTime,
      endTime: block.endTime,
      // 필요한 경우 추가 필드를 매핑합니다
    }));
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }
}

async function fetchAppointments() {
  try {
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/project/${projectId}/active/block/list`);
    appointments.value = response.data.result.content.map(block => ({
      text: block.title,
      startDate: new Date(block.startTime),
      endDate: new Date(block.endTime),
      allDay: false, // 필요시 조건에 따라 설정
    }));
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
  }
}

onMounted(() => {
  fetchTasks();
  fetchAppointments();
});

function onAppointmentRemove({itemData}) {
  const index = appointments.value.indexOf(itemData);

  if (index >= 0) {
    appointments.value = [...appointments.value];
    appointments.value.splice(index, 1);
    tasks.value = [...tasks.value, itemData];
  }
}

function onAppointmentAdd(e) {
  const index = tasks.value.indexOf(e.fromData);

  if (index >= 0) {
    tasks.value = [...tasks.value];
    tasks.value.splice(index, 1);
    appointments.value = [...appointments.value, e.itemData];
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
</script>

<style scoped>
#scroll,
#list {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
}

.item {
  color: var(--dx-color-text);
  background-color: var(--dx-component-color-bg);
  box-sizing: border-box;
  padding: 10px 20px;
  margin-bottom: 10px;
}

#scheduler {
  margin-left: 270px;
}

.dx-draggable-source {
  opacity: 0.5;
}

.dx-draggable-dragging > * {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 6px 8px rgba(0, 0, 0, 0.2);
}
</style>
