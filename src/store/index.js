import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    projectDetail: null,
    tasks: [],
  },
  mutations: {
    setProjectDetail(state, detail) {
      state.projectDetail = detail;
    },
    setTasks(state, tasks) {
      state.tasks = tasks; // 블록 리스트 상태 업데이트
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
            startTime: block.startTime,
            endTime: block.endTime,
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
  },
  // 새로운 액션 추가
  //   async updateBlockDates({ commit }, blockId, startTime, endTime) {
  //     try {
  //       // 로그로 현재 값을 확인합니다.
  //       console.log("block Id ", blockId);
  //       console.log("Original Start Time:", startTime);
  //       console.log("Original End Time:", endTime);

  //       const response = await axios.patch(
  //         `${process.env.VUE_APP_API_BASE_URL}/api/v1/block/addDate`,
  //         {
  //           blockId: blockId,
  //           startTime: startTime,
  //           endTime: endTime,
  //         }
  //       );
  //       return response.data.result;
  //     } catch (error) {
  //       console.error("Error updating block dates:", error);
  //       return null;
  //     }
  //   },
  // },
  getters: {
    projectDetail(state) {
      return state.projectDetail;
    },
  },
});
