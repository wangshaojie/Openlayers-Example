import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/advanced',
    name: 'advanced',
    redirect: '/advanced/path-animation',
    meta: {
      title: '高级功能',
    },
    children: [
      {
        path: '/advanced/path-animation',
        name: 'PathAnimation',
        meta: {
          title: '轨迹路线动画',
        },
        component: () => import('@/pages/advanced/animationspath.vue'),
      },
      {
        path: '/advanced/heatmap',
        name: 'Heatmap',
        meta: {
          title: '热力图',
        },
        component: () => import('@/pages/advanced/heatmap.vue'),
      },
      {
        path: '/advanced/arcgis-map',
        name: 'ArcgisMap',
        meta: {
          title: '加载ArcGIS地图',
        },
        component: () => import('@/pages/advanced/arcgis.vue'),
      },
      {
        path: '/advanced/shelter-map',
        name: 'ShelterMap',
        meta: {
          title: '聚合避难所地图',
        },
        component: () => import('@/pages/advanced/EmergencySheltersMap.vue'),
      },
      {
        path: '/advanced/geofence',
        name: 'Geofence',
        meta: {
          title: '电子围栏',
        },
        component: () => import('@/pages/advanced/rectangulararea.vue'),
      },
      {
        path: '/advanced/draw-point-line',
        name: 'DrawPointLine',
        meta: {
          title: '点线面绘制',
        },
        component: () => import('@/pages/advanced/pointline.vue'),
      },
      {
        path: '/advanced/flight-path',
        name: 'FlightPath',
        meta: {
          title: '飞行路径',
        },
        component: () => import('@/pages/advanced/drawcomplex.vue'),
      },
      {
        path: '/advanced/add-marker',
        name: 'AddMarker',
        meta: {
          title: '添加图标',
        },
        component: () => import('@/pages/advanced/lukuang.vue'),
      },
      {
        path: '/advanced/scatter-plot',
        name: 'ScatterPlot',
        meta: {
          title: '散点图',
        },
        component: () => import('@/pages/advanced/sandian.vue'),
      },
      {
        path: '/advanced/timer-lights',
        name: 'TimerLights',
        meta: {
          title: '定时开关灯',
        },
        component: () => import('@/pages/advanced/timer.vue'),
      },
      {
        path: '/advanced/dynamic-update',
        name: 'DynamicUpdate',
        meta: {
          title: '数据动态更新',
        },
        component: () => import('@/pages/advanced/dynamics.vue'),
      },
      {
        path: '/advanced/land-classification',
        name: 'LandClassification',
        meta: {
          title: '土地分类',
        },
        component: () => import('@/pages/advanced/landClassification.vue'),
      },
      {
        path: '/advanced/track-playback',
        name: 'TrackPlayback',
        meta: {
          title: '智驾轨迹回放',
        },
        component: () => import('@/pages/advanced/TrackPlayback.vue'),
      },
      {
        path: '/advanced/fence-warning',
        name: 'FenceWarning',
        meta: {
          title: '电子围栏预警',
        },
        component: () => import('@/pages/advanced/FenceWarning.vue'),
      },
    ],
  },
];

export default routes;
