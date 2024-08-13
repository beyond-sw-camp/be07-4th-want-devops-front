import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    projectDetail: null,
    tasks: [],
    appointments: [],
  },
  mutations: {
    setProjectDetail(state, detail) {
      state.projectDetail = detail;
    },
    setTasks(state, tasks) {
      state.tasks = tasks; // 블록 리스트 상태 업데이트
    },
    setAppointments(state, appointments) {
      state.appointments = appointments;
    },
  },
  actions: {
    async fetchProjectDetail({ commit }, projectId) {
      try {
        const token = localStorage.getItem("token"); // 로컬스토리지에서 토큰 가져오기
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/v1/project/detail/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
          }
        );
        commit("setProjectDetail", response.data.result);
      } catch (error) {
        console.error("Error fetching project detail:", error);
      }
    },

    async fetchTasks({ commit }, projectId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/v1/project/${projectId}/not/active/block/list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.result && response.data.result.content) {
          const tasks = response.data.result.content.map((block) => ({
            blockId: block.blockId,
            title: block.title,
            placeName: block.placeName,
            heartCount: block.heartCount,
            isActivated: block.isActivated,
            startTime: new Date(block.startTime),
            endTime: new Date(block.endTime),
          }));
          commit("setTasks", tasks);
          return tasks;
        } else {
          console.error("Invalid response structure:", response.data);
          return [];
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }
    },

    async fetchAppointments({ commit }, projectId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/v1/project/${projectId}/active/block/list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.result && response.data.result.content) {
          const appointments = response.data.result.content.map((block) => ({
            blockId: block.blockId,
            title: block.title,
            placeName: block.placeName,
            heartCount: block.heartCount,
            isActivated: block.isActivated,
            startTime: new Date(block.startTime),
            endTime: new Date(block.endTime),
          }));
          commit("setAppointments", appointments);
          return appointments;
        } else {
          console.error("Invalid response structure:", response.data);
          return [];
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }
    },
  },

  getters: {
    projectDetail(state) {
      return state.projectDetail;
    },
    tasks(state) {
      return state.tasks;
    },
    appointments(state) {
      return state.appointments;
    },
  },
});
