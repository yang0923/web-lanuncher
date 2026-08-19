/**
 * ============================================================
 * Web Launcher - 标签状态管理
 * 调用 services，管理响应式状态
 * ============================================================
 */

import { shallowRef, ref, computed } from "vue";
import {
  getTags as getTagsService,
  createTag as createTagService,
  updateTag as updateTagService,
  deleteTag as deleteTagService,
  createTagsIfNotExist,
  findTagById,
  findTagByName,
} from "@/services";
import type { Tag, CreateTagParams, UpdateTagParams } from "@/services";
import { useNotification } from "./useNotification";

export function useTags() {
  // 使用 shallowRef 避免深层响应式追踪，tags 是纯数据数组
  const tags = shallowRef<Tag[]>([]);
  const loading = ref(false);
  const { success, error } = useNotification();

  const sortedTags = computed(() =>
    [...tags.value].sort((a, b) => a.name.localeCompare(b.name)),
  );

  const tagMap = computed(() => new Map(tags.value.map((t) => [t.id, t])));

  /** 替换指定标签并触发响应式更新 */
  function _replace(id: string, updated: Tag) {
    tags.value = tags.value.map((t) => (t.id === id ? updated : t));
  }

  function load() {
    loading.value = true;
    try {
      tags.value = getTagsService();
    } catch (err) {
      error("加载标签失败");
      console.error("[useTags] load failed:", err);
    } finally {
      loading.value = false;
    }
  }

  function add(params: CreateTagParams): Tag | null {
    try {
      const newTag = createTagService(params);
      if (newTag) {
        tags.value = [...tags.value, newTag];
        success(`已创建标签「${newTag.name}」`);
        return newTag;
      }
      return null;
    } catch (err) {
      error(err instanceof Error ? err.message : "创建标签失败");
      return null;
    }
  }

  function update(id: string, params: UpdateTagParams): Tag | null {
    try {
      const updated = updateTagService(id, params);
      if (updated) {
        _replace(id, updated);
        success("标签已更新");
        return updated;
      }
      return null;
    } catch (err) {
      error(err instanceof Error ? err.message : "更新标签失败");
      return null;
    }
  }

  function remove(id: string): boolean {
    try {
      const result = deleteTagService(id);
      if (result.success) {
        tags.value = tags.value.filter((t) => t.id !== id);
        success("标签已删除");
        if (result.removedCount && result.removedCount > 0) {
          success(`已从 ${result.removedCount} 个条目中移除该标签`);
        }
        return true;
      }
      return false;
    } catch (err) {
      error(err instanceof Error ? err.message : "删除标签失败");
      return false;
    }
  }

  function createIfNotExist(tagNames: string[]): string[] {
    try {
      const ids = createTagsIfNotExist(tagNames);
      if (ids.length > 0) {
        load();
      }
      return ids;
    } catch (err) {
      error("创建标签失败");
      return [];
    }
  }

  function findById(id: string): Tag | undefined {
    return findTagById(id);
  }

  function findByName(name: string): Tag | undefined {
    return findTagByName(name);
  }

  function getColorById(id: string): string {
    return findById(id)?.color || "#3b82f6";
  }

  function getNameById(id: string): string {
    return findById(id)?.name || id;
  }

  return {
    tags,
    loading,
    sortedTags,
    tagMap,
    load,
    add,
    update,
    remove,
    createIfNotExist,
    findById,
    findByName,
    getColorById,
    getNameById,
  };
}
