<template>
  <div class="empty-state">
    <div class="empty-icon">
      <slot name="icon">
        <Inbox :size="48" class="empty-icon-svg" />
      </slot>
    </div>
    <h3 class="empty-title">{{ title || "什么都没有" }}</h3>
    <p v-if="description" class="empty-description">{{ description }}</p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
import { Inbox } from "lucide-vue-next";

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
  padding: 40px 20px;
  gap: 8px;
}

.empty-icon-svg {
  color: var(--text-secondary, #616161);
}

.empty-title {
  margin: 8px 0 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color, #333);
}

.empty-description {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary, #616161);
  text-align: center;
}
</style>
