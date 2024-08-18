<template>
    <div>
        <!-- Header Section -->
        <div class="header">
            <h1>인기 여행지</h1>
        </div>

        <!-- Destination List Section -->
        <div class="destination-list">
            <v-row justify="center">
                <v-col cols="12" md="8">
                    <v-card>
                        <v-card-title>
                            <h2>인기 여행 도시</h2>
                        </v-card-title>
                        <v-card-subtitle>
                            <p>전 세계에서 인기 있는 도시를 확인하세요.</p>
                        </v-card-subtitle>
                        <v-list>
                            <v-list-item-group v-if="destinations.length">
                                <v-list-item v-for="destination in destinations" :key="destination.id" @click="goToTasks(destination)">
                                    <v-list-item-content>
                                        <v-list-item-title>{{ destination.city }}</v-list-item-title>
                                        <v-list-item-subtitle>{{ destination.country }}</v-list-item-subtitle>
                                        <v-list-item-subtitle v-if="destination.projectCount !== undefined">프로젝트 수: {{ destination.projectCount }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>
                            <v-list-item v-else>
                                <v-list-item-content>
                                    <v-list-item-title>데이터를 불러오는 중입니다...</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
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

            // 도시 데이터와 프로젝트 수를 destinations에 할당
            this.destinations = cities.map(city => ({
                id: city.id,
                city: city.city,
                country: city.country,
                projectCount: city.projectCount // 프로젝트 수 추가
            }));
        } catch (e) {
            console.error(e);
        }
    },

    methods: {
        goToTasks(destination) {
        this.$router.push({ name: 'PopularBlocks', params: { stateId: destination.id } });
    },
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
}

.v-list-item-content {
    font-size: 18px;
}

.v-list-item-title {
    font-weight: bold;
}

.v-list-item-subtitle {
    color: #555;
}
</style>
