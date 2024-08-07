import ProjectCreate from '@/views/ProjectCreate.vue'
import CreateStep1 from '@/components/projectCreate/CreateStep1.vue'
import CreateStep2 from '@/components/projectCreate/CreateStep2.vue'
import CreateStep3 from '@/components/projectCreate/CreateStep3.vue'

export const projectRouter = [
    {
        path: '/project/create',
        name: 'ProjectCreate',
        component: ProjectCreate
    },
    {
        path: '/project/create/step1',
        name: 'CreateStep1',
        component: CreateStep1
    },
    {
        path: '/project/create/step2',
        name: 'CreateStep2',
        component: CreateStep2
    },
    {
        path: '/project/create/step3',
        name: 'CreateStep3',
        component: CreateStep3
    }
]