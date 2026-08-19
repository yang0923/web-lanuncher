/**
 * ============================================================
 * Web Launcher - 筛选状态管理
 * 统一管理所有筛选条件：搜索、标签、未分类、类型、视图模式
 * ============================================================
 */

import { ref, computed } from "vue";

export type TypeFilter = "all" | "webpage" | "search";

export function useFilter() {
  // ---------- 状态 ----------
  const searchQuery = ref("");
  const selectedTagIds = ref<string[]>([]);
  const showUncategorized = ref(false);
  const typeFilter = ref<TypeFilter>("all");
  const viewMode = ref<"grid" | "list">("grid");

  // ---------- 计算属性 ----------
  const isFiltered = computed(
    () =>
      !!searchQuery.value ||
      selectedTagIds.value.length > 0 ||
      showUncategorized.value ||
      typeFilter.value !== "all",
  );

  // ---------- 标签筛选 ----------
  function isTagSelected(tagId: string): boolean {
    return selectedTagIds.value.includes(tagId);
  }

  function clearTagFilter() {
    selectedTagIds.value = [];
  }

  // ---------- 类型筛选 ----------
  function setTypeFilter(value: TypeFilter) {
    console.log("setTypeFilter", value);
    typeFilter.value = value;
    // 切换类型筛选时取消未分类状态
    if (value !== "all") {
      showUncategorized.value = false;
    }
    console.log("typeFilter.value", typeFilter.value);
  }

  // ---------- 通用操作 ----------
  function selectAll() {
    selectedTagIds.value = [];
    showUncategorized.value = false;
  }

  function selectUncategorized() {
    selectedTagIds.value = [];
    showUncategorized.value = true;
  }

  function selectTag(tagId: string) {
    selectedTagIds.value = [tagId];
    showUncategorized.value = false;
  }

  function reset() {
    searchQuery.value = "";
    selectedTagIds.value = [];
    showUncategorized.value = false;
    typeFilter.value = "all";
  }

  function clearSearch() {
    searchQuery.value = "";
  }

  // ---------- 视图模式 ----------
  function setViewMode(mode: "grid" | "list") {
    viewMode.value = mode;
    try {
      localStorage.setItem("web-launcher-view-mode", mode);
    } catch {
      // ignore
    }
  }

  // 恢复视图模式
  try {
    const saved = localStorage.getItem("web-launcher-view-mode") as
      "grid" | "list" | null;
    if (saved === "grid" || saved === "list") {
      viewMode.value = saved;
    }
  } catch {
    // ignore
  }

  return {
    // 状态
    searchQuery,
    selectedTagIds,
    showUncategorized,
    typeFilter,
    viewMode,
    // 计算属性
    isFiltered,
    // 标签操作
    isTagSelected,
    clearTagFilter,
    // 类型操作
    setTypeFilter,
    // 通用操作
    selectAll,
    selectUncategorized,
    selectTag,
    reset,
    clearSearch,
    setViewMode,
  };
}
