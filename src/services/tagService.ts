/**
 * ============================================================
 * Web Launcher - 标签服务
 * 纯函数，无响应式，直接操作 storage
 * ============================================================
 */

import type { Tag, CreateTagParams, UpdateTagParams } from "./types";
import { generateId } from "@/utils/idGenerator";
import { validateTag } from "@/utils/validator";
import { removeTagFromItems } from "./itemService";

const STORAGE_KEY = "web-launcher-tags";

/** 获取所有标签 */
export function getTags(): Tag[] {
  const data = window.webLauncher.storage.get(STORAGE_KEY);
  return Array.isArray(data) ? data : [];
}

/** 保存标签列表 */
export function saveTags(tags: Tag[]): void {
  window.webLauncher.storage.set(STORAGE_KEY, tags);
}

/** 根据 ID 查找标签 */
export function findTagById(id: string): Tag | undefined {
  return getTags().find((t) => t.id === id);
}

/** 根据名称查找标签 */
export function findTagByName(name: string): Tag | undefined {
  return getTags().find((t) => t.name.toLowerCase() === name.toLowerCase());
}

/** 创建标签 */
export function createTag(params: CreateTagParams): Tag | null {
  const validated = validateTag(params);
  if (!validated.success) {
    throw new Error((validated as { success: false; error: string }).error);
  }
  const name = params.name.trim();

  const tags = getTags();

  // 检查同名标签
  if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
    throw new Error(`标签 "${name}" 已存在`);
  }

  const newTag: Tag = {
    id: generateId(),
    name,
    color: params.color || "#3b82f6",
    createdAt: Date.now(),
  };

  tags.push(newTag);
  saveTags(tags);
  return newTag;
}

/** 更新标签 */
export function updateTag(id: string, params: UpdateTagParams): Tag | null {
  const tags = getTags();
  const index = tags.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updated = { ...tags[index], ...params };
  const validated = validateTag(updated);
  if (!validated.success) {
    throw new Error((validated as { success: false; error: string }).error);
  }

  // 检查同名标签（排除自己）
  const name = params.name?.trim();
  if (name) {
    const duplicate = tags.some(
      (t) => t.name.toLowerCase() === name.toLowerCase() && t.id !== id,
    );
    if (duplicate) {
      throw new Error(`标签 "${name}" 已存在`);
    }
  }

  tags[index] = validated.data as Tag;
  saveTags(tags);
  return tags[index];
}

/** 删除标签 */
export function deleteTag(id: string): {
  success: boolean;
  removedCount?: number;
} {
  const tags = getTags();
  const filtered = tags.filter((t) => t.id !== id);
  if (filtered.length === tags.length) {
    return { success: false };
  }
  saveTags(filtered);
  // 从所有条目中移除该标签引用
  const removedCount = removeTagFromItems(id);
  return { success: true, removedCount };
}

/** 批量创建标签（如果不存在） */
export function createTagsIfNotExist(tagNames: string[]): string[] {
  const results: string[] = [];
  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;

    const existing = findTagByName(trimmed);
    if (existing) {
      results.push(existing.id);
      continue;
    }

    try {
      const tag = createTag({ name: trimmed, color: "#3b82f6" });
      if (tag) results.push(tag.id);
    } catch {
      // 忽略创建失败
    }
  }
  return results;
}
