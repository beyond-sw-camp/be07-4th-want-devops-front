// src/plugins/vuetify.js
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css' // Material Design Icons
import 'vuetify/styles' // Vuetify 스타일 가져오기

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
    //components는 vuetify에서 사용할수있는 UI 컴포넌트들이다.
    components,
    //directives는 vuetify에서 HTML요소에 행동을 부여하는데 사용
    directives,
    icons: {
        iconfont: 'mdi', // 'mdi'는 Material Design Icons를 의미. 좋아요 아이콘 가져오기.
    },
});
