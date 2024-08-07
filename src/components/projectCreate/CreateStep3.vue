<template>
    <div class="backArea">
        <div class="question">
            <v-col>
                <v-row justify="center">
                <p class="question-title">이번 여행의 제목을 지어주세요</p>
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