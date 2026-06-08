<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Check, ArrowLeft, Eye, Edit3, Sparkles } from 'lucide-vue-next';
import type { Template } from '../types';
import { TEMPLATE_CATEGORIES } from '../types';
import { generateTemplateContent } from '../data/templates';

interface Props {
  show: boolean;
  template: Template | null;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  template: null,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'back'): void;
  (e: 'apply', content: string, title: string): void;
  (e: 'edit', template: Template): void;
}>();

const answers = ref<Record<string, string>>({});
const fillableValues = ref<Record<string, string>>({});
const showPreview = ref(false);

const categoryInfo = computed(() => {
  if (!props.template) return null;
  return TEMPLATE_CATEGORIES.find(c => c.id === props.template!.category);
});

const generatedContent = computed(() => {
  if (!props.template) return '';
  return generateTemplateContent(props.template, answers.value, fillableValues.value);
});

const canApply = computed(() => {
  if (!props.template) return false;
  const requiredQuestions = props.template.questions.filter(q => q.required);
  return requiredQuestions.every(q => answers.value[q.id]?.trim());
});

const suggestedTitle = computed(() => {
  if (!props.template) return '';
  const firstFillable = Object.values(fillableValues.value).find(v => v.trim());
  if (firstFillable) {
    return `${props.template.name} - ${firstFillable}`;
  }
  return props.template.name;
});

function handleApply() {
  if (!canApply.value || !props.template) return;
  emit('apply', generatedContent.value, suggestedTitle.value);
  emit('close');
}

function handlePreview() {
  showPreview.value = !showPreview.value;
}

function handleEdit() {
  if (!props.template) return;
  emit('edit', props.template);
}

watch(
  () => props.template,
  (newTemplate) => {
    if (newTemplate) {
      answers.value = {};
      fillableValues.value = {};
      showPreview.value = false;

      for (const fillable of newTemplate.fillables) {
        fillableValues.value[fillable.label] = fillable.defaultValue || '';
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show && template"
      class="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900/70 backdrop-blur-sm p-4"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        <div class="flex items-center justify-between p-6 border-b border-warm-gray-100">
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="$emit('back')"
              class="p-2 rounded-full hover:bg-warm-gray-100 transition-colors"
            >
              <ArrowLeft class="w-5 h-5 text-warm-gray-500" />
            </button>
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ template.emoji }}</span>
              <div>
                <h2 class="text-xl font-bold font-serif-sc text-warm-gray-800">
                  {{ template.name }}
                </h2>
                <p class="text-sm text-warm-gray-500">
                  {{ categoryInfo?.name }} · {{ template.questions.length }} 个引导问题
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="p-2 rounded-full hover:bg-warm-gray-100 transition-colors"
          >
            <X class="w-5 h-5 text-warm-gray-500" />
          </button>
        </div>

        <div class="px-6 py-4 bg-gradient-to-r from-soft-pink-50 to-lavender-50 border-b border-warm-gray-100">
          <p class="text-warm-gray-600">{{ template.description }}</p>
          <div class="flex flex-wrap gap-2 mt-3">
            <span
              v-for="tag in template.tags"
              :key="tag"
              class="text-xs px-2 py-0.5 rounded-full bg-white text-warm-gray-600 shadow-soft"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div v-if="template.fillables.length > 0">
            <h3 class="text-sm font-semibold text-warm-gray-700 mb-3 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-cream-yellow-100 text-cream-yellow-600 flex items-center justify-center text-xs">
                1
              </span>
              填写基本信息
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="fillable in template.fillables"
                :key="fillable.id"
                class="card-soft"
              >
                <label class="block text-sm font-medium text-warm-gray-700 mb-1">
                  {{ fillable.label }}
                </label>
                <input
                  v-model="fillableValues[fillable.label]"
                  type="text"
                  :placeholder="fillable.placeholder"
                  class="input-soft text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-warm-gray-700 mb-3 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-soft-pink-100 text-soft-pink-600 flex items-center justify-center text-xs">
                2
              </span>
              回答引导问题
              <span class="text-xs text-warm-gray-400 font-normal">
                (带 * 为必填)
              </span>
            </h3>
            <div class="space-y-4">
              <div
                v-for="(question, index) in template.questions"
                :key="question.id"
                class="card-soft"
              >
                <label class="block text-sm font-medium text-warm-gray-700 mb-1">
                  <span class="text-warm-gray-400 mr-1">{{ index + 1 }}.</span>
                  {{ question.question }}
                  <span v-if="question.required" class="text-soft-pink-500 ml-1">*</span>
                </label>
                <textarea
                  v-model="answers[question.id]"
                  :placeholder="question.placeholder"
                  rows="3"
                  class="w-full bg-warm-gray-50 border border-warm-gray-200 rounded-xl px-4 py-2.5 text-sm text-warm-gray-700 focus:outline-none focus:ring-2 focus:ring-soft-pink-200 focus:border-soft-pink-300 resize-none font-serif-sc leading-relaxed"
                ></textarea>
              </div>
            </div>
          </div>

          <div v-if="showPreview">
            <h3 class="text-sm font-semibold text-warm-gray-700 mb-3 flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-lavender-400" />
              生成预览
            </h3>
            <div class="card-soft bg-gradient-to-br from-soft-pink-50/50 to-lavender-50/50">
              <div class="letter-paper min-h-[200px]">
                <pre class="whitespace-pre-wrap font-serif-sc text-warm-gray-700 leading-loose text-sm">
{{ generatedContent }}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-6 border-t border-warm-gray-100 bg-warm-gray-50/50">
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="handlePreview"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                showPreview
                  ? 'bg-lavender-100 text-lavender-600'
                  : 'bg-warm-gray-100 text-warm-gray-600 hover:bg-warm-gray-200',
              ]"
            >
              <Eye class="w-4 h-4" />
              {{ showPreview ? '隐藏预览' : '预览效果' }}
            </button>
            <button
              v-if="template.isCustom"
              type="button"
              @click="handleEdit"
              class="flex items-center gap-2 px-4 py-2 bg-warm-gray-100 text-warm-gray-600 rounded-xl hover:bg-warm-gray-200 transition-colors text-sm font-medium"
            >
              <Edit3 class="w-4 h-4" />
              编辑模板
            </button>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-6 py-2.5 bg-warm-gray-100 text-warm-gray-600 rounded-xl hover:bg-warm-gray-200 transition-colors text-sm font-medium"
            >
              取消
            </button>
            <button
              type="button"
              @click="handleApply"
              :disabled="!canApply"
              class="flex items-center gap-2 px-6 py-2.5 bg-soft-pink-400 text-white rounded-xl hover:bg-soft-pink-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check class="w-4 h-4" />
              应用模板
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
