import type { RouteRecordRaw } from 'vue-router';

const superMapRoutes: RouteRecordRaw[] = [
  {
    path: '/superMap/spatial-analysis',
    name: 'SpatialAnalysis',
    component: () => import('@/pages/superMap/SpatialAnalysis.vue'),
    meta: {
      title: 'GIS空间分析',
      icon: '🌐',
    },
  },
];

export default superMapRoutes;
