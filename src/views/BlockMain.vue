<template>
  <v-app>
    <v-container class="fill-height">
      <v-row>
        <v-col cols="12" md="8" class="scheduler-container">
          <!-- devExtreme -->
          <DxScheduler
              :data-source="dataSource"
              :current-date="currentDate"
              :onAppointmentUpdated="onAppointmentUpdated"
              :appointment-template="appointmentTemplate"
              :editing="{ allowUpdating: false, allowDeleting: false, allowAdding: false }"
          />
        </v-col>
        <!-- Block List -->
        <v-col cols="12" md="4" class="block-list" ref="blockList">
          <h2>BLOCK LIST</h2>
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
          <!-- 좋아요 수에 따른 블럭 정렬 -->
          <v-list>
            <v-list-item
                v-for="block in sortedFilteredDataSource"
                :key="block.id"
                :style="getStyle(block.category, block.heartCount)"
                @click="updateBlock(block)"
            >
              <div class="block-title">
                {{ block.title }}
              </div>
              <div class="block-heart">
                <!-- 좋아요 눌린 블럭은 하트 아이콘으로 표시 -->
                <v-icon
                    @click.stop="toggleLike(block)"
                >
                  <!-- 좋아요 상태에 따라 아이콘 변경 -->
                  <template v-if="block.liked">
                    mdi-heart
                  </template>
                  <template v-else>
                    mdi-heart-outline
                  </template>
                </v-icon>
                <!-- 좋아요 수 확인 -->
                <span class="heart-count">{{ block.heartCount }}</span>
              </div>
            </v-list-item>
          </v-list>

          <!-- Block 생성 버튼 -->
          <v-btn @click="createTemporaryBlock" color="primary" class="create-button">블럭 생성</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <FooterComponent/>
  </v-app>
</template>

<script>
import "devextreme/dist/css/dx.light.css";
import {DxScheduler} from "devextreme-vue/scheduler";
import axios from "axios";
import FooterComponent from "@/components/head_and_foot/FooterComponent.vue";
import {mdiHeart, mdiHeartOutline} from '@mdi/js';

export default {
  components: {
    DxScheduler,
    FooterComponent,
  },

  data() {
    return {
      dataSource: [],
      currentDate: new Date(),
      temporaryBlockId: 0,
      selectedBlock: null,
      maxHeartCount: 10,
      pageSize: 10,
      hasMoreData: true,
      dialog: false,
      selectedCategory: null,
      categoryMap: {
        SPOT: "명소",
        RESTAURANT: "식당",
        CAFE: "카페",
        ETC: "기타"
      },
      categoryColors: {
        SPOT: [255, 182, 193],
        CAFE: [255, 180, 110],
        RESTAURANT: [173, 216, 230],
        ETC: [192, 192, 192],
      },
      mdiHeart, // mdi-heart 아이콘 추가
      mdiHeartOutline // mdi-heart-outline 아이콘 추가
    };
  },

  computed: {
    sortedDataSource() {
      return this.dataSource
          ? this.dataSource.slice().sort((a, b) => b.heartCount - a.heartCount)
          : [];
    },
    sortedFilteredDataSource() {
      if (this.selectedCategory === null) {
        return this.sortedDataSource;
      }
      return this.sortedDataSource.filter(
          (block) => block.category === this.selectedCategory
      );
    },
    translatedCategories() {
      return Object.keys(this.categoryMap).map(category => ({
        category,
        label: this.categoryMap[category],
        color: this.categoryColors[category]
      }));
    }
  },

  methods: {
    async fetchData() {
      if (!this.hasMoreData) return;
      try {
        const projectId = 1;
        // 카테고리를 파라미터 형식으로 전달
        const response = await axios.get(
            `http://localhost:8088/api/v1/project/${projectId}/not/active/block/list` );
        const blockList = response.data.result;
        console.log(response);
        if (blockList && Array.isArray(blockList)) {
          // 서버에서 받아온 isHearted 값을 liked로 설정
          this.dataSource = blockList.map(block => ({
            ...block,
            liked: block.isHearted  // 서버에서 받아온 isHearted 값을 liked로 설정
          }));

        // if (blockList && Array.isArray(blockList)) {
        //   this.dataSource = blockList.map(block => ({
        //     ...block,
        //     liked: block.liked || false,  // 서버에서 받은 좋아요 상태를 DB 반영
        //   }));

        } else {
          console.error("잘못된 데이터 형식입니다.");
        }
        this.hasMoreData = false;
      } catch (error) {
        console.error("데이터를 가져오는데 오류가 발생했습니다.");
      }
    },

    async onAppointmentUpdated(e) {
      const updatedBlock = e.appointmentData;
      const url = updatedBlock.active
          ? `/block/addDate`
          : `/block/${updatedBlock.id}/not/active`;
      try {
        await axios.patch(url, updatedBlock);
      } catch (error) {
        console.error("업데이트 중 오류 발생 !");
      }
    },

    createTemporaryBlock() {
      const newBlock = {
        id: `temp-${this.temporaryBlockId++}`,
        title: "새 블럭",
        projectId: "1",
        category: "",
        heartCount: 0,
        liked: false, // 초기 상태 추가
      };
      this.dataSource.push(newBlock);
      this.selectedBlock = {...newBlock};
      this.dialog = true;
    },

    updateBlock(block) {
      this.$router.push({name: 'BlockUpdate', params: {id: block.blockId}});
    },

    async toggleLike(block) {
      const wasLiked = block.liked;
      const newHeartCount = wasLiked ? block.heartCount - 1 : block.heartCount + 1;
      block.liked = !wasLiked;
      block.heartCount = newHeartCount;
      try {
        await axios.post(
            `http://localhost:8088/api/v1/block/${block.blockId}/heart`,
            {}, // 빈 본문으로 요청
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`, // 토큰을 헤더에 포함
              },
            }
        );
      } catch (error) {
        console.error("좋아요 업데이트 중 오류 발생:", error);
        // 업데이트 실패 시 로컬에서 변경 사항 되돌리기
        block.liked = wasLiked;
        block.heartCount = wasLiked ? block.heartCount + 1 : block.heartCount - 1;
      }
    },

    async handleUpdate(updatedBlock) {
      try {
        const response = await axios.patch(
            `http://localhost:8088/api/v1/block/update/${updatedBlock.id}`,
            updatedBlock,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
        );
        if (response.status === 200) {
          alert("블럭이 성공적으로 업데이트되었습니다.");
          this.fetchData(); // 업데이트 후 데이터 새로고침
          this.closeDialog();
        }
      } catch (error) {
        console.error("블럭 업데이트 오류:", error);
        alert("블럭 업데이트 중 오류가 발생했습니다.");
      }
    },

    closeDialog() {
      this.dialog = false;
    },

    appointmentTemplate(data) {
      return {
        template: `<div class="${data.appointmentData.category}" :style="getStyle(data.appointmentData.category, data.appointmentData.heartCount)">${data.appointmentData.name}</div>`,
      };
    },

    getStyle(category, heartCount) {
      const baseColor = this.categoryColors[category] || this.categoryColors["ETC"];
      const minFactor = 0.9;
      const maxFactor = 1.3;
      const lightnessFactor = maxFactor - ((heartCount / this.maxHeartCount) * (maxFactor - minFactor));
      const [r, g, b] = baseColor.map(c => Math.round(c * lightnessFactor));
      return {
        backgroundColor: `rgb(${r}, ${g}, ${b})`,
        padding: "20px",
        margin: "10px 0",
        borderRadius: "5px",
        color: "#000",
      };
    },

    filterByCategory(category) {
      if (this.selectedCategory === category) {
        this.selectedCategory = null;
      } else {
        this.selectedCategory = category;
      }
    },
  },

  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
.scheduler-container {
  padding: 20px;
}

.block-list {
  padding: 20px;
  height: 600px;
  overflow-y: auto;
}

.block-list h2 {
  text-align: center;
}

.block-title {
  width: fit-content;
}

.block-heart {
  width: fit-content;
  float: right;
}

.create-button {
  margin-top: 10px;
  width: 100%;
}

.category-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.category-buttons .v-btn {
  margin: 0 5px;
}

.category-buttons-wrapper {
  overflow-x: auto;
  white-space: nowrap;
  margin-bottom: 20px;
}

.category-buttons {
  display: inline-flex;
}

.category-buttons .v-btn {
  margin: 0 5px;
}
</style>
