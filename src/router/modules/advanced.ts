import type { RouteRecordRaw } from 'vue-router';

const moduleName = 'advanced';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/advanced',
    name: moduleName,
    redirect: '/advanced/animationspath',
    meta: {
      title: '高级',
      icon: 'ant-design:advanced-outlined',
    },
    children: [
      {
        path: 'animationspath',
        name: 'AnimationsPath',
        meta: {
          title: '轨迹路线动画'
        },
        component: () => import('@/pages/advanced/animationspath.vue')
      },
      {
        path: 'heatmap',
        name: 'Heatmap',
        meta: {
          title: '热力图'
        },
        component: () => import('@/pages/advanced/heatmap.vue')
      },
      {
        path: 'arcgis',
        name: 'Arcgis',
        meta: {
          title: '加载Arcgis地图'
        },
        component: () => import('@/pages/advanced/arcgis.vue')
      },
      {
        path: 'emergencySheltersMap',
        name: 'EmergencySheltersMap',
        meta: {
          title: '聚合避难所地图'
        },
        component: () => import('@/pages/advanced/EmergencySheltersMap.vue')
      },
      {
        path: 'rectangulararea',
        name: 'RectangularArea',
        meta: {
          title: '电子围栏'
        },
        component: () => import('@/pages/advanced/rectangulararea.vue')
      },
      {
        path: 'pointLine',
        name: 'PointLine',
        meta: {
          title: '点线面绘制'
        },
        component: () => import('@/pages/advanced/pointline.vue')
      },
      {
        path: 'drawcomplex',
        name: 'drawComplex',
        meta: {
          title: '飞行路劲'
        },
        component: () => import('@/pages/advanced/drawcomplex.vue')
      },
      {
        path: 'lukuang',
        name: 'LuKuang',
        meta: {
          title: '添加图标'
        },
        component: () => import('@/pages/advanced/lukuang.vue')
      },
      {
        path: 'sandian',
        name: 'sandian',
        meta: {
          title: '散点'
        },
        component: () => import('@/pages/advanced/sandian.vue')
      }
    ],
  },
];

export default routes;
