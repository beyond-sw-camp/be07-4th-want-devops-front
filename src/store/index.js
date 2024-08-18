import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    projectDetail: null,
    user: null,
  },
  mutations: {
    setProjectDetail(state, detail) {
      state.projectDetail = detail;
    },
    setUser(state, user) {
      state.user = user;
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
        const filteredDetail = {
          ...response.data.result,
          projectMembers: response.data.result.projectMembers.filter(
            (member) => member.isExist === "Y"
          ),
        };
        commit("setProjectDetail", filteredDetail);
      } catch (error) {
        throw new Error("Access Denied");
      }
    },
    async fetchUser({ commit }) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8088/member/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response); // 응답 데이터 전체를 출력하여 구조 확인

        if (response.data) {
          const user = {
            initials: response.data.name ? response.data.name.charAt(0) : "",
            fullName: response.data.name || "Unknown User",
            email: response.data.email || "No email provided",
            profileUrl: response.data.profile_url || "",
          };
          commit("setUser", user);
        } else {
          console.error("No user data found in the response.");
          commit("setUser", null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        commit("setUser", null); // 오류 시에도 기본값 설정
      }
    },
  },
  getters: {
    projectDetail(state) {
      return state.projectDetail;
    },
    user(state) {
      return state.user || {};
    },
  },
});
