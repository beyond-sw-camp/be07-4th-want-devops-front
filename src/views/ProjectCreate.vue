<template>
  <div>
    <div class="selectStep">
      <li @click="scrollToSection('CreateStep1')">
        STEP 1<br />지역 선택
      </li>
      <li @click="scrollToSection('CreateStep2')">
        STEP 2<br />기간 선택
      </li>
      <li @click="scrollToSection('CreateStep3')">
          STEP 3<br/>제목 설정
      </li>
  </div>

    <!-- Step 1 -->
    <div class="backArea" ref="CreateStep1">
      <div class="question">
        <v-row justify="center">
          <p class="question-title">어디로 여행 가시나요?</p>
        </v-row>
        <v-row justify="center">
          <div class="question-input">
            <p>Country</p>
            <select 
              class="form-select mt-4" 
              style="width: 200px; font-size: 18px;"
              v-model="selectedCountry"
              @change="loadCityList"
            >
              <option disabled value="">국가</option>
              <option 
                v-for="country in countryList" 
                :key="country.id" 
                :value="country.country"
              >
                {{ country.country }}
              </option>
            </select>
          </div>
          <div class="question-input">
            <p>City</p>
            <select 
              class="form-select mt-4" 
              style="width: 200px; font-size: 18px;"
              v-model="selectedCity"
              :disabled="!selectedCountry || cityList.length === 0"
            >
              <option disabled value="">도시</option>
              <option 
                v-for="city in cityList" 
                :key="city.id" 
                :value="city.city"
              >
                {{ city.city }}
              </option>
            </select>
          </div>
        </v-row>
        <v-row justify="center">
          <v-btn color="secondary" @click="validateStep1">NEXT</v-btn>
        </v-row>            
      </div>
    </div>

    <!-- Step 2 -->
    <div class="backArea" ref="CreateStep2">
      <div class="question">
          <v-row justify="center">
          <p class="question-title">여행 기간이 어떻게 되시나요?</p>
          </v-row>
          <v-row justify="center">
              <div class="question-input" style="padding: 20px;">
                  <p>Start Date</p>
                  <input 
                    type="date" 
                    style="font-size: 22px;" 
                    v-model="startTravel"
                  >
              </div>
              <div class="question-input" style="padding: 20px;">
                  <p>End Date</p>
                  <input 
                    type="date" 
                    style="font-size: 22px;" 
                    v-model="endTravel"
                  >
              </div>
          </v-row>
          <v-row justify="center">
              <v-btn color="secondary" @click="validateStep2">NEXT</v-btn>
          </v-row>
      </div>
    </div>

    <!-- Step 3  -->
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
              <v-btn color="primary" @click="validateStep3">DONE!</v-btn>
          </v-row>
      </div> 
    </div>

    <!-- Snackbar for success message -->
    <v-snackbar v-model="snackbar" :timeout="3000" color="yellow">
      프로젝트가 성공적으로 생성되었습니다!
    </v-snackbar>
  </div>
</template>

<script>
import axios from 'axios';
import router from "@/router";

export default {
  data() {
    return {
      countryList: [],
      cityList: [],
      selectedCountry: null,
      selectedCity: null,
      startTravel: null,
      endTravel: null,
      title: '',
      snackbar: false,  // Snackbar 표시 상태
    };
  },
  async created() {
    try {
      const responseCountry = await axios.get('http://localhost:8088/api/v1/state/country');
      this.countryList = responseCountry.data.result;
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async loadCityList() {
      if (!this.selectedCountry) return;

      try {
        const responseCity = await axios.get('http://localhost:8088/api/v1/state/city', {
          params: {
            countryName: this.selectedCountry
          }
        });
        this.cityList = responseCity.data.result;
        this.selectedCity = null;  // 국가를 변경하면 도시 초기화
      } catch (e) {
        console.error(e);
      }
    },
    scrollToSection(refName) {
      const section = this.$refs[refName];
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    },
    validateStep1() {
      if (!this.selectedCountry || !this.selectedCity) {
        alert('국가와 도시를 선택해주세요.');
      } else {
        this.scrollToSection('CreateStep2');
      }
    },
    validateStep2() {
      if (!this.startTravel || !this.endTravel) {
        alert('여행 기간을 입력해주세요.');
      } else if (new Date(this.startTravel) > new Date(this.endTravel)) {
        alert('종료 날짜는 시작 날짜 이후여야 합니다.');
      } else {
        this.scrollToSection('CreateStep3');
      }
    },
    validateStep3() {
      if (!this.title) {
        alert('여행의 제목을 입력해주세요.');
      } else {
        this.submitProject();
      }
    },
    async submitProject() {
      const projectData = {
        title: this.title,
        startTravel: this.startTravel,
        endTravel: this.endTravel,
        state: {
          country: this.selectedCountry,
          city: this.selectedCity
        }
      };
      console.log(projectData);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:8088/api/v1/project/create', projectData, {
          headers: {
            'Authorization': `Bearer ${token}`, // Authorization 헤더 설정
            'Content-Type': 'application/json' // 데이터 전송 형식 설정
          }
        });
        console.log('Project created:', response.data);
        this.snackbar = true;  // 프로젝트 생성 성공 시 스낵바 표시
        // 추가적인 성공 처리 (예: 페이지 이동 등)
        router.push('/mypage');
      } catch (e) {
        console.error('Error creating project:', e);
      }
    }
  }
};
</script>


<style>
.selectStep{
  z-index: 2;
  position: fixed;
  left: 50%;
  transform: translateX( -50% );
  background-color: #fff;
  text-align: center;
  width: 500px;
  bottom: 120px;
  border-radius: 30px;
}
.selectStep li {
  margin: 20px;
  position: relative;
  display: inline-block;
  text-align: center;
  cursor: pointer;
}
.selectStep li:hover {
  font-weight: 700;
  color: #004B6B;
}
.backArea{
  background-image: url("/src/assets/img/airplane.jpg");
  height: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  background-size: cover;
  height: 100vh;
  padding: 45px 0 0;
}
.question {
  position: relative;
  margin: 15vh auto 0;
  height: 50vh;
  width: 50vw;
  text-align: center;
  background-color: #fff;
  border-radius: 20px;
}
.question a {
  font-size: 13px;
  padding: 0 20px;
}
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
