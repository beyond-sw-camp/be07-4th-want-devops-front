<template>
    <v-app>
        <!-- 헤더 추가 -->
        <HeaderComponent />

        <v-container class="fill-height">
            <v-row>
                <!-- 스케줄러 컴포넌트 -->
                <v-col cols="12" md="8" class="scheduler-container">
                    <DxScheduler
                        :data-source="dataSource"
                        :current-date="currentDate"
                        :onAppointmentUpdated="onAppointmentUpdated"
                        :appointment-template="appointmentTemplate"
                    />
                </v-col>

                <!-- 생성된 블럭 목록 -->
                <v-col cols="12" md="4" class="block-list" ref="blockList">
                    <h2>생성된 블럭들</h2>
                    <v-list>
                        <v-list-item
                            v-for="(block) in sortedDataSource"
                            :key="block.id"
                            :style="getStyle(block.category, block.heartCount)"
                            @click="editBlock(block)"
                            class="block-item"
                        >
                            {{ block.title }}
                        </v-list-item>
                        <!-- 스크롤 밖에 꺼내둘지 블럭들 아래로 위치할지 -->
                        <v-btn @click="createTemporaryBlock" color="primary">블럭 생성</v-btn>
                    </v-list>
                </v-col>
            </v-row>

            <!-- 블럭 수정 폼 -->
            <v-row v-if="selectedBlock">
                <v-col cols="12">
                    <v-card>
                        <v-card-title>블럭 정보 입력</v-card-title>
                        <v-card-subtitle>
                            <v-form>
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
                            </v-form>
                        </v-card-subtitle>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>

        <!-- 푸터 추가 -->
        <FooterComponent />
    </v-app>
</template>

<script>
import "devextreme/dist/css/dx.light.css";
import { DxScheduler } from "devextreme-vue/scheduler";
import axios from "axios";
import HeaderComponent from "@/components/head_and_foot/HeaderComponent.vue";
import FooterComponent from "@/components/head_and_foot/FooterComponent.vue";

export default {
    components: {
        DxScheduler,
        HeaderComponent,
        FooterComponent,
    },
    data() {
        return {
            dataSource: [],
            currentDate: new Date(),
            temporaryBlockId: 0,
            selectedBlock: null,
            maxHeartCount: 10,
            page: 0,
            pageSize: 10,
            hasMoreData: true,
        };
    },
    computed: {
        sortedDataSource() {
            return this.dataSource.slice().sort((a, b) => b.heartCount - a.heartCount);
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
                    page: this.page,
                    size: this.pageSize,
                },
            }
        );

        const blockList = response.data.result;

        if (blockList.content.length < this.pageSize) {
            this.hasMoreData = false;
        }

        this.dataSource = [...this.dataSource, ...blockList.content];
        this.page += 1;
    } catch (error) {
        console.error("데이터 가져오기 오류:", error);
    }
},

        handleScroll() {
            const blockList = this.$refs.blockList;
            if (blockList && blockList.scrollTop + blockList.clientHeight >= blockList.scrollHeight - 10) {
                if (this.hasMoreData) {
                    this.fetchData();
                }
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
            this.selectedBlock = newBlock;
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
                    this.fetchData();
                    this.selectedBlock = null;
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

        appointmentTemplate(data) {
            return {
                template: `<div class="${data.appointmentData.category}" :style="getStyle(data.appointmentData.category, data.appointmentData.heartCount)">${data.appointmentData.name}</div>`,
            };
        },

        getStyle(category, heartCount) {
            const baseColor = {
                SPOT: [255, 182, 193], // 분홍
                CAFE: [255, 255, 102], // 노랑
                RESTAURANT: [152, 251, 152], // 초록
                ETC: [192, 192, 192],
            };

            const color = baseColor[category] || [192, 192, 192];

            const minFactor = 1.4;
            const maxFactor = 0.5;

            const lightnessFactor = heartCount === 0 ? minFactor : minFactor + (heartCount / this.maxHeartCount) * (maxFactor - minFactor);
            const [r, g, b] = color.map(c => Math.round(c * Math.max(maxFactor, Math.min(lightnessFactor, minFactor))));

            return {
                backgroundColor: `rgb(${r}, ${g}, ${b})`,
                padding: "20px",
                margin: "10px 0",
                borderRadius: "5px",
                color: "#000",
            };
        }
    },
    mounted() {
        this.fetchData();
        this.$nextTick(() => {
            const blockList = this.$refs.blockList;
            if (blockList) {
                blockList.addEventListener('scroll', this.handleScroll);
            }
        });
    },
    beforeUnmount() {
        const blockList = this.$refs.blockList;
        if (blockList) {
            blockList.removeEventListener('scroll', this.handleScroll);
        }
    },
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
</style>
