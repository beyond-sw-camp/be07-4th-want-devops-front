import ProjectCreate from '@/views/ProjectCreate.vue'

export const projectRouter = [
    {
        path: '/project/create',
        name: 'ProjectCreate',
        component: ProjectCreate
    },
    {
        path: '/project/detail/:projectId',
        name: 'ProjectDetail',
        component: () => import('@/views/ProjectDetailTestPage.vue')
    }
]