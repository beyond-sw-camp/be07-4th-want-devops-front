<template>
    <div>
        <div class="header" style="margin:60px 0 50px">
            <h1><strong><span style="color:dodgerblue;">🛫 WANT</span> 에서 인기 있는 여행지를 확인해보세요 ! </strong></h1>
        </div>

        <div class="destination-list">
            <v-row justify="center">
                <v-col cols="12" md="3" class="pa-2" v-for="destination in sortedDestinations" :key="destination.id">
                    <v-card class="mx-auto my-4" @click="goToTasks(destination)">
                        <div class="image-container">
                            <img :src="getCityImage(destination.city)" class="city-image" alt="destination image" />
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
  getCityImage(cityName) {
    const cityImages = {
    서울: require('@/assets/img/seoul.jpg'),
    대구: require('@/assets/img/daegu.jpg'),
    인천: require('@/assets/img/incheon.jpg'),
    광주: require('@/assets/img/gwangju.jpg'),
    대전: require('@/assets/img/daejeon.jpg'),
    울산: require('@/assets/img/ulsan.jpg'),
    세종: require('@/assets/img/sejong.jpg'),
    제주: require('@/assets/img/jeju.jpg'),
    경주: require('@/assets/img/gyeongju.jpg'),
    부산: require('@/assets/img/busan.jpg'),

    // 일본 (Japan)
    도쿄: require('@/assets/img/tokyo.jpg'),
    오사카: require('@/assets/img/osaka.jpg'),
    나고야: require('@/assets/img/nagoya.jpg'),
    삿포로: require('@/assets/img/sapporo.jpg'),
    후쿠오카: require('@/assets/img/fukuoka.jpg'),
    교토: require('@/assets/img/kyoto.jpg'),
    고베: require('@/assets/img/kobe.jpg'),
    요코하마: require('@/assets/img/yokohama.jpg'),

    // 미국 (United States)
    뉴욕: require('@/assets/img/newyork.jpg'),
    로스앤젤레스: require('@/assets/img/losangeles.jpg'),
    샌프란시스코: require('@/assets/img/sanfrancisco.jpg'),
    라스베이거스: require('@/assets/img/lasvegas.jpg'),
    마이애미: require('@/assets/img/miami.jpg'),

    // 중국 (China)
    베이징: require('@/assets/img/beijing.jpg'),
    상하이: require('@/assets/img/shanghai.jpg'),
    광저우: require('@/assets/img/guangzhou.jpg'),
    시안: require('@/assets/img/xian.jpg'),
    청두: require('@/assets/img/chengdu.jpg'),

    // 영국 (United Kingdom)
    런던: require('@/assets/img/london.jpg'),
    에든버러: require('@/assets/img/edinburgh.jpg'),
    맨체스터: require('@/assets/img/manchester.jpg'),
    리버풀: require('@/assets/img/liverpool.jpg'),
    버밍엄: require('@/assets/img/birmingham.jpg'),

    // 이탈리아 (Italy)
    로마: require('@/assets/img/rome.jpg'),
    베네치아: require('@/assets/img/venice.jpg'),
    피렌체: require('@/assets/img/florence.jpg'),
    밀라노: require('@/assets/img/milan.jpg'),
    나폴리: require('@/assets/img/napoli.jpg'),
    };
    return cityImages[cityName] || require('@/assets/img/airplane.jpg');
    }
  }
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
  object-fit: cover;
  background-size: cover;
  background-position: center;
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
