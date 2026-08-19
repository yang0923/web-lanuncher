<template>
  <div class="spinner-container">
    <Loader2 :size="32" class="spinner" />
    <p v-if="text" class="spinner-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";

defineProps<{
  text?: string;
}>();
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
}

.spinner {
  color: var(--primary-color, #0284c7);
  animation: spin 0.8s linear infinite;
}

.spinner-text {
  font-size: 13px;
  color: var(--text-secondary, #616161);
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
