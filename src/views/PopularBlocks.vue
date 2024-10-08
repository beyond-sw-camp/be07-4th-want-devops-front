<template>
    <div>
        <div class="header">
            <h1 style="margin: 50px 0 80px"><strong><span style="color:dodgerblue;">📍{{ stateCity }}</span> 에서 인기 있는 추천
                    블럭을 확인해보세요 ! </strong></h1>
        </div>

        <div class="location-list">
            <v-row justify="center">
                <!-- 좌측 이미지 영역 -->
                <v-col cols="12" md="6">
                    <v-card>
                        <v-img :src="cityImageUrl" height="300px"></v-img>
                    </v-card>
                </v-col>

                <!-- 우측 블록 리스트 영역 -->
                <v-col cols="12" md="6">
                    <v-card>
                        <v-card-title>
                            <h2 style="text-align: center; width: fit-content; margin: 0 auto;"><strong>🖼️ 인기 명소</strong></h2>
                            <hr>
                        </v-card-title>                        
                        <v-list>
                            <v-list-item-group v-if="!loading && locations.length">
                                <v-list-item v-for="(location, index) in locations" :key="location.locationId"
                                    class="list-item">
                                    <v-list-item-content class="item-content" style="padding: 0 20px;">
                                        <div class="location-number" :class="{ 'special-number': index < 3 }"
                                            style="width: 50px; text-align: center;">
                                            {{ index + 1 }}
                                        </div>
                                        <div class="location-infos" style="margin-left: 50px;">
                                            <v-list-item-subtitle>{{ location.category }}</v-list-item-subtitle>
                                            <v-list-item-title>{{ location.placeName }}</v-list-item-title>
                                        </div>
                                        <div class="action-container">
                                            <v-list-item-action class="map-item-action" style="height: 30px;">
                                                <v-btn @click="openMapModal(location)" icon>
                                                    <v-icon>mdi-map-marker</v-icon>
                                                </v-btn>
                                                <span style="font-size: 12px; color:#666; margin-top: 4px;">위치</span>
                                            </v-list-item-action>
                                            <v-list-item-action class="location-item-action" style="height: 30px;">
                                                <v-btn @click="showProjectSelection(location)" icon>
                                                    <v-icon>mdi-export-variant</v-icon>
                                                </v-btn>
                                                <span class="heart-count" style="font-size: 12px; color:#666;">{{
                                                    location.popularCount }}</span>
                                            </v-list-item-action>
                                        </div>
                                    </v-list-item-content>

                                    <hr>
                                </v-list-item>
                            </v-list-item-group>
                            <v-list-item v-if="loading">
                                <v-list-item-content>
                                    <v-list-item-title>블록을 불러오는 중입니다...</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item v-else-if="!locations.length && !loading">
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
                        <select ref="projectSelect" class="form-select" v-model="selectedProject" required
                            style="flex: 1;">
                            <option value="" disabled>프로젝트 선택</option>
                            <option v-for="project in projects" :key="project.projectId" :value="project.projectId">
                                {{ project.projectTitle }}
                            </option>
                        </select>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="handlelocationImport">가져가기</v-btn>
                    <v-btn @click="showProjectDialog = false">취소</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- 맵 모달 -->
        <CustomModal v-model:modelValue="isMapModalVisible">
            <ShowMap :latitude="selectedlocation.latitude" :longitude="selectedlocation.longitude"
                :placeName="selectedlocation.placeName" />
        </CustomModal>
    </div>
</template>

<script>
import axios from 'axios';
import CustomModal from "@/components/CustomModal.vue";
import ShowMap from "@/components/ShowMap.vue";

export default {
    components: {
        CustomModal,
        ShowMap
    },
    data() {
        return {
            locations: [],
            loading: true,
            error: null,
            isMapModalVisible: false,
            showProjectDialog: false,
            selectedProject: null,
            projects: [],
            selectedlocation: null,
            filterOption: 'all',
            currentPage: 0,
            pageSize: 5,
            stateCity: '', // 도시 이름을 저장하는 데이터 속성
            cityImageUrl: '', // 도시 이미지 URL을 저장하는 데이터 속성
        };
    },
    created() {
        this.loadlocations();
        this.loadProjects();
        this.setCityInfo();
    },

    methods: {
        async loadlocations() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/city/${this.$route.params.stateId}`);
                this.locations = response.data.result || [];
            } catch (e) {
                this.error = '블록을 가져오는 중 오류가 발생했습니다.';
                console.error(e);
            } finally {
                this.loading = false;
            }
        },
        async loadProjects() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/v1/project/list`, {
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
        setCityInfo() {
            const cityId = this.$route.params.stateId;
            const cityInfo = this.getCityInfo(cityId);
            this.stateCity = cityInfo.name;
            this.cityImageUrl = cityInfo.image;
        },
        getCityInfo(cityId) {
            const cityInfoMap = {
                2: { name: '서울', image: require('@/assets/img/seoul.jpg') },
                3: { name: '대구', image: require('@/assets/img/daegu.jpg') },
                4: { name: '인천', image: require('@/assets/img/incheon.jpg') },
                5: { name: '광주', image: require('@/assets/img/gwangju.jpg') },
                6: { name: '대전', image: require('@/assets/img/daejeon.jpg') },
                7: { name: '울산', image: require('@/assets/img/ulsan.jpg') },
                8: { name: '세종', image: require('@/assets/img/sejong.jpg') },
                9: { name: '제주', image: require('@/assets/img/jeju.jpg') },
                10: { name: '경주', image: require('@/assets/img/gyeongju.jpg') },
                11: { name: '부산', image: require('@/assets/img/busan.jpg') },
                13: { name: '도쿄', image: require('@/assets/img/tokyo.jpg') },
                14: { name: '오사카', image: require('@/assets/img/osaka.jpg') },
                15: { name: '나고야', image: require('@/assets/img/nagoya.jpg') },
                16: { name: '삿포로', image: require('@/assets/img/sapporo.jpg') },
                17: { name: '후쿠오카', image: require('@/assets/img/fukuoka.jpg') },
                18: { name: '교토', image: require('@/assets/img/kyoto.jpg') },
                19: { name: '고베', image: require('@/assets/img/kobe.jpg') },
                20: { name: '요코하마', image: require('@/assets/img/yokohama.jpg') },
                22: { name: '뉴욕', image: require('@/assets/img/newyork.jpg') },
                23: { name: '로스앤젤레스', image: require('@/assets/img/losangeles.jpg') },
                24: { name: '샌프란시스코', image: require('@/assets/img/sanfrancisco.jpg') },
                25: { name: '라스베이거스', image: require('@/assets/img/lasvegas.jpg') },
                26: { name: '마이애미', image: require('@/assets/img/miami.jpg') },
                28: { name: '베이징', image: require('@/assets/img/beijing.jpg') },
                29: { name: '상하이', image: require('@/assets/img/shanghai.jpg') },
                30: { name: '광저우', image: require('@/assets/img/guangzhou.jpg') },
                31: { name: '시안', image: require('@/assets/img/xian.jpg') },
                32: { name: '청두', image: require('@/assets/img/chengdu.jpg') },
                34: { name: '런던', image: require('@/assets/img/london.jpg') },
                35: { name: '에든버러', image: require('@/assets/img/edinburgh.jpg') },
                36: { name: '맨체스터', image: require('@/assets/img/manchester.jpg') },
                37: { name: '리버풀', image: require('@/assets/img/liverpool.jpg') },
                38: { name: '버밍엄', image: require('@/assets/img/birmingham.jpg') },
                40: { name: '로마', image: require('@/assets/img/rome.jpg') },
                41: { name: '베네치아', image: require('@/assets/img/venice.jpg') },
                42: { name: '피렌체', image: require('@/assets/img/florence.jpg') },
                43: { name: '밀라노', image: require('@/assets/img/milan.jpg') },
                44: { name: '나폴리', image: require('@/assets/img/napoli.jpg') },
            };

            return cityInfoMap[cityId] || { name: '알 수 없는 도시', image: require('@/assets/img/airplane.jpg') };
        },
        openMapModal(location) {
            this.selectedlocation = location;
            this.isMapModalVisible = true;
        },
        showProjectSelection(location) {
            this.selectedlocation = location;
            this.showProjectDialog = true;
        },
        async handlelocationImport() {
            if (this.selectedProject && this.selectedlocation) {
                try {
                    const requestBody = {
                        location: this.selectedlocation,
                        projectId: this.selectedProject
                    };
                    await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/v1/block/import`, requestBody);
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
    },
};
</script>

<style scoped>
/* Header 스타일 */
.header {
    text-align: center;
    margin: 20px;
}

/* 블록 리스트 스타일 */
.location-list {
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
    gap: 16px;
    /* 여백을 추가 */
}

/* 숫자 순서 스타일 */
.location-number {
    font-size: 24px;
    font-weight: bold;
    margin-right: 10px;
}

/* 특별 숫자 스타일 (1, 2, 3 강조) */
.special-number {
    font-size: 33px;
    color: dodgerblue;
    font-weight: bolder;
}

/* 리스트 항목 제목 스타일 */
.v-list-item-title {
    font-weight: bold;
    font-size: 24px !important;

}

/* 리스트 항목 부제목 스타일 */
.v-list-item-subtitle {
    color: #555;

}

/* 블록 아이템 액션 스타일 */
.location-item-action {
    display: flex;
    flex-direction: column;
    /* 수직 정렬 */
    align-items: center;
    /* 수평 가운데 정렬 */
    justify-content: center;
    /* 수직 가운데 정렬 */
    position: absolute;
    top: 10px;
    right: 10px;
}

/* 맵 아이템 액션 스타일 */
.map-item-action {
    display: flex;
    flex-direction: column;
    /* 수직 정렬 */
    align-items: center;
    /* 수평 가운데 정렬 */
    justify-content: center;
    /* 수직 가운데 정렬 */
    position: absolute;
    top: 10px;
    right: 70px;
    /* 오른쪽 여백 */
}

/* 항목 콘텐츠 스타일 */
.item-content {
    display: flex;
    align-items: center;
    gap: 16px;
    /* 여백을 추가 */
}

/* 블록 하트 스타일 */
.location-heart-section {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* 블록 정보 스타일 */
.location-infos {
    flex: 1;
}

/* 하트 이모지 스타일 */
.heart-imozi {
    font-size: 40px;
}

/* 하트 카운트 스타일 */
.heart-count {
    margin-top: 4px;
    /* 이모지와 텍스트 사이의 간격 조정 */
}

/* 수평 선 스타일 */
hr {
    margin-left: 16px;
    /* 수평 선과 버튼 사이의 여백 */
    border: 1px solid #ccc;
    /* 선 스타일 */
}
</style>
