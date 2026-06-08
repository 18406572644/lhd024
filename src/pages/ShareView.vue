<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Lock, Calendar, Clock, Heart, Unlock } from 'lucide-vue-next';
import LetterPaper from '@/components/LetterPaper.vue';
import { CATEGORIES, MOODS } from '../types';
import { formatDate, formatDateTime, isPast } from '../utils/date';
import type { Capsule } from '../types';
import * as api from '../utils/api';

const route = useRoute();
const router = useRouter();

const capsule = ref<Capsule | null>(null);
const loading = ref(true);
const notFound = ref(false);
const isOpening = ref(false);
const isRevealed = ref(false);

const categoryInfo = computed(() => 
  capsule.value ? CATEGORIES.find(c => c.id === capsule.value!.category) : null
);

const moodInfo = computed(() => 
  capsule.value ? MOODS.find(m => m.id === capsule.value!.mood) : null
);

const canOpen = computed(() => 
  capsule.value && (capsule.value.isOpened || isPast(capsule.value.openAt))
);

onMounted(async () => {
  const id = route.params.id as string;
  try {
    const data = await api.getPublicCapsuleById(id);
    if (data) {
      capsule.value = data;
      if (canOpen.value && !data.isPrivate) {
        isRevealed.value = true;
      }
    } else {
      notFound.value = true;
    }
  } catch (error) {
    notFound.value = true;
  } finally {
    loading.value = false;
  }
});

async function openCapsule() {
  if (!capsule.value || !canOpen.value) return;
  
  isOpening.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (!capsule.value.isOpened) {
    await api.updateCapsule(capsule.value.id, { isOpened: true });
  }
  
  isRevealed.value = true;
  isOpening.value = false;
}

function goBack() {
  window.history.length > 1 ? router.back() : router.push('/');
}
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-3xl">
      <button
        @click="goBack"
        class="flex items-center gap-2 text-warm-gray-600 hover:text-warm-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
        <span>返回</span>
      </button>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-soft-pink-200 border-t-soft-pink-400 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="notFound" class="card-soft text-center py-16 animate-scale-in">
        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-warm-gray-100 to-warm-gray-200 flex items-center justify-center mx-auto mb-6">
          <Lock class="w-12 h-12 text-warm-gray-400" />
        </div>
        <h3 class="font-serif-sc text-2xl font-semibold text-warm-gray-800 mb-3">
          胶囊不存在或未公开
        </h3>
        <p class="text-warm-gray-500 mb-8 max-w-md mx-auto">
          这个胶囊可能已被删除、设置为私密，或者链接无效。
        </p>
        <button @click="router.push('/')" class="btn-primary px-6">
          返回首页
        </button>
      </div>

      <div v-else class="space-y-8">
        <div class="text-center mb-8 animate-fade-in">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-gray-100 text-warm-gray-600 text-sm mb-4">
            <span>{{ categoryInfo?.emoji }}</span>
            <span>{{ categoryInfo?.name }}</span>
            <span class="text-warm-gray-300">·</span>
            <span>{{ moodInfo?.emoji }} {{ moodInfo?.name }}</span>
          </div>
          
          <h1 class="font-serif-sc text-3xl md:text-4xl font-bold text-warm-gray-800 mb-4">
            {{ capsule.title }}
          </h1>
          
          <div class="flex flex-wrap items-center justify-center gap-4 text-sm text-warm-gray-500">
            <span class="flex items-center gap-1">
              <Calendar class="w-4 h-4" />
              创建于 {{ formatDate(capsule.createdAt) }}
            </span>
            <span class="flex items-center gap-1">
              <Clock class="w-4 h-4" />
              开启时间 {{ formatDate(capsule.openAt) }}
            </span>
          </div>

          <div class="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mint-green-100 text-mint-green-600 text-xs">
            <span>🌍</span>
            <span>公开分享</span>
          </div>
        </div>

        <div v-if="!canOpen" class="card-soft text-center py-16 animate-scale-in">
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-soft-pink-100 to-cream-yellow-100 flex items-center justify-center mx-auto mb-6 animate-float">
            <Lock class="w-12 h-12 text-soft-pink-400" />
          </div>
          <h3 class="font-serif-sc text-2xl font-semibold text-warm-gray-800 mb-3">
            这封信还没有到开启的时间
          </h3>
          <p class="text-warm-gray-500 mb-8 max-w-md mx-auto">
            有些美好需要时间来沉淀，让我们一起耐心等待吧。<br/>
            等到约定的那一天，这封信会给你带来惊喜 ✨
          </p>
          
          <div class="mt-12 flex flex-wrap justify-center gap-3">
            <span
              v-for="tag in capsule.tags"
              :key="tag"
              class="px-4 py-2 rounded-full text-sm bg-warm-gray-100 text-warm-gray-600"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <div v-else-if="!isRevealed" class="card-soft text-center py-16 animate-scale-in">
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-cream-yellow-100 to-mint-green-100 flex items-center justify-center mx-auto mb-6 animate-breath cursor-pointer hover:scale-105 transition-transform" @click="openCapsule">
            <Heart class="w-12 h-12 text-cream-yellow-400" />
          </div>
          <h3 class="font-serif-sc text-2xl font-semibold text-warm-gray-800 mb-3">
            有一封信在等你开启
          </h3>
          <p class="text-warm-gray-500 mb-8 max-w-md mx-auto">
            这封信已经到了开启的时间，<br/>
            点击下面的按钮，打开这份来自过去的礼物吧 💌
          </p>
          
          <button
            @click="openCapsule"
            :disabled="isOpening"
            class="btn-primary px-8 flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            <span v-if="isOpening" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <Heart v-else class="w-5 h-5" />
            {{ isOpening ? '正在打开...' : '打开胶囊' }}
          </button>
        </div>

        <Transition name="fade">
          <div v-if="isRevealed" class="space-y-8 animate-fade-in">
            <div class="mb-6">
              <div class="flex items-center gap-2 text-mint-green-600">
                <Unlock class="w-5 h-5" />
                <span class="font-medium">已开启 · {{ formatDateTime(capsule.openAt) }}</span>
              </div>
            </div>

            <LetterPaper
              :title="capsule.title"
              :content="capsule.content"
              :created-at="capsule.createdAt"
              :mood-emoji="moodInfo?.emoji"
              :category-emoji="categoryInfo?.emoji"
            />

            <div class="flex flex-wrap justify-center gap-3 mt-8">
              <span
                v-for="tag in capsule.tags"
                :key="tag"
                class="px-4 py-2 rounded-full text-sm bg-soft-pink-100 text-warm-gray-600"
              >
                #{{ tag }}
              </span>
            </div>

            <div class="text-center mt-12 text-warm-gray-400">
              <p class="font-serif-sc text-sm">
                💌 这是一封来自 {{ formatDate(capsule.createdAt) }} 的信
              </p>
              <p class="text-xs mt-2">
                穿越了 {{ Math.ceil((new Date(capsule.openAt).getTime() - new Date(capsule.createdAt).getTime()) / (1000 * 60 * 60 * 24)) }} 天的时光，与你相遇
              </p>
            </div>

            <div class="text-center mt-8">
              <p class="text-xs text-warm-gray-400 font-serif-sc">
                —— 来自「时间胶囊」的分享
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
