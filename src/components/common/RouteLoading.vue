<template>
  <Transition name="fade">
    <div v-if="isLoading" class="route-loading">
      <div class="route-loading-content">
        <a-spin size="large" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { isLoading } from '@/router';

defineProps<{
  isLoading: boolean;
}>();
</script>

<style scoped>
.route-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.route-loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
