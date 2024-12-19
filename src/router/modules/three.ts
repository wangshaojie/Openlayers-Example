import type { RouteRecordRaw } from 'vue-router';

const moduleName = 'threejs';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/three',
    name: moduleName,
    redirect: '/three/model',
    meta: {
      title: 'THREEJS',
      icon: 'ant-design:advanced-outlined',
    },
    children: [
      {
        path: 'model',
        name: 'Model',
        meta: {
          title: '加载3d模型'
        },
        component: () => import('@/pages/threejs/modelviewer.vue')
      },
      
    ],
  },
];

export default routes;
