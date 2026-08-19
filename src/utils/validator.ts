/**
 * ============================================================
 * Web Launcher - 数据校验
 * ============================================================
 */

import type { Item, CreateItemParams, Tag, CreateTagParams } from "@/services";

/** 校验 URL 是否为 http/https */
export function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** 自动补全协议 */
export function ensureProtocol(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

/** 校验条目数据 */
export function validateItem(
  data: Partial<Item> | CreateItemParams,
): { success: true; data: Item } | { success: false; error: string } {
  const name = (data.name || "").trim();
  let url = (data.url || "").trim();

  if (!name) {
    return { success: false, error: "名称不能为空" };
  }
  if (!url) {
    return { success: false, error: "URL 不能为空" };
  }

  url = ensureProtocol(url);
  if (!isHttpUrl(url)) {
    return { success: false, error: "URL 格式不正确" };
  }

  const isSearch = data.isSearch || false;
  if (isSearch && !url.includes("{q}")) {
    return { success: false, error: "搜索模板必须包含 {q} 占位符" };
  }

  return {
    success: true,
    data: {
      id: (data as Item).id || "",
      name,
      url,
      icon: data.icon || "",
      enabled: data.enabled !== false,
      isSearch,
      tagIds: data.tagIds || [],
      createdAt: (data as Item).createdAt || Date.now(),
      updatedAt: (data as Item).updatedAt || Date.now(),
    },
  };
}

/** 校验标签数据 */
export function validateTag(
  data: Partial<Tag> | CreateTagParams,
): { success: true; data: Tag } | { success: false; error: string } {
  const name = (data.name || "").trim();
  if (!name) {
    return { success: false, error: "标签名称不能为空" };
  }

  const color = data.color || "#3b82f6";
  if (!/^#[0-9a-f]{6}$/i.test(color)) {
    return { success: false, error: "颜色格式不正确" };
  }

  return {
    success: true,
    data: {
      id: (data as Tag).id || "",
      name,
      color,
      createdAt: (data as Tag).createdAt || Date.now(),
    },
  };
}
