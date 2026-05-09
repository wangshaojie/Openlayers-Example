<template>
  <a-layout style="min-height: 100vh; overflow: hidden">
    <a-layout-sider v-model:collapsed="collapsed" collapsible theme="dark" class="sidebar-sider">
      <div class="logo">
        <span v-if="!collapsed" class="logo-text">🗺️ 地图可视化</span>
        <span v-else class="logo-text">🗺️</span>
      </div>

      <div class="menu-container">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          theme="dark"
          @click="handleMenuClick"
        >
          <template v-for="item in menuItems" :key="item.key">
            <a-sub-menu v-if="item.children?.length" :key="'sub_' + item.key">
              <template #title>
                <span>{{ item.label }}</span>
              </template>
              <a-menu-item v-for="child in item.children" :key="child.key">
                {{ child.label }}
              </a-menu-item>
            </a-sub-menu>
            <a-menu-item v-else :key="item.key">
              {{ item.label }}
            </a-menu-item>
          </template>
        </a-menu>
      </div>
    </a-layout-sider>

    <a-layout class="main-layout">
      <a-layout-header class="main-header">
        <a-breadcrumb>
          <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
            <span>{{ item.title }}</span>
          </a-breadcrumb-item>
        </a-breadcrumb>
      </a-layout-header>

      <a-layout-content class="main-content">
        <div class="page-container">
          <div class="content-wrapper">
            <RouterView />
          </div>
        </div>
      </a-layout-content>

      <a-layout-footer class="main-footer">
        地图可视化平台 © {{ currentYear }}
      </a-layout-footer>
    </a-layout>

    <RouteLoading :is-loading="isLoading" />
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import RouteLoading from "@/components/common/RouteLoading.vue";
import { isLoading } from "@/router";

const route = useRoute();
const router = useRouter();
const collapsed = ref<boolean>(false);
const selectedKeys = ref<string[]>([]);

const currentYear = new Date().getFullYear();

interface MenuItem {
  key: string;
  label: string;
  path: string;
  children?: MenuItem[];
}

// 从路由配置中提取菜单项，不依赖 route.matched
const menuItems = computed<MenuItem[]>(() => {
  const layoutRoute = router.options.routes.find(r => r.name === 'Layout');
  if (!layoutRoute || !layoutRoute.children) return [];

  return layoutRoute.children
    .filter((r: any) => r.meta?.title)
    .map((r: any) => {
      if (r.children?.length > 0) {
        return {
          key: r.name,
          label: r.meta.title,
          path: r.path,
          children: r.children
            .filter((c: any) => c.meta?.title)
            .map((c: any) => ({
              key: c.name,
              label: c.meta.title,
              path: c.path,
            })),
        };
      }
      return {
        key: r.name,
        label: r.meta.title,
        path: r.path,
      };
    });
});

const breadcrumbs = computed(() => {
  return route.matched
    .filter(r => r.meta?.title && r.name !== 'Layout')
    .map(r => ({ title: r.meta.title as string, path: r.path }));
});

const handleMenuClick = ({ key }: { key: string }) => {
  const item = findMenuItem(menuItems.value, key);
  if (item) {
    router.push({ path: item.path });
  }
};

const findMenuItem = (items: MenuItem[], key: string): MenuItem | null => {
  for (const item of items) {
    if (item.key === key) return item;
    if (item.children) {
      const found = findMenuItem(item.children, key);
      if (found) return found;
    }
  }
  return null;
};

watch(
  () => route.name,
  () => {
    const currentRoute = route.matched.find(r => r.name === route.name);
    if (currentRoute) {
      selectedKeys.value = [currentRoute.name as string];
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.sidebar-sider {
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.menu-container {
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.main-layout {
  margin-left: 200px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-header {
  height: 48px;
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  margin: 16px;
  overflow: hidden;
  min-height: 0;
}

.main-footer {
  height: 48px;
  text-align: center;
  flex-shrink: 0;
}

.page-container {
  background: #fff;
  border-radius: 8px;
  height: 100%;
  overflow: hidden;
}

.content-wrapper {
  height: 100%;
}

.content-wrapper > * {
  height: 100%;
}
</style>
