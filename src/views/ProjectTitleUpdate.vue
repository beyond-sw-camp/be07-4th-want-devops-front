<template>
  <div class="backArea" ref="CreateStep3">
    <div class="question">
      <v-row justify="center">
        <p class="question-title">이번 여행의 제목을 지어주세요</p>
      </v-row>
      <v-row justify="center">
        <div class="question-input">
          <p>Title</p>
          <input
              v-model="title"
              class="form-control"
              placeholder="제목"
              type="text"
              style="width: 400px;"
          />
        </div>
      </v-row>
      <v-row justify="center">
        <v-btn color="primary" @click="updateProjectTitle">DONE!</v-btn>
      </v-row>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      title: '',
      // startTravel: '',  // 시작 날짜
      // endTravel: ''     // 종료 날짜
    }
  },

  methods: {
    async updateProjectTitle() {
      const request = {
        title: this.title,
      };
      try {
        const response = await axios.patch(`/api/projects/${this.$route.params.id}`, request);
        this.$router.push(`/projects/${this.$route.params.id}`);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
</script>

<style scoped>
.question-title {
  padding: 80px 0 30px;
  font-size: 40px;
}

.question-input {
  margin: 20px;
  padding-bottom: 60px;
  font-size: 36px;
}
</style>
