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
      return props.capsule.content.length > 80 
        ? props.capsule.content.slice(0, 80) + '...'
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
  <div class="polaroid-postcard w-[480px] h-[680px] bg-warm-gray-100 p-6">
    <div class="bg-white p-4 h-full shadow-lg flex flex-col">
      <div 
        class="relative flex-1 bg-gradient-to-br from-warm-gray-800 to-warm-gray-900 mb-4 overflow-hidden"
        :style="backgroundStyle"
      >
        <div v-if="!customBackground" class="absolute inset-0 flex items-center justify-center">
          <div class="text-center text-white/80">
            <div class="text-8xl mb-4">{{ categoryInfo?.emoji }}</div>
            <div class="text-6xl mb-2">{{ moodInfo?.emoji }}</div>
            <div class="flex justify-center gap-2 mt-4">
              <span v-for="(emoji, i) in decorEmojis.slice(0, 4)" :key="i" class="text-3xl">{{ emoji }}</span>
            </div>
          </div>
        </div>
        <div v-else class="absolute inset-0 bg-black/20"></div>

        <div class="absolute top-4 left-4">
          <span class="px-3 py-1 bg-white/90 rounded-full text-xs text-warm-gray-600 font-medium">
            {{ formatDate(capsule.createdAt) }}
          </span>
        </div>

        <div v-if="qrCodeDataUrl" class="absolute bottom-4 right-4">
          <div class="bg-white p-2 rounded-lg shadow-md">
            <img :src="qrCodeDataUrl" class="w-14 h-14" alt="QR Code" />
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col px-4 py-2">
        <h3 class="font-serif-sc text-xl font-bold text-warm-gray-800 mb-2">
          {{ capsule.title }}
        </h3>

        <div class="flex items-center gap-2 mb-3 text-xs text-warm-gray-500">
          <span>{{ categoryInfo?.emoji }} {{ categoryInfo?.name }}</span>
          <span class="text-warm-gray-300">·</span>
          <span>{{ moodInfo?.emoji }} {{ moodInfo?.name }}</span>
        </div>

        <div v-if="displayContent" class="flex-1 overflow-hidden">
          <p class="text-sm text-warm-gray-600 leading-relaxed whitespace-pre-wrap font-serif-sc">
            {{ displayContent }}
          </p>
        </div>

        <div class="mt-auto pt-3 border-t border-warm-gray-200 flex items-center justify-between">
          <div class="flex gap-1">
            <span v-for="(emoji, i) in decorEmojis.slice(4)" :key="i" class="text-lg">{{ emoji }}</span>
          </div>
          <div class="flex items-center gap-1 text-warm-gray-400">
            <span class="text-lg">💌</span>
            <span class="text-xs font-serif-sc">时间胶囊</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
