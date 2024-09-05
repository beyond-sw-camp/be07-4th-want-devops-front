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
      <!-- 필터링 & 정렬 -->
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
            <span class="material-symbols-outlined plusIcon">add_box</span>
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
                <div class="menu-item" @click="showConfirmationModal(project)">
                  <span class="material-symbols-outlined">delete</span>
                  <span>탈퇴하기</span>
                </div>
              </div>
            </div>
            <div class="projectImage" @click="goToMyPage(project.projectId)">
              <img :src="getCityImage(project.city)" alt="프로젝트 이미지" />
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

  <!-- Confirmation Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <p>정말 탈퇴하시겠습니까?</p>
      <p>프로젝트 제목: {{ currentProject?.projectTitle }}</p>
      <div class="modal-buttons">
        <button @click="confirmDeletion">탈퇴하기</button>
        <button @click="closeModal">취소</button>
      </div>
    </div>
  </div>
</template>





<script>
// import router from "@/router";
import axios from "axios";

export default {
  data() {
    return {
      projectList: [],
      filteredProjects: [],
      sortOption: 'createdAtDesc',
      filterOption: 'all',
      activeMenu: null,
      profileUrl: "",
      userName: "",
      userEmail: "",
      currentPage: 0,
      pageSize: 5,
      isLastPage: false,
      isLoading: false,
      showModal: false,
      currentProject: null, // 현재 탈퇴할 프로젝트
    };
  },
  async created() {
    await this.fetchProjects();
    await this.getMyInfo();
    window.addEventListener('scroll', this.scrollPagination);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.scrollPagination);
  },
  methods: {
    async getMyInfo() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member/me`);
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
        console.log(newProjects);

        if (newProjects.length === 0) {
          this.isLastPage = true;
        } else {
          this.projectList = [...this.projectList, ...newProjects];
          this.filterProjects(); // 필터링을 적용
          this.currentPage++;
          console.log("ProjectList: ", this.projectList);
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
      this.sortProjects(); // 정렬을 적용
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
      this.fetchProjects().then(() => {
        this.$nextTick(() => {
          this.updateSectionHeight();
        });
      });
    }
  },
  updateSectionHeight() {
    const section = document.querySelector('.section');
    const sectionProject = document.querySelector('.sectionProject');
    if (section && sectionProject) {
      section.style.height = `${sectionProject.offsetHeight + 100}px`;
    }
  },
    toggleMenu(projectId) {
      if (this.activeMenu === projectId) {
        this.activeMenu = null;
      } else {
        this.activeMenu = projectId;
      }
    },
    showConfirmationModal(project) {
      this.currentProject = project;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.currentProject = null;
    },
    goToMyPage(projectId) {
      this.$router.push({ path: `/project/${projectId}/detail` });
    },
    async confirmDeletion() {
      try {
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/v1/project/${this.currentProject.projectId}`);
        this.$router.go(); // 현재 페이지를 새로고침
      } catch (e) {
        console.log(e);
      } finally {
        this.closeModal(); // 모달 닫기
      }
    },
    getCityImage(cityName) {
      const cityImages = {
        서울: require('@/assets/img/seoul.jpg'),
        대구: require('@/assets/img/daegu.jpg'),
        인천: require('@/assets/img/incheon.jpg'),
        광주: require('@/assets/img/gwangju.jpg'),
        대전: require('@/assets/img/daejeon.jpg'),
        울산: require('@/assets/img/ulsan.jpg'),
        세종: require('@/assets/img/sejong.jpg'),
        제주: require('@/assets/img/jeju.jpg'),
        경주: require('@/assets/img/gyeongju.jpg'),
        부산: require('@/assets/img/busan.jpg'),

        // 일본 (Japan)
        도쿄: require('@/assets/img/tokyo.jpg'),
        오사카: require('@/assets/img/osaka.jpg'),
        나고야: require('@/assets/img/nagoya.jpg'),
        삿포로: require('@/assets/img/sapporo.jpg'),
        후쿠오카: require('@/assets/img/fukuoka.jpg'),
        교토: require('@/assets/img/kyoto.jpg'),
        고베: require('@/assets/img/kobe.jpg'),
        요코하마: require('@/assets/img/yokohama.jpg'),

        // 미국 (United States)
        뉴욕: require('@/assets/img/newyork.jpg'),
        로스앤젤레스: require('@/assets/img/losangeles.jpg'),
        샌프란시스코: require('@/assets/img/sanfrancisco.jpg'),
        라스베이거스: require('@/assets/img/lasvegas.jpg'),
        마이애미: require('@/assets/img/miami.jpg'),

        // 중국 (China)
        베이징: require('@/assets/img/beijing.jpg'),
        상하이: require('@/assets/img/shanghai.jpg'),
        광저우: require('@/assets/img/guangzhou.jpg'),
        시안: require('@/assets/img/xian.jpg'),
        청두: require('@/assets/img/chengdu.jpg'),

        // 영국 (United Kingdom)
        런던: require('@/assets/img/london.jpg'),
        에든버러: require('@/assets/img/edinburgh.jpg'),
        맨체스터: require('@/assets/img/manchester.jpg'),
        리버풀: require('@/assets/img/liverpool.jpg'),
        버밍엄: require('@/assets/img/birmingham.jpg'),

        // 이탈리아 (Italy)
        로마: require('@/assets/img/rome.jpg'),
        베네치아: require('@/assets/img/venice.jpg'),
        피렌체: require('@/assets/img/florence.jpg'),
        밀라노: require('@/assets/img/milan.jpg'),
        나폴리: require('@/assets/img/napoli.jpg'),
      };
      return cityImages[cityName.toLowerCase()] || '@/assets/img/airplane.jpg'; // 기본 이미지를 설정
    }, 
  },
};
</script>


<style >
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
  align-items: flex-start;
  width: 100vw;
  height: auto; /* 높이를 자동으로 조정 */
  min-height: 100vh; /* 페이지의 최소 높이 설정 (화면 높이에 맞추기) */
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
  height: auto; /* 높이를 내용에 맞게 조정 */
}
.controls {
  display: flex;
  justify-content: flex-end;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}
.projectCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #E5EEF3;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.projectCard:hover {
  transform: translateY(-5px);
  cursor: pointer;
}
.projectImage {
  width: 100%;
  height: 150px; /* 모든 이미지를 200px 높이로 고정 */
  overflow: hidden; /* 컨테이너를 벗어난 이미지는 잘림 */
}

.projectImage img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 이미지가 컨테이너에 꽉 차도록 조정 */
  border-radius: 8px; /* 이미지 모서리를 둥글게 처리 */
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
  text-align: right;
}
.modalContainer .menu {
  font-size: 15px;
  position: absolute;
  width: 105px;
  right: 0;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 10px;
  z-index: 10;
  border-radius: 3px;
}
.moreBtn {
  cursor: pointer;
}
.modalContainer .menu-item {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0;
}
.menu-item:hover span{
  color: red;
}
.menu-item span {
  font-weight: 300;
}
.plusBtn {
  justify-content: center;
  background-color: #c0c0c0;
}
.plusBtn .plusIcon {
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

/* 수정된 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999; /* 모달이 다른 요소 위에 표시되도록 높은 z-index 설정 */
}

.modal-content {
  background-color: white !important;
  padding: 20px;
  border-radius: 8px !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 500px !important; /* 모달의 가로 폭을 500px로 설정 */
  z-index: 1000; /* 모달 내용이 overlay 위에 표시되도록 설정 */
}

.modal-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}

.modal-buttons button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-buttons button:hover {
  background-color: #0056b3;
}

.modal-buttons button:nth-child(2) {
  background-color: #6c757d;
}

.modal-buttons button:nth-child(2):hover {
  background-color: #5a6268;
}

</style>