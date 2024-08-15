import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    projectDetail: null,
  },
  mutations: {
    setProjectDetail(state, detail) {
      state.projectDetail = detail;
    },
  },
  actions: {
    async fetchProjectDetail({ commit }, projectId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8088/api/v1/project/${projectId}/detail`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        commit("setProjectDetail", response.data.result);
      } catch (error) {
        console.error("Error fetching project detail:", error);
      }
    },
  },
  getters: {
    projectDetail(state) {
      return state.projectDetail;
    },
  },
});
