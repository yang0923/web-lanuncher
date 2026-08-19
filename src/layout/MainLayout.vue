<template>
  <div class="main-layout">
    <div v-if="$slots.toolbar" class="main-toolbar">
      <slot name="toolbar" />
    </div>
    <div class="main-content">
      <slot />
    </div>
    <div v-if="$slots.footer" class="main-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 12px 16px 16px;
}

.main-toolbar {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.main-footer {
  flex-shrink: 0;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
}
</style>
