<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo" />

      <a-menu :default-selected-keys="selectedKeys" mode="inline" theme="dark">
        <template v-for="route in routesList" :key="route.name">
          <a-sub-menu v-if="route.children" :key="'sub-' + (typeof route.name === 'string' ? route.name : '')">
            <template #title>
              <router-link :to="{ name: route.name }">
                {{ route.meta?.title }}
              </router-link>
            </template>
            <a-menu-item v-for="child in route.children" :key="child.name">
              <router-link :to="{ name: child.name }">
                {{ child.meta?.title }}
              </router-link>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item v-else :key="'item-' + (typeof route.name === 'string' ? route.name : '')">
            <router-link :to="{ name: route.name }">
              {{ route.meta?.title }}
            </router-link>
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0" />
      <a-layout-content style="margin: 0 16px">
        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item>User</a-breadcrumb-item>
          <a-breadcrumb-item>Bill</a-breadcrumb-item>
        </a-breadcrumb>
        <div
          :style="{ padding: '24px', background: '#fff', minHeight: '360px', position: 'relative' }"
        >
          <RouterView />
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Ant Design ©2018 Created by Ant UED
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const routesList = router.options.routes[0].children;
const collapsed = ref<boolean>(false);
const selectedKeys = ref<string[]>(["dashboard"]);
</script>
<style scoped>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}
[data-theme="dark"] .site-layout .site-layout-background {
  background: #141414;
}
</style>