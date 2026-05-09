import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/cesium',
    name: 'cesium',
    redirect: '/cesium/basic-example',
    meta: {
      title: '三维地球',
    },
    children: [
      {
        path: '/cesium/basic-example',
        name: 'CesiumBasic',
        meta: {
          title: '基础示例',
        },
        component: () => import('@/pages/cesium/first.vue'),
      },
      {
        path: '/cesium/san-francisco',
        name: 'CesiumSanFrancisco',
        meta: {
          title: '旧金山示例',
        },
        component: () => import('@/pages/cesium/jiujinshan.vue'),
      },
    ],
  },
];

export default routes;
