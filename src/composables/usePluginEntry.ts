/**
 * ============================================================
 * Web Launcher - 插件进入处理
 * ============================================================
 */

import type { LaunchParam } from "@/env";
import { FEATURE_PREFIX } from "@/constants";
import { Item } from "@/services";

const MANAGER_FEATURE_CODE = "web-launcher";

export interface UsePluginEntryOptions {
  /** 查找条目的函数 */
  findItem: (id: string) => Item | undefined;
  /** 打开管理界面的回调 */
  onOpenManager?: () => void;
}

export function usePluginEntry(options: UsePluginEntryOptions) {
  const { findItem, onOpenManager } = options;

  function getZtools() {
    if (!window.ztools) {
      throw new Error("ZTools runtime is not ready");
    }
    return window.ztools;
  }

  function getSearchPayload(param: LaunchParam): string {
    return (
      param.payload ||
      param.inputState?.pastedText ||
      param.inputState?.searchQuery ||
      ""
    ).trim();
  }

  function extractItemId(code: string): string | null {
    if (!code.startsWith(FEATURE_PREFIX)) return null;
    return code.slice(FEATURE_PREFIX.length);
  }

  async function handleEntry(param: LaunchParam): Promise<void> {
    const code = param?.code || "";

    // 打开管理界面
    if (code === MANAGER_FEATURE_CODE) {
      onOpenManager?.();
      return;
    }

    const itemId = extractItemId(code);
    if (!itemId) {
      getZtools().showNotification?.("无效的指令");
      getZtools().outPlugin(false);
      return;
    }

    const item = findItem(itemId);
    if (!item) {
      getZtools().showNotification?.("未找到对应的网页");
      getZtools().outPlugin(false);
      return;
    }

    if (!item.enabled) {
      getZtools().showNotification?.("该网页已禁用");
      getZtools().outPlugin(false);
      return;
    }

    let targetUrl: string;
    if (item.isSearch) {
      const payload = getSearchPayload(param);
      if (!payload) {
        getZtools().showNotification?.("请输入搜索关键词");
        getZtools().outPlugin(false);
        return;
      }
      targetUrl = item.url.replace(/\{q\}/g, encodeURIComponent(payload));
    } else {
      targetUrl = item.url;
    }

    try {
      window.webLauncher.openExternal(targetUrl);
    } catch (err) {
      console.error("[WebLauncher] open external failed:", err);
      getZtools().showNotification?.("打开失败");
    }

    window.webLauncher.hideMainWindow();
    window.webLauncher.outPlugin();
  }

  return { handleEntry, extractItemId };
}
