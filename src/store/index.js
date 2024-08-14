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
  },
  getters: {
    projectDetail(state) {
      return state.projectDetail;
    },
  },
});
