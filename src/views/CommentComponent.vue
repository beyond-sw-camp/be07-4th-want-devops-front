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

              <v-card class="mx-auto" max-width="425">
                <v-list
                    lines="two"
                    style="max-height: 300px; overflow-y: auto;"
                    @scroll.passive="handleScroll"
                    ref="commentList"
                >
                  <v-list-subheader>댓글</v-list-subheader>

                  <!-- 댓글이 없을 때 -->
                  <template v-if="comments.length === 0">
                    <v-list-item>
                      <v-list-item-content>
                        댓글 없음
                      </v-list-item-content>
                    </v-list-item>
                  </template>

                  <!-- 댓글이 있을 때 -->
                  <template v-else>
                    <v-list-item
                        v-for="comment in comments"
                        :key="comment.id"
                        :prepend-avatar="comment.memberProfile"
                    >
                      <template v-slot:title>
                        {{ comment.memberName }} &mdash; {{ formatDate(comment.createdTime) }}
                      </template>
                      <div>
                        <div class="comment-text">{{ comment.contents }}</div>
                      </div>
                    </v-list-item>
                  </template>

                  <!-- 로딩 스피너 표시 -->
                  <v-progress-circular
                      v-if="loading"
                      indeterminate
                      color="primary"
                      class="d-flex justify-center mt-2"
                  ></v-progress-circular>
                </v-list>
              </v-card>

              <v-card-subtitle>
                <v-form ref="commentForm" v-model="valid" @submit.prevent="submitComment">
                  <v-textarea
                      v-model="newComment"
                      label="댓글 작성"
                      rows="3"
                      required
                      auto-grow
                  ></v-textarea>
                  <v-btn type="submit" color="primary" class="mt-2">댓글 달기</v-btn>
                </v-form>
              </v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>

        <!-- 블록 업데이트 폼 -->
        <v-card>
          <v-card-title>
            <span class="headline">블록 업데이트</span>
          </v-card-title>
          <v-card-subtitle>
            <v-form ref="form" v-model="valid" @submit.prevent="updateBlock">
              <v-text-field v-model="localBlock.title" label="제목" required />
              <v-text-field v-model="localBlock.category" label="카테고리" required />
              <v-textarea v-model="localBlock.content" label="내용" />
              <div>
                <v-btn @click="showMapModal = true" color="primary">구글 맵 보기</v-btn>
                <CustomModal v-model:modelValue="showMapModal">
                  <GoogleMap @place-selected="handlePlaceSelected" />
                </CustomModal>
              </div>
              <v-text-field v-model="localBlock.placeName" label="장소 이름" />
              <v-menu v-model="startDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="localBlock.startTime" label="시작 시간" readonly v-bind="attrs" v-on="on" />
                </template>
                <v-date-picker v-model="localBlock.startTime" @input="startDateMenu = false" />
              </v-menu>
              <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="localBlock.endTime" label="종료 시간" readonly v-bind="attrs" v-on="on" />
                </template>
                <v-date-picker v-model="localBlock.endTime" @input="endDateMenu = false" />
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
import axios from "axios";
import GoogleMap from "@/components/GoogleMap.vue";
import CustomModal from "@/components/CustomModal.vue";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  components: { CustomModal, GoogleMap },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const showMapModal = ref(false);
    const localBlock = ref({
      title: "",
      category: "",
      content: "",
      placeName: "",
      imageUrl: "",
      likes: 0,
      comments: null,
      liked: false,
      startTime: null,
      endTime: null,
    });
    const comments = ref([]); // 댓글 리스트
    const newComment = ref(""); // 새로운 댓글
    const loading = ref(false); // 로딩 상태 관리
    const currentPage = ref(0); // 현재 페이지 번호
    const hasNext = ref(true); // 다음 페이지 여부
    const commentList = ref(null); // 댓글 리스트 DOM 요소 참조

    const valid = ref(true);
    const startDateMenu = ref(false);
    const endDateMenu = ref(false);
    const selectedBlock = ref(null);

    const categoryMap = {
      SPOT: "명소",
      RESTAURANT: "식당",
      CAFE: "카페",
      ETC: "기타",
    };
    const reverseCategoryMap = {
      명소: "SPOT",
      식당: "RESTAURANT",
      카페: "CAFE",
      기타: "ETC",
    };

    // 댓글 목록을 가져오는 메서드
    const fetchComments = async (loadMore = false) => {
      if (loading.value || !hasNext.value) return; // 로딩 중이거나 다음 페이지가 없으면 중단
      loading.value = true;

      try {
        const blockId = route.params.blockId;
        const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/api/v1/block_comment/list/${blockId}`,
            { params: { page: currentPage.value } }
        );

        const fetchedComments = response.data.result.content;

        if (loadMore) {
          comments.value.push(...fetchedComments); // 새로운 댓글 추가
        } else {
          comments.value = fetchedComments; // 첫 로드
        }

        hasNext.value = response.data.result.hasNext; // 다음 페이지 여부 설정
        currentPage.value += 1; // 페이지 증가
      } catch (error) {
        console.error("댓글을 가져오는 중 오류 발생:", error);
      } finally {
        loading.value = false;
      }
    };

    // 댓글을 서버로 전송하는 메서드
    const submitComment = async () => {
      if (valid.value && newComment.value) {
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/block_comment/create`, {
            blockId: selectedBlock.value,
            contents: newComment.value,
          });
          newComment.value = ""; // 댓글 입력창 초기화
          fetchComments(); // 댓글 목록 다시 가져오기
        } catch (error) {
          console.error("댓글 작성 중 오류 발생:", error);
        }
      }
    };

    // 스크롤 이벤트 처리 메서드
    const handleScroll = () => {
      const list = commentList.value.$el;

      if (list.scrollTop + list.clientHeight >= list.scrollHeight - 10) {
        fetchComments(true); // 더 많은 댓글을 로드
      }
    };

    const formatDate = (dateString) => {
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", options);
    };

    // 페이지 로드 시 데이터 로드
    onMounted(async () => {
      const blockId = route.params.blockId;

      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/block/${blockId}`);
        const blockData = response.data.result;

        localBlock.value = {
          ...blockData,
          category: categoryMap[blockData.category],
        };
        selectedBlock.value = blockData.blockId;

        fetchComments(); // 페이지 로드 시 첫 댓글 목록 가져오기
      } catch (error) {
        console.error("블록 데이터를 가져오는 중 오류 발생:", error);
      }
    });

    // 블록 업데이트 메서드
    const updateBlock = async () => {
      if (valid.value) {
        try {
          const blockId = route.params.blockId;
          const payload = {
            ...localBlock.value,
            category: reverseCategoryMap[localBlock.value.category],
          };
          await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/v1/block/update/${blockId}`, payload);
          router.push(`/block/${blockId}`); // 업데이트 후 페이지 이동
        } catch (error) {
          console.error("블록 업데이트 중 오류 발생:", error);
        }
      }
    };

    // 블록 삭제 메서드
    const deleteBlock = async () => {
      const blockId = route.params.blockId;
      try {
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/block/delete/${blockId}`);
        router.push(`/`); // 삭제 후 메인 페이지로 이동
      } catch (error) {
        console.error("블록 삭제 중 오류 발생:", error);
      }
    };

    // 구글 맵에서 장소 선택 시 처리
    const handlePlaceSelected = (placeName) => {
      localBlock.value.placeName = placeName;
      showMapModal.value = false;
    };

    // 업데이트 취소 메서드
    const cancel = () => {
      router.push(`/block/${route.params.blockId}`);
    };

    return {
      localBlock,
      selectedBlock,
      valid,
      startDateMenu,
      endDateMenu,
      showMapModal,
      submitComment,
      cancel,
      deleteBlock,
      updateBlock,
      handlePlaceSelected,
      comments,
      newComment,
      fetchComments,
      handleScroll,
      formatDate,
      commentList, // 스크롤 관리
    };
  },
};
</script>

<style scoped>
.comment-text {
  white-space: pre-wrap;
}
</style>
