<template>
    <v-app>
        <!-- <HeaderComponent /> -->
        <v-container class="fill-height">
            <v-row>
                <v-col cols="12" md="8" class="scheduler-container">
                    <DxScheduler
                        :data-source="dataSource"
                        :current-date="currentDate"
                        :onAppointmentUpdated="onAppointmentUpdated"
                        :appointment-template="appointmentTemplate"
                    />
                </v-col>
                <v-col cols="12" md="4" class="block-list" ref="blockList">
                    <h2>BLOCK LIST</h2>
                    <!-- 카테고리 필터 버튼 추가 -->
                    <div class="category-buttons">
                        <v-btn
                            v-for="(color, category) in categoryColors"
                            :key="category"
                            :style="{ backgroundColor: `rgb(${color.join(',')})`, color: '#fff' }"
                            @click="filterByCategory(category)"
                        >
                            #{{ category }}
                        </v-btn>
                        <v-btn @click="filterByCategory(null)" color="secondary">All</v-btn>
                    </div>
                    <v-list>
                        <v-list-item
                            v-for="(block) in sortedFilteredDataSource"
                            :key="block.id"
                            :style="getStyle(block.category, block.heartCount)"
                            @click="editBlock(block)"
                            class="block-item"
                        >
                            {{ block.title }}
                        </v-list-item>
                    </v-list>
                    <v-btn @click="createTemporaryBlock" color="primary" class="create-button">블럭 생성</v-btn>
                </v-col>
            </v-row>
        </v-container>
        <!-- 블록 정보 입력 모달 -->
        <v-dialog v-model="dialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">블럭 정보 입력</span>
                </v-card-title>
                <v-card-subtitle>
                    <v-form v-if="selectedBlock">
                        <v-text-field
                            v-model="selectedBlock.projectId"
                            label="프로젝트 ID"
                            required
                        />
                        <v-text-field
                            v-model="selectedBlock.category"
                            label="카테고리"
                            required
                        />
                        <v-btn @click="saveBlock" color="primary">저장</v-btn>
                        <v-btn @click="closeDialog" color="secondary">취소</v-btn>
                    </v-form>
                </v-card-subtitle>
            </v-card>
        </v-dialog>
        <FooterComponent />
    </v-app>
</template>

<script>
import "devextreme/dist/css/dx.light.css";
import { DxScheduler } from "devextreme-vue/scheduler";
import axios from "axios";
// import HeaderComponent from "@/components/head_and_foot/HeaderComponent.vue";
import FooterComponent from "@/components/head_and_foot/FooterComponent.vue";

export default {
    components: {
        DxScheduler,
        // HeaderComponent,
        FooterComponent,
    },
    data() {
        return {
            dataSource: [], // 초기값을 빈 배열로 설정
            currentDate: new Date(),
            temporaryBlockId: 0,
            selectedBlock: {
                projectId: '',
                category: '',
                title: ''
            }, // 기본값 설정
            maxHeartCount: 10,
            pageSize: 10,
            hasMoreData: true,
            dialog: false, // 모달 창 상태 관리. 누르면 true
            selectedCategory: null, // 선택된 카테고리 상태 추가
            // 카테고리 색상 정의
            categoryColors: {
                SPOT: [255, 182, 193], // 분홍
                CAFE: [255, 255, 102], // 노랑
                RESTAURANT: [152, 251, 152], // 초록
                ETC: [192, 192, 192], // 회색
            },
        };
    },

    computed: {
        sortedDataSource() {
            return this.dataSource ? this.dataSource.slice().sort((a, b) => b.heartCount - a.heartCount) : [];
        },
        sortedFilteredDataSource() {
            if (this.selectedCategory === null) {
                return this.sortedDataSource;
            }
            return this.sortedDataSource.filter(block => block.category === this.selectedCategory);
        }
    },
    methods: {
        async fetchData() {
            if (!this.hasMoreData) return;
            try {
                const projectId = 1;
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `http://localhost:8088/api/v1/project/${projectId}/not/active/block/list`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            page: 0,  // 페이지 관련 파라미터 제거
                            size: this.pageSize,
                        },
                    }
                );
                const blockList = response.data.result;
                if (blockList && Array.isArray(blockList)) {
                    console.log("Fetched data:", blockList);
                    this.dataSource = blockList;
                } else {
                    console.error("Invalid data format:", blockList);
                }
                this.hasMoreData = false; // 더 이상의 데이터는 없음
            } catch (error) {
                console.error("데이터 가져오기 오류:", error);
            }
        },
        async onAppointmentUpdated(e) {
            const updatedBlock = e.appointmentData;
            const url = updatedBlock.active
                ? `/block/addDate`
                : `/block/${updatedBlock.id}/not/active`;
            try {
                await axios.patch(url, updatedBlock);
            } catch (error) {
                console.error("업데이트 중 오류 발생:", error);
            }
        },
        createTemporaryBlock() {
            const newBlock = {
                id: `temp-${this.temporaryBlockId++}`,
                title: "새 블럭",
                projectId: "1",
                category: "",
                heartCount: 0
            };
            this.dataSource.push(newBlock);
            this.selectedBlock = { ...newBlock }; // 새로운 객체로 설정
            this.dialog = true; // 모달 창 열기
        },
        async saveBlock() {
            if (!this.selectedBlock.category) {
                alert("카테고리를 입력해주세요.");
                return;
            }
            try {
                const requestBody = {
                    projectId: "1",
                    category: this.selectedBlock.category,
                };

                const token = localStorage.getItem("token");

                const response = await axios.post(
                    "http://localhost:8088/api/v1/block/create",
                    requestBody,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.status === 200) {
                    alert("블럭이 성공적으로 생성되었습니다.");
                    this.selectedBlock.id = response.data.result;
                    this.fetchData(); // 블럭 생성 후 데이터 새로고침
                    this.selectedBlock = null;
                    this.dialog = false; // 모달 창 닫기
                }
            } catch (error) {
                console.error(
                    "블럭 생성 오류:",
                    error.response ? error.response.data : error.message
                );
                alert(
                    "블럭 생성 중 오류가 발생했습니다. 서버 응답: " +
                    (error.response ? error.response.data : error.message)
                );
            }
        },
        closeDialog() {
            this.dialog = false; // 모달 창 닫기
        },
        appointmentTemplate(data) {
            return {
                template: `<div class="${data.appointmentData.category}" :style="getStyle(data.appointmentData.category, data.appointmentData.heartCount)">${data.appointmentData.name}</div>`,
            };
        },

        getStyle(category, heartCount) {
        // 기본 색상 설정
        const baseColor = this.categoryColors;

        // 선택된 카테고리의 기본 색상 가져오기
        const color = baseColor[category] || baseColor['ETC'];

        // 색상의 밝기를 조정하기 위한 변수 설정
        const minFactor = 0.8; // 최소 밝기 계수 (heartCount가 많을 때 밝기)
        const maxFactor = 1.4; // 최대 밝기 계수 (heartCount가 적을 때 어두움)

        // 밝기 계수를 계산 (heartCount에 따라 조정)
        const lightnessFactor = minFactor + ((heartCount - 0) / this.maxHeartCount) * (maxFactor - minFactor);

        // 색상 조정
        const [r, g, b] = color.map(c => Math.round(c * lightnessFactor));

        // 스타일 객체 반환
        return {
            backgroundColor: `rgb(${r}, ${g}, ${b})`,
            padding: "20px",
            margin: "10px 0",
            borderRadius: "5px",
            color: "#000",
        };
    },

        filterByCategory(category) {
            this.selectedCategory = category;
        }
    },
    mounted() {
        this.fetchData();
    }
};
</script>


<style scoped>
.scheduler-container {
    padding: 20px;
}

.block-list {
    padding: 20px;
    height: 600px;
    overflow-y: auto;
}

.block-list h2 {
    text-align: center;
}

.block-item {
    cursor: pointer;
    padding: 5px;
    border: 1px solid #ccc;
    margin: 5px 0;
    border-radius: 4px;
    text-align: center;
}

.create-button {
    margin-top: 10px;
    width: 100%;
}

.category-buttons {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.category-buttons .v-btn {
    margin: 0 5px;
}
</style>
