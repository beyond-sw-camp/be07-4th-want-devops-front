<template>
<div class="container">
    <div class="question">
        <v-row justify="center">
            <p class="question-title">어디로 여행 가시나요?</p>
        </v-row>
        <v-row justify="center">
            <div class="question-input">
                <p>Country</p>
                <input
                v-model="country"
                class="form-control"
                placeholder="국가"
                type="text"
                />
            </div>
            <div class="question-input">
                <p>City</p>
                <input
                v-model="city"
                class="form-control"
                placeholder="도시"
                type="text"
                />
            </div>
        </v-row>
        <v-row justify="center">
            <v-btn color="secondary" type="submit">NEXT</v-btn>
        </v-row>
    </div>  
</div>  

   

  </template>
  
  <script>
  export default {
    data() {
      return {
        country: "",
        city: ""
      };
    }, 
  };
  </script>
  
  <style>
  .v-main {
    height: 100vh;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  background-size: cover;
    background-image: url(/Users/keemzleun/study/Want-Front/want_project_fe/src/assets/img/airplane.jpg);
  }
  .question {
    margin-top: 15vh;
    height: 50vh;
    text-align: center;
    background-color: #fff;
    border-radius: 20px;
  }
  .question-title {
    padding: 50px 0 40px;
    font-size: 48px;
  }
  .question-input {
    margin: 20px;
    padding-bottom: 60px;
    font-size: 36px;
  }

  </style>
  