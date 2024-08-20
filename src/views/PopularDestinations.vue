<template>
    <div>
        <div class="header">
            <h1><strong><span style="color:dodgerblue;">🛫 WANT</span> 에서 인기 있는 여행지를 확인해보세요 ! </strong></h1>
        </div>

        <div class="destination-list">
            <v-row justify="center">
                <v-col cols="12" md="3" class="pa-2" v-for="destination in sortedDestinations" :key="destination.id">
                    <v-card class="mx-auto my-4" @click="goToTasks(destination)">
                        <div class="image-container">
                            <div :class="getCityImageClass(destination.city)" class="city-image"></div>
                        </div>
                        <v-card-title>{{ destination.city }}</v-card-title>
                        <v-card-subtitle>{{ destination.country }}</v-card-subtitle>
                        <v-card-subtitle v-if="destination.projectCount !== undefined" style="margin-bottom:10px">
                            프로젝트 수: {{ destination.projectCount }}
                        </v-card-subtitle>
                    </v-card>
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            destinations: [],
        };
    },
    async created() {
        try {
            const response = await axios.get('http://localhost:8088/api/v1/popular/destinations');
            const cities = response.data.result;
            this.destinations = cities.map(city => ({
                id: city.id,
                city: city.city,
                country: city.country,
                projectCount: city.projectCount,
            }));
        } catch (e) {
            console.error(e);
        }
    },

    computed: {
        sortedDestinations() {
            return this.destinations.slice().sort((a, b) => b.projectCount - a.projectCount);
        }
    },

    methods: {
        goToTasks(destination) {
            this.$router.push({ name: 'PopularBlocks', params: { stateId: destination.id } });
        },
        getCityImageClass(cityName) {
            // 도시 이름에 따라 이미지 클래스를 반환
            const cityImages = {
                seoul: 'seoul-image',
                paris: 'paris-image',
                newyork: 'newyork-image',
                osaka: 'osaka-image',
                fukuoka: 'fukuoka-image',
                jeju: 'jeju-image',
                gyeongju: 'gyeongju-image',
                busan: 'busan-image',

                // 다른 도시들도 필요에 따라 추가
            };
            return cityImages[cityName.toLowerCase()] || 'default-image';
        }
    },
};
</script>

<style>
.header {
    text-align: center;
    margin: 20px;
}

.destination-list {
    margin: 20px auto;
    max-width: 800px;
}

.v-card {
    border-radius: 10px;
    cursor: pointer;
}

.image-container {
    height: 200px;
    overflow: hidden;
}

.city-image {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
}

/* 도시별 이미지 클래스 */
.seoul-image {
    background-image: url('@/assets/img/seoul.jpg');
}

.osaka-image {
    background-image: url('@/assets/img/osaka.jpg');
}

.newyork-image {
    background-image: url('@/assets/img/newyork.jpg');
}

.jeju-image {
    background-image: url('@/assets/img/jeju.jpg');
}

.gyeongju-image {
    background-image: url('@/assets/img/gyeongju.jpg');
}

.busan-image {
    background-image: url('@/assets/img/busan.jpg');
}

.fukuoka-image {
    background-image: url('@/assets/img/fukuoka.jpg');
}

.paris-image {
    background-image: url('@/assets/img/paris.jpg');
}

.v-card-title {
    font-weight: bold;
    font-size: 20px;
    text-align: center;
}

.v-card-subtitle {
    color: #555;
    text-align: center;
    font-size: 16px;
}
</style>
