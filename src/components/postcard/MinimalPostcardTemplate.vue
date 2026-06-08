<script setup lang="ts">
import { computed } from 'vue';
import { formatDate } from '@/utils/date';
import type { Capsule, ContentDisplayMode } from '@/types';
import { DECOR_ELEMENTS, CATEGORIES, MOODS } from '@/types';

const props = defineProps<{
  capsule: Capsule;
  displayMode: ContentDisplayMode;
  qrCodeDataUrl?: string;
  decorElements: string[];
  customBackground?: string;
}>();

const displayContent = computed(() => {
  switch (props.displayMode) {
    case 'title':
      return '';
    case 'summary':
      return props.capsule.content.length > 150 
        ? props.capsule.content.slice(0, 150) + '...'
        : props.capsule.content;
    case 'full':
    default:
      return props.capsule.content;
  }
});

const decorEmojis = computed(() => {
  return props.decorElements
    .map(id => DECOR_ELEMENTS.find(d => d.id === id)?.emoji)
    .filter(Boolean) as string[];
});

const categoryInfo = computed(() => 
  CATEGORIES.find(c => c.id === props.capsule.category)
);

const moodInfo = computed(() => 
  MOODS.find(m => m.id === props.capsule.mood)
);

const backgroundStyle = computed(() => {
  if (props.customBackground) {
    return {
      backgroundImage: `url(${props.customBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return {};
});
</script>

<template>
  <div 
    class="minimal-postcard relative w-[480px] h-[680px] overflow-hidden"
    :style="backgroundStyle"
  >
    <div 
      class="absolute inset-0"
      :class="customBackground ? 'bg-white/95' : 'bg-white'"
    >
      <div class="h-full flex flex-col p-10">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <span class="text-4xl">{{ categoryInfo?.emoji }}</span>
            <div>
              <div class="text-sm font-medium text-warm-gray-800">{{ categoryInfo?.name }}</div>
              <div class="text-xs text-warm-gray-400">{{ formatDate(capsule.createdAt) }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-3xl">{{ moodInfo?.emoji }}</span>
          </div>
        </div>

        <h1 class="font-serif-sc text-3xl font-bold text-warm-gray-900 mb-6 leading-tight">
          {{ capsule.title }}
        </h1>

        <div class="w-12 h-1 bg-gradient-to-r from-soft-pink-300 to-cream-yellow-300 rounded-full mb-6"></div>

        <div v-if="displayContent" class="flex-1 overflow-hidden">
          <p class="text-warm-gray-600 leading-loose whitespace-pre-wrap font-serif-sc text-base">
            {{ displayContent }}
          </p>
        </div>

        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-8xl opacity-20">{{ categoryInfo?.emoji }}</div>
        </div>

        <div class="mt-8 pt-6 border-t border-warm-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div v-if="qrCodeDataUrl" class="flex items-center gap-2">
                <img :src="qrCodeDataUrl" class="w-14 h-14" alt="QR Code" />
                <div class="text-xs text-warm-gray-400">
                  扫码查看<br/>完整内容
                </div>
              </div>
            </div>

            <div class="text-right">
              <div class="flex gap-1 mb-2 justify-end">
                <span v-for="(emoji, i) in decorEmojis.slice(0, 4)" :key="i" class="text-xl">{{ emoji }}</span>
              </div>
              <div class="flex items-center gap-1 justify-end text-warm-gray-400">
                <span class="text-lg">💌</span>
                <span class="text-sm font-serif-sc">时间胶囊</span>
              </div>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <span 
              v-for="tag in capsule.tags" 
              :key="tag"
              class="px-3 py-1 text-xs bg-warm-gray-100 text-warm-gray-500 rounded-full"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>

      <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-soft-pink-100 to-transparent opacity-50"></div>
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-mint-green-100 to-transparent opacity-50"></div>
    </div>
  </div>
</template>
