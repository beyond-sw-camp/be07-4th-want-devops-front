<template>
  <div class="profile" align="center">
    <v-avatar style="width: 100px; height: 100px;">
      <img :src="profileUrl"/>
    </v-avatar>
    <p class="userName">{{ userName }}</p>
    <p class="userEmail">{{ userEmail }}</p>
  </div>
  <v-row>
    <v-col class="secondTitle" cols="6" align="center">
      <router-link to="myPage">My Project</router-link>
    </v-col>
    <v-col class="mainTitle" cols="6" align="center">
      <p>My Invitation</p>
    </v-col>
  </v-row>

  <div class="section">
    <div class="sectionInvitation">
      <!-- 초대가 없는 경우 -->
      <div v-if="filteredInvitations.length === 0" class="no-invitations" style="margin: auto;">
        초대받은 프로젝트가 없습니다
      </div>
      <!-- 초대가 있는 경우 -->
      <div
        v-else
        class="invitation"
        v-for="invitation in filteredInvitations"
        :key="invitation.projectId"
        @click="openModal(invitation)"
      >
        <span style="font-weight: 700;">[{{ invitation.projectTitle }}]</span>
        에 초대되었습니다
      </div>
    </div>
  </div>

  <div class="modal-wrap" v-show="modalCheck">
    <div class="modal-container">
      <!-- 닫는 버튼 -->
      <button class="close-btn" @click="modalOpen">×</button>

      <div v-if="selectedInvitation">
        <h2><strong>[{{ selectedInvitation.projectTitle }}]</strong>에 초대되었습니다</h2>
        <p><strong>여행지:</strong> {{ selectedInvitation.projectStates[0].country }} {{ selectedInvitation.projectStates[0].city }}</p>
        <p><strong>여행일:</strong> {{ selectedInvitation.startTravel }} ~ {{ selectedInvitation.endTravel }}</p>
      </div>
      <div class="modal-btn">
        <v-btn @click="handleInvitation('accept')">수락</v-btn>
        <v-btn @click="handleInvitation('reject')">거절</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      invitationList: [],
      modalCheck: false,
      selectedInvitation: null,
      profileUrl: "",
      userName: "",
      userEmail: "",
    };
  },
  computed: {
    filteredInvitations() {
      return this.invitationList.filter(invitation => invitation.invitationAccepted !== 'Y');
    }
  },
  async created() {
    await this.getMyInfo();
    try {
      const response = await axios.get('http://localhost:8088/member/invitations', {
        params: {
          page: 0,
          size: 30,
        },
      });
      this.invitationList = response.data.content;
      console.log(this.invitationList);
    } catch (e) {
      console.log(e);
    }
  },
  methods: {
    async getMyInfo() {
      try {
        const response = await axios.get('http://localhost:8088/member/me');
        this.profileUrl = response.data.profileUrl;
        this.userName = response.data.name;
        this.userEmail = response.data.email;
      } catch (e) {
        console.log(e);
      }
    },
    openModal(invitation) {
      this.selectedInvitation = invitation;
      this.modalCheck = true;
    },
    modalOpen() {
      this.modalCheck = !this.modalCheck;
      if (!this.modalCheck) {
        this.selectedInvitation = null; // 모달이 닫힐 때 선택된 초대 초기화
      }
    },
    async handleInvitation(action) {
      if (!this.selectedInvitation) return;
      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member/invitations/response`, {
          projectId: this.selectedInvitation.projectId,
          action: action
        });

        // 초대 응답 후 처리
        this.invitationList = this.invitationList.filter(invitation => invitation.projectId !== this.selectedInvitation.projectId);
        console.log(this.invitationList);
        this.modalOpen(); // 모달 닫기
      } catch (e) {
        console.error(e.response?.data || e.message); // 에러 메시지 로그 추가
      }
    }
  }
};
</script>

<style>
.profile img {
  width: 100px;
  height: 100px;
}
.profile p {
  margin: 0;
}
.profile .userName {
  font-weight: 700;
  font-size: 18px;
}
.mainTitle {
  font-weight: 700;
  background-color: #f0f0f0;
  border-top-left-radius: 15px;
  box-shadow: 4px -4px 8px rgba(0, 0, 0, 0.1);
}
.mainTitle p {
  font-size: 18px;
}
.secondTitle a {
  text-decoration-line: none;
  color: #333;
}
.secondTitle a:hover {
  font-weight: 700;
  color: #004B6B;
}
.section {
  display: flex;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  padding: 30px;
  background-color: #f0f0f0;
}
.sectionInvitation {
  display: flex;
  flex-direction: column; /* 세로 방향으로 배치 */
  align-items: flex-start;
  gap: 20px;
  width: 60%;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.invitation {
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.invitation:hover {
  cursor: pointer;
  transform: translateY(-3px);
}
.modal-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  animation: fadeIn 0.3s ease-in-out;
}

.modal-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-sizing: border-box;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease-in-out;
  max-width: 90%; /* 작은 화면에서 모달이 잘리거나 화면 밖으로 나가지 않도록 설정 */
  max-height: 90%; /* 작은 화면에서 모달이 잘리거나 화면 밖으로 나가지 않도록 설정 */
  overflow-y: auto; /* 컨텐츠가 많을 경우 스크롤 가능하게 설정 */
  position: relative; /* 닫기 버튼 위치를 위한 설정 */
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  color: #555;
}

.close-btn:hover {
  color: #000;
}

.modal-container h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.modal-container p {
  font-size: 16px;
  line-height: 1.5;
  color: #555;
  margin-bottom: 20px;
}

.modal-container .modal-btn {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.modal-container .modal-btn v-btn {
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.modal-container .modal-btn v-btn:first-child {
  background-color: #4CAF50;
  color: white;
}

.modal-container .modal-btn v-btn:first-child:hover {
  background-color: #45A049;
}

.modal-container .modal-btn v-btn:last-child {
  background-color: #f44336;
  color: white;
}

.modal-container .modal-btn v-btn:last-child:hover {
  background-color: #e53935;
}

.material-symbols-outlined {
  font-size: 24px;
  color: #666;
}

/* 모달 등장 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
