<template>
  <div>
    <div>{{ title }}</div>
    <button @click="openModal">Update Title</button>
    <button @click="openDateModal">Select Travel Dates</button>

    <!-- Modal for updating the title -->
    <CustomModal v-model:modelValue="isModalOpen">
      <div class="modal-content">
        <p class="modal-title">Update Project Title</p>
        <v-text-field
            v-model="modalTitle"
            label="Title"
            placeholder="Enter new title"
            class="modal-input"
        />
        <v-btn color="primary" @click="updateProjectTitle">DONE!</v-btn>
      </div>
    </CustomModal>

    <!-- Modal for selecting travel dates -->
    <CustomModal v-model:modelValue="isDateModalOpen">
      <div class="modal-content">
        <p class="modal-title">여행 기간이 어떻게 되시나요?</p>
        <v-row justify="center">
          <div class="question-input">
            <p>Start Date</p>
            <input
                type="date"
                v-model="startTravel"
                class="date-input"
            >
          </div>
          <div class="question-input">
            <p>End Date</p>
            <input
                type="date"
                v-model="endTravel"
                class="date-input"
            >
          </div>
        </v-row>
        <v-row justify="center">
          <v-btn color="secondary" @click="updateProjectDates">SAVE</v-btn>
        </v-row>
      </div>
    </CustomModal>

    <!-- Display selected travel dates -->
    <div>
      <p><strong>Start Date:</strong> {{ startTravel }}</p>
      <p><strong>End Date:</strong> {{ endTravel }}</p>
    </div>

    <br><br><br>
<!-- 좌표정보를 업데이트 하는 곳-->
    <div>
      <button @click="openInviteModal"> +버튼 </button>
    </div>

    <CustomModal model-value="isInviteModalOpen">
      <div class="modal-content">
        <p class="modal-title">Invite</p>
        <v-text-field
            v-model="inviteMemberEmail"
            label="Email"
            placeholder="Enter email"
            class="modal-input"
        />
        <v-btn color="primary" @click="updateMemberInvite">DONE!</v-btn>
      </div>
    </CustomModal>

  </div>
</template>

<script>
import axios from 'axios';
import CustomModal from '@/components/CustomModal.vue';

export default {
  components: {
    CustomModal
  },
  data() {
    return {
      title: '',
      projectId: null,
      isModalOpen: false,
      isDateModalOpen: false,
      modalTitle: '',
      startTravel: '',
      endTravel: '',
      inviteMemberEmail: '',

      isInviteModalOpen: false
    };
  },
  created() {
    this.projectId = this.$route.params.projectId;
    this.fetchProjectDetail();
  },
  methods: {
    async fetchProjectDetail() {
      try {
        const response = await axios.get(`http://localhost:8088/api/v1/project/${this.projectId}/detail`);
        this.title = response.data.result.projectTitle;
        // Assuming the API response also includes travel dates
        this.startTravel = response.data.result.startTravel;
        this.endTravel = response.data.result.endTravel;
      } catch (error) {
        console.error('Error fetching project detail:', error);
      }
    },

    openModal() {
      this.modalTitle = this.title;
      this.isModalOpen = true;
    },

    async updateProjectTitle() {
      const request = {
        title: this.modalTitle,
      };
      console.log('Updating project title with:', request);
      try {
        const response = await axios.patch(`http://localhost:8088/api/v1/project/${this.projectId}/update/title`, request);
        console.log('Response:', response);
        this.title = this.modalTitle;
        this.isModalOpen = false;
      } catch (error) {
        console.error('Error updating project title:', error);
        alert('서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
      }
    },

    async updateProjectDates() {
      const request = {
        startTravel: this.startTravel,
        endTravel: this.endTravel,
      };
      console.log('Updating project dates with:', request);
      try {
        const response = await axios.patch(`http://localhost:8088/api/v1/project/${this.projectId}/update/travel-dates`, request);
        console.log('Response:', response);
        this.isDateModalOpen = false;
        console.log('Saving dates:', { startTravel: this.startTravel, endTravel: this.endTravel });
      } catch (error) {
        console.error('Error updating project dates:', error);
        alert('서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
      }
    },

    openDateModal() {
      this.isDateModalOpen = true;
    },
    openInviteModal(){
      this.isInviteModalOpen = true;
    },
    async updateMemberInvite() {
      const request = {
        email: this.inviteMemberEmail,
      };
      console.log('Inviting member with:', request);
      try {
        const response = await axios.post(`http://localhost:8088/api/v1/project/${this.projectId}/invite`, request);
        console.log('Response:', response);
        this.isInviteModalOpen = false;
      } catch (error) {
        console.error('Error inviting member:', error);
        alert('서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
      }
    }



  }
};
</script>


<style scoped>
.modal-content {
  text-align: center;
  padding: 20px;
}

.modal-title {
  padding: 20px 0;
  font-size: 36px;
  font-weight: bold;
}

.modal-input {
  width: 400px;
  margin: 20px auto;
}

.date-input {
  font-size: 22px;
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
}



</style>
