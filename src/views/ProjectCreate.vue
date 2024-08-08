<template>
  <div class="selectStep">
      <li @click="scrollToSection('CreateStep1')">
          STEP 1<br/>지역 선택
      </li>
      <li @click="scrollToSection('CreateStep2')">
          STEP 2<br/>기간 선택
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
            <option disabled selected>국가</option>
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
            <option disabled selected>도시</option>
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
        <v-btn color="secondary" @click="scrollToSection('CreateStep2')">NEXT</v-btn>
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
                <input type="date" style="font-size: 22px;">
            </div>
            <div class="question-input" style="padding: 20px;">
                <p>End Date</p>
                <input type="date" style="font-size: 22px;">
            </div>
        </v-row>
        <v-row justify="center">
            <v-btn color="secondary" @click="scrollToSection('CreateStep3')">NEXT</v-btn>
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
                v-model="country"
                class="form-control"
                placeholder="제목"
                type="text"
                style="width: 400px;"
                />
            </div>
        </v-row>
        <v-row justify="center">
            <v-btn color="primary" type="submit">DONE!</v-btn>
        </v-row>
    </div> 
  </div>
</template>
  
<script>
import axios from 'axios';

export default {
  data() {
    return {
      countryList: [],
      cityList: [],
      selectedCountry: null,
      selectedCity: null
    };
  },
  async created() {
    try {
      const responseCountry = await axios.get('http://localhost:8088/api/v1/state/country');
      this.countryList = responseCountry.data.result;
    } catch (e) {
      console.log(e);
    }
  },
  methods: {
    async loadCityList() {
    if (!this.selectedCountry) return;

    try {
      const responseCity = await axios.get('http://localhost:8088/api/v1/state/city', {
        params: {
          countryName: this.selectedCountry // 프론트엔드에서 'countryName'으로 전달
        }
      });
      this.cityList = responseCity.data.result;
      this.selectedCity = null; // 국가 변경 시 선택된 도시 초기화
    } catch (e) {
      console.log(e);
    }
  },
    scrollToSection(refName) {
      this.$refs[refName].scrollIntoView({ behavior: "smooth" });
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
.v-main{
  background-image: url("/src/assets/img/airplane.jpg");
  height: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  background-size: cover;
}
.backArea{
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
