import MyPage from '@/views/MyPage.vue'
import MyInvitationComponent from '@/views/MyInvitation.vue'

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

]