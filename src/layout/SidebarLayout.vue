<template>
  <div class="sidebar-layout">
    <div v-if="$slots.header" class="sidebar-header">
      <slot name="header" />
    </div>
    <div class="sidebar-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="sidebar-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.sidebar-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sidebar-header {
  padding: 8px 12px 8px 16px;
  border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
  flex-shrink: 0;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.sidebar-footer {
  padding: 8px 12px 12px 16px;
  border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
  flex-shrink: 0;
}
</style>
