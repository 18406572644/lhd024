<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Calendar, Tag, Lock, Unlock, Send, Sparkles, Heart, Globe } from 'lucide-vue-next';
import type { CapsuleCategory, MoodType } from '../types';
import { CATEGORIES, MOODS, PRESET_TIMES } from '../types';
import { useCapsuleOperation } from '../composables/useCapsules';
import { addMonths, formatDate, dayjs } from '../utils/date';

const router = useRouter();
const { createCapsule, loading } = useCapsuleOperation();

const title = ref('');
const content = ref('');
const category = ref<CapsuleCategory>('growth');
const mood = ref<MoodType>('peaceful');
const tags = ref<string[]>([]);
const tagInput = ref('');
const openAt = ref('');
const isPrivate = ref(false);
const isPublic = ref(false);
const email = ref('');
const showSuccess = ref(false);

const customDate = computed(() => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
});

const minDate = computed(() => {
  return dayjs().add(1, 'day').format('YYYY-MM-DD');
});

const canSubmit = computed(() => {
  return title.value.trim() && content.value.trim() && openAt.value;
});

function selectPreset(months: number) {
  openAt.value = addMonths(new Date(), months).split('T')[0];
}

function addTag() {
  const tag = tagInput.value.trim();
  if (tag && !tags.value.includes(tag) && tags.value.length < 5) {
    tags.value.push(tag);
    tagInput.value = '';
  }
}

function removeTag(tag: string) {
  tags.value = tags.value.filter(t => t !== tag);
}

function handleTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTag();
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return;
  
  try {
    const openDate = new Date(openAt.value);
    openDate.setHours(9, 0, 0, 0);
    
    await createCapsule({
      title: title.value.trim(),
      content: content.value.trim(),
      category: category.value,
      mood: mood.value,
      tags: tags.value,
      openAt: openDate.toISOString(),
      isPrivate: isPrivate.value,
      isPublic: isPublic.value,
      email: email.value || undefined,
    });
    
    showSuccess.value = true;
    
    setTimeout(() => {
      router.push('/');
    }, 2000);
  } catch (e) {
    console.error('Failed to create capsule:', e);
  }
}

function handleCancel() {
  if (title.value || content.value) {
    if (confirm('确定要离开吗？当前内容将不会保存。')) {
      router.push('/');
    }
  } else {
    router.push('/');
  }
}
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div v-if="showSuccess" class="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900/30 backdrop-blur-sm">
        <div class="bg-white rounded-3xl p-12 text-center shadow-soft animate-scale-in max-w-md mx-4">
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-soft-pink-100 to-cream-yellow-100 flex items-center justify-center mx-auto mb-6 animate-heart-beat">
            <Sparkles class="w-12 h-12 text-soft-pink-400" />
          </div>
          <h2 class="font-serif-sc text-2xl font-semibold text-warm-gray-800 mb-3">
            胶囊已封存成功！
          </h2>
          <p class="text-warm-gray-600 mb-6">
            这封信已经被小心翼翼地收藏起来，等待着在未来的某一天，与你再次相遇。
          </p>
          <p class="text-sm text-warm-gray-400">
            即将跳转到首页...
          </p>
        </div>
      </div>

      <div class="mb-8 animate-fade-in">
        <h1 class="font-serif-sc text-3xl font-bold text-warm-gray-800 mb-2">
          给未来写一封信 ✨
        </h1>
        <p class="text-warm-gray-600">
          把此刻的心情、想说的话，都放进这个小小的胶囊里吧。
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <div class="card-soft animate-slide-up" style="animation-delay: 0.1s">
          <label class="block text-sm font-medium text-warm-gray-700 mb-2">
            <span class="text-soft-pink-400 mr-1">♥</span> 信件标题
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="给这封信起个温暖的名字吧"
            class="input-soft text-lg font-serif-sc"
            maxlength="50"
          />
        </div>

        <div class="card-soft animate-slide-up" style="animation-delay: 0.2s">
          <label class="block text-sm font-medium text-warm-gray-700 mb-2">
            <span class="text-cream-yellow-400 mr-1">✉️</span> 信件内容
          </label>
          <div class="letter-paper min-h-[300px]">
            <textarea
              v-model="content"
              placeholder="亲爱的未来的自己...

此刻，我正坐在窗前，窗外的阳光正好。我想对你说..."
              class="w-full min-h-[400px] bg-transparent border-none outline-none resize-none font-serif-sc text-lg text-warm-gray-700 leading-loose letter-textarea"
            ></textarea>
          </div>
          <p class="text-right text-sm text-warm-gray-400 mt-2">
            {{ content.length }} 字
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card-soft animate-slide-up" style="animation-delay: 0.3s">
            <label class="block text-sm font-medium text-warm-gray-700 mb-3">
              <span class="text-mint-green-400 mr-1">📂</span> 选择分类
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="cat in CATEGORIES"
                :key="cat.id"
                type="button"
                @click="category = cat.id"
                :class="[
                  'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300',
                  category === cat.id
                    ? [cat.bgColor, 'shadow-soft scale-105']
                    : 'bg-warm-gray-50 hover:bg-warm-gray-100'
                ]"
              >
                <span class="text-2xl">{{ cat.emoji }}</span>
                <span class="text-xs font-medium text-warm-gray-600">{{ cat.name }}</span>
              </button>
            </div>
          </div>

          <div class="card-soft animate-slide-up" style="animation-delay: 0.4s">
            <label class="block text-sm font-medium text-warm-gray-700 mb-3">
              <span class="text-lavender-300 mr-1">😊</span> 此刻的心情
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="m in MOODS"
                :key="m.id"
                type="button"
                @click="mood = m.id"
                :class="[
                  'flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300',
                  mood === m.id
                    ? [m.color, 'shadow-soft scale-105']
                    : 'bg-warm-gray-50 hover:bg-warm-gray-100'
                ]"
              >
                <span class="text-2xl">{{ m.emoji }}</span>
                <span class="text-xs font-medium text-warm-gray-600">{{ m.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="card-soft animate-slide-up" style="animation-delay: 0.5s">
          <label class="block text-sm font-medium text-warm-gray-700 mb-3">
            <Tag class="w-4 h-4 inline-block mr-1 text-soft-pink-400" />
            添加标签
            <span class="text-warm-gray-400 text-xs ml-2">(最多5个，按回车添加)</span>
          </label>
          <div class="flex gap-3">
            <input
              v-model="tagInput"
              type="text"
              placeholder="添加一个标签，比如：梦想、旅行、感恩..."
              class="input-soft flex-1"
              @keydown="handleTagKeydown"
              maxlength="10"
            />
            <button
              type="button"
              @click="addTag"
              class="btn-secondary"
              :disabled="tags.length >= 5"
            >
              添加
            </button>
          </div>
          <div v-if="tags.length > 0" class="flex flex-wrap gap-2 mt-3">
            <span
              v-for="tag in tags"
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

        <div class="card-soft animate-slide-up" style="animation-delay: 0.6s">
          <label class="block text-sm font-medium text-warm-gray-700 mb-3">
            <Calendar class="w-4 h-4 inline-block mr-1 text-cream-yellow-400" />
            选择开启时间
          </label>
          <p class="text-sm text-warm-gray-500 mb-4">
            这封信将在你选择的时间自动开启，给未来的你一个惊喜 ✨
          </p>
          
          <div class="mb-4">
            <p class="text-xs text-warm-gray-500 mb-2">快捷选择：</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in PRESET_TIMES"
                :key="preset.months"
                type="button"
                @click="selectPreset(preset.months)"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  openAt === addMonths(new Date(), preset.months).split('T')[0]
                    ? 'bg-cream-yellow-200 text-warm-gray-800 shadow-soft'
                    : 'bg-warm-gray-100 text-warm-gray-600 hover:bg-warm-gray-200'
                ]"
              >
                {{ preset.label }}后
              </button>
            </div>
          </div>
          
          <div>
            <p class="text-xs text-warm-gray-500 mb-2">或自定义日期：</p>
            <input
              v-model="openAt"
              type="date"
              :min="minDate"
              class="input-soft"
            />
          </div>
          
          <p v-if="openAt" class="text-sm text-mint-green-600 mt-3 flex items-center gap-2">
            <Heart class="w-4 h-4 animate-pulse" />
            将在 {{ formatDate(openAt) }} 开启这封信
          </p>
        </div>

        <div class="card-soft animate-slide-up" style="animation-delay: 0.7s">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <component :is="isPrivate ? Lock : Unlock" class="w-4 h-4 text-lavender-300" />
                <span class="text-sm font-medium text-warm-gray-700">设为私密胶囊</span>
              </div>
              <p class="text-sm text-warm-gray-500">
                私密胶囊在查看时需要额外输入密码验证
              </p>
            </div>
            <button
              type="button"
              @click="isPrivate = !isPrivate"
              :class="[
                'relative w-14 h-8 rounded-full transition-colors duration-300',
                isPrivate ? 'bg-lavender-200' : 'bg-warm-gray-200'
              ]"
            >
              <span
                :class="[
                  'absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300',
                  isPrivate ? 'left-7' : 'left-1'
                ]"
              ></span>
            </button>
          </div>
        </div>

        <div class="card-soft animate-slide-up" style="animation-delay: 0.75s">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Globe class="w-4 h-4 text-mint-green-300" />
                <span class="text-sm font-medium text-warm-gray-700">公开分享</span>
              </div>
              <p class="text-sm text-warm-gray-500">
                开启后可生成分享链接和二维码，他人可通过链接查看此胶囊
              </p>
            </div>
            <button
              type="button"
              @click="isPublic = !isPublic"
              :class="[
                'relative w-14 h-8 rounded-full transition-colors duration-300',
                isPublic ? 'bg-mint-green-200' : 'bg-warm-gray-200'
              ]"
            >
              <span
                :class="[
                  'absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300',
                  isPublic ? 'left-7' : 'left-1'
                ]"
              ></span>
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center mt-12 pb-8">
          <button
            type="button"
            @click="handleCancel"
            class="btn-secondary px-8"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="!canSubmit || loading"
            class="btn-primary px-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <Send v-else class="w-5 h-5" />
            {{ loading ? '封存中...' : '封存胶囊' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
