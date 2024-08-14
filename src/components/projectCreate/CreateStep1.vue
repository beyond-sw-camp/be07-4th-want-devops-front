<template>
    <div class="backArea">
        <div class="question">
                <v-row justify="center">
                <p class="question-title">어디로 여행 가시나요?</p>
                </v-row>
                <v-row justify="center">
                    <div class="question-input">
                        <p>Country</p>
                        <select class="form-select mt-4" style="width: 200px; font-size: 18px;">
                            <option selected>국가</option>
                            <option v-for="country in countryList" :key="country.id" value="country.country">{{country.country}}</option>
                        </select>
                    </div>
                    <div class="question-input">
                        <p>City</p>
                        <select class="form-select mt-4" style="width: 200px; font-size: 18px;">
                            <option selected>도시</option>
                            <option v-for="city in cityList" :key="city.id" value="city.city">{{city.city}}</option>
                        </select>
                    </div>
                </v-row>
                <v-row justify="center">
                    <v-btn color="secondary">NEXT</v-btn>
                </v-row>
                
        </div>
    </div>
        
        
    
</template>
<script>
import axios from 'axios';
export default{
    data(){
        return{
            countryList:[],
            cityList:[]
        }
    },
    async created(){
        try{
            const response= await axios.get('http://localhost:8088/api/v1/state/country');
            this.countryList = response.data.result;
            console.log(this.countryList);
        }catch(e){
            console.log(e);
        }
    }
}
  </script>
<style>
</style>