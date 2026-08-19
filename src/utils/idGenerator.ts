/**
 * ============================================================
 * Web Launcher - ID 生成器
 * ============================================================
 */

export function generateId(): string {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
