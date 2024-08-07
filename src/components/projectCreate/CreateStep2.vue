<template>
    <div class="backArea">
        <div class="question">
            <v-col>
                <v-row justify="center">
                <p class="question-title">여행 기간이 어떻게 되시나요?</p>
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
            </v-col> 
        </div>
    </div>  
        
  
</template>
<script>
</script>