/**
 * ============================================================
 * Web Launcher - 常量定义
 * ============================================================
 */

export * from "./types";

export const PRESET_COLORS = [
  "#3b82f6", // 蓝色
  "#10b981", // 翠绿
  "#8b5cf6", // 紫色
  "#f59e0b", // 琥珀色
  "#ef4444", // 红色
  "#ec4899", // 粉色
  "#14b8a6", // 青色
  "#f97316", // 橙色
  "#6366f1", // 靛蓝
  "#22d3ee", // 天蓝
  "#a78bfa", // 淡紫
  "#34d399", // 薄荷
  "#fb923c", // 橘色
  "#f472b6", // 浅粉
  "#60a5fa", // 淡蓝
  "#4ade80", // 草绿
] as const;

export const STORAGE_KEYS = {
  ITEMS: "web-launcher-items",
  TAGS: "web-launcher-tags",
} as const;

export const FEATURE_PREFIX = "launcher-";

export const DEFAULTS = {
  TAG_COLOR: "#3b82f6",
  ENABLED: true,
  ICON: "",
  VIEW_MODE: "grid" as const,
} as const;

export const NOTIFICATION = {
  DURATION: 2400,
} as const;

export const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
} as const;

export type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];
