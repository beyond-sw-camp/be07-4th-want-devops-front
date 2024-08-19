<template>

    <div class="container">
        <div class="projectBoard">
            <div class="blockHeader">
                <div class="category-buttons" style="display: flex; align-items: center; margin: 0 0 0 20px;">
                    <v-btn v-for="item in filteredCategories" :key="item.category"
                        style="font-size: 17px; font-weight: 700"
                        :style="{ backgroundColor: `rgb(${item.color.join(',')})`, color: '#fff', marginRight: '10px' }">
                        #{{ item.label }}
                    </v-btn>
                </div>
                <div class="blockTitle" style="font-size: 32px;">
                    {{ localBlock.title }}
                </div>
                <span @click="showMapModal = true" style="cursor: pointer;">
                    <v-card-subtitle>
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
                <span @click.stop="toggleMenu" ref="moreVertButton" class="material-symbols-outlined"
                    style="margin-left: 5px; cursor: pointer;">
                    more_vert
                </span>

                <!-- 모달 -->
                <div v-if="menuOpen" class="modal-menu" ref="modalMenu">
                    <div class="menu-item" @click="editBlock">
                        <v-icon>mdi-pencil</v-icon> 수정하기
                    </div>
                    <div class="menu-item" @click="deleteBlock">
                        <v-icon>mdi-delete</v-icon> 삭제하기
                    </div>
                </div>
            </div>
            <hr>
            <div class="slider-container">
                <button v-if="blockPhotos.length > 1" class="slider-btn prev-btn" @click="prevSlide">
                    <v-icon>mdi-chevron-left</v-icon>
                </button>
                <div class="slider">
                    <div class="slider-item" v-for="(photo, index) in blockPhotos" :key="photo.photoId"
                        :class="{ active: index === activeIndex }">
                        <div class="photo-container">
                            <v-img :src="photo.url" alt="블록 이미지" class="slider-image"></v-img>
                        </div>
                    </div>

                </div>
                <button v-if="blockPhotos.length >= 1" class="slider-btn next-btn" @click="nextSlide">
                    <v-icon>mdi-chevron-right</v-icon>
                </button>
            </div>
            <hr>
            <div class="blockContent" style="margin: 0 20px;">
                {{ localBlock.content }}
            </div>

        </div>

        <!-- 오른쪽: 카테고리명, 선택한 블록, 좋아요, 댓글 -->
        <div class="projectComment" style="display: inline-block; background-color: #F6F6F6">
            <!-- 카테고리 버튼 : 누르면 해당 카테고리만, 다시 누르면 전체 조회. -->
            <div class="block-heart" style="margin: 60px 10px 30px;">
                <!-- 좋아요 눌린 블럭은 하트 아이콘으로 표시 -->
                <v-icon @click.stop="toggleLike(localBlock)">
                    <!-- 좋아요 상태에 따라 아이콘 변경 -->
                    <template v-if="localBlock.isHearted">
                        mdi-heart
                    </template>
                    <template v-else>
                        mdi-heart-outline
                    </template>
                </v-icon>
                <span class="heart-count" style="font-size: 17px; font-weight: 700;">
                    좋아요 {{ localBlock.heartCount }}개
                </span>
            </div>

            <hr>
            <CommentSection :blockId="blockId" />
        </div>
    </div>


</template>


<script>
import axios from 'axios';
import GoogleMap from "@/components/GoogleMap.vue";
import CustomModal from "@/components/CustomModal.vue";
import CommentSection from "@/components/CommentSection.vue";
import { ref, onMounted } from 'vue';
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
            menuOpen: false,
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
        }
    },
    components: { CustomModal, GoogleMap, CommentSection },
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
            comments: null, // 초기값을 null로 설정
            startTime: null,
            endTime: null,
        });
        const blockPhotos = ref([]);
        const activeIndex = ref(0);

        const valid = ref(true);
        const startDateMenu = ref(false);
        const endDateMenu = ref(false);
        const selectedBlock = ref(null);

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

                // 서버에서 받은 데이터로 localBlock 업데이트
                localBlock.value = {
                    ...blockData,
                    category: categoryMap[blockData.category] || blockData.category,
                    isHearted: blockData.isHearted,
                };
                console.log(localBlock.value)

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
                        category: categoryInEnglish
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
            router.push('/block/main');
        };

        const deleteBlock = async () => {
            if (confirm('정말로 이 블록을 삭제하시겠습니까?')) {
                try {
                    await axios.delete(`http://localhost:8088/api/v1/block/${selectedBlock.value}/delete`);
                    alert('블록이 성공적으로 삭제되었습니다.');
                    router.push(`/project/${localBlock.value.projectId}/detail`);
                } catch (error) {
                    console.error('블록 삭제 중 오류 발생:', error);
                    alert('블록 삭제 중 오류가 발생했습니다.');
                }
            }
        }

        const handlePlaceSelected = (place) => {
            localBlock.value.placeName = place.name;
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
        const nextSlide = () => {
            activeIndex.value = (activeIndex.value + 1) % blockPhotos.value.length;
            updateSliderPosition();
        };

        const prevSlide = () => {
            activeIndex.value = (activeIndex.value - 1 + blockPhotos.value.length + 1) % (blockPhotos.value.length + 1);
            updateSliderPosition();
        };

        const updateSliderPosition = () => {
            const slider = document.querySelector('.slider');
            const offset = -activeIndex.value * 500; // 이미지 크기와 동일한 너비로 오프셋 계산
            slider.style.transform = `translateX(${offset}px)`;
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
        toggleMenu() {
            this.menuOpen = !this.menuOpen;
            if (this.menuOpen) {
                this.$nextTick(() => {
                    const buttonRect = this.$refs.moreVertButton.getBoundingClientRect();
                    const modalMenu = this.$refs.modalMenu;

                    modalMenu.style.top = `${buttonRect.bottom + window.scrollY}px`; // 버튼의 아래쪽에 위치 설정
                    modalMenu.style.left = `${buttonRect.right - modalMenu.offsetWidth}px`; // 버튼의 왼쪽 정렬에 맞춤
                });
            }
        },
        editBlock() {
            const blockId = this.blockId; // 현재 블록 ID 가져오기
            this.$router.push(`/block/${blockId}/detail`); // 해당 블록의 detail 페이지로 이동
        },
    }
};
</script>

<style>
.blockHeader {
    display: flex;
    align-items: center;
    /* 요소들을 수평으로 정렬 */
    justify-content: space-between;
    /* 요소들 사이의 간격을 고르게 배치 */
    padding: 10px 0;
    /* 패딩 추가 */
}

.category-buttons v-btn {
    margin-right: 10px;
    /* 버튼 간 간격 추가 */
}

.blockHeader span {
    margin-left: auto;
    /* 맵 아이콘을 오른쪽으로 밀기 */
}

.container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
}

/* 수정 & 삭제 모달 */
.modal-menu {
    position: absolute;
    top: 40px;
    right: 0;
    background-color: white;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    width: 150px;
}

.menu-item {
    padding: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.menu-item:hover {
    background-color: #f0f0f0;
}

.menu-item v-icon {
    margin-right: 8px;
}

.projectBoard {
    flex: 1;
    margin: 20px 0;
    padding: 20px;
    width: 60vw;
}

.projectComment {
    width: 450px;
    height: 100vh;
    position: absolute;
    top: 0;
    right: 0;
    background-color: white;
    padding: 80px 50px 0 20px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

/* 사진 슬라이더 부분 */
.slider-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    width: 500px;
    max-width: 500px;
    height: 500px;
}

.slider {
    display: flex;
    transition: transform 0.5s ease-in-out;
    height: 100%;
}

.slider-item {
    min-width: 500px;
    height: 500px;
    transition: opacity 0.3s ease-in-out;
    opacity: 1;
}

.slider-image {
    width: 500px;
    height: 500px;
    object-fit: cover;
}

.slider-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    padding: 10px;
    border: none;
    cursor: pointer;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}

.prev-btn {
    left: 10px;
}

.next-btn {
    right: 10px;
}

.slider-btn v-icon {
    font-size: 24px;
    color: black;
}

.photo-container {
    position: relative;
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
