<template>
  <Transition name="notice">
    <div v-if="notice" class="toast" :class="`toast-${notice.type}`">
      <component :is="getIcon(notice.type)" :size="16" class="toast-icon" />
      {{ notice.text }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { CheckCircle, AlertCircle, Info } from "lucide-vue-next";
import type { Notice } from "@/env";

defineProps<{
  notice: Notice | null;
}>();

function getIcon(type: string) {
  switch (type) {
    case "success":
      return CheckCircle;
    case "error":
      return AlertCircle;
    default:
      return Info;
  }
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.1));
  white-space: nowrap;
  background: var(--bg-color, #f4f4f4);
  color: var(--text-color, #333);
  border: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-success {
  background: var(--success-color, #10b981);
  color: var(--text-on-primary, #fff);
  border-color: var(--success-color, #10b981);
}
.toast-error {
  background: var(--danger-color, #ef4444);
  color: var(--text-on-primary, #fff);
  border-color: var(--danger-color, #ef4444);
}
.toast-info {
  background: var(--primary-color, #0284c7);
  color: var(--text-on-primary, #fff);
  border-color: var(--primary-color, #0284c7);
}

.notice-enter-active,
.notice-leave-active {
  transition: all 0.3s ease;
}
.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
