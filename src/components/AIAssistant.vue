<script setup lang="ts">
import { ref, computed } from 'vue';
import { Sparkles, X, Plus, RefreshCw, Copy, Check, MessageSquare } from 'lucide-vue-next';
import type { AIParagraphSuggestion } from '../types';
import { TONE_OPTIONS } from '../types';

interface Props {
  show: boolean;
  currentContent?: string;
  cursorPosition?: number;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  currentContent: '',
  cursorPosition: 0,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'insert', content: string, position: number): void;
}>();

const keywords = ref('');
const selectedTone = ref<AIParagraphSuggestion['tone']>('warm');
const suggestions = ref<AIParagraphSuggestion[]>([]);
const isGenerating = ref(false);
const copiedId = ref<string | null>(null);

const canGenerate = computed(() => keywords.value.trim().length > 0);

const PARAGRAPH_TEMPLATES: Record<AIParagraphSuggestion['tone'], Record<string, string[]>> = {
  warm: {
    default: [
      '每当想起{keywords}，心中总是涌起一股暖流。那是一种无法用言语完全表达的感受，却真实地存在于每一个平凡的日子里。',
      '{keywords}就像冬日里的一缕阳光，温柔地洒在心头，让人在寒冷中也能感受到温暖和希望。',
      '关于{keywords}，我想说的有很多很多。但千言万语，最终都化作一句：谢谢你，出现在我的生命里。',
    ],
    love: [
      '爱一个人，就是会不自觉地想起{keywords}，然后嘴角不自觉地上扬。这种感觉，很奇妙，也很美好。',
      '{keywords}让我相信，原来真的有这样一个人，能让你变得温柔，变得勇敢，变得更好。',
    ],
    gratitude: [
      '感恩生命中遇到的{keywords}，它们教会我成长，教会我爱，教会我珍惜每一个当下。',
    ],
  },
  formal: [
    '关于{keywords}，经过深思熟虑，我认为这是一个值得认真对待的话题。从多个角度来看，它都具有重要的意义和价值。',
    '在回顾{keywords}的过程中，我发现了许多值得总结的经验和教训。这些都将成为未来发展的宝贵财富。',
    '基于对{keywords}的分析和思考，我得出以下结论。希望这些观点能够为相关的讨论提供一些参考。',
  ] as any,
  casual: [
    '说到{keywords}，我就想起很多有趣的事情。哈哈，现在想起来还觉得很有意思呢！',
    '{keywords}？这可是个好东西/好话题！让我来跟你好好聊聊~',
    '其实吧，{keywords}这件事，我觉得顺其自然就好。不用太纠结，开心最重要嘛！',
  ] as any,
  emotional: [
    '{keywords}，这三个字/这个词，承载了我太多太多的情感。有喜悦，有泪水，有感动，也有成长。',
      '每次想到{keywords}，我的心就会被某种情绪填满。那是一种复杂而深刻的感受，只有真正经历过的人才能懂。',
      '{keywords}让我明白，有些情感是无法用理性来解释的。它们就这样真实地存在着，温暖着我们的生命。',
  ] as any,
  inspirational: [
    '{keywords}告诉我们，只要不放弃希望，只要坚持走下去，就一定能看到更美的风景。',
    '在追求{keywords}的道路上，我们可能会遇到很多困难和挫折。但正是这些经历，让我们变得更强大，更接近自己想要成为的人。',
    '不要害怕{keywords}。每一次挑战，都是成长的机会；每一次坚持，都是向梦想靠近的一步。',
  ] as any,
};

function generateId(): string {
  return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractKeywordCategories(kw: string): string[] {
  const lowerKw = kw.toLowerCase();
  const categories: string[] = ['default'];

  const loveKeywords = ['爱', '喜欢', '恋人', '爱情', '老婆', '老公', '亲爱的', 'love'];
  const gratitudeKeywords = ['感谢', '感恩', '谢谢', '谢谢', 'grateful', 'thank'];
  const workKeywords = ['工作', '职场', '公司', '项目', '同事', '领导', 'work', 'job'];
  const dreamKeywords = ['梦想', '目标', '未来', '希望', 'dream', 'goal', 'future'];
  const familyKeywords = ['家人', '父母', '爸爸', '妈妈', '家人', 'family', 'parent'];
  const friendKeywords = ['朋友', '闺蜜', '兄弟', '友谊', 'friend', 'buddy'];

  if (loveKeywords.some(k => lowerKw.includes(k))) categories.push('love');
  if (gratitudeKeywords.some(k => lowerKw.includes(k))) categories.push('gratitude');
  if (workKeywords.some(k => lowerKw.includes(k))) categories.push('default');
  if (dreamKeywords.some(k => lowerKw.includes(k))) categories.push('default');
  if (familyKeywords.some(k => lowerKw.includes(k))) categories.push('default');
  if (friendKeywords.some(k => lowerKw.includes(k))) categories.push('default');

  return categories;
}

function generateParagraphs(): AIParagraphSuggestion[] {
  const kw = keywords.value.trim();
  const tone = selectedTone.value;
  const categories = extractKeywordCategories(kw);

  const toneTemplates = PARAGRAPH_TEMPLATES[tone];
  let availableTemplates: string[] = [];

  for (const cat of categories) {
    if (Array.isArray(toneTemplates)) {
      availableTemplates = [...availableTemplates, ...toneTemplates];
    } else if (toneTemplates[cat]) {
      availableTemplates = [...availableTemplates, ...toneTemplates[cat]];
    }
  }

  if (availableTemplates.length === 0) {
    if (Array.isArray(toneTemplates)) {
      availableTemplates = toneTemplates;
    } else {
      availableTemplates = toneTemplates['default'] || [];
    }
  }

  const shuffled = [...availableTemplates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  return selected.map(template => ({
    id: generateId(),
    content: template.replace(/{keywords}/g, kw),
    keywords: kw.split(/[,，\s]+/).filter(Boolean),
    tone,
  }));
}

async function handleGenerate() {
  if (!canGenerate.value) return;

  isGenerating.value = true;
  suggestions.value = [];

  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

  suggestions.value = generateParagraphs();
  isGenerating.value = false;
}

function handleInsert(suggestion: AIParagraphSuggestion) {
  emit('insert', suggestion.content, props.cursorPosition);
  emit('close');
}

async function handleCopy(suggestion: AIParagraphSuggestion) {
  try {
    await navigator.clipboard.writeText(suggestion.content);
    copiedId.value = suggestion.id;
    setTimeout(() => {
      copiedId.value = null;
    }, 2000);
  } catch (e) {
    console.error('Failed to copy:', e);
  }
}

function handleRegenerate() {
  handleGenerate();
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900/70 backdrop-blur-sm p-4"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        <div class="flex items-center justify-between p-6 border-b border-warm-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-soft-pink-100 to-lavender-100 flex items-center justify-center">
              <Sparkles class="w-5 h-5 text-soft-pink-400" />
            </div>
            <div>
              <h2 class="text-xl font-bold font-serif-sc text-warm-gray-800">
                AI 写作助手
              </h2>
              <p class="text-sm text-warm-gray-500">
                输入关键词，让 AI 帮你生成段落
              </p>
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

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="card-soft">
            <label class="block text-sm font-medium text-warm-gray-700 mb-2">
              关键词
            </label>
            <div class="flex gap-3">
              <input
                v-model="keywords"
                type="text"
                placeholder="输入关键词，比如：梦想、家人、爱情、工作..."
                class="input-soft flex-1"
                @keydown.enter.prevent="handleGenerate"
              />
              <button
                type="button"
                @click="handleGenerate"
                :disabled="!canGenerate || isGenerating"
                class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-soft-pink-400 to-lavender-400 text-white rounded-xl hover:from-soft-pink-500 hover:to-lavender-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Sparkles class="w-4 h-4" :class="{ 'animate-spin': isGenerating }" />
                {{ isGenerating ? '生成中...' : '生成' }}
              </button>
            </div>
            <p class="text-xs text-warm-gray-400 mt-2">
              多个关键词用逗号或空格分隔
            </p>
          </div>

          <div class="card-soft">
            <label class="block text-sm font-medium text-warm-gray-700 mb-3">
              选择语气风格
            </label>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button
                v-for="tone in TONE_OPTIONS"
                :key="tone.id"
                type="button"
                @click="selectedTone = tone.id as AIParagraphSuggestion['tone']"
                :class="[
                  'flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-center',
                  selectedTone === tone.id
                    ? 'bg-soft-pink-100 text-soft-pink-600 shadow-soft scale-105'
                    : 'bg-warm-gray-50 hover:bg-warm-gray-100 text-warm-gray-600',
                ]"
              >
                <span class="text-xl">{{ tone.emoji }}</span>
                <span class="text-xs font-medium">{{ tone.name }}</span>
              </button>
            </div>
          </div>

          <div v-if="suggestions.length > 0">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-warm-gray-700 flex items-center gap-2">
                <MessageSquare class="w-4 h-4 text-lavender-400" />
                AI 为你生成了 {{ suggestions.length }} 个段落
              </h3>
              <button
                type="button"
                @click="handleRegenerate"
                :disabled="isGenerating"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-warm-gray-500 hover:text-warm-gray-700 bg-warm-gray-100 rounded-lg hover:bg-warm-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isGenerating }" />
                换一批
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="suggestion in suggestions"
                :key="suggestion.id"
                class="group card-soft hover:shadow-soft transition-all"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs px-2 py-0.5 rounded-full bg-lavender-100 text-lavender-600">
                      {{ TONE_OPTIONS.find(t => t.id === suggestion.tone)?.name }}
                    </span>
                    <div class="flex gap-1">
                      <span
                        v-for="kw in suggestion.keywords.slice(0, 3)"
                        :key="kw"
                        class="text-xs px-2 py-0.5 rounded-full bg-soft-pink-50 text-soft-pink-500"
                      >
                        #{{ kw }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      @click="handleCopy(suggestion)"
                      class="p-1.5 rounded-lg text-warm-gray-400 hover:text-soft-pink-500 hover:bg-soft-pink-50 transition-colors"
                      :title="copiedId === suggestion.id ? '已复制' : '复制'"
                    >
                      <Check v-if="copiedId === suggestion.id" class="w-4 h-4 text-green-500" />
                      <Copy v-else class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      @click="handleInsert(suggestion)"
                      class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-soft-pink-100 text-soft-pink-600 hover:bg-soft-pink-200 transition-colors"
                    >
                      <Plus class="w-3.5 h-3.5" />
                      插入
                    </button>
                  </div>
                </div>
                <p class="text-warm-gray-700 leading-relaxed font-serif-sc">
                  {{ suggestion.content }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="!isGenerating" class="text-center py-12">
            <div class="w-16 h-16 rounded-full bg-warm-gray-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles class="w-8 h-8 text-warm-gray-400" />
            </div>
            <p class="text-warm-gray-500">输入关键词，让 AI 帮你写</p>
            <p class="text-sm text-warm-gray-400 mt-1">试试：梦想、感谢、爱情、成长...</p>
          </div>

          <div v-if="isGenerating" class="text-center py-12">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-soft-pink-100 to-lavender-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkles class="w-8 h-8 text-soft-pink-400 animate-spin" />
            </div>
            <p class="text-warm-gray-500">AI 正在思考中...</p>
            <p class="text-sm text-warm-gray-400 mt-1">很快就能为你生成漂亮的文字 ✨</p>
          </div>
        </div>

        <div class="flex items-center justify-end p-6 border-t border-warm-gray-100 bg-warm-gray-50/50">
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-2.5 bg-warm-gray-100 text-warm-gray-600 rounded-xl hover:bg-warm-gray-200 transition-colors text-sm font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
