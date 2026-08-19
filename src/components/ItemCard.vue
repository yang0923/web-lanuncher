<template>
  <div
    class="item-card"
    :class="[
      viewMode === 'list' ? 'item-card-list' : 'item-card-grid',
      { disabled: !item.enabled },
    ]"
    @click="viewMode === 'grid' ? $emit('preview', item) : undefined"
  >
    <!-- 类型标识角标 -->
    <div
      class="card-type-badge"
      :class="item.isSearch ? 'type-search' : 'type-webpage'"
    >
      <Search v-if="item.isSearch" :size="12" />
      <Globe v-else :size="12" />
      <span v-if="viewMode === 'grid'">{{
        item.isSearch ? "搜索" : "网页"
      }}</span>
    </div>

    <!-- 图标 -->
    <div class="card-icon">
      <img v-if="item.icon" :src="item.icon" alt="" loading="lazy" />
      <Globe
        v-else
        :size="viewMode === 'grid' ? 24 : 20"
        class="icon-placeholder"
      />
    </div>

    <!-- 信息 -->
    <div class="card-info">
      <div class="card-header">
        <div class="card-name" :title="item.name">{{ item.name }}</div>
      </div>
      <div class="card-url" :title="item.url">{{ item.url }}</div>

      <!-- 标签 -->
      <div v-if="itemTags.length > 0" class="card-tags">
        <span
          v-for="tag in itemTags"
          :key="tag.id"
          class="card-tag"
          :style="{ background: tag.color }"
        >
          {{ tag.name }}
        </span>
      </div>
      <div v-else class="card-tags-empty">无标签</div>
    </div>

    <!-- 操作按钮 -->
    <div class="card-actions" @click.stop>
      <button
        class="action-btn"
        :title="item.enabled ? '点击禁用' : '点击启用'"
        @click="$emit('toggle', item)"
      >
        <CheckCircle v-if="item.enabled" :size="16" class="text-success" />
        <Circle v-else :size="16" class="text-muted" />
      </button>
      <button class="action-btn" title="编辑" @click="$emit('edit', item)">
        <Pencil :size="16" />
      </button>
      <button
        class="action-btn danger"
        title="删除"
        @click="$emit('delete', item)"
      >
        <Trash2 :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Globe,
  Pencil,
  Trash2,
  CheckCircle,
  Circle,
  Search,
} from "lucide-vue-next";
import type { Item, Tag } from "@/services";

const props = defineProps<{
  item: Item;
  tags: Tag[];
  viewMode?: "grid" | "list";
}>();

defineEmits<{
  (e: "edit", item: Item): void;
  (e: "delete", item: Item): void;
  (e: "preview", item: Item): void;
  (e: "toggle", item: Item): void;
}>();

const itemTags = computed(() => {
  return props.tags.filter((tag) => props.item.tagIds.includes(tag.id));
});
</script>

<style scoped>
/* ---------- 基础卡片样式 ---------- */
.item-card {
  display: flex;
  flex-direction: column;
  background: var(--card-bg, rgba(0, 0, 0, 0.015));
  border-radius: 8px;
  border: 1px solid var(--border-color, #e5e7eb);
  transition: all 0.2s;
  cursor: default;
  position: relative;
}

.item-card.disabled {
  opacity: 0.55;
  filter: grayscale(0.2);
}

.item-card:hover {
  border-color: var(--primary-color, #0284c7);
  box-shadow: 0 2px 8px var(--shadow-color, rgba(0, 0, 0, 0.1));
}

/* ---------- 网格视图 ---------- */
.item-card-grid {
  padding: 12px;
  padding-top: 32px;
  min-height: 150px;
  cursor: pointer;
}

.item-card-grid .card-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}

.item-card-grid .card-name {
  font-size: 14px;
  font-weight: 600;
}

.item-card-grid .card-url {
  font-size: 11px;
}

/* ---------- 列表视图 ---------- */
.item-card-list {
  flex-direction: row;
  align-items: center;
  padding: 10px 14px;
  padding-right: 60px;
  min-height: 56px;
  gap: 12px;
}

.item-card-list .card-type-badge {
  top: 4px;
  right: 4px;
  padding: 1px 4px;
  font-size: 9px;
}

.item-card-list .card-type-badge span {
  display: none;
}

.item-card-list .card-icon {
  width: 28px;
  height: 28px;
  margin-bottom: 0;
  flex-shrink: 0;
}

.item-card-list .card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.item-card-list .card-header {
  min-width: 0;
}

.item-card-list .card-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.item-card-list .card-url {
  font-size: 11px;
  color: var(--text-secondary, #616161);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  margin-top: 0;
}

.item-card-list .card-tags {
  margin-top: 0;
  flex: 0 0 auto;
}

.item-card-list .card-tags-empty {
  margin-top: 0;
  font-size: 10px;
}

.item-card-list .card-actions {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
  flex-shrink: 0;
  gap: 2px;
}

/* ---------- 类型角标 ---------- */
.card-type-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  color: var(--text-on-primary, #fff);
  z-index: 1;
}

.card-type-badge.type-webpage {
  background: var(--primary-color, #0284c7);
}

.card-type-badge.type-search {
  background: var(--success-color, #10b981);
}

/* ---------- 卡片图标 ---------- */
.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--control-bg, rgba(0, 0, 0, 0.035));
  border-radius: 6px;
  flex-shrink: 0;
}

.card-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.icon-placeholder {
  color: var(--text-secondary, #616161);
}

/* ---------- 卡片信息 ---------- */
.card-info {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.card-name {
  color: var(--text-color, #333);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.card-url {
  color: var(--text-secondary, #616161);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- 标签 ---------- */
.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.card-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  color: var(--text-on-primary, #fff);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-tags-empty {
  font-size: 10px;
  color: var(--text-secondary, #616161);
}

/* ---------- 操作按钮 ---------- */
.card-actions {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
}

.action-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #616161);
}

.action-btn:hover {
  background: var(--hover-bg, #f9fafb);
  color: var(--text-color, #333);
}

.action-btn.danger:hover {
  background: var(--danger-light-bg, #fee2e2);
  color: var(--danger-color, #ef4444);
}

.text-success {
  color: var(--success-color, #10b981);
}
.text-muted {
  color: var(--text-secondary, #616161);
}

/* ---------- 响应式 ---------- */
@media (max-width: 640px) {
  .item-card-list .card-url {
    max-width: 120px;
  }
}

@media (max-width: 480px) {
  .item-card-list {
    flex-wrap: wrap;
    padding-right: 14px;
    padding-bottom: 8px;
  }
  .item-card-list .card-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  .item-card-list .card-url {
    max-width: 100%;
  }
  .item-card-list .card-tags {
    flex-wrap: wrap;
  }
  .item-card-list .card-type-badge {
    display: none;
  }
}
</style>
