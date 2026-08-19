/**
 * ============================================================
 * Web Launcher - 通知管理
 * ============================================================
 */

import { ref } from "vue";

export type NoticeType = "success" | "error" | "info";

export interface Notice {
  type: NoticeType;
  text: string;
}

const NOTICE_DURATION = 3000;

// 单例：全局共享同一个 notice ref，确保所有组件的通知都显示在同一个 Toast 中
const notice = ref<Notice | null>(null);
let timer = 0;

export function useNotification() {
  function show(type: NoticeType, text: string) {
    notice.value = { type, text };
    if (timer) {
      clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      notice.value = null;
      timer = 0;
    }, NOTICE_DURATION);
  }

  function success(text: string) {
    show("success", text);
  }

  function error(text: string) {
    show("error", text);
  }

  function info(text: string) {
    show("info", text);
  }

  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = 0;
    }
    notice.value = null;
  }

  return { notice, show, success, error, info, clear };
}
