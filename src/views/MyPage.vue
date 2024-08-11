<template>
  <div class="profile">
    <v-avatar class="ml-2">
      <v-img :src="profileUrl"></v-img>
    </v-avatar>
  </div>
  <div class="title">
    <p>My Project</p>
  </div>
  <div class="title">
    <router-link to="myInvitation">My Invitation</router-link>
  </div>

  

  <div class="section">
    
    <div class="section2">
      <!-- 정렬 및 필터링 선택 -->
      <div class="controls">
        <label for="sort">Sort by:</label>
        <select v-model="sortOption" @change="sortProjects">
          <option value="createdAtDesc">최근 생성순</option>
          <option value="createdAtAsc">오래전에 생성된 순</option>
          <option value="startTravelAsc">가까운 여행일순</option>
          <option value="startTravelDesc">가장 먼 여행일 순</option>
        </select>

        <label for="filter">Filter by status:</label>
        <select v-model="filterOption" @change="filterProjects">
          <option value="all">전체</option>
          <option value="completed">완료된 여행</option>
          <option value="incomplete">완료되지 않은 여행</option>
        </select>
      </div>
      <div class="project addBtn">
        <router-link to="project/create">새로운 프로젝트 생성하기</router-link>
      </div>
      <div
        class="project"
        v-for="project in filteredProjects"
        :key="project.projectId"
      >
        <div class="projectImage">
          <img src="@/assets/img/airplane.jpg" alt="프로젝트 이미지" />
        </div>
        <div class="projectTitle">
          {{ project.projectTitle }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      projectList: [],
      filteredProjects: [], // 필터링된 프로젝트 목록
      sortOption: 'createdAtDesc', // 정렬 옵션
      filterOption: 'all', // 필터 옵션
    };
  },
  async created() {
    await this.fetchProjects(); // 페이지 로드 시 프로젝트를 가져옴
  },
  methods: {
    async fetchProjects() {
      try {
        const response = await axios.get('http://localhost:8088/api/v1/project/list', {
          params: {
            page: 0,
            size: 11,
            filter: this.filterOption,
          },
        });
        this.projectList = response.data.result.content;
        this.filterProjects(); // 데이터를 필터링하고 정렬 수행
      } catch (e) {
        console.log(e);
      }
    },

    filterProjects() {
      // invitationAccepted가 'N'인 경우만 필터링
      // this.filteredProjects = this.projectList.filter(project => project.invitationAccepted !== 'N');
      console.log(this.projectList)
      if (this.filterOption === 'completed') {
        this.filteredProjects = this.projectList.filter((project) => project.isDone === 'Y');
      } else if (this.filterOption === 'incomplete') {
        this.filteredProjects = this.projectList.filter((project) => project.isDone === 'N');
      } else {
        this.filteredProjects = this.projectList;
      }
      this.sortProjects(); // 필터링 후 정렬
    },

    sortProjects() {
      const sortOption = this.sortOption;
      if (sortOption === 'createdAtDesc') {
        this.filteredProjects.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
      } else if (sortOption === 'createdAtAsc') {
        this.filteredProjects.sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime));
      } else if (sortOption === 'startTravelAsc') {
        this.filteredProjects.sort((a, b) => new Date(a.startTravel) - new Date(b.startTravel));
      } else if (sortOption === 'startTravelDesc') {
        this.filteredProjects.sort((a, b) => new Date(b.startTravel) - new Date(a.startTravel));
      }
    }
  },
};
</script>

  
  <style>
  .section {
    display: flex;
    justify-content: center;   
    height: 100vh;
    width: 100vw;
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