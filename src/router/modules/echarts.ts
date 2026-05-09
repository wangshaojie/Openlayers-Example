import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/echarts',
    name: 'echarts',
    redirect: '/echarts/map-chart',
    meta: {
      title: '图表联动',
    },
    children: [
      {
        path: '/echarts/map-chart',
        name: 'MapChart',
        meta: {
          title: '地图图表',
        },
        component: () => import('@/pages/echartsDemo/earth.vue'),
      },
    ],
  },
];

export default routes;
