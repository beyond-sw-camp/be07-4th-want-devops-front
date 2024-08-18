<template>
    <div>
        <!-- Header Section -->
        <div class="header">
            <h1>블록들</h1>
        </div>

        <!-- Block List Section -->
        <div class="block-list">
            <v-row justify="center">
                <v-col cols="12" md="8">
                    <v-card>
                        <v-card-title>
                            <h2>블록 리스트</h2>
                        </v-card-title>
                        <v-card-subtitle>
                            <p>선택한 도시에서의 블록들을 확인하세요.</p>
                        </v-card-subtitle>
                        <v-list>
                            <!-- 조건부 렌더링: 데이터가 로드되었는지 확인 -->
                            <v-list-item-group v-if="!loading && blocks.length">
                                <v-list-item v-for="block in blocks" :key="block.blockId">
                                    <v-list-item-content>
                                        <v-list-item-title>{{ block.title }}</v-list-item-title>
                                        <v-list-item-subtitle>{{ block.content }}</v-list-item-subtitle>
                                        <v-list-item-subtitle>장소: {{ block.placeName }}</v-list-item-subtitle>
                                        <v-list-item-subtitle>좌표: {{ block.latitude }}, {{ block.longitude }}</v-list-item-subtitle>
                                        <v-list-item-subtitle>카테고리: {{ block.category.name }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>
                            <!-- 로딩 상태에 대한 메시지 -->
                            <v-list-item v-if="loading">
                                <v-list-item-content>
                                    <v-list-item-title>블록을 불러오는 중입니다...</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                            <!-- 데이터가 없을 때 메시지 -->
                            <v-list-item v-else-if="!blocks.length && !loading">
                                <v-list-item-content>
                                    <v-list-item-title>블록이 없습니다.</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-card>
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
    name: 'PopularBlocks',
    setup() {
        const route = useRoute();
        const stateId = route.params.stateId; // stateId만 사용
        const blocks = ref([]); // 빈 배열로 초기화
        const loading = ref(true);
        const error = ref(null);

        onMounted(async () => {
            try {
                const response = await axios.get(`http://localhost:8088/api/v1/city/${stateId}`);
                blocks.value = response.data.result || []; // 데이터가 없을 경우 빈 배열로 설정
            } catch (e) {
                error.value = '블록을 가져오는 중 오류가 발생했습니다.';
                console.error(e);
            } finally {
                loading.value = false;
            }
        });

        return {
            blocks,
            loading,
            error,
        };
    },
};
</script>

<style>
.header {
    text-align: center;
    margin: 20px;
}

.block-list {
    margin: 20px auto;
    max-width: 800px;
}

.v-card {
    border-radius: 10px;
}

.v-list-item-content {
    font-size: 18px;
}

.v-list-item-title {
    font-weight: bold;
}

.v-list-item-subtitle {
    color: #555;
}
</style>
