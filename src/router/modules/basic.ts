import type { RouteRecordRaw } from 'vue-router';

const moduleName = 'dashboard';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/dashboard',
    name: moduleName,
    redirect: '/dashboard/welcome',
    meta: {
      title: '基础',
      icon: 'ant-design:dashboard-outlined',
    },
    children: [
      {
        path: 'welcome',
        name: 'Welcome',
        meta: {
          title: '更改地图和语言'
        },
        component: () => import('@/pages/home.vue')
      },
      {
        path: 'about',
        name: 'About',
        meta: {
          title: '第二课'
        },
        component: () => import('@/pages/about.vue')
      },
      {
        path: 'tile',
        name: 'Tile',
        meta: {
          title: '离线瓦片'
        },
        component: () => import('@/pages/tile.vue')
      },
      {
        path: 'areamark',
        name: 'AreaMark',
        meta: {
          title: '分类标注'
        },
        component: () => import('@/pages/areamark.vue')
      },
      {
        path: 'dynamicsmark',
        name: 'DynamicsMark',
        meta: {
          title: '动态分类标注'
        },
        component: () => import('@/pages/dynamicsmark.vue')
      },
      {
        path: 'mapbgcolor',
        name: 'MapbgColor',
        meta: {
          title: '区域颜色'
        },
        component: () => import('@/pages/mapbgcolor.vue')
      },
      {
        path: 'dragmarkers',
        name: 'DragtheMarkers',
        meta: {
          title: '拖拽标记'
        },
        component: () => import('@/pages/basic/dragmarkers.vue')
      },
      {
        path: 'geojsonareamark',
        name: 'GeojsonareaMark',
        meta: {
          title: 'Geojson区域标记'
        },
        component: () => import('@/pages/basic/geojsonareamark.vue')
      },
      {
        path: 'mapcolor',
        name: 'Mapcolor',
        meta: {
          title: '地图背景色'
        },
        component: () => import('@/pages/basic/mapcolor.vue')
      },
      {
        path: 'mapStyle',
        name: 'MapStyle',
        meta: {
          title: '地图样式'
        },
        component: () => import('@/pages/basic/custom.vue')
      },
      {
        path: 'staticmap',
        name: 'staticMap',
        meta: {
          title: '静态图片'
        },
        component: () => import('@/pages/basic/staticimage.vue')
      },
    ],
  },
];

export default routes;
