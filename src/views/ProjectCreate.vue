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
    
    <CreateStep1 ref="CreateStep1" />
    
    <CreateStep2 ref="CreateStep2"/>
    
    <CreateStep3 ref="CreateStep3"/>
      
  </template>
  
  <script>
  import CreateStep1 from '@/components/projectCreate/CreateStep1.vue';
  import CreateStep2 from '@/components/projectCreate/CreateStep2.vue';
  import CreateStep3 from '@/components/projectCreate/CreateStep3.vue';

  export default {
    data() {
      return {
        country: "",
        city: ""
      };
    },
    components: {
      CreateStep1,
      CreateStep2,
      CreateStep3,
    },
    methods:{
      scrollToSection(refName) {
        this.$refs[refName].$el.scrollIntoView({behavior: "smooth"});
    },
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
  }
  .selectStep li {
    margin: 20px;
    position: relative;
    display: inline-block;
    text-align: center;
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
    padding: 45px 0;
}
  .question {
    position: relative;
    margin: 15vh;
    height: 60vh;
    text-align: center;
    background-color: #fff;
    border-radius: 20px;
  }
  .question a {
    font-size: 13px;
    padding: 0 20px;
  }
  .question-title {
    padding: 50px 0 20px;
    font-size: 40px;
  }
  .question-input {
    margin: 20px;
    padding-bottom: 60px;
    font-size: 36px;
  }

  </style>
  