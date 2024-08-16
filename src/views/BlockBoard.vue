<template>
    <v-app>
        <v-container>
            <!-- 블록 세부 정보 카드 -->
            <v-card>
                <v-row>
                    <!-- 왼쪽: 제목, 장소명, 이미지, 내용 -->
                    <v-col cols="8">
                        <v-card-title>
                            <span class="headline">{{ localBlock.title }}</span>
                        </v-card-title>
                        <v-card-subtitle>{{ localBlock.placeName }}</v-card-subtitle>
                    
                        <!-- 블럭내 이미지 -->
                        <div class="slider-container">
                            <button v-if="blockPhotos.length > 1" class="slider-btn prev-btn" @click="prevSlide">
                                <v-icon>mdi-chevron-left</v-icon>
                            </button>
                            <div class="slider">
                                <div
                                    class="slider-item"
                                    v-for="(photo, index) in blockPhotos"
                                    :key="photo.photoId"
                                    :class="{ active: index === activeIndex }"
                                >
                                    <div class="photo-container">
                                        <v-img :src="photo.url" alt="블록 이미지" class="slider-image"></v-img>
                                        <span class="material-symbols-outlined delete-btn" @click="deletePhoto(photo.photoId)">
                                            delete
                                        </span>
                                    </div>
                                </div>
                                <div v-if="blockPhotos.length <= 10" class="slider-item add-photo-item" @click="triggerFileUpload">
                                    <v-icon large>mdi-plus</v-icon>
                                    <input type="file" ref="photoInput" style="display: none;" @change="uploadPhoto" />
                                </div>
                                <div v-if="blockPhotos.length === 0" class="slider-item add-photo-item camera-item" @click="triggerFileUpload">
                                    <v-icon large>mdi-camera</v-icon>
                                    <p>사진을 추가하세요</p>
                                    <input type="file" ref="photoInput" style="display: none;" @change="uploadPhoto" />
                                </div>
                            </div>
                            <button v-if="blockPhotos.length >= 1" class="slider-btn next-btn" @click="nextSlide">
                                <v-icon>mdi-chevron-right</v-icon>
                            </button>
                        </div>
                        
                        
                        <v-card-text>{{ localBlock.content }}</v-card-text>
                    </v-col>

                    <!-- 오른쪽: 카테고리명, 선택한 블록, 좋아요, 댓글 -->
                    <v-col cols="4">
                        <v-card>
                            <v-list-item>
                                <v-list-item-content>
                                    <v-list-item-title>{{ localBlock.category }}</v-list-item-title>
                                    <v-list-item-subtitle>카테고리명</v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item>
                                <v-list-item-content>
                                    <v-list-item-title>블록 {{ selectedBlock }}</v-list-item-title>
                                    <v-list-item-subtitle>선택한 블록</v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item>
                                <v-list-item-content>
                                    <v-icon left :color="localBlock.liked ? 'red' : ''">mdi-heart</v-icon>
                                    <v-list-item-title>{{ localBlock.likes }} 좋아요</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item>
                                <v-list-item-content>
                                    <v-list-item-title>댓글</v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ localBlock.comments ? localBlock.comments.join(', ') : '댓글 없음' }}
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- 블록 업데이트 폼 -->
                <!-- BlockDetail 에서 참조할 거 다 가져오면 삭제 예정. BlockDetail 대신 BlockBoard 코드 사용하려 함. -->
                <v-card>
                    <v-card-title>
                        <span class="headline">블록 업데이트</span>
                    </v-card-title>
                    <v-card-subtitle>
                        <v-form ref="form" v-model="valid" @submit.prevent="updateBlock">
                            <v-text-field v-model="localBlock.title" label="제목" required />
                            <v-text-field v-model="localBlock.category" label="카테고리" required />
                            <v-textarea v-model="localBlock.content" label="내용" />
                            <div>
                                <v-btn @click="showMapModal = true" color="primary">구글 맵 보기</v-btn>
                                <CustomModal v-model:modelValue="showMapModal">
                                    <GoogleMap @place-selected="handlePlaceSelected" />
                                </CustomModal>
                            </div>
                            <v-text-field v-model="localBlock.placeName" label="장소 이름" />
                            <v-menu v-model="startDateMenu" :close-on-content-click="false"
                                transition="scale-transition" offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="localBlock.startTime" label="시작 시간" readonly v-bind="attrs"
                                        v-on="on" />
                                </template>
                                <v-date-picker v-model="localBlock.startTime" @input="startDateMenu = false" />
                            </v-menu>
                            <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition"
                                offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="localBlock.endTime" label="종료 시간" readonly v-bind="attrs"
                                        v-on="on" />
                                </template>
                                <v-date-picker v-model="localBlock.endTime" @input="endDateMenu = false" />
                            </v-menu>
                            <v-btn type="submit" color="primary">저장</v-btn>
                            <v-btn @click="cancel" color="secondary">취소</v-btn>
                            <v-btn @click="deleteBlock" color="red" class="ml-2">삭제</v-btn>
                        </v-form>
                    </v-card-subtitle>
                </v-card>
            </v-card>
        </v-container>
    </v-app>
</template>

<script>
import axios from 'axios';
import GoogleMap from "@/components/GoogleMap.vue";
import CustomModal from "@/components/CustomModal.vue";
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    components: { CustomModal, GoogleMap },
    setup() {
        const route = useRoute();
        const router = useRouter();

        const showMapModal = ref(false);
        const localBlock = ref({
            title: '',
            category: '',
            content: '',
            placeName: '',
            likes: 0,
            comments: null, // 초기값을 null로 설정
            liked: false,
            startTime: null,
            endTime: null,
        });
        const blockPhotos = ref([]);
        const activeIndex = ref(0);
        const oldFiles = ref([]);

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
                        category: categoryInEnglish
                    }, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    alert('블록이 성공적으로 업데이트되었습니다.');
                    router.push('/block/main');
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
                    await axios.delete(`http://localhost:8088/api/v1/block/${selectedBlock.value}/delete`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    alert('블록이 성공적으로 삭제되었습니다.');
                    router.push('/block/main');
                } catch (error) {
                    console.error('블록 삭제 중 오류 발생:', error);
                    alert('블록 삭제 중 오류가 발생했습니다.');
                }
            }
        };

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
            } catch(e){
                console.log(e);
            }
        };
        const nextSlide = () => {
            activeIndex.value = (activeIndex.value + 1) % (blockPhotos.value.length + 1);
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
        const deletePhoto = async (photoId, photoUrl) => {
            // URL을 oldFiles에 추가
            oldFiles.value.push(photoUrl);

            // 업데이트 요청
            try {
                const formData = new FormData();
                formData.append('blockId', selectedBlock.value);
                formData.append('oldFiles', JSON.stringify(oldFiles.value));
                formData.append('newFiles', JSON.stringify([])); // 새로운 파일 없음

                await axios.put('http://localhost:8088/api/v1/photo/update', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // 삭제된 사진을 블록 사진 목록에서 제거
                blockPhotos.value = blockPhotos.value.filter(photo => photo.photoId !== photoId);
                alert('사진이 성공적으로 삭제되었습니다.');
            } catch (error) {
                console.error('사진 삭제 중 오류 발생:', error);
                alert('사진 삭제 중 오류가 발생했습니다.');
            }
        };
        const triggerFileUpload = () => {
            document.querySelector("input[type='file']").click();
        };
        const uploadPhoto = async (event) => {
            const files = event.target.files;
            if (files.length > 0) {
                const formData = new FormData();
                formData.append('blockId', selectedBlock.value); // 블록 ID를 추가합니다.

                for (const file of files) {
                    formData.append('files', file);
                }

                try {
                    const response = await axios.post(
                        'http://localhost:8088/api/v1/photo/upload', // 업로드 API 엔드포인트
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                    const photoList = response.data.result.photoList;
                    blockPhotos.value.push(...photoList.map(photo => ({ ...photo, url: photo.url })));
                    alert('사진이 성공적으로 업로드되었습니다.');
                } catch (error) {
                    console.error('사진 업로드 중 오류 발생:', error);
                    alert('사진 업로드 중 오류가 발생했습니다.');
                }
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
            fetchBlock,
            updateBlock,
            cancel,
            deleteBlock,
            deletePhoto,
            handlePlaceSelected,
            blockPhotos,
            nextSlide,
            prevSlide,
            triggerFileUpload,
            uploadPhoto,
            oldFiles,
        };
    },
    
};
</script>

<style>
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
    opacity: 1; /* 기본적으로 모든 이미지 뚜렷하게 */
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
    display: block; /* 사진에 커서가 올라가면 삭제 버튼 표시 */
}
.camera-item p {
    margin-left: 8px;
}
</style>