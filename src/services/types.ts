/**
 * ============================================================
 * Web Launcher - 服务层类型定义
 * ============================================================
 */

/** 标签 */
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

/** 条目 */
export interface Item {
  id: string;
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
  isSearch: boolean;
  tagIds: string[];
  createdAt: number;
  updatedAt: number;
}

/** 创建条目参数 */
export interface CreateItemParams {
  name: string;
  url: string;
  icon?: string;
  enabled?: boolean;
  isSearch?: boolean;
  tagIds?: string[];
}

/** 更新条目参数 */
export interface UpdateItemParams {
  name?: string;
  url?: string;
  icon?: string;
  enabled?: boolean;
  isSearch?: boolean;
  tagIds?: string[];
}

/** 创建标签参数 */
export interface CreateTagParams {
  name: string;
  color?: string;
}

/** 更新标签参数 */
export interface UpdateTagParams {
  name?: string;
  color?: string;
}
