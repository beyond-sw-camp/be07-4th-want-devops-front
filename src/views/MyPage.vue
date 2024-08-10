<template>
      <h1>This is MyPage</h1>
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
        <select v-model="filterOption" @change="fetchProjects">
          <option value="all">전체</option>
          <option value="completed">완료된 여행</option>
          <option value="incomplete">완료되지 않은 여행</option>
        </select>
      </div>


      <div class="section">
        <div class="section2">
            <div
            class="project"
            v-for="project in projectList"
            :key="project.projectId"
        >
            <div class="projectImage">
                <img src="@/assets/img/airplane.jpg" alt="프로젝트 이미지"/>
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
      projectList: [], // 프로젝트 목록을 저장할 배열
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
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8088/api/v1/project/list', {
          params: {
            page: 0,
            size: 11,
            filter: this.filterOption,
          },
          headers: {
            'Authorization': `Bearer ${token}`, // Authorization 헤더 설정
            'Content-Type': 'application/json' // 데이터 전송 형식 설정
          }
        });
        this.projectList = response.data.result.content; // 올바른 데이터 경로로 수정
        console.log(this.projectList);
        this.sortProjects(); // 데이터가 로드된 후 정렬 수행
      } catch (e) {
        console.log(e);
      }
    },
    sortProjects() {
      const sortOption = this.sortOption;
      if (sortOption === 'createdAtDesc') {
        this.projectList.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
      } else if (sortOption === 'createdAtAsc') {
        this.projectList.sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime));
      } else if (sortOption === 'startTravelAsc') {
        this.projectList.sort((a, b) => new Date(a.startTravel) - new Date(b.startTravel));
      } else if (sortOption === 'startTravelDesc') {
        this.projectList.sort((a, b) => new Date(b.startTravel) - new Date(a.startTravel));
      }
    }
  },
};
</script>
  
  <style>
  /* section을 화면 전체를 사용하는 컨테이너로 설정 */
  .section {
    display: flex;
    justify-content: center; /* 수평 중앙 정렬 */
    align-items: center;     /* 수직 중앙 정렬 */
    height: 100vh;           /* 전체 화면 높이 */
    width: 100vw;            /* 전체 화면 너비 */
    background-color: #f0f0f0; /* 배경색 설정 (선택 사항) */
    height: auto;
  }
  
  /* section2를 중앙에 위치시키기 위한 스타일 */
  .section2 {
    display: flex;
    flex-direction: column; /* 세로 방향으로 정렬 */
    align-items: flex-start; /* 프로젝트를 왼쪽 정렬 */
    gap: 20px;               /* 프로젝트 간 간격 */
    width: 60%;          /* 최대 너비 제한 (선택 사항) */
    padding: 20px;           /* 안쪽 여백 (선택 사항) */
    background-color: white; /* 배경색 설정 (선택 사항) */
    border-radius: 8px;      /* 모서리 둥글게 하기 (선택 사항) */
    box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* 그림자 추가 (선택 사항) */

  }
  
  /* 개별 프로젝트를 구성하는 스타일 */
  .project {
    display: flex;
    align-items: center; /* 이미지와 텍스트를 수직으로 정렬 */
    gap: 10px;           /* 이미지와 제목 사이의 간격 */
    width: 100%;         /* 너비를 100%로 설정하여 section2 안에 맞추기 */
    background-color: #e0e0e0; /* 프로젝트 배경색 (선택 사항) */
    padding: 10px;       /* 프로젝트 내 여백 */
    border-radius: 4px;  /* 프로젝트 모서리 둥글게 하기 (선택 사항) */
  }
  
  /* 프로젝트 이미지를 위한 스타일 */
  .projectImage img {
    width: 50px;          /* 이미지 너비 설정 */
    height: 50px;         /* 이미지 높이 설정 */
    object-fit: cover;    /* 이미지 비율 유지 */
    border-radius: 50%;   /* 이미지 둥글게 만들기 */
  }
  
  /* 프로젝트 제목 스타일 */
  .projectTitle {
    font-size: 16px;      /* 제목 폰트 크기 */
    color: #333;          /* 제목 색상 */
  }
  </style>