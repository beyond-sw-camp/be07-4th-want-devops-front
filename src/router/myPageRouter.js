import MyPage from '@/views/MyPage.vue'
import MyInvitationComponent from '@/components/mypage/MyInvitationComponent.vue'
import MyProjectComponent from '@/components/mypage/MyProjectComponent.vue'

export const myPageRouter = [
    {
        path: '/myPage',
        name: 'MyPage',
        component: MyPage
    },
    {
        path: '/myInvitation',
        name: 'MyInvitation',
        component: MyInvitationComponent
    },
    {
        path: '/myProject',
        name: 'myProject',
        component: MyProjectComponent
    },

]