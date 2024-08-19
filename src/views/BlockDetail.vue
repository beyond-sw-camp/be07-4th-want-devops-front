<template>
    <div class="container" style="width: 60%">
        <v-form ref="form" v-model="valid" @submit.prevent="updateBlock">
            <div style="display: flex; margin: 15px 5px">
                <v-btn @click="cancel" color="#999">취소</v-btn>
                <v-btn type="submit" color="primary" style="margin-left: auto">저장하기</v-btn>
            </div>
            <hr>
            <div class="blockFormHeader" style="display: flex; gap: 10px">
                <div class="form-floating" style="width: 20%; font-size: 18px;">
                    <select class="form-select" v-model="localBlock.category">
                        <option value="" disabled :selected="!localBlock.category">카테고리를 선택해주세요</option>
                        <option v-for="(item, index) in translatedCategories" :key="index" G :value="item.category">
                            {{ item.label }}
                        </option>
                    </select>
                    <label for="floatingSelect">CATEGORY</label>
                </div>
                <div class="form-floating" style="width: 80%">
                    <textarea class="form-control" v-model="localBlock.title" placeholder="제목을 입력해주세요"
                        required></textarea>
                    <label for="floatingTextarea">TITLE</label>
                </div>
            </div>

            <span @click="showMapModal = true" style="color: blue; cursor: pointer;">
                <v-card-subtitle style="margin: 15px 0; font-size: 15px">
                    <template v-if="localBlock.placeName">
                        📍 {{ localBlock.placeName }}
                    </template>
                    <template v-else>
                        🗺️ 지도에서 장소 지정하기
                    </template>
                </v-card-subtitle>
                <CustomModal v-model:modelValue="showMapModal">
                    <GoogleMap @place-selected="handlePlaceSelected" />
                </CustomModal>
            </span>
        </v-form>

        <div class="slider-container">
            <button v-if="filteredPhotos.length > 1" class="slider-btn prev-btn" @click="prevSlide">
                <v-icon>mdi-chevron-left</v-icon>
            </button>
            <div class="slider">
                <div class="slider-item" v-for="(photo, index) in filteredPhotos" :key="photo.id"
                    :class="{ active: index === activeIndex }">
                    <div class="photo-container">
                        <v-img :src="photo.url" alt="블록 이미지" class="slider-image"></v-img>
                        <span class="material-symbols-outlined delete-btn" @click="handleDelete(photo.id)">
                            delete
                        </span>
                    </div>
                </div>
                <div v-if="filteredPhotos.length <= 10" class="slider-item add-photo-item" @click="triggerFileUpload">
                    <v-icon large>mdi-plus</v-icon>
                    <input type="file" ref="photoInput" @change="handleFileUpload" style="display: none;" />
                </div>
                <div v-if="filteredPhotos.length === 0" class="slider-item add-photo-item camera-item"
                    @click="triggerFileUpload">
                    <v-icon large>mdi-camera</v-icon>
                    <p>사진을 추가하세요</p>
                    <input type="file" ref="photoInput" @change="handleFileUpload" style="display: none;" />
                </div>
            </div>
            <button v-if="filteredPhotos.length >= 1" class="slider-btn next-btn" @click="nextSlide">
                <v-icon>mdi-chevron-right</v-icon>
            </button>
        </div>
        <v-form>
            <div class="form-floating" style="margin: 20px 0 40px">
                <textarea class="form-control" v-model="localBlock.content" placeholder="내용을 입력해주세요" required
                    style="height: 300px;"></textarea>
                <label for="floatingTextarea">CONTENT</label>
            </div>
        </v-form>
    </div>


</template>


<script>
import axios from 'axios';
import GoogleMap from "@/components/GoogleMap.vue";
import CustomModal from "@/components/CustomModal.vue";
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    data() {
        return {
            categoryMap: {
                SPOT: "명소",
                RESTAURANT: "식당",
                CAFE: "카페",
                ETC: "기타"
            },
            categoryColors: {
                SPOT: [255, 182, 193],
                CAFE: [255, 180, 110],
                RESTAURANT: [173, 216, 230],
                ETC: [192, 192, 192],
            },

        }
    },
    computed: {
        translatedCategories() {
            return Object.keys(this.categoryMap).map(category => ({
                category,
                label: this.categoryMap[category],
                color: this.categoryColors[category]
            }));
        },
        filteredCategories() {
            const filtered = this.translatedCategories.filter(item => item.label === this.localBlock.category);
            console.log('Filtered Categories:', filtered); // 디버깅을 위한 로그
            return filtered;
        },
        filteredPhotos() {
            // 삭제할 사진을 제외한 사진만 필터링
            return this.blockPhotos.filter(photo => !this.delFiles.includes(photo.id))
                .concat(this.newFiles.map(file => ({ url: URL.createObjectURL(file), id: file.name })));
        }
    },
    components: { CustomModal, GoogleMap },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const blockId = ref(route.params.blockId)
        const showMapModal = ref(false);
        const localBlock = ref({
            title: '',
            category: '',
            content: '',
            placeName: '',
            heartCount: 0,
            startTime: null,
            endTime: null,
            latitude: null,
            longitude: null,
        });
        const blockPhotos = ref([]);
        const activeIndex = ref(0);

        const valid = ref(true);
        const startDateMenu = ref(false);
        const endDateMenu = ref(false);
        const selectedBlock = ref(null);

        const newFiles = ref([]); // 새로 추가된 파일
        const delFiles = []; // 삭제된 파일 URL

        const categoryMap = {
            SPOT: "명소",
            RESTAURANT: "식당",
            CAFE: "카페",
            ETC: "기타"
        };
        const reverseCategoryMap = {
            "명소": "SPOT",
            "식당": "RESTAURANT",
            "카페": "CAFE",
            "기타": "ETC"
        };

        const fetchBlock = async () => {
            try {
                const blockId = route.params.blockId;
                const response = await axios.get(`http://localhost:8088/api/v1/block/${blockId}/detail`);
                const blockData = response.data.result;
                console.log(blockData);
                localBlock.value = {
                    ...blockData,
                    category: categoryMap[blockData.category] || blockData.category,
                };
            } catch (error) {
                console.error('블록 정보를 가져오는 중 오류 발생:', error);
            }
        };

        const updateBlock = async () => {
            if (valid.value) {
                try {
                    const categoryInEnglish = reverseCategoryMap[localBlock.value.category] || localBlock.value.category;

                    await axios.patch(`http://localhost:8088/api/v1/block/${selectedBlock.value}/update`, {
                        ...localBlock.value,
                        category: categoryInEnglish,
                        latitude: localBlock.value.latitude,
                        longitude: localBlock.value.longitude,
                    }, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    alert('블록이 성공적으로 업데이트되었습니다.');
                    router.push(`/block/${localBlock.value.blockId}/board`);
                } catch (error) {
                    console.error('블록 업데이트 중 오류 발생:', error);
                    alert('블록 업데이트 중 오류가 발생했습니다.');
                }
            }
        };

        const cancel = () => {
            router.push(`/block/${localBlock.value.blockId}/board`);
        };

        const deleteBlock = async () => {
            if (confirm('정말로 이 블록을 삭제하시겠습니까?')) {
                try {
                    await axios.delete(`http://localhost:8088/api/v1/block/${selectedBlock.value}/delete`);
                    alert('블록이 성공적으로 삭제되었습니다.');
                    router.push(`/project/${localBlock.value.projectId}/board`);
                } catch (error) {
                    console.error('블록 삭제 중 오류 발생:', error);
                    alert('블록 삭제 중 오류가 발생했습니다.');
                }
            }
        }

        const handlePlaceSelected = (place) => {
            console.log(place)
            localBlock.value.placeName = place.name;
            localBlock.value.latitude = place.lat;
            localBlock.value.longitude = place.lng;
        };

        // 사진 관련 로직
        const getPhotos = async () => {
            try {
                const blockId = route.params.blockId;
                const response = await axios.get(`http://localhost:8088/api/v1/photo/${blockId}/list`);
                blockPhotos.value = response.data.result.photoList;
                console.log(blockPhotos.value);
            } catch (e) {
                console.log(e);
            }
        };

        const filteredPhotos = computed(() => {
            const delFileUrls = new Set(delFiles.value);
            return [
                ...blockPhotos.value.filter(photo => !delFileUrls.has(photo.id)),
                ...newFiles.value.map(file => ({ url: URL.createObjectURL(file), id: file.name })) // 새로 추가된 사진
            ];
        });

        const nextSlide = () => {
            activeIndex.value = (activeIndex.value + 1) % (filteredPhotos.value.length + 1);
            updateSliderPosition();
        };

        const prevSlide = () => {
            activeIndex.value = (activeIndex.value - 1 + filteredPhotos.value.length) % filteredPhotos.value.length;
            updateSliderPosition();
        };

        const updateSliderPosition = () => {
            const slider = document.querySelector('.slider');
            const offset = -activeIndex.value * 500; // 이미지 크기와 동일한 너비로 오프셋 계산
            slider.style.transform = `translateX(${offset}px)`;
        };

        const triggerFileUpload = () => {
            document.querySelector("input[type='file']").click();
        };

        const handleFileUpload = (event) => {
            const files = event.target.files;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    newFiles.value.push(files[i]);
                }
            }
            console.log(newFiles.value);
        };

        const handleDelete = (id) => {
            // 기존 블록에 있는 사진을 삭제할 때
            const isExistingPhoto = blockPhotos.value.some(photo => photo.id === id);
            if (isExistingPhoto) {
                blockPhotos.value = blockPhotos.value.map(photo =>
                    photo.id === id ? { ...photo, isDeleted: true } : photo
                );
                delFiles.push(id);
                console.log("delFiles", delFiles);
            } else {
                // 새로 추가된 사진(newFiles)에 해당하는 경우, newFiles에서만 삭제
                newFiles.value = newFiles.value.filter(file => file.name !== id);
                console.log("newFiles", newFiles.value);
            }
        };

        const updatePhoto = async () => {
            try {
                const formData = new FormData();
                formData.append('blockId', selectedBlock.value);

                if (delFiles.length > 0 && newFiles.value.length === 0) {
                    // 삭제만 있는 경우
                    delFiles.forEach(fileId => formData.append('delFiles', fileId));

                    const response = await axios.put(`http://localhost:8088/api/v1/photo/delete`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    console.log('사진 삭제 성공:', response.data);

                } else if (delFiles.length === 0 && newFiles.value.length > 0) {
                    // 추가만 있는 경우
                    newFiles.value.forEach(file => formData.append('files', file));

                    const response = await axios.post(`http://localhost:8088/api/v1/photo/upload`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    console.log('사진 추가 성공:', response.data);

                } else if (delFiles.length > 0 && newFiles.value.length > 0) {
                    // 삭제와 추가 모두 있는 경우
                    delFiles.forEach(fileId => formData.append('delFiles', fileId));
                    newFiles.value.forEach(file => formData.append('newFiles', file));

                    const response = await axios.put(`http://localhost:8088/api/v1/photo/update`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    console.log('사진 업데이트 성공:', response.data);
                }

            } catch (error) {
                console.error('사진 처리 중 오류 발생:', error);
                alert('사진 처리 중 오류가 발생했습니다.');
            }
        };

        onMounted(async () => {
            selectedBlock.value = route.params.blockId;
            await fetchBlock();
            await getPhotos();
        });

        return {
            showMapModal,
            localBlock,
            valid,
            startDateMenu,
            endDateMenu,
            selectedBlock,
            blockId,
            fetchBlock,
            updateBlock,
            cancel,
            deleteBlock,
            handlePlaceSelected,
            blockPhotos,
            nextSlide,
            prevSlide,
            triggerFileUpload,
            handleFileUpload,
            handleDelete,
            delFiles,
            newFiles,
            activeIndex,
            updatePhoto,
        };
    },
    methods: {
        async toggleLike(localBlock) {
            const wasLiked = localBlock.isHearted;
            const newHeartCount = wasLiked ? localBlock.heartCount - 1 : localBlock.heartCount + 1;
            localBlock.isHearted = !wasLiked;
            localBlock.heartCount = newHeartCount;
            try {
                await axios.post(
                    `http://localhost:8088/api/v1/block/${localBlock.blockId}/heart`,
                    {}, // 빈 본문으로 요청
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`, // 토큰을 헤더에 포함
                        },
                    }
                );
            } catch (error) {
                console.error("좋아요 업데이트 중 오류 발생:", error);
                // 업데이트 실패 시 로컬에서 변경 사항 되돌리기
                localBlock.isHearted = wasLiked;
                localBlock.heartCount = wasLiked ? localBlock.heartCount + 1 : localBlock.heartCount - 1;
            }
        },
        getStyle() {
            return {
                backgroundColor: localStorage.getItem('backgroundColor'),
                padding: "20px",
                margin: "10px 0",
                borderRadius: "10px !important",
                color: "#000",
            };
        },
    }
};
</script>

<style>
.slider-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    width: 400px;
    max-width: 400px;
    height: 400px;
    margin: auto;
}


.add-photo-item {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    cursor: pointer;
}

.delete-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
    color: white;
    border-radius: 50%;
    padding: 5px;
    cursor: pointer;
    z-index: 3;
    display: none;
}

.photo-container:hover .delete-btn {
    display: block;
    /* 사진에 커서가 올라가면 삭제 버튼 표시 */
}

.camera-item p {
    margin-left: 8px;
}

.comment-text {
    white-space: pre-wrap;
    /* 줄바꿈과 공백을 유지 */
    overflow-wrap: break-word;
    /* 단어가 넘칠 때 줄바꿈 */
    word-wrap: break-word;
    /* 단어가 넘칠 때 줄바꿈 */
}
</style>
