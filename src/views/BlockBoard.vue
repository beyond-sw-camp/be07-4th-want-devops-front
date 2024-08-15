<template>
  <v-app>
    <v-container>
      <!-- 블록 세부 정보 카드 -->
      <v-card>
        <v-row>
          <!-- 왼쪽: 제목, 장소명, 이미지, 내용 -->
          <v-col cols="8">
            <v-card-title>
              <span class="headline">{{ localBlock.title }}</span>
            </v-card-title>
            <v-card-subtitle>{{ localBlock.placeName }}</v-card-subtitle>
            <v-img :src="localBlock.imageUrl" alt="블록 이미지" class="mb-3"></v-img>
            <v-card-text>{{ localBlock.content }}</v-card-text>
          </v-col>

          <!-- 오른쪽: 카테고리명, 선택한 블록, 좋아요, 댓글 -->
          <v-col cols="4">
            <v-card>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{ localBlock.category }}</v-list-item-title>
                  <v-list-item-subtitle>카테고리명</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>블록 {{ selectedBlock }}</v-list-item-title>
                  <v-list-item-subtitle>선택한 블록</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <v-list-item-content>
                  <v-icon left :color="localBlock.liked ? 'red' : ''">mdi-heart</v-icon>
                  <v-list-item-title>{{ localBlock.likes }} 좋아요</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>

<!--              댓글 구역-->
              <CommentSection :blockId="blockId" />


            </v-card>
          </v-col>
        </v-row>

        <!-- 블록 업데이트 폼 -->
        <!-- BlockDetail 에서 참조할 거 다 가져오면 삭제 예정. BlockDetail 대신 BlockBoard 코드 사용하려 함. -->
        <v-card>
          <v-card-title>
            <span class="headline">블록 업데이트</span>
          </v-card-title>
          <v-card-subtitle>
            <v-form ref="form" v-model="valid" @submit.prevent="updateBlock">
              <v-text-field v-model="localBlock.title" label="제목" required/>
              <v-text-field v-model="localBlock.category" label="카테고리" required/>
              <v-textarea v-model="localBlock.content" label="내용"/>
              <div>
                <v-btn @click="showMapModal = true" color="primary">구글 맵 보기</v-btn>
                <CustomModal v-model:modelValue="showMapModal">
                  <GoogleMap @place-selected="handlePlaceSelected"/>
                </CustomModal>
              </div>
              <v-text-field v-model="localBlock.placeName" label="장소 이름"/>
              <v-menu v-model="startDateMenu" :close-on-content-click="false"
                      transition="scale-transition" offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="localBlock.startTime" label="시작 시간" readonly v-bind="attrs"
                                v-on="on"/>
                </template>
                <v-date-picker v-model="localBlock.startTime" @input="startDateMenu = false"/>
              </v-menu>
              <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition"
                      offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="localBlock.endTime" label="종료 시간" readonly v-bind="attrs"
                                v-on="on"/>
                </template>
                <v-date-picker v-model="localBlock.endTime" @input="endDateMenu = false"/>
              </v-menu>
              <v-btn type="submit" color="primary">저장</v-btn>
              <v-btn @click="cancel" color="secondary">취소</v-btn>
              <v-btn @click="deleteBlock" color="red" class="ml-2">삭제</v-btn>
            </v-form>
          </v-card-subtitle>
        </v-card>
      </v-card>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios';
import GoogleMap from "@/components/GoogleMap.vue";
import CustomModal from "@/components/CustomModal.vue";
import CommentSection from "@/components/CommentSection.vue";
import {ref, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';

export default {
  components: {CustomModal, GoogleMap, CommentSection},
  setup() {
    const route = useRoute();
    const router = useRouter();
    const blockId = ref(route.params.blockId); // 라우터에서 블록 ID를 가져옴
    const showMapModal = ref(false);
    const localBlock = ref({
      title: '',
      category: '',
      content: '',
      placeName: '',
      imageUrl: '',
      likes: 0,
      comments: null, // 초기값을 null로 설정
      liked: false,
      startTime: null,
      endTime: null,
    });

    const valid = ref(true);
    const startDateMenu = ref(false);
    const endDateMenu = ref(false);
    const selectedBlock = ref(null);

    const categoryMap = {
      SPOT: "명소",
      RESTAURANT: "식당",
      CAFE: "카페",
      ETC: "기타"
    };
    const reverseCategoryMap = {
      "명소": "SPOT",
      "식당": "RESTAURANT",
      "카페": "CAFE",
      "기타": "ETC"
    };

    const fetchBlock = async () => {
      try {
        const blockId = route.params.blockId;
        const response = await axios.get(`http://localhost:8088/api/v1/block/${blockId}/detail`);
        const blockData = response.data.result;
        localBlock.value = {
          ...blockData,
          category: categoryMap[blockData.category] || blockData.category,
        };
      } catch (error) {
        console.error('블록 정보를 가져오는 중 오류 발생:', error);
      }
    };

    const updateBlock = async () => {
      if (valid.value) {
        try {
          const categoryInEnglish = reverseCategoryMap[localBlock.value.category] || localBlock.value.category;

          await axios.patch(`http://localhost:8088/api/v1/block/${selectedBlock.value}/update`, {
            ...localBlock.value,
            category: categoryInEnglish
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          alert('블록이 성공적으로 업데이트되었습니다.');
          router.push('/block/main');
        } catch (error) {
          console.error('블록 업데이트 중 오류 발생:', error);
          alert('블록 업데이트 중 오류가 발생했습니다.');
        }
      }
    };

    const cancel = () => {
      router.push('/block/main');
    };

    const deleteBlock = async () => {
      if (confirm('정말로 이 블록을 삭제하시겠습니까?')) {
        try {
          await axios.delete(`http://localhost:8088/api/v1/block/${selectedBlock.value}/delete`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          alert('블록이 성공적으로 삭제되었습니다.');
          router.push('/block/main');
        } catch (error) {
          console.error('블록 삭제 중 오류 발생:', error);
          alert('블록 삭제 중 오류가 발생했습니다.');
        }
      }
    };

    const handlePlaceSelected = (place) => {
      localBlock.value.placeName = place.name;
    };

    onMounted(async () => {
      selectedBlock.value = route.params.blockId;
      await fetchBlock();
    });

    return {
      showMapModal,
      localBlock,
      valid,
      startDateMenu,
      endDateMenu,
      selectedBlock,
      blockId,
      fetchBlock,
      updateBlock,
      cancel,
      deleteBlock,
      handlePlaceSelected,
    };
  },
};
</script>

<style>
.comment-text {
  white-space: pre-wrap; /* 줄바꿈과 공백을 유지 */
  overflow-wrap: break-word; /* 단어가 넘칠 때 줄바꿈 */
  word-wrap: break-word; /* 단어가 넘칠 때 줄바꿈 */
}
</style>
