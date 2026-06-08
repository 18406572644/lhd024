<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, X, Sparkles, Heart, Download, Upload, Plus, Star } from 'lucide-vue-next';
import type { Template, CapsuleCategory, MoodType } from '../types';
import { TEMPLATE_CATEGORIES, MOODS, CATEGORIES } from '../types';
import { useTemplatesStore } from '../stores/templates';

interface Props {
  show: boolean;
  capsuleCategory?: CapsuleCategory;
  currentMood?: MoodType;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  capsuleCategory: 'growth',
  currentMood: 'peaceful',
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', template: Template): void;
  (e: 'create'): void;
}>();

const templatesStore = useTemplatesStore();

const activeTab = ref<'recommend' | 'browse' | 'favorites' | 'custom'>('recommend');
const localSearch = ref('');
const selectedCategoryFilter = ref<string>('all');

const smartRecommendations = computed(() => {
  return templatesStore.getSmartRecommendations(props.capsuleCategory, props.currentMood, 6);
});

const displayTemplates = computed(() => {
  if (activeTab.value === 'recommend') {
    return smartRecommendations.value;
  }
  if (activeTab.value === 'favorites') {
    return templatesStore.favoriteTemplates;
  }
  if (activeTab.value === 'custom') {
    return templatesStore.customTemplatesList;
  }
  if (selectedCategoryFilter.value === 'all') {
    return templatesStore.filteredTemplates;
  }
  return templatesStore.filteredTemplates.filter(
    t => t.category === selectedCategoryFilter.value
  );
});

function handleSelectTemplate(template: Template) {
  templatesStore.incrementUsage(template.id);
  emit('select', template);
  emit('close');
}

function handleToggleFavorite(e: Event, templateId: string) {
  e.stopPropagation();
  templatesStore.toggleFavorite(templateId);
}

function handleExport(e: Event, templateId: string) {
  e.stopPropagation();
  templatesStore.downloadTemplate(templateId);
}

function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const imported = templatesStore.importTemplate(content);
        if (imported) {
          alert('模板导入成功！');
          activeTab.value = 'custom';
        } else {
          alert('模板导入失败，请检查文件格式。');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

watch(localSearch, (val) => {
  templatesStore.setSearchQuery(val);
});

watch(
  () => props.show,
  (val) => {
    if (val) {
      localSearch.value = '';
      templatesStore.setSearchQuery('');
      templatesStore.setSelectedCategory('all');
      selectedCategoryFilter.value = 'all';
    }
  }
);
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900/70 backdrop-blur-sm p-4"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        <div class="flex items-center justify-between p-6 border-b border-warm-gray-100">
          <div>
            <h2 class="text-2xl font-bold font-serif-sc text-warm-gray-800">
              选择模板
            </h2>
            <p class="text-sm text-warm-gray-500 mt-1">
              选择一个模板，让写作更轻松
            </p>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="p-2 rounded-full hover:bg-warm-gray-100 transition-colors"
          >
            <X class="w-5 h-5 text-warm-gray-500" />
          </button>
        </div>

        <div class="flex items-center gap-4 px-6 py-4 border-b border-warm-gray-100">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
            <input
              v-model="localSearch"
              type="text"
              placeholder="搜索模板名称、描述或标签..."
              class="w-full pl-10 pr-4 py-2 bg-warm-gray-50 border border-warm-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-soft-pink-200 focus:border-soft-pink-300"
            />
          </div>
          <button
            type="button"
            @click="$emit('create')"
            class="flex items-center gap-2 px-4 py-2 bg-soft-pink-100 text-soft-pink-600 rounded-xl hover:bg-soft-pink-200 transition-colors text-sm font-medium"
          >
            <Plus class="w-4 h-4" />
            新建模板
          </button>
          <button
            type="button"
            @click="handleImport"
            class="flex items-center gap-2 px-4 py-2 bg-warm-gray-100 text-warm-gray-600 rounded-xl hover:bg-warm-gray-200 transition-colors text-sm font-medium"
          >
            <Upload class="w-4 h-4" />
            导入模板
          </button>
        </div>

        <div class="flex gap-1 px-6 py-3 border-b border-warm-gray-100 bg-warm-gray-50/50">
          <button
            v-for="tab in [
              { id: 'recommend', label: '智能推荐', icon: Sparkles },
              { id: 'browse', label: '全部模板', icon: Star },
              { id: 'favorites', label: '我的收藏', icon: Heart },
              { id: 'custom', label: '自定义', icon: Plus },
            ]"
            :key="tab.id"
            type="button"
            @click="activeTab = tab.id as any"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-soft-pink-600 shadow-soft'
                : 'text-warm-gray-500 hover:text-warm-gray-700 hover:bg-white/50',
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeTab === 'browse'" class="px-6 py-3 border-b border-warm-gray-100">
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="selectedCategoryFilter = 'all'"
              :class="[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                selectedCategoryFilter === 'all'
                  ? 'bg-soft-pink-100 text-soft-pink-600'
                  : 'bg-warm-gray-100 text-warm-gray-600 hover:bg-warm-gray-200',
              ]"
            >
              全部
            </button>
            <button
              v-for="cat in TEMPLATE_CATEGORIES"
              :key="cat.id"
              type="button"
              @click="selectedCategoryFilter = cat.id"
              :class="[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1',
                selectedCategoryFilter === cat.id
                  ? [cat.bgColor, cat.color]
                  : 'bg-warm-gray-100 text-warm-gray-600 hover:bg-warm-gray-200',
              ]"
            >
              <span>{{ cat.emoji }}</span>
              {{ cat.name }}
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'recommend'" class="px-6 py-4 bg-gradient-to-r from-soft-pink-50 to-lavender-50">
          <div class="flex items-center gap-2 mb-3">
            <Sparkles class="w-5 h-5 text-soft-pink-400" />
            <span class="text-sm font-medium text-warm-gray-700">
              基于你选择的分类和心情，为你推荐：
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-soft-pink-100 text-soft-pink-600">
              {{ CATEGORIES.find(c => c.id === capsuleCategory)?.emoji }} {{ CATEGORIES.find(c => c.id === capsuleCategory)?.name }}
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-lavender-100 text-lavender-400">
              {{ MOODS.find(m => m.id === currentMood)?.emoji }} {{ MOODS.find(m => m.id === currentMood)?.name }}
            </span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="displayTemplates.length === 0" class="text-center py-12">
            <div class="w-16 h-16 rounded-full bg-warm-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search class="w-8 h-8 text-warm-gray-400" />
            </div>
            <p class="text-warm-gray-500">暂无匹配的模板</p>
            <p class="text-sm text-warm-gray-400 mt-1">试试其他关键词或分类吧</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="template in displayTemplates"
              :key="template.id"
              @click="handleSelectTemplate(template)"
              class="group card-soft cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">{{ template.emoji }}</span>
                  <div>
                    <h3 class="font-semibold text-warm-gray-800 group-hover:text-soft-pink-500 transition-colors">
                      {{ template.name }}
                    </h3>
                    <span class="text-xs text-warm-gray-400">
                      {{ TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.name }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    @click="(e) => handleToggleFavorite(e, template.id)"
                    :class="[
                      'p-1.5 rounded-full transition-colors',
                      template.isFavorite
                        ? 'text-soft-pink-500 bg-soft-pink-50'
                        : 'text-warm-gray-400 hover:text-soft-pink-500 hover:bg-soft-pink-50',
                    ]"
                    :title="template.isFavorite ? '取消收藏' : '收藏'"
                  >
                    <Heart class="w-4 h-4" :fill="template.isFavorite ? 'currentColor' : 'none'" />
                  </button>
                  <button
                    type="button"
                    @click="(e) => handleExport(e, template.id)"
                    class="p-1.5 rounded-full text-warm-gray-400 hover:text-sky-blue-500 hover:bg-sky-blue-50 transition-colors"
                    title="导出模板"
                  >
                    <Download class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p class="text-sm text-warm-gray-600 mb-3 line-clamp-2">
                {{ template.description }}
              </p>

              <div class="flex flex-wrap gap-1 mb-3">
                <span
                  v-for="tag in template.tags.slice(0, 3)"
                  :key="tag"
                  class="text-xs px-2 py-0.5 rounded-full bg-warm-gray-100 text-warm-gray-500"
                >
                  #{{ tag }}
                </span>
                <span
                  v-if="template.tags.length > 3"
                  class="text-xs px-2 py-0.5 rounded-full bg-warm-gray-100 text-warm-gray-400"
                >
                  +{{ template.tags.length - 3 }}
                </span>
              </div>

              <div class="flex items-center justify-between text-xs text-warm-gray-400">
                <span>
                  {{ template.questions.length }} 个引导问题
                </span>
                <span v-if="template.usageCount > 0">
                  {{ template.usageCount }} 人使用
                </span>
                <span v-else>
                  还没人用过
                </span>
              </div>

              <div v-if="template.isCustom" class="mt-2">
                <span class="text-xs px-2 py-0.5 rounded-full bg-lavender-100 text-lavender-500">
                  自定义模板
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
