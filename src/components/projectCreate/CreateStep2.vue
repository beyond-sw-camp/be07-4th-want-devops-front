<template>
    <div class="backArea">
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
                    <v-btn color="secondary">NEXT</v-btn>
                </v-row>
            
        </div>
    </div>   
</template>
<script>
export default {
    data() {
      return {
        value: ''
      }
    }
  }
</script>
<style>

</style>