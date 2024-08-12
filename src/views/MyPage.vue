<template>
  <div class="profile" align="center">
    <v-avatar style="width: 100px; height: 100px;">
      <img :src="profileUrl" />
    </v-avatar>
    <p class="userName">{{ userName }}</p>
    <p class="userEmail">{{ userEmail }}</p>
  </div>
  <v-row>
    <v-col class="mainTitle" cols="6" align="center">
      <p>My Project</p>
    </v-col>
    <v-col class="secondTitle" cols="6" align="center">
      <router-link to="myInvitation">My Invitation</router-link>
    </v-col>
  </v-row>

  <div class="section">
    <div class="sectionProject">
      <div class="filter">
        <div class="controls" style="display: flex; justify-content: flex-end;">
          <select class="form-select mt-2" v-model="sortOption" @change="sortProjects">
            <option value="createdAtDesc">최근 생성순</option>
            <option value="createdAtAsc">오래전에 생성된 순</option>
            <option value="startTravelAsc">가까운 여행일순</option>
            <option value="startTravelDesc">가장 먼 여행일 순</option>
          </select>

          <select class="form-select mt-2" v-model="filterOption" @change="filterProjects">
            <option value="all">전체</option>
            <option value="completed">완료된 여행</option>
            <option value="incomplete">완료되지 않은 여행</option>
          </select>
        </div>
      </div>

      <div class="projectList">
        <div class="projectGrid">
          <div class="projectCard plusBtn" @click="toCreateProject">
            <div class="material-symbols-outlined">add_box</div>
            <div>새로운 프로젝트 생성하기</div>
          </div>

          <div
            class="projectCard"
            v-for="project in filteredProjects"
            :key="project.projectId"
          >
            <div class="modalContainer">
              <span class="material-symbols-outlined moreBtn" @click="toggleMenu(project.projectId)">
                more_horiz
              </span>
              <div class="menu" v-if="activeMenu === project.projectId">
                <div class="menu-item">
                  <span class="material-symbols-outlined">delete</span>
                  <span>탈퇴하기</span>
                </div>
              </div>
            </div>
            <div class="projectImage">
              <img src="@/assets/img/airplane.jpg" alt="프로젝트 이미지" />
            </div>
            <div class="projectTitle">{{ project.projectTitle }}</div>
            <div class="projectDate">
              {{ project.startTravel }} ~ {{ project.endTravel }}
            </div>
            <div class="projectCreated">
              생성된 날짜: {{ new Date(project.createdTime).toLocaleDateString() }}
            </div>
          </div>
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
      activeMenu: null, // 활성화된 메뉴의 ID
      profileUrl: "",
      userName: "",
      userEmail: "",
      currentPage: 0, // 현재 페이지
      pageSize: 8, // 페이지당 항목 수
      isLastPage: false, // 마지막 페이지 여부
      isLoading: false, // 로딩 상태
    };
  },
  async created() {
    await this.fetchProjects(); // 페이지 로드 시 프로젝트를 가져옴
    await this.getMyInfo();
    window.addEventListener('scroll', this.scrollPagination); // 스크롤 이벤트 리스너 추가
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.scrollPagination); // 스크롤 이벤트 리스너 제거
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
    toCreateProject() {
      this.$router.push({ path: '/project/create' });
    },
    async fetchProjects() {
      if (this.isLoading || this.isLastPage) return;
      this.isLoading = true;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/project/list`, {
          params: {
            page: this.currentPage,
            size: this.pageSize,
            filter: this.filterOption,
          },
        });
        const newProjects = response.data.result.content;

        if (newProjects.length === 0) {
          this.isLastPage = true;
        } else {
          this.projectList = [...this.projectList, ...newProjects];
          this.filterProjects(); // 데이터를 필터링하고 정렬 수행
          this.currentPage++;
        }
      } catch (e) {
        console.log(e);
      } finally {
        this.isLoading = false;
      }
    },
    filterProjects() {
      if (this.filterOption === 'completed') {
        this.filteredProjects = this.projectList.filter((project) => project.isDone === 'Y');
      } else if (this.filterOption === 'incomplete') {
        this.filteredProjects = this.projectList.filter((project) => project.isDone === 'N');
      } else {
        this.filteredProjects = [...this.projectList];
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
    },
    scrollPagination() {
      const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      if (isBottom && !this.isLastPage && !this.isLoading) {
        this.fetchProjects(); // 스크롤이 바닥에 닿으면 다음 페이지의 데이터를 로드
      }
    },
    toggleMenu(projectId) {
      if (this.activeMenu === projectId) {
        this.activeMenu = null; // 메뉴가 이미 활성화되어 있으면 비활성화
      } else {
        this.activeMenu = projectId; // 다른 메뉴를 활성화
      }
    }
  },
};
</script>




<style>
.profile {
  padding: 40px;
}
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
  align-items: flex-start; /* 상단 정렬 */
  width: 100vw;
  min-height: 100vh; /* 최소 높이를 화면의 100%로 설정하여 전체 높이 보장 */
  padding: 30px;
  background-color: #f0f0f0;
}
.sectionProject {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 60%;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  /* 높이 자동 조정 */
}
.controls {
  display: flex;
  justify-content: flex-end; /* 컨트롤을 오른쪽 끝으로 정렬 */
  gap: 10px;
}
.controls .form-select {
  width: 150px;
  font-size: 12px;
}
.projectList {
  width: 100%;
}
.projectGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 한 줄에 3개의 아이템 */
  gap: 20px; /* 카드 간의 간격 */
  margin-top: 20px;
}
.projectCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.projectCard:hover {
  transform: translateY(-5px); /* 호버 시 살짝 올라가는 효과 */
  cursor: pointer;
}
.projectImage img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}
.projectTitle {
  margin-top: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  text-align: center;
}
.projectDate {
  margin-top: 5px;
  font-size: 14px;
  color: #555;
  text-align: center;
}

.projectCreated {
  margin-top: 5px;
  font-size: 12px;
  color: #777;
  text-align: center;
}

.modalContainer {
  position: relative;
  width: 100%;
  text-align: right; /* 버튼을 오른쪽으로 이동 */
}
.modalContainer .menu {
  font-size: 15px;
  position: absolute;
  width: 105px;
  right: 0; /* 오른쪽으로 메뉴 정렬 */
  background-color: white; /* 메뉴의 배경색을 흰색으로 설정 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); /* 메뉴에 그림자 추가 */
  padding: 10px;
  z-index: 10;
  border-radius: 3px;
}
.moreBtn {
  cursor: pointer;
}
.menu-item {
  display: flex;
  align-items: center; /* 요소들을 수평 가운데 정렬 */
  gap: 3px; /* 아이콘과 텍스트 사이의 간격 */
}
.menu-item:hover {
  color: red;
}

.menu-item span {
  font-weight: 300;
}

.plusBtn {
  justify-content: center;
  background-color: #c0c0c0;
}
.plusBtn .material-symbols-outlined {
  font-size: 40px;
  color: #333;
}
.plusBtn div {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  text-align: center;
}

</style>
