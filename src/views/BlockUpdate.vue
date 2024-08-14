<template>
<v-app>
    <v-container>
        <v-card>
            <v-card-title>
                <span class="headline">Block Update</span>
            </v-card-title>
            <v-card-subtitle>
                <v-form ref="form" v-model="valid" @submit.prevent="updateBlock">
                    <v-text-field v-model="localBlock.title" label="제목" required />
                    <v-text-field v-model="localBlock.category" label="카테고리" required />
                    <v-textarea v-model="localBlock.content" label="내용" />
                    <v-text-field v-model="localBlock.placeName" label="장소 이름" />
                    <v-menu v-model="startDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y >
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="localBlock.startTime" label="시작 시간" readonly v-bind="attrs" v-on="on" />
                        </template>
                        <v-date-picker v-model="localBlock.startTime" @input="startDateMenu = false" />
                    </v-menu>
                    <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y >
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="localBlock.endTime" label="종료 시간" readonly v-bind="attrs" v-on="on" />
                        </template>
                        <v-date-picker v-model="localBlock.endTime" @input="endDateMenu = false" />
                    </v-menu>
                    <v-btn type="submit" color="primary">저장</v-btn>
                    <v-btn @click="cancel" color="secondary">취소</v-btn>
                </v-form>
            </v-card-subtitle>
        </v-card>
    </v-container>
</v-app>
</template>

<script>
import axios from 'axios';

export default {
    props: {
        id: {
            type: String,
            required: true,
        }
    },
    data() {
        return {
            localBlock: {},
            valid: true,
            startDateMenu: false,
            endDateMenu: false,
        };
    },
    async created() {
        await this.fetchBlock();
    },
    methods: {
        async fetchBlock() {
        try {
            const response = await axios.get(`http://localhost:8088/api/v1/block/${this.id}`);
            this.localBlock = response.data;
        } catch (error) {
            console.error('블록 정보를 가져오는 중 오류 발생:', error);
        }
        },
        async updateBlock() {
            if (this.$refs.form.validate()) {
                try {
                    await axios.patch(`http://localhost:8088/api/v1/block/update/${this.id}`, this.localBlock, {
                        headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    alert('블록이 성공적으로 업데이트되었습니다.');
                    this.$router.push('/'); // 업데이트 후 홈으로 이동
                } catch (error) {
                    console.error('블록 업데이트 중 오류 발생:', error);
                    alert('블록 업데이트 중 오류가 발생했습니다.');
                }
            }
        },
        cancel() {
            this.$router.push('/block/create'); 
        }
    },
};
</script>
