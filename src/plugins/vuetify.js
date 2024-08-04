import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


export default createVuetify({
    //components는 vuetify에서 사용할수있는 UI 컴포넌트들이다.
    components,
    //directives는 vuetify에서 HTML요소에 행동을 부여하는데 사용
    directives,

});

