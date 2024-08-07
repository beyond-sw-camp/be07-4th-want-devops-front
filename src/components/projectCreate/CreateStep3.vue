<template>
    <div class="backArea">
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
</script>