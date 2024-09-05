<template>
    <div class="comment-container" ref="commentList">
      <div v-if="comments.length === 0" class="no-comments">
        댓글이 없습니다
      </div>

      <div v-else>
        <div
            v-for="comment in comments"
            :key="comment.commentId"
            class="comment-item"
        >
          <div class="comment-header">
            <img :src="comment.memberProfile" class="avatar" alt="Profile Picture" />
            <div class="comment-info">
              <strong>{{ comment.memberName }}</strong> 
              <span style="font-size: 12px">
                &mdash; {{ formatDate(comment.createdTime) }}
              </span>
            </div>
            <div class="modalContainer" style="width:fit-content">
              <span class="material-symbols-outlined moreBtn" @click="toggleMenu(comment.commentId)">
                more_horiz
              </span>
              <div class="menu" v-if="activeMenu === comment.commentId">
                <div class="menu-item" @click="showConfirmationModal(comment, 'delete')">
                  <span class="material-symbols-outlined">delete</span>
                  <span>삭제</span>
                </div>
                <div class="menu-item" @click="showConfirmationModal(comment, 'update')">
                  <span class="material-symbols-outlined">update</span>
                  <span>수정</span>
                </div>
              </div>
            </div>
          </div>
          <div class="comment-text" style="margin-left:40px">{{ comment.contents }}</div>
        </div>
      </div>

      <!-- 로딩 스피너 -->
      <div v-if="loading" class="loading-spinner">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <!-- 감지용 엘리먼트 -->
      <div ref="observerElement"></div>
    </div>

    <!-- 댓글 작성 -->
     
    <v-form ref="commentForm" v-model="valid" @submit.prevent="submitComment" style="display: flex; margin: 20px 0; gap: 10px">
     
      <div class="commentForm">
        <input
        v-model="newComment"
        class="form-control"
        placeholder="댓글"
        type="text"
        style="width: 280px; display: inline-block;"
        />
      </div>
      <v-btn type="submit" color="primary" style="display: inline-block; width: 20px">게시</v-btn>
    </v-form>

    <!-- 댓글 수정 모달 -->
    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card>
        <v-card-title>댓글 수정</v-card-title>
        <v-card-text>
          <v-textarea
              v-model="editComment"
              label="댓글 내용"
              rows="3"
              required
              auto-grow
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="updateComment">수정</v-btn>
          <v-btn @click="showEditDialog = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
    const activeMenu = ref(null);
    const showEditDialog = ref(false);
    const editComment = ref('');
    const commentToEdit = ref(null);

    const fetchComments = async (page = 0, reset = false) => {
      if (loading.value || (!reset && !hasNext.value)) return;
      loading.value = true;

      try {
        const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/api/v1/block_comment/list/${props.blockId}`,
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

    const submitComment = async () => {
      if (newComment.value) {
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/block_comment/create`, {
            blockId: props.blockId,
            contents: newComment.value,
          });
          newComment.value = '';
          await fetchComments(0, true);
          nextTick(() => {
            const list = commentList.value;
            list.scrollTop = list.scrollHeight;
          });
        } catch (error) {
          console.error('댓글 작성 중 오류 발생:', error);
        }
      }
    };

    const loadMore = () => {
      if (hasNext.value) {
        fetchComments(currentPage.value);
      }
    };

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

      onUnmounted(() => {
        if (observerElement.value) {
          observer.unobserve(observerElement.value);
        }
      });

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

    const toggleMenu = (commentId) => {
      activeMenu.value = activeMenu.value === commentId ? null : commentId;
    };

    const showConfirmationModal = (comment, action) => {
      if (action === 'delete') {
        if (confirm(`댓글을 삭제하시겠습니까? 댓글 ID: ${comment.commentId}`)) {
          deleteComment(comment.commentId);
        }
      } else if (action === 'update') {
        commentToEdit.value = comment;
        editComment.value = comment.contents;
        showEditDialog.value = true;
      }
    };

    const deleteComment = async (commentId) => {
      try {
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/block_comment/delete/${commentId}`);
        await fetchComments(0, true);
      } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
      }
    };

    const updateComment = async () => {
      if (editComment.value && commentToEdit.value) {
        try {
          await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/api/v1/block_comment/update`, {
            commentId: commentToEdit.value.commentId,
            contents: editComment.value,
          });
          showEditDialog.value = false;
          await fetchComments(0, true);
        } catch (error) {
          console.error('댓글 수정 중 오류 발생:', error);
        }
      }
    };

    return {
      comments,
      newComment,
      loading,
      formatDate,
      submitComment,
      observerElement,
      commentList,
      activeMenu,
      toggleMenu,
      showConfirmationModal,
      deleteComment,
      updateComment,
      showEditDialog,
      editComment,
      commentToEdit,
    };
  },
};
</script>

<style scoped>
.comment-container {
  max-height: 65vh;
  overflow-y: auto;
}

  .comment-item {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #ccc;
  padding: 10px 10px 15px;
  position: relative;
}

  .comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Align children in a row */
}

  .avatar {
    border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

  .comment-info {
  flex: 1;
  font-size: 15px;
  /* Takes up remaining space */
}

  .modalContainer {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

  .moreBtn {
  cursor: pointer;
}

  .menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 120px;
}

  .menu-item {
  padding: 10px;
  cursor: pointer;
}

  .menu-item:hover {
    background-color: #f5f5f5;
}

  .no-comments {
  padding: 10px;
  text-align: center;
}

  .loading-spinner {
  display: flex;
  justify-content: center;
  padding: 10px;
}
</style>
