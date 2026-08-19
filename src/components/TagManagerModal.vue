<template>
  <div class="modal-overlay">
    <div class="modal">
      <header class="modal-header">
        <h2><TagIcon :size="17" /> 管理标签</h2>
        <button class="close-btn" @click="close"><X /></button>
      </header>

      <div class="modal-body">
        <div class="add-tag">
          <input
            v-model="newTagName"
            type="text"
            class="field-input"
            placeholder="新标签名称..."
            @keydown.enter="createTag"
          />
          <input
            v-model="newTagColor"
            type="color"
            class="color-picker"
            title="选择颜色"
          />
          <button
            class="btn-primary"
            :disabled="!newTagName.trim()"
            @click="createTag"
          >
            添加
          </button>
        </div>

        <div v-if="tags.length === 0" class="empty-tags">
          <span>还没有标签，创建第一个吧</span>
        </div>
        <div v-else class="tag-list">
          <div v-for="tag in sortedTags" :key="tag.id" class="tag-item">
            <div class="tag-item-left">
              <span class="tag-dot" :style="{ background: tag.color }" />
              <input
                v-model="tag.name"
                type="text"
                class="tag-name-input"
                @blur="updateTag(tag)"
                @keydown.enter="updateTag(tag)"
              />
              <input
                v-model="tag.color"
                type="color"
                class="tag-color-input"
                @change="updateTag(tag)"
              />
            </div>
            <button
              class="action-btn danger"
              title="删除"
              @click="handleDelete(tag.id)"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <button class="btn-secondary" @click="close">关闭</button>
      </footer>
    </div>
  </div>
</template>
<script setup lang="ts">
import { X, Tag as TagIcon, Trash2 } from "lucide-vue-next";
import { ref, computed } from "vue";
import type { Tag } from "@/services";
import { useNotification } from "@/composables/useNotification";

const props = defineProps<{
  tags: Tag[];
}>();

const emit = defineEmits<{
  (e: "save", tag: Tag): void;
  (e: "delete", id: string): void;
  (e: "close"): void;
}>();

const { show } = useNotification();

const newTagName = ref("");
const newTagColor = ref("#3b82f6");

const sortedTags = computed(() =>
  [...props.tags].sort((a, b) => a.name.localeCompare(b.name)),
);

function createTag() {
  const name = newTagName.value.trim();
  if (!name) return;
  emit("save", {
    id: "",
    name,
    color: newTagColor.value,
    createdAt: Date.now(),
  } as Tag);
  newTagName.value = "";
  newTagColor.value = "#3b82f6";
}

function updateTag(tag: Tag) {
  if (!tag.name.trim()) {
    show("error", "标签名称不能为空");
    return;
  }
  emit("save", tag);
}

function handleDelete(id: string) {
  const tag = props.tags.find((t) => t.id === id);
  if (!tag) return;
  if (
    confirm(`确定要删除标签「${tag.name}」吗？所有关联的条目将移除该标签。`)
  ) {
    emit("delete", id);
  }
}

function close() {
  emit("close");
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--dialog-bg, #f4f4f4);
  border-radius: 12px;
  width: 440px;
  max-width: 94vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px var(--shadow-color, rgba(0, 0, 0, 0.3));
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
}

.modal-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-color, #333);
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary, #616161);
  line-height: 1;
}

.close-btn:hover {
  color: var(--text-color, #333);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.add-tag {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.add-tag .field-input {
  flex: 1;
  padding: 7px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--input-bg, #f4f4f4);
  color: var(--text-color, #333);
  font-size: 13px;
  outline: none;
}
.add-tag .field-input:focus {
  border-color: var(--primary-color, #0284c7);
}

.color-picker {
  width: 36px;
  height: 36px;
  padding: 2px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  flex-shrink: 0;
}
.color-picker::-webkit-color-swatch-wrapper {
  padding: 2px;
}
.color-picker::-webkit-color-swatch {
  border-radius: 4px;
  border: none;
}

.btn-primary {
  padding: 7px 16px;
  border: none;
  border-radius: 6px;
  background: var(--primary-color, #0284c7);
  color: var(--text-on-primary, #fff);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.btn-primary:hover:not(:disabled) {
  background: var(--primary-color, #0284c7);
  opacity: 0.85;
}
.btn-primary:disabled {
  opacity: 0.5;
}

.btn-secondary {
  padding: 6px 16px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background: var(--control-bg, rgba(0, 0, 0, 0.035));
  color: var(--text-color, #333);
  font-size: 13px;
  cursor: pointer;
}
.btn-secondary:hover {
  background: var(--hover-bg, #f9fafb);
}

.empty-tags {
  text-align: center;
  color: var(--text-secondary, #616161);
  padding: 30px 0;
  font-size: 14px;
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--card-bg, rgba(0, 0, 0, 0.015));
  border: 1px solid var(--border-color, #e5e7eb);
}

.tag-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.tag-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-name-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-color, #333);
  font-size: 13px;
  outline: none;
  padding: 2px 4px;
  border-radius: 4px;
  min-width: 60px;
}
.tag-name-input:focus {
  background: var(--input-bg, #f4f4f4);
}

.tag-color-input {
  width: 24px;
  height: 24px;
  padding: 1px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
  flex-shrink: 0;
  margin-right: 4px;
}
.tag-color-input::-webkit-color-swatch-wrapper {
  padding: 1px;
}
.tag-color-input::-webkit-color-swatch {
  border-radius: 3px;
  border: none;
}

.action-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #616161);
}

.action-btn:hover {
  background: var(--hover-bg, #f9fafb);
  color: var(--text-color, #333);
}

.action-btn.danger:hover {
  background: var(--danger-light-bg, #fee2e2);
  color: var(--danger-color, #ef4444);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px 16px;
  border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
}
</style>
