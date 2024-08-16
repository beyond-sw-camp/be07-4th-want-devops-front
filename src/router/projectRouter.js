import ProjectCreate from "@/views/ProjectCreate.vue";
import ProjectDetail from "@/components/Scheduler/MyScheduler.vue";

export const projectRouter = [
  {
    path: "/project/create",
    name: "ProjectCreate",
    component: ProjectCreate,
  },
  {
    path: "/project/:projectId/detail",
    name: "ProjectDetail",
    component: ProjectDetail,
  },
];
