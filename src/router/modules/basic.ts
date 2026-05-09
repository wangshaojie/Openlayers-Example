import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/basic',
    name: 'basic',
    redirect: '/basic/map-switch',
    meta: {
      title: '基础功能',
    },
    children: [
      {
        path: '/basic/map-switch',
        name: 'MapSwitch',
        meta: {
          title: '地图切换',
        },
        component: () => import('@/pages/basic/custom.vue'),
      },
      {
        path: '/basic/offline-tiles',
        name: 'OfflineTiles',
        meta: {
          title: '离线瓦片',
        },
        component: () => import('@/pages/tile.vue'),
      },
      {
        path: '/basic/area-marker',
        name: 'AreaMarker',
        meta: {
          title: '分类标注',
        },
        component: () => import('@/pages/areamark.vue'),
      },
      {
        path: '/basic/dynamic-marker',
        name: 'DynamicMarker',
        meta: {
          title: '动态分类标注',
        },
        component: () => import('@/pages/dynamicsmark.vue'),
      },
      {
        path: '/basic/region-color',
        name: 'RegionColor',
        meta: {
          title: '区域颜色',
        },
        component: () => import('@/pages/mapbgcolor.vue'),
      },
      {
        path: '/basic/drag-marker',
        name: 'DragMarker',
        meta: {
          title: '拖拽标记',
        },
        component: () => import('@/pages/basic/dragmarkers.vue'),
      },
      {
        path: '/basic/geojson-area',
        name: 'GeojsonArea',
        meta: {
          title: 'GeoJSON区域',
        },
        component: () => import('@/pages/basic/geojsonareamark.vue'),
      },
      {
        path: '/basic/map-bg',
        name: 'MapBg',
        meta: {
          title: '地图背景色',
        },
        component: () => import('@/pages/basic/mapcolor.vue'),
      },
      {
        path: '/basic/map-bg2',
        name: 'MapBg2',
        meta: {
          title: '地图背景色2',
        },
        component: () => import('@/pages/basic/mapcolor2.vue'),
      },
      {
        path: '/basic/map-style',
        name: 'MapStyle',
        meta: {
          title: '地图样式',
        },
        component: () => import('@/pages/basic/custom.vue'),
      },
      {
        path: '/basic/vector-style',
        name: 'VectorStyle',
        meta: {
          title: '矢量图层样式',
        },
        component: () => import('@/pages/basic/layerstyle.vue'),
      },
      {
        path: '/basic/static-image',
        name: 'StaticImage',
        meta: {
          title: '静态图片',
        },
        component: () => import('@/pages/basic/staticimage.vue'),
      },
    ],
  },
];

export default routes;
