import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { ref } from 'vue';
import basic from './modules/basic';
import advanced from './modules/advanced';
import cesium from './modules/cesium';
import echarts from './modules/echarts';
import three from './modules/three';

export const isLoading = ref(false);

// Redirect routes (old paths -> new paths)
const redirectRoutes: RouteRecordRaw[] = [
  { path: '/dashboard', redirect: '/basic' },
  { path: '/dashboard/welcome', redirect: '/basic/map-switch' },
  { path: '/dashboard/about', redirect: '/basic/offline-tiles' },
  { path: '/dashboard/tile', redirect: '/basic/offline-tiles' },
  { path: '/dashboard/areamark', redirect: '/basic/area-marker' },
  { path: '/dashboard/dynamicsmark', redirect: '/basic/dynamic-marker' },
  { path: '/dashboard/mapbgcolor', redirect: '/basic/region-color' },
  { path: '/dashboard/dragmarkers', redirect: '/basic/drag-marker' },
  { path: '/dashboard/geojsonareamark', redirect: '/basic/geojson-area' },
  { path: '/dashboard/mapcolor', redirect: '/basic/map-bg' },
  { path: '/dashboard/mapcolor2', redirect: '/basic/map-bg2' },
  { path: '/dashboard/mapStyle', redirect: '/basic/map-style' },
  { path: '/dashboard/layerstyle', redirect: '/basic/vector-style' },
  { path: '/dashboard/staticmap', redirect: '/basic/static-image' },
  { path: '/advanced/animationspath', redirect: '/advanced/path-animation' },
  { path: '/advanced/emergencySheltersMap', redirect: '/advanced/shelter-map' },
  { path: '/advanced/rectangulararea', redirect: '/advanced/geofence' },
  { path: '/advanced/pointLine', redirect: '/advanced/draw-point-line' },
  { path: '/advanced/drawcomplex', redirect: '/advanced/flight-path' },
  { path: '/advanced/lukuang', redirect: '/advanced/add-marker' },
  { path: '/advanced/sandian', redirect: '/advanced/scatter-plot' },
  { path: '/advanced/timer', redirect: '/advanced/timer-lights' },
  { path: '/advanced/dynamics', redirect: '/advanced/dynamic-update' },
  { path: '/cesium/cesiumfirst', redirect: '/cesium/basic-example' },
  { path: '/cesium/cesiumsecond', redirect: '/cesium/san-francisco' },
  { path: '/three/model', redirect: '/three/model-viewer' },
  { path: '/echarts/earth', redirect: '/echarts/map-chart' },
];

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Layout',
    redirect: '/home',
    component: () => import('@/layouts/Layout.vue'),
    meta: { title: '根路由' },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/pages/home.vue'),
        meta: { title: '首页' },
      },
      ...basic,
      ...advanced,
      ...cesium,
      ...three,
      ...echarts,
    ],
  },
  ...redirectRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/components/common/NotFound.vue'),
    meta: { title: '页面未找到' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(() => {
  isLoading.value = true;
});

router.afterEach((to) => {
  isLoading.value = false;
  document.title = to.meta?.title
    ? `${to.meta.title} - 地图可视化平台`
    : '地图可视化平台';
});

export { router };
