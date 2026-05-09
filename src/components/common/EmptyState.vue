<template>
  <div class="empty-state">
    <div class="empty-state-icon">
      <InboxOutlined />
    </div>
    <h3 class="empty-state-title">{{ title }}</h3>
    <p v-if="description" class="empty-state-description">{{ description }}</p>
    <div v-if="$slots.default" class="empty-state-actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { InboxOutlined } from '@ant-design/icons-vue';

defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-state-icon {
  font-size: 48px;
  color: rgba(0, 0, 0, 0.25);
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  margin: 0 0 8px 0;
}

.empty-state-description {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin: 0 0 16px 0;
}

.empty-state-actions {
  margin-top: 8px;
}
</style>
