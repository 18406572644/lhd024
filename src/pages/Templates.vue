<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Plus, Heart, Download, Upload, Trash2, Edit3, Sparkles } from 'lucide-vue-next';
import { useTemplatesStore } from '../stores/templates';
import { TEMPLATE_CATEGORIES } from '../types';
import type { Template } from '../types';
import TemplateSelector from '../components/TemplateSelector.vue';
import TemplateDetail from '../components/TemplateDetail.vue';
import CustomTemplateEditor from '../components/CustomTemplateEditor.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const templatesStore = useTemplatesStore();

const showSelector = ref(false);
const showDetail = ref(false);
const showEditor = ref(false);
const selectedTemplate = ref<Template | null>(null);
const editingTemplate = ref<Template | null>(null);
const activeCategory = ref<string>('all');
const searchQuery = ref('');

const filteredTemplates = computed(() => {
  let templates = templatesStore.allTemplates;

  if (activeCategory.value !== 'all') {
    templates = templates.filter(t => t.category === activeCategory.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    templates = templates.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  return templates;
});

const stats = computed(() => ({
  total: templatesStore.allTemplates.length,
  custom: templatesStore.customTemplatesList.length,
  favorites: templatesStore.favoriteTemplates.length,
}));

function handleSelectTemplate(template: Template) {
  selectedTemplate.value = template;
  showSelector.value = false;
  showDetail.value = true;
}

function handleApplyTemplate(content: string, title: string) {
  router.push({
    path: '/write',
    query: { template: selectedTemplate.value?.id, content, title },
  });
}

function handleCreateTemplate() {
  editingTemplate.value = null;
  showSelector.value = false;
  showDetail.value = false;
  showEditor.value = true;
}

function handleEditTemplate(template: Template) {
  editingTemplate.value = template;
  showDetail.value = false;
  showEditor.value = true;
}

function handleDeleteTemplate(e: Event, templateId: string) {
  e.stopPropagation();
  if (confirm('确定要删除这个模板吗？')) {
    templatesStore.deleteTemplate(templateId);
  }
}

function handleExportTemplate(e: Event, templateId: string) {
  e.stopPropagation();
  templatesStore.downloadTemplate(templateId);
}

function handleImportTemplate() {
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
        } else {
          alert('模板导入失败，请检查文件格式。');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function handleTemplateSaved(template: Template) {
  selectedTemplate.value = template;
  showEditor.value = false;
  showDetail.value = true;
}

function openTemplateCard(template: Template) {
  selectedTemplate.value = template;
  showDetail.value = true;
}
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <div class="mb-8 animate-fade-in">
        <h1 class="font-serif-sc text-3xl font-bold text-warm-gray-800 mb-2">
          模板中心 ✨
        </h1>
        <p class="text-warm-gray-600">
          选择一个模板，让写作更轻松；或者创建属于你自己的模板
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="card-soft animate-slide-up flex items-center gap-4" style="animation-delay: 0.1s">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-soft-pink-100 to-lavender-100 flex items-center justify-center">
            <Sparkles class="w-6 h-6 text-soft-pink-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-warm-gray-800">{{ stats.total }}</p>
            <p class="text-sm text-warm-gray-500">全部模板</p>
          </div>
        </div>
        <div class="card-soft animate-slide-up flex items-center gap-4" style="animation-delay: 0.2s">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender-100 to-sky-blue-100 flex items-center justify-center">
            <Edit3 class="w-6 h-6 text-lavender-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-warm-gray-800">{{ stats.custom }}</p>
            <p class="text-sm text-warm-gray-500">自定义模板</p>
          </div>
        </div>
        <div class="card-soft animate-slide-up flex items-center gap-4" style="animation-delay: 0.3s">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cream-yellow-100 to-soft-pink-100 flex items-center justify-center">
            <Heart class="w-6 h-6 text-cream-yellow-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-warm-gray-800">{{ stats.favorites }}</p>
            <p class="text-sm text-warm-gray-500">我的收藏</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-4 mb-6 animate-slide-up" style="animation-delay: 0.4s">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索模板名称、描述或标签..."
            class="w-full pl-10 pr-4 py-3 bg-white border border-warm-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-soft-pink-200 focus:border-soft-pink-300"
          />
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            @click="handleImportTemplate"
            class="flex items-center gap-2 px-5 py-3 bg-white border border-warm-gray-200 text-warm-gray-600 rounded-2xl hover:bg-warm-gray-50 transition-colors text-sm font-medium"
          >
            <Upload class="w-4 h-4" />
            导入模板
          </button>
          <button
            type="button"
            @click="handleCreateTemplate"
            class="flex items-center gap-2 px-5 py-3 bg-soft-pink-400 text-white rounded-2xl hover:bg-soft-pink-500 transition-colors text-sm font-medium shadow-soft"
          >
            <Plus class="w-4 h-4" />
            新建模板
          </button>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 mb-6 animate-slide-up" style="animation-delay: 0.5s">
        <button
          type="button"
          @click="activeCategory = 'all'"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            activeCategory === 'all'
              ? 'bg-soft-pink-100 text-soft-pink-600 shadow-soft'
              : 'bg-white text-warm-gray-500 hover:bg-warm-gray-50 border border-warm-gray-200',
          ]"
        >
          全部
        </button>
        <button
          v-for="cat in TEMPLATE_CATEGORIES"
          :key="cat.id"
          type="button"
          @click="activeCategory = cat.id"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
            activeCategory === cat.id
              ? [cat.bgColor, cat.color, 'shadow-soft']
              : 'bg-white text-warm-gray-500 hover:bg-warm-gray-50 border border-warm-gray-200',
          ]"
        >
          <span>{{ cat.emoji }}</span>
          {{ cat.name }}
        </button>
      </div>

      <div v-if="filteredTemplates.length === 0" class="text-center py-16 animate-fade-in">
        <div class="w-20 h-20 rounded-full bg-warm-gray-100 flex items-center justify-center mx-auto mb-4">
          <Search class="w-10 h-10 text-warm-gray-400" />
        </div>
        <p class="text-warm-gray-500 text-lg">暂无匹配的模板</p>
        <p class="text-sm text-warm-gray-400 mt-2">试试其他关键词或分类吧</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(template, index) in filteredTemplates"
          :key="template.id"
          @click="openTemplateCard(template)"
          class="group card-soft cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-slide-up"
          :style="{ animationDelay: `${0.1 * (index % 9) + 0.1}s` }"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ template.emoji }}</span>
              <div>
                <h3 class="font-semibold text-warm-gray-800 group-hover:text-soft-pink-500 transition-colors">
                  {{ template.name }}
                </h3>
                <span class="text-xs text-warm-gray-400">
                  {{ TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.name }}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="(e) => { e.stopPropagation(); templatesStore.toggleFavorite(template.id); }"
                :class="[
                  'p-1.5 rounded-lg transition-colors',
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
                @click="(e) => handleExportTemplate(e, template.id)"
                class="p-1.5 rounded-lg text-warm-gray-400 hover:text-sky-blue-500 hover:bg-sky-blue-50 transition-colors"
                title="导出模板"
              >
                <Download class="w-4 h-4" />
              </button>
              <button
                v-if="template.isCustom"
                type="button"
                @click="(e) => { e.stopPropagation(); handleEditTemplate(template); }"
                class="p-1.5 rounded-lg text-warm-gray-400 hover:text-lavender-500 hover:bg-lavender-50 transition-colors"
                title="编辑模板"
              >
                <Edit3 class="w-4 h-4" />
              </button>
              <button
                v-if="template.isCustom"
                type="button"
                @click="(e) => handleDeleteTemplate(e, template.id)"
                class="p-1.5 rounded-lg text-warm-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="删除模板"
              >
                <Trash2 class="w-4 h-4" />
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
            <span>{{ template.questions.length }} 个引导问题</span>
            <span v-if="template.isCustom" class="px-2 py-0.5 rounded-full bg-lavender-100 text-lavender-500">
              自定义
            </span>
            <span v-else-if="template.usageCount > 0">
              {{ template.usageCount }} 人使用
            </span>
          </div>
        </div>
      </div>
    </div>

    <TemplateSelector
      :show="showSelector"
      @close="showSelector = false"
      @select="handleSelectTemplate"
      @create="handleCreateTemplate"
    />

    <TemplateDetail
      :show="showDetail"
      :template="selectedTemplate"
      @close="showDetail = false"
      @back="showSelector = true; showDetail = false"
      @apply="handleApplyTemplate"
      @edit="handleEditTemplate"
    />

    <CustomTemplateEditor
      :show="showEditor"
      :editing-template="editingTemplate"
      @close="showEditor = false"
      @saved="handleTemplateSaved"
    />
  </div>
</template>
