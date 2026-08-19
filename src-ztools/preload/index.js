/**
 * ============================================================
 * Web Launcher - Preload 入口
 * 职责：提供底层能力，不做业务逻辑
 * ============================================================
 */

// ---------- 常量 ----------
const FAVICON_API_URL = "https://fav.lee.cm/get.php";
const FEATURE_PREFIX = "launcher-";
const REQUEST_TIMEOUT_MS = 10000; // 10 秒超时
const MAX_ICON_BYTES = 1024 * 1024; // 1MB 限制
const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
};

// ---------- 存储 ----------
function getZtools() {
  if (!window.ztools) {
    throw new Error("ZTools runtime is not ready");
  }
  return window.ztools;
}

function getStorage(key) {
  return getZtools().dbStorage.getItem(key);
}

function setStorage(key, value) {
  getZtools().dbStorage.setItem(key, value);
}

// ---------- 图标获取 ----------
/**
 * 从第三方服务获取网站图标
 * 参考 web-quick-open 的实现，使用 fetch + 完善的控制
 * @param {string} url - 网站 URL
 * @returns {Promise<string|null>} base64 Data URL 或 null
 */
async function fetchFaviconFromService(url) {
  // 1. URL 规范化
  let cleanUrl = url.replace(/\{q\}/g, "test").trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }

  let domain;
  try {
    const parsed = new URL(cleanUrl);
    domain = parsed.hostname;
  } catch {
    console.warn("[WebLauncher] favicon invalid URL:", url);
    return null;
  }

  // 2. 构建图标服务 URL
  const faviconUrl = `${FAVICON_API_URL}?url=${encodeURIComponent(domain)}`;

  // 3. 超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // 4. 发起请求
    const response = await fetch(faviconUrl, {
      method: "GET",
      headers: REQUEST_HEADERS,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 5. 检查 HTTP 状态
    if (!response.ok) {
      console.warn("[WebLauncher] favicon HTTP error:", response.status);
      return null;
    }

    // 6. 检查 Content-Type
    const contentType = response.headers.get("content-type") || "";
    const normalizedType = contentType.split(";")[0].trim().toLowerCase();

    const isImage =
      normalizedType.startsWith("image/") ||
      normalizedType === "application/octet-stream";

    if (!isImage) {
      console.warn("[WebLauncher] favicon not an image:", normalizedType);
      return null;
    }

    // 7. 读取响应数据
    const buffer = await response.arrayBuffer();

    // 8. 检查是否为空
    if (buffer.byteLength === 0) {
      console.warn("[WebLauncher] favicon response empty");
      return null;
    }

    // 9. 检查大小限制
    if (buffer.byteLength > MAX_ICON_BYTES) {
      console.warn("[WebLauncher] favicon too large:", buffer.byteLength);
      return null;
    }

    // 10. 转换为 base64 Data URL
    const base64 = Buffer.from(buffer).toString("base64");
    const finalContentType = normalizedType || "image/x-icon";

    return `data:${finalContentType};base64,${base64}`;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      console.warn("[WebLauncher] favicon request timeout");
    } else if (error instanceof TypeError && error.message.includes("fetch")) {
      console.warn("[WebLauncher] favicon network error:", error.message);
    } else {
      console.warn("[WebLauncher] favicon error:", error.message);
    }
    return null;
  }
}

// ---------- Feature 同步 ----------
function syncFeature(id, name, icon, isSearch) {
  if (!id) return;
  const zt = getZtools();
  const code = `${FEATURE_PREFIX}${id}`;
  const base = {
    code,
    explain: name,
    icon: icon || "logo.png",
    mainHide: true,
  };
  if (isSearch) {
    zt.setFeature({
      ...base,
      cmds: [{ type: "over", label: name, minLength: 1 }],
    });
  } else {
    zt.setFeature({ ...base, cmds: [name] });
  }
}

function removeFeature(id) {
  if (!id) return;
  getZtools().removeFeature(`${FEATURE_PREFIX}${id}`);
}

// ---------- 暴露 API ----------
window.webLauncher = {
  storage: {
    get: getStorage,
    set: setStorage,
  },
  openExternal: (url) => getZtools().shellOpenExternal(url),
  hideMainWindow: () => getZtools().hideMainWindow(false),
  outPlugin: () => getZtools().outPlugin(false),
  fetchFavicon: async (url) => {
    const data = await fetchFaviconFromService(url);
    return data
      ? { success: true, data }
      : { success: false, error: "获取图标失败" };
  },
  feature: {
    sync: syncFeature,
    remove: removeFeature,
  },
};
