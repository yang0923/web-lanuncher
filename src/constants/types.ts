/**
 * ============================================================
 * Web Launcher - 常量类型定义
 * ============================================================
 */

export type PresetColors = readonly string[];

export interface StorageKeys {
  ITEMS: string;
  TAGS: string;
}

export interface Defaults {
  TAG_COLOR: string;
  ENABLED: boolean;
  ICON: string;
  VIEW_MODE: "grid" | "list";
}

export interface NotificationConfig {
  DURATION: number;
}
