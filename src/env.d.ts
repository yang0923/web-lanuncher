/// <reference types="vite/client" />
/// <reference types="@ztools-center/ztools-api-types" />

// ============================================================
// 底层 API（由 preload 暴露）
// ============================================================

export interface WebLauncherStorage {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
}

export interface WebLauncherFeature {
  sync: (id: string, name: string, icon: string, isSearch: boolean) => void;
  remove: (id: string) => void;
}

export interface WebLauncherApi {
  storage: WebLauncherStorage;
  openExternal: (url: string) => void;
  hideMainWindow: () => void;
  outPlugin: () => void;
  fetchFavicon: (
    url: string,
  ) => Promise<{ success: boolean; data?: string; error?: string }>;
  feature: WebLauncherFeature;
}

// ============================================================
// 插件进入参数
// ============================================================

export interface LaunchParam {
  code?: string;
  type?: string;
  payload?: string;
  inputState?: {
    searchQuery?: string;
    pastedText?: string;
    pastedImage?: unknown;
    pastedFiles?: unknown[];
  };
}

// ============================================================
// 通知类型
// ============================================================

export type NoticeType = "success" | "error" | "info";

export interface Notice {
  type: NoticeType;
  text: string;
}

// ============================================================
// 扩展 Window
// ============================================================
global {
  export interface Window {
    webLauncher: WebLauncherApi;
    ztools: {
      dbStorage: {
        getItem: (key: string) => unknown;
        setItem: (key: string, value: unknown) => void;
      };
      setFeature: (feature: {
        code: string;
        explain: string;
        icon?: string;
        mainHide?: boolean;
        cmds?: unknown[];
      }) => void;
      removeFeature: (code: string) => void;
      shellOpenExternal: (url: string) => void;
      hideMainWindow: (animate?: boolean) => void;
      outPlugin: (animate?: boolean) => void;
      onPluginEnter: (callback: (param: LaunchParam) => void) => void;
      showNotification?: (body: string) => void;
      getThemeInfo?: () => {
        isDark: boolean;
        primaryColor?: string;
        customColor?: string;
        windowMaterial?: string;
      };
      onThemeChange?: (callback: (theme: unknown) => void) => void;
      isMacOS?: () => boolean;
      isMacOs?: () => boolean;
      isWindows?: () => boolean;
      isLinux?: () => boolean;
    };
  }
}
