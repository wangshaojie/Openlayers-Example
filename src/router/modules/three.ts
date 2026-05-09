import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/three',
    name: 'threejs',
    redirect: '/three/model-viewer',
    meta: {
      title: '三维模型',
    },
    children: [
      {
        path: '/three/model-viewer',
        name: 'ModelViewer',
        meta: {
          title: '3D模型查看器',
        },
        component: () => import('@/pages/threejs/modelviewer.vue'),
      },
    ],
  },
];

export default routes;
