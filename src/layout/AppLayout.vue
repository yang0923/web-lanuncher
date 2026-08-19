<template>
  <div class="app-layout">
    <aside class="app-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <slot name="sidebar">
        <div class="sidebar-default">
          <div class="sidebar-body">
            <slot name="sidebar-content" />
          </div>
        </div>
      </slot>
    </aside>

    <main class="app-main" :class="{ expanded: sidebarCollapsed }">
      <slot name="main">
        <slot />
      </slot>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const sidebarCollapsed = ref(false);

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

defineExpose({ sidebarCollapsed, toggleSidebar });
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  height: 100dvh;
  background: var(--bg-color, #f4f4f4);
  color: var(--text-color, #333);
  overflow: hidden;
}

.app-sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--card-bg, rgba(0, 0, 0, 0.02));
  border-right: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  flex-direction: column;
  transition:
    width 0.25s ease,
    min-width 0.25s ease,
    opacity 0.25s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.app-sidebar.collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
  opacity: 0;
}

.sidebar-default {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 220px;
  flex-shrink: 0;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.app-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
  background: var(--bg-color, #f4f4f4);
}

.sidebar-body::-webkit-scrollbar {
  width: 3px;
}
.sidebar-body::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-body::-webkit-scrollbar-thumb {
  background: var(--border-color, #e5e7eb);
  border-radius: 3px;
}
</style>
