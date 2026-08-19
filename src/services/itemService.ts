/**
 * ============================================================
 * Web Launcher - 条目服务
 * 纯函数，无响应式，直接操作 storage
 * ============================================================
 */

import type { Item, CreateItemParams, UpdateItemParams } from "./types";
import { generateId } from "@/utils/idGenerator";
import { validateItem } from "@/utils/validator";

const STORAGE_KEY = "web-launcher-items";

/** 获取所有条目 */
export function getItems(): Item[] {
  const data = window.webLauncher.storage.get(STORAGE_KEY);
  return Array.isArray(data) ? data : [];
}

/** 保存条目列表 */
export function saveItems(items: Item[]): void {
  window.webLauncher.storage.set(STORAGE_KEY, items);
}

/** 根据 ID 查找条目 */
export function findItemById(id: string): Item | undefined {
  return getItems().find((i) => i.id === id);
}

/** 根据标签 ID 查找条目 */
export function findItemsByTagId(tagId: string): Item[] {
  return getItems().filter((i) => i.tagIds.includes(tagId));
}

/** ✅ 检查是否存在同名同类型条目 */
export function existsByNameAndType(name: string, isSearch: boolean): boolean {
  const items = getItems();
  return items.some(
    (i) =>
      i.name.toLowerCase() === name.toLowerCase() && i.isSearch === isSearch,
  );
}

/** 创建条目（含去重校验） */
export function createItem(params: CreateItemParams): Item | null {
  // ✅ 去重校验：检查同名同类型是否存在
  if (existsByNameAndType(params.name, params.isSearch || false)) {
    throw new Error(
      `已存在同名「${params.isSearch ? "搜索" : "网页"}」条目「${params.name}」`,
    );
  }

  const validated = validateItem(params);
  if (!validated.success) {
    throw new Error((validated as { success: false; error: string }).error);
  }

  const items = getItems();
  const newItem: Item = {
    id: generateId(),
    name: params.name,
    url: params.url,
    icon: params.icon || "",
    enabled: params.enabled !== false,
    isSearch: params.isSearch || false,
    tagIds: params.tagIds || [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  items.push(newItem);
  saveItems(items);

  // 同步到 Feature
  window.webLauncher.feature.sync(
    newItem.id,
    newItem.name,
    newItem.icon,
    newItem.isSearch,
  );

  return newItem;
}

/** 更新条目（含去重校验） */
export function updateItem(id: string, params: UpdateItemParams): Item | null {
  const items = getItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;

  // ✅ 更新时去重：检查同名同类型是否被其他条目占用
  const name = params.name || items[index].name;
  const isSearch =
    params.isSearch !== undefined ? params.isSearch : items[index].isSearch;
  const duplicate = items.some(
    (i) =>
      i.id !== id &&
      i.name.toLowerCase() === name.toLowerCase() &&
      i.isSearch === isSearch,
  );
  if (duplicate) {
    throw new Error(
      `已存在同名「${isSearch ? "搜索" : "网页"}」条目「${name}」`,
    );
  }

  const updated = { ...items[index], ...params, updatedAt: Date.now() };
  const validated = validateItem(updated);
  if (!validated.success) {
    throw new Error((validated as { success: false; error: string }).error);
  }

  items[index] = validated.data as Item;
  saveItems(items);

  // 同步到 Feature
  window.webLauncher.feature.sync(
    items[index].id,
    items[index].name,
    items[index].icon,
    items[index].isSearch,
  );

  return items[index];
}

/** 删除条目 */
export function deleteItem(id: string): boolean {
  const items = getItems();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveItems(filtered);
  window.webLauncher.feature.remove(id);
  return true;
}

/** 切换条目启用状态 */
export function toggleItemEnabled(id: string, enabled: boolean): Item | null {
  const item = findItemById(id);
  if (!item) return null;
  return updateItem(id, { enabled });
}

/** 从所有条目中移除标签引用 */
export function removeTagFromItems(tagId: string): number {
  const items = getItems();
  let count = 0;
  const updated = items.map((item) => {
    if (item.tagIds.includes(tagId)) {
      count++;
      return {
        ...item,
        tagIds: item.tagIds.filter((id) => id !== tagId),
        updatedAt: Date.now(),
      };
    }
    return item;
  });
  if (count > 0) {
    saveItems(updated);
    // 重新同步所有更新的条目
    updated.forEach((item) => {
      if (item.tagIds.includes(tagId) === false) {
        window.webLauncher.feature.sync(
          item.id,
          item.name,
          item.icon,
          item.isSearch,
        );
      }
    });
  }
  return count;
}
