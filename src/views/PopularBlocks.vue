<template>
    <div>
        <div class="header">
            <h1>블록들</h1>
        </div>

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
                            <v-list-item-group v-if="!loading && blocks.length">
                                <v-list-item v-for="block in sortedBlocks" :key="block.blockId">
                                    <v-list-item-content>
                                        <v-list-item-title>{{ block.title }}</v-list-item-title>
                                        <v-list-item-subtitle>{{ block.content }}</v-list-item-subtitle>
                                        <v-list-item-subtitle>장소: {{ block.placeName }}</v-list-item-subtitle>
                                        <v-list-item-subtitle>좌표: {{ block.latitude }}, {{ block.longitude
                                            }}</v-list-item-subtitle>
                                        <v-list-item-subtitle>카테고리: {{ block.category }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                    <v-list-item-action class="block-item-action">
                                        <v-btn @click="showProjectSelection(block)" icon>
                                            <v-icon>mdi-export-variant</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
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
                    <select v-model="selectedProject" required>
                        <option value="" disabled>프로젝트 선택</option>
                        <option v-for="project in projects" :key="project.projectId" :value="project.projectId">
                            {{ project.projectTitle }}
                        </option>
                    </select>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="handleBlockImport">가져가기</v-btn>
                    <v-btn @click="showProjectDialog = false">취소</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            blocks: [],
            loading: true,
            error: null,
            showProjectDialog: false,
            selectedProject: null,
            projects: [],
            selectedBlock: null,
            filterOption: 'all',
            currentPage: 0,
            pageSize: 5,
        };
    },
    created() {
        this.loadBlocks();
        this.loadProjects();
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
        showProjectSelection(block) {
            this.selectedBlock = block;
            this.showProjectDialog = true;
        },
        async handleBlockImport() {
            if (this.selectedProject && this.selectedBlock) {
                try {
                    // 요청 본문 생성
                    const requestBody = {
                        blockId: this.selectedBlock.blockId,
                        projectId: this.selectedProject
                    };
                    console.log(requestBody);
                    // API 호출
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
        }


    }
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
    position: relative;
}

.v-list-item-title {
    font-weight: bold;
}

.v-list-item-subtitle {
    color: #555;
}

.block-item-action {
    position: absolute;
    top: 10px;
    right: 10px;
}
</style>
