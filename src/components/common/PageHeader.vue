<template>
  <div class="page-header">
    <a-breadcrumb v-if="showBreadcrumb" class="page-breadcrumb">
      <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
        <router-link v-if="item.path !== currentPath" :to="item.path">
          {{ item.title }}
        </router-link>
        <span v-else>{{ item.title }}</span>
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div class="page-header-main">
      <div class="page-header-content">
        <h1 v-if="title" class="page-title">{{ title }}</h1>
        <p v-if="subTitle" class="page-subtitle">{{ subTitle }}</p>
      </div>
      <div v-if="$slots.actions" class="page-header-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

interface Breadcrumb {
  title: string;
  path: string;
}

defineProps<{
  title?: string;
  subTitle?: string;
  showBreadcrumb?: boolean;
}>();

const route = useRoute();
const currentPath = route.path;

const breadcrumbs = computed<Breadcrumb[]>(() => {
  return route.matched
    .filter(r => r.meta?.title)
    .map(r => ({ title: r.meta.title as string, path: r.path }));
});
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-breadcrumb {
  margin-bottom: 12px;
}

.page-header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin: 0;
}

.page-header-actions {
  display: flex;
  gap: 8px;
}
</style>
