<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Calendar, Heart, Tag, Lock, Unlock, Clock, XCircle } from 'lucide-vue-next';
import { CATEGORIES, MOODS } from '../types';
import type { FilterOptions, MoodType, CapsuleCategory } from '../types';

const props = defineProps<{
  modelValue: boolean;
  filters: FilterOptions;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:filters': [filters: FilterOptions];
  reset: [];
}>();

const localFilters = ref<FilterOptions>({ ...props.filters });

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      localFilters.value = { ...props.filters };
    }
  }
);

const statusOptions = [
  { id: 'pending', label: '待开启', icon: Lock, color: 'bg-soft-pink-100' },
  { id: 'opened', label: '已开启', icon: Unlock, color: 'bg-mint-green-100' },
  { id: 'comingSoon', label: '即将开启', icon: Clock, color: 'bg-cream-yellow-100' },
  { id: 'private', label: '私密胶囊', icon: XCircle, color: 'bg-warm-gray-200' },
];

function close() {
  emit('update:modelValue', false);
}

function confirm() {
  emit('update:filters', { ...localFilters.value });
  close();
}

function reset() {
  localFilters.value = {
    moods: [],
    categories: [],
    status: [],
    createdAtStart: null,
    createdAtEnd: null,
    openAtStart: null,
    openAtEnd: null,
  };
  emit('reset');
}

function toggleMood(mood: MoodType) {
  const index = localFilters.value.moods.indexOf(mood);
  if (index === -1) {
    localFilters.value.moods.push(mood);
  } else {
    localFilters.value.moods.splice(index, 1);
  }
}

function toggleCategory(category: CapsuleCategory) {
  const index = localFilters.value.categories.indexOf(category);
  if (index === -1) {
    localFilters.value.categories.push(category);
  } else {
    localFilters.value.categories.splice(index, 1);
  }
}

function toggleStatus(status: 'pending' | 'opened' | 'comingSoon' | 'private') {
  const index = localFilters.value.status.indexOf(status);
  if (index === -1) {
    localFilters.value.status.push(status);
  } else {
    localFilters.value.status.splice(index, 1);
  }
}

function updateDate(type: 'createdAtStart' | 'createdAtEnd' | 'openAtStart' | 'openAtEnd', value: string) {
  localFilters.value[type] = value || null;
}

const hasChanges = computed(() => {
  return (
    localFilters.value.moods.length > 0 ||
    localFilters.value.categories.length > 0 ||
    localFilters.value.status.length > 0 ||
    localFilters.value.createdAtStart !== null ||
    localFilters.value.createdAtEnd !== null ||
    localFilters.value.openAtStart !== null ||
    localFilters.value.openAtEnd !== null
  );
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end justify-center"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="close"
        ></div>
        
        <Transition name="slide-up">
          <div
            v-if="modelValue"
            class="relative z-10 w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-slide-up"
          >
            <div class="sticky top-0 bg-white border-b border-warm-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <button
                @click="close"
                class="p-2 rounded-full hover:bg-warm-gray-100 transition-colors"
              >
                <X class="w-5 h-5 text-warm-gray-600" />
              </button>
              <h2 class="font-serif-sc text-xl font-semibold text-warm-gray-800">
                智能筛选
              </h2>
              <button
                @click="reset"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  hasChanges
                    ? 'text-soft-pink-500 hover:bg-soft-pink-50'
                    : 'text-warm-gray-400 cursor-not-allowed'
                ]"
                :disabled="!hasChanges"
              >
                重置
              </button>
            </div>

            <div class="overflow-y-auto p-6 pb-32">
              <div class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                  <Heart class="w-5 h-5 text-soft-pink-400" />
                  <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800">
                    心情筛选
                  </h3>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="mood in MOODS"
                    :key="mood.id"
                    @click="toggleMood(mood.id)"
                    :class="[
                      'flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300',
                      localFilters.moods.includes(mood.id)
                        ? [mood.color, 'shadow-soft scale-105 ring-2 ring-offset-2 ring-soft-pink-300']
                        : 'bg-warm-gray-50 hover:bg-warm-gray-100 border border-warm-gray-200'
                    ]"
                  >
                    <span class="text-2xl">{{ mood.emoji }}</span>
                    <span class="text-sm font-medium text-warm-gray-700">{{ mood.name }}</span>
                  </button>
                </div>
              </div>

              <div class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                  <Tag class="w-5 h-5 text-lavender-400" />
                  <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800">
                    分类筛选
                  </h3>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="category in CATEGORIES"
                    :key="category.id"
                    @click="toggleCategory(category.id)"
                    :class="[
                      'flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300',
                      localFilters.categories.includes(category.id)
                        ? [category.bgColor, 'shadow-soft scale-105 ring-2 ring-offset-2 ring-lavender-300']
                        : 'bg-warm-gray-50 hover:bg-warm-gray-100 border border-warm-gray-200'
                    ]"
                  >
                    <span class="text-2xl">{{ category.emoji }}</span>
                    <span class="text-sm font-medium text-warm-gray-700">{{ category.name }}</span>
                  </button>
                </div>
              </div>

              <div class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                  <Lock class="w-5 h-5 text-mint-green-400" />
                  <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800">
                    状态筛选
                  </h3>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="status in statusOptions"
                    :key="status.id"
                    @click="toggleStatus(status.id as any)"
                    :class="[
                      'flex items-center gap-3 p-4 rounded-2xl transition-all duration-300',
                      localFilters.status.includes(status.id as any)
                        ? [status.color, 'shadow-soft scale-[1.02] ring-2 ring-offset-2 ring-mint-green-300']
                        : 'bg-warm-gray-50 hover:bg-warm-gray-100 border border-warm-gray-200'
                    ]"
                  >
                    <component :is="status.icon" class="w-5 h-5 text-warm-gray-600" />
                    <span class="text-sm font-medium text-warm-gray-700">{{ status.label }}</span>
                  </button>
                </div>
              </div>

              <div class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                  <Calendar class="w-5 h-5 text-cream-yellow-400" />
                  <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800">
                    创建时间范围
                  </h3>
                </div>
                <div class="flex gap-4">
                  <div class="flex-1">
                    <label class="block text-sm text-warm-gray-600 mb-2">开始日期</label>
                    <input
                      type="date"
                      :value="localFilters.createdAtStart || ''"
                      @input="updateDate('createdAtStart', ($event.target as HTMLInputElement).value)"
                      class="w-full px-4 py-3 rounded-2xl bg-warm-gray-50 border border-warm-gray-200 text-warm-gray-700 focus:outline-none focus:ring-2 focus:ring-cream-yellow-300 focus:border-transparent transition-all"
                    />
                  </div>
                  <div class="flex-1">
                    <label class="block text-sm text-warm-gray-600 mb-2">结束日期</label>
                    <input
                      type="date"
                      :value="localFilters.createdAtEnd || ''"
                      @input="updateDate('createdAtEnd', ($event.target as HTMLInputElement).value)"
                      class="w-full px-4 py-3 rounded-2xl bg-warm-gray-50 border border-warm-gray-200 text-warm-gray-700 focus:outline-none focus:ring-2 focus:ring-cream-yellow-300 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                  <Clock class="w-5 h-5 text-sky-blue-400" />
                  <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800">
                    开启时间范围
                  </h3>
                </div>
                <div class="flex gap-4">
                  <div class="flex-1">
                    <label class="block text-sm text-warm-gray-600 mb-2">开始日期</label>
                    <input
                      type="date"
                      :value="localFilters.openAtStart || ''"
                      @input="updateDate('openAtStart', ($event.target as HTMLInputElement).value)"
                      class="w-full px-4 py-3 rounded-2xl bg-warm-gray-50 border border-warm-gray-200 text-warm-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-blue-300 focus:border-transparent transition-all"
                    />
                  </div>
                  <div class="flex-1">
                    <label class="block text-sm text-warm-gray-600 mb-2">结束日期</label>
                    <input
                      type="date"
                      :value="localFilters.openAtEnd || ''"
                      @input="updateDate('openAtEnd', ($event.target as HTMLInputElement).value)"
                      class="w-full px-4 py-3 rounded-2xl bg-warm-gray-50 border border-warm-gray-200 text-warm-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-blue-300 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 bg-white border-t border-warm-gray-100 px-6 py-4">
              <button
                @click="confirm"
                class="w-full btn-primary py-3 text-lg font-medium"
              >
                应用筛选
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
