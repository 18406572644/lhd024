<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Plus, Trash2, Save, Eye, Sparkles } from 'lucide-vue-next';
import type { Template, TemplateCategoryType, CapsuleCategory, MoodType, TemplateQuestion, TemplateFillable } from '../types';
import { TEMPLATE_CATEGORIES, CATEGORIES, MOODS } from '../types';
import { useTemplatesStore } from '../stores/templates';
import { createEmptyTemplate } from '../data/templates';

interface Props {
  show: boolean;
  editingTemplate?: Template | null;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  editingTemplate: null,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', template: Template): void;
}>();

const templatesStore = useTemplatesStore();

const isEditing = computed(() => !!props.editingTemplate);

const form = ref<Template>(createEmptyTemplate());
const tagInput = ref('');
const activeTab = ref<'basic' | 'questions' | 'fillables' | 'template'>('basic');
const showPreview = ref(false);

const canSave = computed(() => {
  return form.value.name.trim() &&
    form.value.description.trim() &&
    form.value.contentTemplate.trim() &&
    form.value.questions.length > 0;
});

function addQuestion() {
  const newQuestion: TemplateQuestion = {
    id: `q${form.value.questions.length + 1}`,
    question: '',
    placeholder: '',
    required: true,
  };
  form.value.questions.push(newQuestion);
}

function removeQuestion(index: number) {
  form.value.questions.splice(index, 1);
  form.value.questions.forEach((q, i) => {
    q.id = `q${i + 1}`;
  });
}

function addFillable() {
  const newFillable: TemplateFillable = {
    id: `f${form.value.fillables.length + 1}`,
    label: '',
    placeholder: '',
    defaultValue: '',
  };
  form.value.fillables.push(newFillable);
}

function removeFillable(index: number) {
  form.value.fillables.splice(index, 1);
  form.value.fillables.forEach((f, i) => {
    f.id = `f${i + 1}`;
  });
}

function addTag() {
  const tag = tagInput.value.trim();
  if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 5) {
    form.value.tags.push(tag);
    tagInput.value = '';
  }
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter(t => t !== tag);
}

function toggleMood(mood: MoodType) {
  const index = form.value.suitableMoods.indexOf(mood);
  if (index === -1) {
    form.value.suitableMoods.push(mood);
  } else {
    form.value.suitableMoods.splice(index, 1);
  }
}

function toggleCategory(category: CapsuleCategory) {
  const index = form.value.suitableCategories.indexOf(category);
  if (index === -1) {
    form.value.suitableCategories.push(category);
  } else {
    form.value.suitableCategories.splice(index, 1);
  }
}

function insertQuestionPlaceholder(question: TemplateQuestion) {
  const placeholder = `{{问题${question.id.replace('q', '')}_${question.question}}}`;
  const textarea = document.getElementById('contentTemplate') as HTMLTextAreaElement;
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.value.contentTemplate;
    form.value.contentTemplate = text.substring(0, start) + placeholder + text.substring(end);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  }
}

function insertBuiltinPlaceholder(variable: string) {
  const placeholder = `{{${variable}}}`;
  const textarea = document.getElementById('contentTemplate') as HTMLTextAreaElement;
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.value.contentTemplate;
    form.value.contentTemplate = text.substring(0, start) + placeholder + text.substring(end);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  }
}

function insertFillablePlaceholder(fillable: TemplateFillable) {
  const placeholder = `{{${fillable.label}}}`;
  const textarea = document.getElementById('contentTemplate') as HTMLTextAreaElement;
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.value.contentTemplate;
    form.value.contentTemplate = text.substring(0, start) + placeholder + text.substring(end);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  }
}

function handleSave() {
  if (!canSave.value) return;

  const templateData = { ...form.value };

  let savedTemplate: Template | undefined;
  if (isEditing.value && props.editingTemplate) {
    savedTemplate = templatesStore.updateTemplate(props.editingTemplate.id, templateData);
  } else {
    savedTemplate = templatesStore.createTemplate(templateData);
  }

  if (savedTemplate) {
    emit('saved', savedTemplate);
    emit('close');
  }
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      if (props.editingTemplate) {
        form.value = { ...props.editingTemplate };
      } else {
        form.value = createEmptyTemplate();
      }
      activeTab.value = 'basic';
      showPreview.value = false;
    }
  },
  { immediate: true }
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
              {{ isEditing ? '编辑模板' : '新建模板' }}
            </h2>
            <p class="text-sm text-warm-gray-500 mt-1">
              {{ isEditing ? '修改你的自定义模板' : '创建属于你自己的写作模板' }}
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

        <div class="flex gap-1 px-6 py-3 border-b border-warm-gray-100 bg-warm-gray-50/50">
          <button
            v-for="tab in [
              { id: 'basic', label: '基本信息' },
              { id: 'questions', label: '引导问题' },
              { id: 'fillables', label: '填空项' },
              { id: 'template', label: '内容模板' },
            ]"
            :key="tab.id"
            type="button"
            @click="activeTab = tab.id as any"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-soft-pink-600 shadow-soft'
                : 'text-warm-gray-500 hover:text-warm-gray-700 hover:bg-white/50',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="activeTab === 'basic'" class="space-y-6">
            <div class="card-soft">
              <label class="block text-sm font-medium text-warm-gray-700 mb-2">
                模板名称 *
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="给模板起一个好记的名字"
                class="input-soft"
                maxlength="50"
              />
            </div>

            <div class="card-soft">
              <label class="block text-sm font-medium text-warm-gray-700 mb-2">
                模板描述 *
              </label>
              <textarea
                v-model="form.description"
                placeholder="简单描述一下这个模板的用途"
                rows="2"
                class="w-full bg-warm-gray-50 border border-warm-gray-200 rounded-xl px-4 py-2.5 text-sm text-warm-gray-700 focus:outline-none focus:ring-2 focus:ring-soft-pink-200 focus:border-soft-pink-300 resize-none"
                maxlength="200"
              ></textarea>
            </div>

            <div class="card-soft">
              <label class="block text-sm font-medium text-warm-gray-700 mb-3">
                模板分类 *
              </label>
              <div class="grid grid-cols-3 md:grid-cols-4 gap-2">
                <button
                  v-for="cat in TEMPLATE_CATEGORIES.filter(c => c.id !== 'custom')"
                  :key="cat.id"
                  type="button"
                  @click="form.category = cat.id"
                  :class="[
                    'flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-center',
                    form.category === cat.id
                      ? [cat.bgColor, 'shadow-soft scale-105']
                      : 'bg-warm-gray-50 hover:bg-warm-gray-100',
                  ]"
                >
                  <span class="text-xl">{{ cat.emoji }}</span>
                  <span class="text-xs font-medium text-warm-gray-600">{{ cat.name }}</span>
                </button>
              </div>
            </div>

            <div class="card-soft">
              <label class="block text-sm font-medium text-warm-gray-700 mb-3">
                图标和表情
              </label>
              <div class="flex gap-4">
                <div class="flex-1">
                  <label class="block text-xs text-warm-gray-500 mb-1">图标名称</label>
                  <input
                    v-model="form.icon"
                    type="text"
                    placeholder="lucide icon name"
                    class="input-soft text-sm"
                  />
                </div>
                <div class="flex-1">
                  <label class="block text-xs text-warm-gray-500 mb-1">表情符号</label>
                  <input
                    v-model="form.emoji"
                    type="text"
                    placeholder="✨"
                    class="input-soft text-sm"
                    maxlength="2"
                  />
                </div>
              </div>
            </div>

            <div class="card-soft">
              <label class="block text-sm font-medium text-warm-gray-700 mb-3">
                适合的心情
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="mood in MOODS"
                  :key="mood.id"
                  type="button"
                  @click="toggleMood(mood.id)"
                  :class="[
                    'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                    form.suitableMoods.includes(mood.id)
                      ? [mood.color, 'shadow-soft scale-105']
                      : 'bg-warm-gray-50 hover:bg-warm-gray-100',
                  ]"
                >
                  <span class="text-xl">{{ mood.emoji }}</span>
                  <span class="text-xs font-medium text-warm-gray-600">{{ mood.name }}</span>
                </button>
              </div>
            </div>

            <div class="card-soft">
              <label class="block text-sm font-medium text-warm-gray-700 mb-3">
                适合的分类
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="cat in CATEGORIES"
                  :key="cat.id"
                  type="button"
                  @click="toggleCategory(cat.id)"
                  :class="[
                    'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                    form.suitableCategories.includes(cat.id)
                      ? [cat.bgColor, 'shadow-soft scale-105']
                      : 'bg-warm-gray-50 hover:bg-warm-gray-100',
                  ]"
                >
                  <span class="text-xl">{{ cat.emoji }}</span>
                  <span class="text-xs font-medium text-warm-gray-600">{{ cat.name }}</span>
                </button>
              </div>
            </div>

            <div class="card-soft">
              <label class="block text-sm font-medium text-warm-gray-700 mb-2">
                标签
                <span class="text-warm-gray-400 text-xs ml-2">(最多5个，按回车添加)</span>
              </label>
              <div class="flex gap-3 mb-3">
                <input
                  v-model="tagInput"
                  type="text"
                  placeholder="添加一个标签"
                  class="input-soft flex-1"
                  @keydown.enter.prevent="addTag"
                  maxlength="10"
                />
                <button
                  type="button"
                  @click="addTag"
                  class="btn-secondary"
                  :disabled="form.tags.length >= 5"
                >
                  添加
                </button>
              </div>
              <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2">
                <span
                  v-for="tag in form.tags"
                  :key="tag"
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-soft-pink-100 text-warm-gray-700"
                >
                  #{{ tag }}
                  <button type="button" @click="removeTag(tag)" class="hover:text-soft-pink-400">
                    ×
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'questions'" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm text-warm-gray-600">
                引导性问题帮助用户更好地表达。用户回答后会自动填入内容模板。
              </p>
              <button
                type="button"
                @click="addQuestion"
                class="flex items-center gap-2 px-4 py-2 bg-soft-pink-100 text-soft-pink-600 rounded-xl hover:bg-soft-pink-200 transition-colors text-sm font-medium"
              >
                <Plus class="w-4 h-4" />
                添加问题
              </button>
            </div>

            <div
              v-for="(question, index) in form.questions"
              :key="question.id"
              class="card-soft"
            >
              <div class="flex items-start justify-between mb-2">
                <span class="text-sm font-medium text-warm-gray-700">
                  问题 {{ index + 1 }}
                </span>
                <button
                  type="button"
                  @click="removeQuestion(index)"
                  class="p-1.5 rounded-lg text-warm-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              <div class="space-y-3">
                <input
                  v-model="question.question"
                  type="text"
                  placeholder="问题内容，比如：这一年最让你骄傲的成就是什么？"
                  class="input-soft text-sm"
                />
                <input
                  v-model="question.placeholder"
                  type="text"
                  placeholder="提示文字，比如：比如：完成了一个重要项目..."
                  class="input-soft text-sm"
                />
                <div class="flex items-center gap-2">
                  <input
                    :id="`required-${question.id}`"
                    v-model="question.required"
                    type="checkbox"
                    class="w-4 h-4 text-soft-pink-500 border-warm-gray-300 rounded focus:ring-soft-pink-200"
                  />
                  <label :for="`required-${question.id}`" class="text-sm text-warm-gray-600">
                    必填问题
                  </label>
                </div>
              </div>
            </div>

            <div v-if="form.questions.length === 0" class="text-center py-12">
              <div class="w-16 h-16 rounded-full bg-warm-gray-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles class="w-8 h-8 text-warm-gray-400" />
              </div>
              <p class="text-warm-gray-500">还没有引导问题</p>
              <p class="text-sm text-warm-gray-400 mt-1">点击上方按钮添加第一个问题</p>
            </div>
          </div>

          <div v-if="activeTab === 'fillables'" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm text-warm-gray-600">
                填空项用于快速填写基本信息，比如姓名、日期等。
              </p>
              <button
                type="button"
                @click="addFillable"
                class="flex items-center gap-2 px-4 py-2 bg-soft-pink-100 text-soft-pink-600 rounded-xl hover:bg-soft-pink-200 transition-colors text-sm font-medium"
              >
                <Plus class="w-4 h-4" />
                添加填空项
              </button>
            </div>

            <div
              v-for="(fillable, index) in form.fillables"
              :key="fillable.id"
              class="card-soft"
            >
              <div class="flex items-start justify-between mb-2">
                <span class="text-sm font-medium text-warm-gray-700">
                  填空项 {{ index + 1 }}
                </span>
                <button
                  type="button"
                  @click="removeFillable(index)"
                  class="p-1.5 rounded-lg text-warm-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs text-warm-gray-500 mb-1">标签 *</label>
                  <input
                    v-model="fillable.label"
                    type="text"
                    placeholder="比如：姓名"
                    class="input-soft text-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs text-warm-gray-500 mb-1">提示文字</label>
                  <input
                    v-model="fillable.placeholder"
                    type="text"
                    placeholder="比如：请输入你的名字"
                    class="input-soft text-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs text-warm-gray-500 mb-1">默认值</label>
                  <input
                    v-model="fillable.defaultValue"
                    type="text"
                    placeholder="可选"
                    class="input-soft text-sm"
                  />
                </div>
              </div>
            </div>

            <div v-if="form.fillables.length === 0" class="text-center py-12">
              <div class="w-16 h-16 rounded-full bg-warm-gray-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles class="w-8 h-8 text-warm-gray-400" />
              </div>
              <p class="text-warm-gray-500">还没有填空项</p>
              <p class="text-sm text-warm-gray-400 mt-1">点击上方按钮添加第一个填空项</p>
            </div>
          </div>

          <div v-if="activeTab === 'template'" class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-warm-gray-600">
                设计你的内容模板。使用 <code class="px-1.5 py-0.5 bg-warm-gray-100 rounded text-xs">{{ '{' }}{{ '{' }}变量名{{ '}' }}{{ '}' }}</code> 格式插入变量。
              </p>
              <button
                type="button"
                @click="showPreview = !showPreview"
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
            </div>

            <div class="flex flex-wrap gap-2 p-4 bg-warm-gray-50 rounded-xl">
              <span class="text-xs text-warm-gray-500 mr-2">可用变量：</span>
              <button
                type="button"
                class="text-xs px-2 py-1 rounded-full bg-cream-yellow-100 text-cream-yellow-600 hover:bg-cream-yellow-200 transition-colors"
                @click="insertBuiltinPlaceholder('日期')"
              >
                {{ '{' }}{{ '{' }}日期{{ '}' }}{{ '}' }}
              </button>
              <button
                type="button"
                class="text-xs px-2 py-1 rounded-full bg-cream-yellow-100 text-cream-yellow-600 hover:bg-cream-yellow-200 transition-colors"
                @click="insertBuiltinPlaceholder('年份')"
              >
                {{ '{' }}{{ '{' }}年份{{ '}' }}{{ '}' }}
              </button>
              <button
                v-for="fillable in form.fillables"
                :key="fillable.id"
                type="button"
                class="text-xs px-2 py-1 rounded-full bg-mint-green-100 text-mint-green-600 hover:bg-mint-green-200 transition-colors"
                @click="insertFillablePlaceholder(fillable)"
              >
                {{ '{' }}{{ '{' }}{{ fillable.label }}{{ '}' }}{{ '}' }}
              </button>
              <button
                v-for="question in form.questions"
                :key="question.id"
                type="button"
                class="text-xs px-2 py-1 rounded-full bg-lavender-100 text-lavender-600 hover:bg-lavender-200 transition-colors"
                @click="insertQuestionPlaceholder(question)"
              >
                {{ '{' }}{{ '{' }}问题{{ question.id.replace('q', '') }}_...{{ '}' }}{{ '}' }}
              </button>
            </div>

            <div class="card-soft">
              <label class="block text-sm font-medium text-warm-gray-700 mb-2">
                内容模板 *
              </label>
              <textarea
                id="contentTemplate"
                v-model="form.contentTemplate"
                placeholder="在这里设计你的模板内容，使用上面的变量按钮插入占位符..."
                rows="12"
                class="w-full bg-warm-gray-50 border border-warm-gray-200 rounded-xl px-4 py-3 text-sm text-warm-gray-700 focus:outline-none focus:ring-2 focus:ring-soft-pink-200 focus:border-soft-pink-300 resize-none font-serif-sc leading-loose"
              ></textarea>
            </div>

            <div v-if="showPreview" class="card-soft bg-gradient-to-br from-soft-pink-50/50 to-lavender-50/50">
              <h4 class="text-sm font-semibold text-warm-gray-700 mb-3">预览效果</h4>
              <div class="letter-paper">
                <pre class="whitespace-pre-wrap font-serif-sc text-warm-gray-700 leading-loose text-sm">
{{ form.contentTemplate }}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 p-6 border-t border-warm-gray-100 bg-warm-gray-50/50">
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-2.5 bg-warm-gray-100 text-warm-gray-600 rounded-xl hover:bg-warm-gray-200 transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            type="button"
            @click="handleSave"
            :disabled="!canSave"
            class="flex items-center gap-2 px-6 py-2.5 bg-soft-pink-400 text-white rounded-xl hover:bg-soft-pink-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save class="w-4 h-4" />
            {{ isEditing ? '保存修改' : '创建模板' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
