<template>
  <SidebarLayout>
    <template #header>
      <div class="sidebar-header">
        <span class="logo">⚡ Web Launcher</span>
        <ZTag v-if="totalCount" size="small" type="primary">
          {{ totalCount }}
        </ZTag>
      </div>
    </template>

    <!-- 类型筛选 -->
    <div class="filter-section">
      <div class="filter-buttons">
        <button
          class="filter-btn"
          :class="{ active: typeFilter === 'all' }"
          @click="handleTypeFilter('all')"
        >
          全部
        </button>
        <button
          class="filter-btn"
          :class="{ active: typeFilter === 'webpage' }"
          @click="handleTypeFilter('webpage')"
        >
          <Globe :size="14" /> 网页
        </button>
        <button
          class="filter-btn"
          :class="{ active: typeFilter === 'search' }"
          @click="handleTypeFilter('search')"
        >
          <Search :size="14" /> 搜索
        </button>
      </div>
    </div>

    <div class="tag-list">
      <div
        class="tag-item"
        :class="{ active: isAllActive }"
        @click="handleSelectAll"
      >
        <Folder :size="16" class="tag-icon" />
        <span class="tag-name">全部</span>
        <span class="tag-count">{{ filteredTotal }}</span>
      </div>

      <div
        class="tag-item"
        :class="{ active: isUncategorizedActive }"
        @click="handleSelectUncategorized"
      >
        <Pin :size="16" class="tag-icon" />
        <span class="tag-name">未分类</span>
        <span class="tag-count">{{ uncategorizedCount }}</span>
      </div>

      <div class="tag-divider" />

      <div
        v-for="tag in sortedTags"
        :key="tag.id"
        class="tag-item"
        :class="{ active: isTagSelected(tag.id) }"
        @click="handleTagClick(tag.id)"
      >
        <span class="tag-dot" :style="{ background: tag.color }" />
        <span class="tag-name">{{ tag.name }}</span>
        <span class="tag-count">{{ getTagItemCount(tag.id) }}</span>
      </div>
    </div>

    <template #footer>
      <ZButton
        variant="outline"
        size="small"
        block
        @click="handleShowTagManager"
      >
        <Tag :size="14" /> 管理标签
      </ZButton>
    </template>
  </SidebarLayout>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { Folder, Pin, Tag, Globe, Search } from "lucide-vue-next";
import { ZTag, ZButton } from "ztools-ui";
import { SidebarLayout } from "@/layout";
import type { Item, Tag as TagType } from "@/services";
import type { TypeFilter } from "@/composables/useFilter";

const props = defineProps<{
  items: Item[];
  tags: TagType[];
  selectedTagIds: string[];
  showUncategorized: boolean;
  typeFilter: TypeFilter;
  totalCount?: number;
  uncategorizedCount?: number;
  isTagSelected: (tagId: string) => boolean;
  getTagItemCount: (tagId: string) => number;
}>();

const emit = defineEmits<{
  (e: "update:typeFilter", value: TypeFilter): void;
  (e: "selectAll"): void;
  (e: "selectUncategorized"): void;
  (e: "selectTag", tagId: string): void;
  (e: "showTagManager"): void;
}>();

// ---------- 计算属性 ----------
const sortedTags = computed(() =>
  [...props.tags].sort((a, b) => a.name.localeCompare(b.name)),
);

// 修复：只要没有选中具体标签，且不是未分类状态，那么“全部(标签)”就应该高亮
// 不应该受 props.typeFilter 的影响，这样逻辑更解耦
const isAllActive = computed(
  () => props.selectedTagIds.length === 0 && !props.showUncategorized,
);

const isUncategorizedActive = computed(
  () => props.showUncategorized && props.selectedTagIds.length === 0,
);

const filteredTotal = computed(() => {
  if (props.typeFilter === "webpage") {
    return props.items.filter((item) => !item.isSearch).length;
  }
  if (props.typeFilter === "search") {
    return props.items.filter((item) => item.isSearch).length;
  }
  return props.items.length;
});

// ---------- 方法 (纯净版，不越权处理副作用) ----------
function handleTypeFilter(value: TypeFilter) {
  emit("update:typeFilter", value);
}

function handleSelectAll() {
  emit("selectAll");
}

function handleSelectUncategorized() {
  emit("selectUncategorized");
}

function handleTagClick(tagId: string) {
  // 如果再次点击已选中的标签，视为取消选择（回到全部）
  if (props.selectedTagIds.length === 1 && props.selectedTagIds[0] === tagId) {
    emit("selectAll");
  } else {
    emit("selectTag", tagId);
  }
}

function handleShowTagManager() {
  emit("showTagManager");
}
</script>

<style scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.logo {
  font-size: 15px;
  font-weight: 700;
  background: var(
    --primary-gradient,
    linear-gradient(135deg, #667eea 0%, #fff 100%)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ---------- 筛选按钮 ---------- */
.filter-section {
  padding: 8px 12px 4px;
}

.filter-buttons {
  display: flex;
  gap: 4px;
  background: var(--control-bg, rgba(0, 0, 0, 0.035));
  border-radius: 6px;
  padding: 3px;
}

.filter-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary, #616161);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-btn:hover {
  color: var(--text-color, #333);
}

.filter-btn.active {
  background: var(--bg-color, #f4f4f4);
  color: var(--text-color, #333);
  box-shadow: 0 1px 3px var(--shadow-color, rgba(0, 0, 0, 0.1));
}

/* ---------- 标签列表 ---------- */
.tag-list {
  padding: 4px 8px;
  flex: 1;
  overflow-y: auto;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin-top: 2px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-color, #333);
  font-size: 13px;
  user-select: none;
}

.tag-item:hover {
  background: var(--hover-bg, #f9fafb);
}

.tag-item.active {
  background: var(--active-bg, #f0f9ff);
  color: var(--primary-color, #0284c7);
}

.tag-item.active .tag-count {
  background: var(--primary-color, #0284c7);
  color: var(--text-on-primary, #fff);
}

.tag-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-icon {
  flex-shrink: 0;
  color: var(--text-secondary, #616161);
}

.tag-item.active .tag-icon {
  color: var(--primary-color, #0284c7);
}

.tag-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-count {
  font-size: 11px;
  color: var(--text-secondary, #616161);
  background: var(--control-bg, rgba(0, 0, 0, 0.035));
  padding: 0 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.tag-divider {
  height: 1px;
  background: var(--divider-color, rgba(0, 0, 0, 0.06));
  margin: 6px 10px;
}
</style>
