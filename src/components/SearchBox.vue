<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, X, Clock, Trash2 } from 'lucide-vue-next';
import type { SearchHistoryItem } from '../types';

const props = defineProps<{
  modelValue: string;
  isSearching?: boolean;
  searchHistory: SearchHistoryItem[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  search: [keyword: string];
  clear: [];
  clearHistory: [];
  removeHistory: [id: string];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const showHistory = ref(false);

const hasValue = computed(() => props.modelValue.trim() !== '');

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  emit('update:modelValue', value);
}

function handleClear() {
  emit('update:modelValue', '');
  emit('clear');
  inputRef.value?.focus();
}

function handleHistoryClick(keyword: string) {
  emit('update:modelValue', keyword);
  emit('search', keyword);
  showHistory.value = false;
}

function handleRemoveHistory(id: string, e: Event) {
  e.stopPropagation();
  emit('removeHistory', id);
}

function handleClearHistory(e: Event) {
  e.stopPropagation();
  emit('clearHistory');
}

function handleFocus() {
  showHistory.value = true;
}

function handleBlur() {
  setTimeout(() => {
    showHistory.value = false;
  }, 200);
}
</script>

<template>
  <div class="relative">
    <div class="relative">
      <div class="absolute left-4 top-1/2 -translate-y-1/2">
        <Search
          :class="[
            'w-5 h-5 transition-colors',
            isSearching ? 'text-soft-pink-400 animate-pulse' : 'text-warm-gray-400'
          ]"
        />
      </div>
      
      <input
        ref="inputRef"
        type="text"
        :value="modelValue"
        :placeholder="placeholder || '搜索胶囊标题、内容、标签...'"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        class="w-full pl-12 pr-12 py-4 bg-white border border-warm-gray-200 rounded-3xl text-warm-gray-700 placeholder-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-soft-pink-300 focus:border-transparent shadow-soft transition-all duration-300"
      />
      
      <button
        v-if="hasValue"
        @click="handleClear"
        class="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-warm-gray-100 transition-colors"
      >
        <X class="w-4 h-4 text-warm-gray-400" />
      </button>
    </div>

    <Transition name="dropdown">
      <div
        v-if="showHistory && searchHistory.length > 0 && !hasValue"
        class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-warm-gray-100 overflow-hidden z-20"
      >
        <div class="flex items-center justify-between px-4 py-3 bg-warm-gray-50 border-b border-warm-gray-100">
          <div class="flex items-center gap-2 text-warm-gray-600">
            <Clock class="w-4 h-4" />
            <span class="text-sm font-medium">搜索历史</span>
          </div>
          <button
            @click="handleClearHistory"
            class="flex items-center gap-1 text-xs text-warm-gray-400 hover:text-soft-pink-400 transition-colors"
          >
            <Trash2 class="w-3 h-3" />
            清空
          </button>
        </div>
        
        <div class="max-h-60 overflow-y-auto">
          <div
            v-for="item in searchHistory"
            :key="item.id"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-warm-gray-50 transition-colors"
          >
            <button
              @click="handleHistoryClick(item.keyword)"
              class="flex-1 flex items-center gap-3 text-left"
            >
              <Clock class="w-4 h-4 text-warm-gray-300" />
              <span class="text-sm text-warm-gray-700">{{ item.keyword }}</span>
            </button>
            <button
              @click="handleRemoveHistory(item.id, $event)"
              class="p-1 rounded-full hover:bg-warm-gray-200 transition-colors flex-shrink-0"
            >
              <X class="w-3 h-3 text-warm-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
