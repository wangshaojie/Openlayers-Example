import type { RouteRecordRaw } from 'vue-router';

const moduleName = 'cesium';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/cesium',
    name: moduleName,
    redirect: '/cesium/cesiumfirst',
    meta: {
      title: 'CESIUM',
      icon: 'ant-design:advanced-outlined',
    },
    children: [
      {
        path: 'cesiumfirst',
        name: 'CesiumFirst',
        meta: {
          title: '基础的例子'
        },
        component: () => import('@/pages/cesium/first.vue')
      },
      {
        path: 'cesiumsecond',
        name: 'CesiumSecond',
        meta: {
          title: '初始化旧金山'
        },
        component: () => import('@/pages/cesium/jiujinshan.vue')
      }
    ],
  },
];

export default routes;
