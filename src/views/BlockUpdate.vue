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
                    <v-btn @click="deleteBlock" color="red" class="ml-2">삭제</v-btn>
                </v-form>
            </v-card-subtitle>
        </v-card>
    </v-container>
</v-app>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            localBlock: {
                title: '',
                category: '',
                content: '',
                placeName: '',
                startTime: null,
                endTime: null,
            },
            categoryMap: {
                SPOT: "명소",
                RESTAURANT: "식당",
                CAFE: "카페",
                ETC: "기타"
            },
            reverseCategoryMap: {
                "명소": "SPOT",
                "식당": "RESTAURANT",
                "카페": "CAFE",
                "기타": "ETC"
            },
            valid: true,
            startDateMenu: false,
            endDateMenu: false,
            selectedBlock: 0,
        };
    },

    async created() {
        this.selectedBlock = this.$route.params.id;
        await this.fetchBlock();
    },
    methods: {
        async fetchBlock() {
            try {
                const response = await axios.get(`http://localhost:8088/api/v1/block/detail/${this.selectedBlock}`);
                const blockData = response.data.result;

                // 서버에서 가져온 카테고리 코드를 한국어로 변환
                this.localBlock.title = blockData.title;
                this.localBlock.category = this.categoryMap[blockData.category] || blockData.category;
                this.localBlock.content = blockData.content;
                this.localBlock.placeName = blockData.placeName;
                this.localBlock.startTime = blockData.startTime;
                this.localBlock.endTime = blockData.endTime;
            } catch (error) {
                console.error('블록 정보를 가져오는 중 오류 발생:', error);
            }
        },
        async updateBlock() {
            if (this.$refs.form.validate()) {
                try {
                    // 카테고리를 영어 코드로 변환
                    const categoryInEnglish = this.reverseCategoryMap[this.localBlock.category] || this.localBlock.category;

                    // 변환된 카테고리로 블록 업데이트
                    await axios.patch(`http://localhost:8088/api/v1/block/${this.selectedBlock}/update`, {
                        ...this.localBlock,
                        category: categoryInEnglish
                    }, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    alert('블록이 성공적으로 업데이트되었습니다.');
                    this.$router.push('/block/create');
                } catch (error) {
                    console.error('블록 업데이트 중 오류 발생:', error);
                    alert('블록 업데이트 중 오류가 발생했습니다.');
                }
            }
        },


        cancel() {
            this.$router.push('/block/create'); 
        },

        async deleteBlock() {
        if (confirm('정말로 이 블록을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`http://localhost:8088/api/v1/block/${this.selectedBlock}/delete`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                alert('블록이 성공적으로 삭제되었습니다.');
                this.$router.push('/block/create'); // 삭제 후 홈으로 이동
            } catch (error) {
                console.error('블록 삭제 중 오류 발생:', error);
                alert('블록 삭제 중 오류가 발생했습니다.');
            }
        }
    },
    },
};
</script>
