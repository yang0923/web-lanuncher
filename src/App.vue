<template>
  <AppLayout>
    <!-- ==================== 侧边栏 ==================== -->
    <template #sidebar-content>
      <TagList
        :items="items"
        :tags="tags"
        :selected-tag-ids="selectedTagIds"
        :show-uncategorized="showUncategorized"
        :type-filter="typeFilter"
        :total-count="items.length"
        :uncategorized-count="uncategorizedCount"
        :is-tag-selected="isTagSelected"
        :get-tag-item-count="getTagItemCount"
        @update:type-filter="setTypeFilter"
        @select-all="selectAll"
        @select-uncategorized="selectUncategorized"
        @select-tag="selectTag"
        @show-tag-manager="showTagManager = true"
      />
    </template>

    <!-- ==================== 主内容区 ==================== -->
    <template #main>
      <MainLayout>
        <template #toolbar>
          <div class="toolbar">
            <div class="search-wrapper">
              <Search :size="16" class="search-icon" />
              <ZInput
                ref="searchInputRef"
                v-model="searchQuery"
                placeholder="搜索名称、URL 或标签... (Ctrl+K)"
                clearable
                class="search-input"
                @update:model-value="onSearchInput"
              />
            </div>

            <div class="toolbar-actions">
              <div class="view-toggle">
                <ZButton
                  variant="text"
                  size="small"
                  class="view-btn"
                  :class="{ active: viewMode === 'grid' }"
                  title="网格视图"
                  @click="setViewMode('grid')"
                >
                  <LayoutGrid :size="16" />
                </ZButton>
                <ZButton
                  variant="text"
                  size="small"
                  class="view-btn"
                  :class="{ active: viewMode === 'list' }"
                  title="列表视图"
                  @click="setViewMode('list')"
                >
                  <List :size="16" />
                </ZButton>
              </div>

              <ZButton type="primary" @click="openCreateEditor">
                <Plus :size="16" /> 添加
              </ZButton>
            </div>
          </div>
        </template>

        <!-- 加载状态 -->
        <div v-if="itemsLoading" class="loading-state">
          <LoadingSpinner text="加载中..." />
        </div>

        <!-- 空状态 -->
        <EmptyState
          v-else-if="filteredItems.length === 0"
          :title="isFiltered ? '没有匹配的条目' : '还没有任何条目'"
          :description="
            isFiltered
              ? '试试调整搜索条件或清除筛选'
              : '点击右上角「添加」按钮创建第一个条目'
          "
        >
          <template #icon>
            <Search v-if="isFiltered" :size="48" class="empty-icon" />
            <Rocket v-else :size="48" class="empty-icon" />
          </template>
        </EmptyState>

        <!-- 内容 -->
        <div v-else class="content-area">
          <div :class="viewMode === 'grid' ? 'grid-view' : 'list-view'">
            <ItemCard
              v-for="item in filteredItems"
              :key="item.id"
              :item="item"
              :tags="tags"
              :view-mode="viewMode"
              @edit="openEditEditor"
              @delete="handleDeleteItem"
              @preview="handlePreviewItem"
              @toggle="handleToggleItem"
            />
          </div>
        </div>
      </MainLayout>
    </template>
  </AppLayout>

  <!-- 编辑弹窗 -->
  <ItemEditor
    v-if="showEditor"
    :item="editingItem"
    :tags="tags"
    @save="handleSaveItem"
    @close="closeEditor"
  />

  <!-- 标签管理弹窗 -->
  <TagManagerModal
    v-if="showTagManager"
    :tags="tags"
    @save="handleSaveTag"
    @delete="handleDeleteTag"
    @close="showTagManager = false"
  />

  <!-- 通知 -->
  <NotificationToast :notice="notice" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Search, Plus, LayoutGrid, List, Rocket } from "lucide-vue-next";
import { ZInput, ZButton } from "ztools-ui";
import { AppLayout, MainLayout } from "@/layout";
import {
  NotificationToast,
  LoadingSpinner,
  EmptyState,
  ItemCard,
  ItemEditor,
  TagManagerModal,
  TagList,
} from "@/components";
import {
  useItems,
  useTags,
  useFilter,
  usePluginEntry,
  useNotification,
  useDebounce,
} from "@/composables";
import type {
  Item,
  Tag as TagType,
  CreateItemParams,
  UpdateItemParams,
} from "@/services";
import type { LaunchParam } from "@/env";

// ============================================================
// 状态管理
// ============================================================

const { notice } = useNotification();

const {
  items,
  loading: itemsLoading,
  load: loadItems,
  add: addItem,
  update: updateItem,
  remove: removeItem,
  toggleEnabled,
} = useItems();

const {
  tags,
  load: loadTags,
  add: addTag,
  update: updateTag,
  remove: removeTag,
  createIfNotExist,
} = useTags();

// ✅ 所有筛选状态统一从 useFilter 获取
const {
  searchQuery,
  selectedTagIds,
  showUncategorized,
  typeFilter,
  viewMode,
  isFiltered,
  isTagSelected,
  setTypeFilter,
  selectAll,
  selectUncategorized,
  selectTag,
  setViewMode,
} = useFilter();

// ============================================================
// 插件进入处理
// ============================================================

const { handleEntry } = usePluginEntry({
  findItem: (id: string) => items.value.find((i) => i.id === id),
  onOpenManager: () => {
    console.log("[WebLauncher] 管理界面已打开");
  },
});

// ============================================================
// 本地 UI 状态
// ============================================================

const showEditor = ref(false);
const editingItem = ref<Item | null>(null);
const showTagManager = ref(false);
const searchInputRef = ref<HTMLInputElement | null>(null);

// ============================================================
// 计算属性
// ============================================================

const uncategorizedCount = computed(
  () => items.value.filter((item) => item.tagIds.length === 0).length,
);

// ✅ 统一的筛选逻辑
const filteredItems = computed(() => {
  const hasTagFilter = selectedTagIds.value.length > 0;
  const isUncat = showUncategorized.value && selectedTagIds.value.length === 0;
  const q = searchQuery.value.trim().toLowerCase();
  const type = typeFilter.value;
  console.log(
    "[WebLauncher] 筛选条件",
    "type:",
    type,
    "tags:",
    selectedTagIds.value,
    "uncat:",
    showUncategorized.value,
    "search:",
    q,
  );

  return items.value.filter((item) => {
    // 类型筛选
    if (type === "webpage" && item.isSearch) return false;
    if (type === "search" && !item.isSearch) return false;

    // 标签筛选
    if (hasTagFilter) {
      if (!selectedTagIds.value.every((tagId) => item.tagIds.includes(tagId)))
        return false;
    }
    if (isUncat && item.tagIds.length > 0) return false;

    // 搜索筛选
    if (q) {
      const matchName = item.name.toLowerCase().includes(q);
      const matchUrl = item.url.toLowerCase().includes(q);
      const matchTag = item.tagIds.some((tagId) =>
        getTagName(tagId).toLowerCase().includes(q),
      );
      if (!matchName && !matchUrl && !matchTag) return false;
    }
    return true;
  });
});

// ============================================================
// 标签辅助方法
// ============================================================

function getTagName(id: string): string {
  return tags.value.find((t) => t.id === id)?.name || id;
}

function getTagItemCount(tagId: string): number {
  const filtered = items.value.filter((item) => {
    if (typeFilter.value === "webpage" && item.isSearch) return false;
    if (typeFilter.value === "search" && !item.isSearch) return false;
    return true;
  });
  return filtered.filter((item) => item.tagIds.includes(tagId)).length;
}

// ============================================================
// 搜索输入防抖
// ============================================================

const onSearchInput = useDebounce(() => {
  if (showUncategorized.value) {
    showUncategorized.value = false;
  }
}, 200);

// ============================================================
// 条目操作
// ============================================================

function openCreateEditor() {
  editingItem.value = null;
  showEditor.value = true;
}

function openEditEditor(item: Item) {
  editingItem.value = item;
  showEditor.value = true;
}

function closeEditor() {
  showEditor.value = false;
  editingItem.value = null;
}

async function handleSaveItem(
  data: CreateItemParams | UpdateItemParams,
  newTagNames: string[] = [],
) {
  let finalTagIds: string[] = data.tagIds || [];
  if (newTagNames.length > 0) {
    const createdIds = createIfNotExist(newTagNames);
    finalTagIds = [...finalTagIds, ...createdIds];
  }
  finalTagIds = finalTagIds.filter((id) => !id.startsWith("temp-"));

  const itemData = { ...data, tagIds: finalTagIds };

  const isEdit = "id" in data && !!data.id;
  let result;

  if (isEdit) {
    const { id, ...rest } = itemData as UpdateItemParams & { id: string };
    result = updateItem(id, rest);
  } else {
    result = addItem(itemData as CreateItemParams);
  }

  if (result) {
    closeEditor();
    if (showTagManager.value) {
      loadTags();
    }
  }
}

async function handleDeleteItem(item: Item) {
  if (confirm(`确定要删除「${item.name}」吗？`)) {
    removeItem(item.id);
  }
}

function handleToggleItem(item: Item) {
  toggleEnabled(item.id, !item.enabled);
}

function handlePreviewItem(item: Item) {
  const url = item.isSearch ? item.url.replace(/\{q\}/g, "test") : item.url;
  window.webLauncher.openExternal(url);
}

// ============================================================
// 标签管理
// ============================================================

async function handleSaveTag(tag: TagType) {
  let result;
  if (tag.id) {
    result = updateTag(tag.id, { name: tag.name, color: tag.color });
  } else {
    result = addTag({ name: tag.name, color: tag.color });
  }
  if (result) {
    loadTags();
  }
}

async function handleDeleteTag(id: string) {
  const success = removeTag(id);
  if (success) {
    loadTags();
    loadItems();
    const index = selectedTagIds.value.indexOf(id);
    if (index !== -1) {
      selectedTagIds.value.splice(index, 1);
    }
  }
}

// ============================================================
// 快捷键
// ============================================================

function handleKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    searchInputRef.value?.focus();
  }
  if (event.key === "Escape") {
    if (showEditor.value) closeEditor();
    if (showTagManager.value) showTagManager.value = false;
  }
}

// ============================================================
// 生命周期
// ============================================================

onMounted(async () => {
  loadItems();
  loadTags();

  window.ztools?.onPluginEnter?.((param: LaunchParam) => {
    void handleEntry(param);
  });

  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
/* ---------- 工具栏 ---------- */
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 4px 0;
}

.search-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: var(--control-bg, rgba(0, 0, 0, 0.04));
  border-radius: 8px;
  border: 1px solid var(--border-color, #e5e7eb);
  transition: border-color 0.2s;
}

.search-wrapper:focus-within {
  border-color: var(--primary-color, #667eea);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-wrapper :deep(.zt-input) {
  border: none;
  background: transparent;
  padding: 0;
}

.search-wrapper :deep(.zt-input input) {
  font-size: 13px;
}

.toolbar-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}

.view-toggle {
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--text-on-primary, #e5e7eb);
}

.view-toggle .view-btn {
  border-radius: 0;
  color: var(--text-secondary, #999);
  padding: 4px 8px;
}

.view-toggle .view-btn:not(:last-child) {
  border-right: none;
}
.view-toggle .view-btn:not(:first-child) {
  border-left: none;
}

.view-toggle .view-btn:hover {
  background: var(--hover-bg, #f0f0f0);
}

.view-toggle .view-btn.active {
  background: var(--primary-color, #667eea);
  color: #fff;
}

/* ---------- 内容区域 ---------- */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.empty-icon {
  color: var(--text-secondary, #999);
}

.content-area {
  height: 100%;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.list-view {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ---------- 响应式 ---------- */
@media (max-width: 640px) {
  .grid-view {
    grid-template-columns: 1fr;
  }
  .view-toggle {
    display: none;
  }
}

@media (max-width: 480px) {
  .toolbar {
    flex-direction: column;
    gap: 8px;
  }
  .toolbar-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
