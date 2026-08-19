<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <header class="editor-header">
        <button class="icon-button" title="返回" @click="close">
          <ArrowLeft :size="17" />
        </button>
        <div>
          <h1>{{ isEdit ? "编辑条目" : "添加入口" }}</h1>
          <p>
            {{ isWebpage ? "输入关键字直接打开网页" : "把搜索词填入 URL 模板" }}
          </p>
        </div>
      </header>

      <div class="editor-content">
        <!-- 类型（分段按钮） -->
        <div class="form-field">
          <label>类型</label>
          <div class="segmented">
            <button
              type="button"
              :class="{ active: !form.isSearch }"
              @click="form.isSearch = false"
            >
              <Globe :size="15" /> 网页
            </button>
            <button
              type="button"
              :class="{ active: form.isSearch }"
              @click="form.isSearch = true"
            >
              <Search :size="15" /> 搜索
            </button>
          </div>
        </div>

        <!-- 快捷添加预设 -->
        <div v-if="!isEdit && isSearchMode" class="form-field">
          <label>快捷添加</label>
          <div class="preset-list">
            <ZButton
              v-for="preset in searchPresets"
              :key="preset.name"
              size="small"
              :loading="quickSavingPreset === preset.name"
              :disabled="Boolean(quickSavingPreset)"
              @click="quickAddSearchPreset(preset)"
            >
              <template #icon><Plus :size="14" /></template>
              {{ preset.name }}
            </ZButton>
          </div>
        </div>

        <!-- 名称 -->
        <div class="form-grid">
          <div class="form-field">
            <label>名称 <span class="required">*</span></label>
            <ZInput
              v-model="form.name"
              clearable
              :placeholder="isWebpage ? '例如：ZTools 官网' : '例如：Google'"
            />
          </div>
        </div>

        <!-- URL -->
        <div class="form-field">
          <label
            >{{ isWebpage ? "网页 URL" : "搜索 URL 模板" }}
            <span class="required">*</span></label
          >
          <ZInput
            v-model="form.url"
            clearable
            :placeholder="
              isWebpage
                ? 'https://www.example.com'
                : 'https://www.google.com/search?q={q}'
            "
          />
          <p class="hint">
            {{
              isWebpage
                ? "支持 http/https，未写协议会自动补全"
                : "使用 {q} 作为搜索词占位符"
            }}
          </p>
        </div>

        <!-- 标签 -->
        <div class="form-field">
          <label>标签</label>
          <ZSelect
            v-model="selectedTagIds"
            :options="tagOptions"
            multiple
            mode="tags"
            filterable
            placeholder="选择已有标签或输入新标签名称后按回车..."
            class="tag-select"
            @tag-create="handleTagCreate"
          />
          <p class="hint">输入新标签名称后按回车即可创建</p>
        </div>

        <!-- 图标 -->
        <div class="form-field">
          <label>图标</label>
          <div class="icon-editor">
            <div class="icon-preview">
              <img v-if="form.icon" :src="form.icon" alt="" />
              <Globe v-else :size="24" />
            </div>
            <ZButton
              size="small"
              :loading="fetchingIcon"
              :disabled="!form.url"
              @click="fetchIcon"
            >
              <template #icon><Download :size="14" /></template> 自动获取
            </ZButton>
            <ZButton size="small" @click="pickIcon">
              <template #icon><Upload :size="14" /></template> 上传
            </ZButton>
            <input
              ref="iconFileInput"
              type="file"
              accept="image/*"
              class="file-input"
              @change="handleIconFile"
            />
            <ZButton
              v-if="form.icon"
              size="small"
              variant="danger"
              @click="form.icon = ''"
            >
              <X :size="14" /> 清除
            </ZButton>
          </div>
        </div>

        <!-- 启用 -->
        <label class="switch-row">
          <span>启用</span>
          <ZSwitch v-model="form.enabled" size="medium" />
        </label>
      </div>

      <footer class="editor-footer">
        <ZButton @click="close">取消</ZButton>
        <ZButton type="primary" :loading="saving" @click="save">
          <template #icon><Check :size="15" /></template> 保存
        </ZButton>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import {
  ArrowLeft,
  Check,
  Download,
  Globe,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-vue-next";
import { ZInput, ZButton, ZSwitch, ZSelect } from "ztools-ui";
import type { Item, Tag, CreateItemParams, UpdateItemParams } from "@/services";
import { useNotification } from "@/composables/useNotification";

const props = defineProps<{
  item: Item | null;
  tags: Tag[];
}>();

const emit = defineEmits<{
  (
    e: "save",
    data: CreateItemParams | UpdateItemParams,
    newTagNames?: string[],
  ): void;
  (e: "close"): void;
}>();

const { show } = useNotification();

// ---------- 表单数据 ----------
const form = reactive<{
  id: string;
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
  isSearch: boolean;
}>({
  id: "",
  name: "",
  url: "",
  icon: "",
  enabled: true,
  isSearch: false,
});

const selectedTagIds = ref<string[]>([]);
const saving = ref(false);
const fetchingIcon = ref(false);
const iconFileInput = ref<HTMLInputElement | null>(null);
const quickSavingPreset = ref("");

const isEdit = computed(() => !!form.id);
const isWebpage = computed(() => !form.isSearch);
const isSearchMode = computed(() => form.isSearch);

// ---------- 预设搜索引擎 ----------
const searchPresets = [
  { name: "百度搜索", url: "https://www.baidu.com/s?wd={q}" },
  { name: "必应搜索", url: "https://www.bing.com/search?q={q}" },
  { name: "Google Search", url: "https://www.google.com/search?q={q}" },
  {
    name: "哔哩哔哩搜索",
    url: "https://search.bilibili.com/all?keyword={q}",
  },
  { name: "Github Search", url: "https://github.com/search?q={q}" },
];

// ---------- 标签选项（ZSelect 格式） ----------
const tagOptions = computed(() => {
  return props.tags.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));
});

// ---------- 快捷添加预设 ----------
async function quickAddSearchPreset(preset: { name: string; url: string }) {
  if (quickSavingPreset.value) return;
  quickSavingPreset.value = preset.name;

  try {
    const iconResult = await window.webLauncher.fetchFavicon(preset.url);

    const data: CreateItemParams = {
      name: preset.name,
      url: preset.url,
      icon: iconResult.success && iconResult.data ? iconResult.data : "",
      enabled: true,
      isSearch: true,
      tagIds: [],
    };

    emit("save", data);
    close();
  } catch (error) {
    show("error", "添加失败");
  } finally {
    quickSavingPreset.value = "";
  }
}

// ---------- 处理新标签创建 ----------
function handleTagCreate(value: string) {
  // ZSelect 的 tag-create 事件会触发，这里可以添加额外逻辑
  // 比如提示用户，或者执行某些操作
  // 但我们不需要在这里处理，因为 selectedTagIds 已经包含了新标签名称
  // 保存时会自动区分
}

// ---------- 图标操作 ----------
function pickIcon() {
  iconFileInput.value?.click();
}

function handleIconFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    show("error", "请选择图片文件");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      form.icon = reader.result;
      show("success", "图标已上传");
    }
  };
  reader.readAsDataURL(file);
  input.value = "";
}

async function fetchIcon() {
  if (!form.url) {
    show("error", "请先填写 URL");
    return;
  }
  fetchingIcon.value = true;
  try {
    const result = await window.webLauncher.fetchFavicon(form.url);
    if (result.success && result.data) {
      form.icon = result.data;
      show("success", "已获取图标");
    } else {
      show("error", result.error || "获取图标失败");
    }
  } catch (err) {
    show("error", "获取图标失败");
  } finally {
    fetchingIcon.value = false;
  }
}

// ---------- 校验 ----------
function validate(): boolean {
  if (!form.name.trim()) {
    show("error", "请填写名称");
    return false;
  }
  if (!form.url.trim()) {
    show("error", "请填写 URL");
    return false;
  }
  if (form.isSearch && !form.url.includes("{q}")) {
    show("error", "搜索模板必须包含 {q} 占位符");
    return false;
  }
  return true;
}

// ---------- 保存 ----------
function save() {
  if (!validate()) return;
  saving.value = true;
  try {
    // 区分已有标签 ID 和用户新输入的标签名称
    const existingTagIds: string[] = [];
    const newTagNames: string[] = [];

    for (const val of selectedTagIds.value) {
      if (props.tags.some((t) => t.id === val)) {
        existingTagIds.push(val);
      } else {
        newTagNames.push(val);
      }
    }

    const data: Record<string, unknown> = {
      name: form.name,
      url: form.url,
      icon: form.icon,
      enabled: form.enabled,
      isSearch: form.isSearch,
      tagIds: existingTagIds,
    };

    if (form.id) {
      data.id = form.id;
    }

    emit("save", data as CreateItemParams | UpdateItemParams, newTagNames);
  } finally {
    saving.value = false;
  }
}

function close() {
  emit("close");
}

// ---------- 监听 props ----------
watch(
  () => props.item,
  (item) => {
    if (item) {
      form.id = item.id;
      form.name = item.name;
      form.url = item.url;
      form.icon = item.icon || "";
      form.enabled = item.enabled;
      form.isSearch = item.isSearch || false;
      selectedTagIds.value = [...item.tagIds];
    } else {
      form.id = "";
      form.name = "";
      form.url = "";
      form.icon = "";
      form.enabled = true;
      form.isSearch = false;
      selectedTagIds.value = [];
    }
  },
  { immediate: true },
);
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--dialog-bg, #f4f4f4);
  border-radius: 12px;
  width: 520px;
  max-width: 94vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px var(--shadow-color, rgba(0, 0, 0, 0.3));
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
}

.editor-header h1 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-color, #333);
}

.editor-header p {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--text-secondary, #616161);
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary, #616161);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.icon-button:hover {
  background: var(--hover-bg, #f9fafb);
  color: var(--text-color, #333);
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-field label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color, #333);
}

.required {
  color: var(--danger-color, #ef4444);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.hint {
  font-size: 12px;
  color: var(--text-secondary, #616161);
  margin: 2px 0 0;
}
.hint code {
  background: var(--control-bg, rgba(0, 0, 0, 0.035));
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11px;
}

/* ---------- 分段选择器 ---------- */
.segmented {
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color, #e5e7eb);
}

.segmented button {
  flex: 1;
  padding: 6px 12px;
  border: none;
  background: var(--input-bg, #f4f4f4);
  color: var(--text-secondary, #616161);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.15s;
}

.segmented button:hover {
  background: var(--hover-bg, #f9fafb);
}

.segmented button.active {
  background: var(--primary-color, #0284c7);
  color: var(--text-on-primary, #fff);
}

.segmented button:not(:last-child) {
  border-right: 1px solid var(--border-color, #e5e7eb);
}

.preset-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-select {
  width: 100%;
}

.icon-editor {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.icon-preview {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--control-bg, rgba(0, 0, 0, 0.035));
}

.icon-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color, #333);
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
  border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
}

.file-input {
  display: none;
}
</style>
