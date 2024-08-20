<template>
    <div>
        <div class="header">
            <h1><strong><span style="color:dodgerblue;">📍{{ stateCity }}</span> 에서 인기 있는 추천 장소를 확인해보세요 ! </strong></h1>
        </div>

        <div class="block-list">
            <v-row justify="center">
                <!-- 좌측 이미지 영역 -->
                <v-col cols="12" md="4">
                    <v-card>
                        <v-img :src="getCityImageUrl($route.params.stateId)" height="300px"></v-img>
                    </v-card>
                </v-col>

                <!-- 우측 블록 리스트 영역 -->
                <v-col cols="12" md="8">
                    <v-card>
                        <v-card-title>
                            <h2><strong>추천 장소</strong></h2>
                            <hr>
                        </v-card-title>
                        <v-list>
                            <v-list-item-group v-if="!loading && blocks.length">
                                <v-list-item v-for="block in sortedBlocks" :key="block.blockId" class="list-item">
                                    <v-list-item-content class="item-content">
                                        <div class="block-heart">
                                            <div class="heart-imozi" style="font-size:30px">
                                                🩵
                                            </div>
                                            <span class="heart-count"> 좋아요 {{ block.heartCount }}개</span>
                                        </div>
                                        <div class="block-infos" style="margin-left: 50px;">
                                            <v-list-item-title>{{ block.title }}</v-list-item-title>
                                            <v-list-item-subtitle>{{ block.content }}</v-list-item-subtitle>
                                            <v-list-item-subtitle>장소: {{ block.placeName }}</v-list-item-subtitle>
                                            <v-list-item-subtitle>카테고리: {{ block.category }}</v-list-item-subtitle>
                                            <v-list-item-subtitle>좋아요 {{ block.heartCount }} 개</v-list-item-subtitle>
                                        </div>
                                    </v-list-item-content>
                                    <div class="action-container">
                                        <v-list-item-action class="map-item-action">
                                            <v-btn @click="openMapModal(block)" icon>
                                                <v-icon>mdi-map-marker</v-icon>
                                            </v-btn>
                                        </v-list-item-action>
                        
                                        <v-list-item-action class="block-item-action">
                                            <v-btn @click="showProjectSelection(block)" icon>
                                                <v-icon>mdi-export-variant</v-icon>
                                            </v-btn>
                                        </v-list-item-action>
                                    </div>
                                    <hr>
                                </v-list-item>
                            </v-list-item-group>
                            <v-list-item v-if="loading">
                                <v-list-item-content>
                                    <v-list-item-title>블록을 불러오는 중입니다...</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
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

        <v-dialog v-model="showProjectDialog" max-width="500px">
            <v-card v-if="!loading">
                <v-card-title>프로젝트 선택</v-card-title>
                <v-card-subtitle>블록을 등록할 프로젝트를 선택하세요.</v-card-subtitle>
                <v-card-text>
                    <div style="display: flex; align-items: center;">
                        <select ref="projectSelect" v-model="selectedProject" required style="flex: 1; 
                            border: 2px solid #007BFF; /* 테두리 두께, 스타일, 색상 설정 */
                            border-radius: 4px; 
                            padding: 8px;">
                            <option value="" disabled>프로젝트 선택</option>
                            <option v-for="project in projects" :key="project.projectId" :value="project.projectId">
                                {{ project.projectTitle }}
                            </option>
                        </select>
                        <v-icon style="margin-left: 8px; cursor: pointer;" @click="openSelect">
                            mdi-arrow-down-drop-circle-outline
                        </v-icon>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="handleBlockImport">가져가기</v-btn>
                    <v-btn @click="showProjectDialog = false">취소</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- 맵 모달 -->
        <CustomModal v-model:modelValue="isMapModalVisible">
            <ShowMap :latitude="selectedBlock.latitude" :longitude="selectedBlock.longitude"
                :placeName="selectedBlock.placeName" />
        </CustomModal>
    </div>
</template>

<script>
import axios from 'axios';
import seoulImage from '@/assets/img/seoul.jpg';
import parisImage from '@/assets/img/paris.jpg';
import newYorkImage from '@/assets/img/newyork.jpg';
import busanImage from '@/assets/img/busan.jpg';
import gyeongjuImage from '@/assets/img/gyeongju.jpg';
import jejuImage from '@/assets/img/jeju.jpg';
import fukuokaImage from '@/assets/img/fukuoka.jpg';
import osakaImage from '@/assets/img/osaka.jpg';
import CustomModal from "@/components/CustomModal.vue";
import ShowMap from "@/components/ShowMap.vue";

export default {
    components: {
        CustomModal,
        ShowMap
    },
    data() {
        return {
            blocks: [],
            loading: true,
            error: null,
            isMapModalVisible: false,
            showProjectDialog: false,
            selectedProject: null,
            projects: [],
            selectedBlock: null,
            filterOption: 'all',
            currentPage: 0,
            pageSize: 5,
            stateCity: '', // 도시 이름을 저장하는 데이터 속성
        };
    },
    created() {
        this.loadBlocks();
        this.loadProjects();
        this.setCityName();
    },
    computed: {
        sortedBlocks() {
            return this.blocks.slice().sort((a, b) => b.heartCount - a.heartCount);
        }
    },
    methods: {
        async loadBlocks() {
            try {
                const response = await axios.get(`http://localhost:8088/api/v1/city/${this.$route.params.stateId}`);
                this.blocks = response.data.result || [];
            } catch (e) {
                this.error = '블록을 가져오는 중 오류가 발생했습니다.';
                console.error(e);
            } finally {
                this.loading = false;
            }
        },
        async loadProjects() {
            try {
                const response = await axios.get(`http://localhost:8088/api/v1/project/list`, {
                    params: {
                        page: this.currentPage,
                        size: this.pageSize,
                        filter: this.filterOption,
                    },
                });
                this.projects = Array.isArray(response.data.result.content) ? response.data.result.content : [];
                console.log(this.projects);
            } catch (e) {
                console.error('프로젝트를 가져오는 중 오류 발생:', e);
            }
        },
        setCityName() {
            const cityId = this.$route.params.stateId;
            this.stateCity = this.getCityName(cityId);
        },
        getCityName(cityId) {
            const cityIdToNameMap = {
                5: '서울',
                6: '오사카',
                7: '뉴욕',
                8: '후쿠오카',
                9: '제주',
                10: '경주',
                11: '부산',
                12: '파리',
            };
            return cityIdToNameMap[cityId] || '알 수 없는 도시';
        },
        openMapModal(block) {
            this.selectedBlock = block;
            this.isMapModalVisible = true;
        },
        showProjectSelection(block) {
            this.selectedBlock = block;
            this.showProjectDialog = true;
        },
        async handleBlockImport() {
            if (this.selectedProject && this.selectedBlock) {
                try {
                    const requestBody = {
                        blockId: this.selectedBlock.blockId,
                        projectId: this.selectedProject
                    };
                    console.log(requestBody);
                    await axios.post('http://localhost:8088/api/v1/block/import', requestBody);
                    alert('블록을 성공적으로 가져왔습니다.');
                    this.showProjectDialog = false;
                } catch (error) {
                    console.error('블록 가져가기 중 오류 발생:', error);
                    alert('블록 가져가기 중 오류가 발생했습니다.');
                }
            } else {
                alert('프로젝트를 선택하세요.');
            }
        },
        getCityImageUrl(cityId) {
            const cityIdToNameMap = {
                5: 'seoul',
                6: 'osaka',
                7: 'newyork',
                8: 'fukuoka',
                9: 'jeju',
                10: 'gyeongju',
                11: 'busan',
                12: 'paris',
            };

            const cityImages = {
                seoul: seoulImage,
                paris: parisImage,
                newyork: newYorkImage,
                busan: busanImage,
                fukuoka: fukuokaImage,
                jeju: jejuImage,
                osaka: osakaImage,
                gyeongju: gyeongjuImage,
            };
            const cityName = cityIdToNameMap[cityId];
            return cityImages[cityName] || require('@/assets/img/airplane.jpg');
        },
    },
};
</script>

<style>
/* Header 스타일 */
.header {
    text-align: center;
    margin: 20px;
}

/* 블록 리스트 스타일 */
.block-list {
    margin: 20px auto;
    max-width: 1200px;
}

/* 카드 스타일 */
.v-card {
    border-radius: 10px;
}

/* 리스트 항목 콘텐츠 스타일 */
.v-list-item-content {
    font-size: 18px;
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px; /* 여백을 추가 */
}

/* 리스트 항목 제목 스타일 */
.v-list-item-title {
    font-weight: bold;
}

/* 리스트 항목 부제목 스타일 */
.v-list-item-subtitle {
    color: #555;
}

/* 블록 아이템 액션 스타일 */
.block-item-action {
    position: absolute;
    top: 10px;
    right: 10px;
}

/* 맵 아이템 액션 스타일 */
.map-item-action {
    position: absolute;
    top: 10px;
    right: 70px; /* 오른쪽 여백 */
}

/* 항목 콘텐츠 스타일 */
.item-content {
    display: flex;
    align-items: center;
    gap: 16px; /* 여백을 추가 */
}

/* 블록 하트 스타일 */
.block-heart {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* 블록 정보 스타일 */
.block-infos {
    flex: 1;
}

/* 하트 이모지 스타일 */
.heart-imozi {
    font-size: 40px;
}

/* 하트 카운트 스타일 */
.heart-count {
    margin-top: 4px; /* 이모지와 텍스트 사이의 간격 조정 */
}

/* 수평 선 스타일 */
hr {
    margin-left: 16px; /* 수평 선과 버튼 사이의 여백 */
    border: 1px solid #ccc; /* 선 스타일 */
}

</style>
