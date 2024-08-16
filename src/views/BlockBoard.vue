<template>
    <v-app>
        <v-container>
            <v-card>
                <v-row>
                    <!-- 왼쪽: 제목, 장소명, 이미지, 내용 -->
                    <v-col cols="8">
                        <v-form ref="form" v-model="valid" @submit.prevent="updateBlock">
                            <v-card-title>
                                <v-text-field v-model="localBlock.title" label="제목" required />
                            </v-card-title>
                            <span @click="showMapModal = true" style="color: blue; cursor: pointer;">
                                <v-card-subtitle>
                                    <template v-if="localBlock.placeName">
                                        {{ localBlock.placeName }}
                                    </template>
                                    <template v-else>
                                        📍 지도에서 장소 지정하기
                                    </template>
                                </v-card-subtitle>
                                <CustomModal v-model:modelValue="showMapModal">
                                    <GoogleMap @place-selected="handlePlaceSelected" />
                                </CustomModal>
                            </span>
                            <v-img :src="localBlock.imageUrl" alt="블록 이미지" class="mb-3"></v-img>
                            <v-textarea v-model="localBlock.content" label="내용" style="margin-left: 15px;"/>
                        </v-form>
                    </v-col>

                    <!-- 오른쪽: 카테고리명, 선택한 블록, 좋아요, 댓글 -->
                    <v-col cols="4">

                        <!-- 카테고리 버튼 : 누르면 해당 카테고리만, 다시 누르면 전체 조회. -->
                        <div class="category-buttons-wrapper">
                            <div class="category-buttons">
                                <v-btn v-for="item in filteredCategories" :key="item.category"
                                    :style="{ backgroundColor: `rgb(${item.color.join(',')})`, color: '#fff' }">
                                    #{{ item.label }}
                                </v-btn>
                            </div>
                        </div>
                        <v-list-item :style="getStyle()">
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ localBlock.title }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <div class="block-heart">
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
                                <span class="heart-count" style="font-size: small;"> 좋아요 {{ localBlock.heartCount }}
                                    개</span>
                            </div>
                        </v-list-item>
                         <CommentSection :blockId="blockId" />
                    </v-col>
                </v-row>
                <div style="float: right; width:fit-content; margin-top: 16px;">
                    <v-btn type="submit" color="primary">저장</v-btn>
                    <v-btn @click="cancel" color="secondary">취소</v-btn>
                    <v-btn @click="deleteBlock" color="red" class="ml-2">삭제</v-btn>
                </div>
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
              <v-text-field v-model="localBlock.title" label="제목" required/>
              <v-text-field v-model="localBlock.category" label="카테고리" required/>
              <v-textarea v-model="localBlock.content" label="내용"/>
              <div>
                <v-btn @click="showMapModal = true" color="primary">구글 맵 보기</v-btn>
                <CustomModal v-model:modelValue="showMapModal">
                  <GoogleMap @place-selected="handlePlaceSelected"/>
                </CustomModal>
              </div>
              <v-text-field v-model="localBlock.placeName" label="장소 이름"/>
              <v-menu v-model="startDateMenu" :close-on-content-click="false"
                      transition="scale-transition" offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="localBlock.startTime" label="시작 시간" readonly v-bind="attrs"
                                v-on="on"/>
                </template>
                <v-date-picker v-model="localBlock.startTime" @input="startDateMenu = false"/>
              </v-menu>
              <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition"
                      offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="localBlock.endTime" label="종료 시간" readonly v-bind="attrs"
                                v-on="on"/>
                </template>
                <v-date-picker v-model="localBlock.endTime" @input="endDateMenu = false"/>
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
import CommentSection from "@/components/CommentSection.vue";
import {ref, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';

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

        const showMapModal = ref(false);
        const localBlock = ref({
            title: '',
            category: '',
            content: '',
            placeName: '',
            imageUrl: '',
            heartCount: 0,
            comments: null, // 초기값을 null로 설정
            startTime: null,
            endTime: null,
        });

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
                localBlock.value = {
                    ...blockData,
                    category: categoryMap[blockData.category] || blockData.category,
                    isHearted: blockData.isHearted
                };
            } catch (error) {
                console.error('블록 정보를 가져오는 중 오류 발생:', error);
            }
        };

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
        onMounted(async () => {
            selectedBlock.value = route.params.blockId;
            await fetchBlock();
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
            handlePlaceSelected,
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
.comment-text {
  white-space: pre-wrap; /* 줄바꿈과 공백을 유지 */
  overflow-wrap: break-word; /* 단어가 넘칠 때 줄바꿈 */
  word-wrap: break-word; /* 단어가 넘칠 때 줄바꿈 */
}
</style>
