<template>
  <v-card class="mx-auto" max-width="425">
    <v-list lines="two" style="max-height: 300px; overflow-y: auto;" ref="commentList">
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
            :key="comment.commentId"
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

      <!-- 로딩 스피너 -->
      <v-list-item v-if="loading" class="text-center">
        <v-list-item-content>
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-list-item-content>
      </v-list-item>

      <!-- 감지용 엘리먼트 -->
      <div ref="observerElement"></div>
    </v-list>

    <!-- 댓글 작성 -->
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
  </v-card>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

export default {
  props: {
    blockId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const comments = ref([]);
    const newComment = ref('');
    const loading = ref(false);
    const currentPage = ref(0);
    const hasNext = ref(true);
    const observerElement = ref(null);
    const commentList = ref(null);

    // 댓글 목록을 가져오는 메서드
    const fetchComments = async (page = 0, reset = false) => {
      if (loading.value || (!reset && !hasNext.value)) return;
      loading.value = true;

      try {
        const response = await axios.get(
            `http://localhost:8088/api/v1/block_comment/list/${props.blockId}`,
            { params: { page } }
        );

        const fetchedComments = response.data.result.content;

        if (page === 0 || reset) {
          comments.value = fetchedComments;
        } else {
          comments.value.push(...fetchedComments);
        }

        hasNext.value = !response.data.result.last;
        currentPage.value = page + 1;
      } catch (error) {
        console.error('댓글을 가져오는 중 오류 발생:', error);
      } finally {
        loading.value = false;
      }
    };

    // 댓글을 서버로 전송하는 메서드
    const submitComment = async () => {
      if (newComment.value) {
        try {
          await axios.post(`http://localhost:8088/api/v1/block_comment/create`, {
            blockId: props.blockId,
            contents: newComment.value,
          });
          newComment.value = ''; // 댓글 입력창 초기화

          // 댓글 목록을 다시 가져오고, 스크롤을 최신 댓글로 이동
          await fetchComments(0, true);
          nextTick(() => {
            const list = commentList.value;
            list.scrollTop = list.scrollHeight; // 스크롤을 최신 댓글로 이동
          });
        } catch (error) {
          console.error('댓글 작성 중 오류 발생:', error);
        }
      }
    };

    // 추가 댓글을 로드하는 메서드
    const loadMore = () => {
      if (hasNext.value) {
        fetchComments(currentPage.value);
      }
    };

    // IntersectionObserver 콜백
    const handleIntersection = (entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    };

    onMounted(() => {
      const observer = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      });

      if (observerElement.value) {
        observer.observe(observerElement.value);
      }

      // Cleanup observer on unmount
      onUnmounted(() => {
        if (observerElement.value) {
          observer.unobserve(observerElement.value);
        }
      });

      // 초기 댓글 목록을 가져옴
      fetchComments();
    });

    const formatDate = (dateString) => {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', options);
    };

    return {
      comments,
      newComment,
      loading,
      formatDate,
      submitComment,
      observerElement,
      commentList,
    };
  },
};
</script>

<style scoped>
.comment-text {
  white-space: pre-wrap;
}
</style>
