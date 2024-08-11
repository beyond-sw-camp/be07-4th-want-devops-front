<template>
  <div class="profile" align="center">
    <v-avatar style="width: 100px; height: 100px;" >
      <img :src="profileUrl"/>
    </v-avatar>
    <p class="userName" >{{userName}} </p>
    <p class="userEmail" >{{userEmail}}</p>
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
    <div class="section2">
      <!-- 초대가 없는 경우 -->
      <div v-if="filteredInvitations.length === 0" class="no-invitations">
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
        <div class="projectInfo">
          <div class="projectTitle">
            title: {{ invitation.projectTitle }}
          </div>
          <div class="projectEtc">
            추가할 내용: 여행 일정, 나라, 초대한 사람
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="modal-wrap" v-show="modalCheck">
    <div class="modal-container">
      <span class="material-symbols-outlined closeBtn" @click="modalOpen">
        close
      </span>
      <div v-if="selectedInvitation">
        <h2>{{ selectedInvitation.projectTitle }}</h2> <!-- 선택된 초대의 projectTitle 표시 -->
      </div>
      <div class="modal-btn">
        <v-btn @click="handleInvitation('accept')">확인</v-btn>
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
      profileUrl: localStorage.getItem('profileUrl'),
      userName: localStorage.getItem('name'),
      userEmail: localStorage.getItem('email'),
    };
  },
  computed: {
    filteredInvitations() {
      return this.invitationList.filter(invitation => invitation.invitationAccepted !== 'Y');
    }
  },
  async created() {
    try {
      const response = await axios.get('http://localhost:8088/member/invitations', {
        params: {
          page: 0,
          size: 11,
        },
      });
      this.invitationList = response.data.content;
      console.log(this.invitationList);
    } catch (e) {
      console.log(e);
    }
  },
  methods: {
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
        await axios.post('http://localhost:8088/member/invitations/response', {
          projectId: this.selectedInvitation.projectId,
          action: action
          });

        // 초대 응답 후 처리
        this.invitationList = this.invitationList.filter(invitation => invitation.projectId !== this.selectedInvitation.projectId);
        console.log(this.invitationList)
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
  border-top-right-radius: 15px;
  box-shadow: 4px -4px 8px rgba(0, 0, 0, 0.1);
}
.mainTitle p {
  font-size: 18px;
}
.secondTitle a{
  text-decoration-line: none;
  color: #333;
}
.secondTitle a:hover{
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
.section2 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  width: 60%;
  padding: 20px;
  background-color: white;
  border-radius: 8px;      /* 모서리 둥글게 하기 (선택 사항) */
  box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* 그림자 추가 (선택 사항) */
}

.project {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background-color: #e0e0e0;
  padding: 10px;
  border-radius: 4px; 
}

.projectImage img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 50%;
}

.projectTitle {
  font-size: 16px;
  color: #333;
}
</style>