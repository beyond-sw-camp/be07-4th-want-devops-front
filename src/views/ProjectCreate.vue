<template>
    <div class="container">
      <div class="question">어디로 여행 가시나요?</div>
      <div class="question-input">
        <p>국가</p>
        <input
          v-model="country"
          class="form-control"
          placeholder="국가"
          type="text"
        />
      </div>
      <div class="question-input">
        <p>도시</p>
        <input
          v-model="city"
          class="form-control"
          placeholder="도시"
          type="text"
        />
      </div>
      <v-row justify="end">
        <v-btn color="secondary" type="submit">NEXT</v-btn>
      </v-row>
      
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
  .container {
    margin-top: 15vh;
    justify-content: center;
    text-align: center;
  }
  .question {
    padding: 50px;
    font-size: 48px;
  }
  .question-input {
    padding: 20px 30px 200px;
    font-size: 36px;
    display: inline-block;
  }
  </style>
  