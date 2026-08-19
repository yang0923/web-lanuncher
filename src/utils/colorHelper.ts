/**
 * ============================================================
 * Web Launcher - 颜色工具函数
 * ============================================================
 */

/**
 * 判断颜色是否为十六进制格式（#rrggbb）
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(color);
}

/**
 * 从预设颜色中随机获取一个
 */
export function getRandomPresetColor(colors: readonly string[]): string {
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 调整颜色亮度（变亮或变暗）
 * @param color - 十六进制颜色 #rrggbb
 * @param amount - -1 到 1 之间的值，负值变暗，正值变亮
 */
export function adjustBrightness(color: string, amount: number): string {
  if (!isValidHexColor(color)) return color;
  const hex = color.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  const factor = 1 + amount;
  r = Math.min(255, Math.max(0, Math.round(r * factor)));
  g = Math.min(255, Math.max(0, Math.round(g * factor)));
  b = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * 获取文本颜色（黑或白），基于背景亮度
 * 用于在彩色标签上显示文字
 */
export function getContrastTextColor(
  backgroundColor: string,
): "#ffffff" | "#333333" {
  if (!isValidHexColor(backgroundColor)) return "#ffffff";
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // 计算亮度 (0-255)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 160 ? "#333333" : "#ffffff";
}
