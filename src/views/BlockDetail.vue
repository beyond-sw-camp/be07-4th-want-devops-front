<template>
  <v-app>
      <v-container>
          <v-card>
              <!-- 삭제 버튼을 첫 번째 v-col 내부에 위치 -->
              <div style="display: flex; justify-content: flex-start; padding: 8px 0;">
                  <v-btn @click="deleteBlock" color="red" small>
                      <v-icon left small>mdi-delete</v-icon>
                      일정 삭제하기
                  </v-btn>
                  <div style="float: right; width:fit-content;">
                      <v-btn type="submit" color="primary">저장</v-btn>
                      <v-btn @click="cancel" color="secondary">취소</v-btn>
                  </div>
              </div>

              <v-form ref="form" v-model="valid" @submit.prevent="updateBlock">
                  <v-row>
                      <v-col cols="3" style="padding: 5px">
                          <v-select v-model="localBlock.category" label="카테고리" required>
                              <option 
                                  v-for="category in categoryMap" 
                                  :key="category.id" 
                              >
                                  {{ category.category }}
                              </option>
                          </v-select> 
                      </v-col>
                      <v-col cols="9" style="padding: 5px">
                          <v-text-field v-model="localBlock.title" label="제목" required />
                      </v-col>
                      
                  </v-row>
                  <span @click="showMapModal = true" style="color: blue; cursor: pointer;">
                      <v-card-subtitle style="margin: 0 0 20px">
                          <template v-if="localBlock.placeName">
                              📍 {{ localBlock.placeName }}
                          </template>
                          <template v-else>
                              📍 지도에서 장소 지정하기
                          </template>
                      </v-card-subtitle>
                      <CustomModal v-model:modelValue="showMapModal">
                          <GoogleMap @place-selected="handlePlaceSelected" />
                      </CustomModal>
                  </span>
              </v-form>

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
              <v-form>
                  <v-textarea v-model="localBlock.content" label="내용" style="margin: 40px 0 0" />
              </v-form>
              
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
                  await axios.delete(`http://localhost:8088/api/v1/block/${selectedBlock.value}/delete`);
                  alert('블록이 성공적으로 삭제되었습니다.');
                  router.push('/block/main');
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
          blockId,
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
  width: 500px;
  max-width: 500px;
  height: 500px;
  margin: auto;
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

.comment-text {
  white-space: pre-wrap;
  /* 줄바꿈과 공백을 유지 */
  overflow-wrap: break-word;
  /* 단어가 넘칠 때 줄바꿈 */
  word-wrap: break-word;
  /* 단어가 넘칠 때 줄바꿈 */
}

</style>

