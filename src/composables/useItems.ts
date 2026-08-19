/**
 * ============================================================
 * Web Launcher - 条目状态管理
 * 调用 services，管理响应式状态
 * ============================================================
 */

import { shallowRef, ref, computed } from "vue";
import {
  getItems as getItemsService,
  createItem as createItemService,
  updateItem as updateItemService,
  deleteItem as deleteItemService,
  toggleItemEnabled as toggleItemEnabledService,
  findItemById,
} from "@/services";
import type { Item, CreateItemParams, UpdateItemParams } from "@/services";
import { useNotification } from "./useNotification";

export function useItems() {
  // 使用 shallowRef 避免深层响应式追踪，items 是纯数据数组
  const items = shallowRef<Item[]>([]);
  const loading = ref(false);
  const { success, error } = useNotification();

  const enabledItems = computed(() => items.value.filter((i) => i.enabled));
  const disabledItems = computed(() => items.value.filter((i) => !i.enabled));

  /** 重新赋值触发响应式更新 */
  function _replace(id: string, updated: Item) {
    items.value = items.value.map((i) => (i.id === id ? updated : i));
  }

  function load() {
    loading.value = true;
    try {
      items.value = getItemsService();
    } catch (err) {
      error("加载失败");
      console.error("[useItems] load failed:", err);
    } finally {
      loading.value = false;
    }
  }

  function add(params: CreateItemParams): Item | null {
    try {
      const newItem = createItemService(params);
      if (newItem) {
        items.value = [...items.value, newItem];
        success("已添加");
        return newItem;
      }
      return null;
    } catch (err) {
      error(err instanceof Error ? err.message : "添加失败");
      return null;
    }
  }

  function update(id: string, params: UpdateItemParams): Item | null {
    try {
      const updated = updateItemService(id, params);
      if (updated) {
        _replace(id, updated);
        success("已更新");
        return updated;
      }
      return null;
    } catch (err) {
      error(err instanceof Error ? err.message : "更新失败");
      return null;
    }
  }

  function remove(id: string): boolean {
    try {
      const result = deleteItemService(id);
      if (result) {
        items.value = items.value.filter((i) => i.id !== id);
        success("已删除");
        return true;
      }
      return false;
    } catch (err) {
      error(err instanceof Error ? err.message : "删除失败");
      return false;
    }
  }

  function toggleEnabled(id: string, enabled: boolean): Item | null {
    try {
      const updated = toggleItemEnabledService(id, enabled);
      if (updated) {
        _replace(id, updated);
        return updated;
      }
      return null;
    } catch (err) {
      error(err instanceof Error ? err.message : "更新失败");
      return null;
    }
  }

  function findById(id: string): Item | undefined {
    return findItemById(id);
  }

  function findByTagId(tagId: string): Item[] {
    return items.value.filter((i) => i.tagIds.includes(tagId));
  }

  return {
    items,
    loading,
    enabledItems,
    disabledItems,
    load,
    add,
    update,
    remove,
    toggleEnabled,
    findById,
    findByTagId,
  };
}
