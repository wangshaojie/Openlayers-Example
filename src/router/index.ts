import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import constant from './modules/index'

export const rootRoute: RouteRecordRaw = {
  path: '/',
  name: 'Layout',
  redirect: '/dashboard/welcome',
  component: () => import('@/layouts/Layout.vue'),
  meta: {
    title: '根路由',
  },
  children: [
    ...constant
  ],
};



const router = createRouter({
  history: createWebHistory(),
  routes: [
    rootRoute,
  ],
})

export {
  router
}