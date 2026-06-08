<script setup lang="ts">
import { computed } from 'vue';
import { formatDate } from '@/utils/date';
import type { Capsule, ContentDisplayMode } from '@/types';
import { DECOR_ELEMENTS } from '@/types';

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
      return props.capsule.content.length > 100 
        ? props.capsule.content.slice(0, 100) + '...'
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
    class="letter-postcard relative w-[480px] h-[680px] overflow-hidden"
    :style="backgroundStyle"
  >
    <div 
      class="absolute inset-0"
      :class="customBackground ? 'bg-white/90' : 'bg-gradient-to-b from-cream-yellow-50 to-white'"
    >
      <div class="absolute inset-0 opacity-30" 
           style="background-image: repeating-linear-gradient(
             transparent,
             transparent 31px,
             rgba(231, 224, 213, 0.5) 31px,
             rgba(231, 224, 213, 0.5) 32px
           );
           background-position: 0 40px;">
      </div>

      <div class="relative z-10 p-10 h-full flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <div class="flex gap-2">
            <span v-for="(emoji, i) in decorEmojis.slice(0, 3)" :key="i" class="text-2xl">{{ emoji }}</span>
          </div>
          <span class="text-sm text-warm-gray-500 font-serif-sc">
            {{ formatDate(capsule.createdAt) }}
          </span>
        </div>

        <h2 class="font-serif-sc text-2xl font-bold text-warm-gray-800 mb-6 pb-4 border-b border-cream-yellow-300">
          {{ capsule.title }}
        </h2>

        <div class="flex-1 overflow-hidden" v-if="displayContent">
          <p 
            class="text-warm-gray-700 leading-loose whitespace-pre-wrap font-serif-sc text-base"
            style="letter-spacing: 0.5px;"
          >
            {{ displayContent }}
          </p>
        </div>

        <div class="mt-auto pt-6 border-t border-cream-yellow-300">
          <div class="flex items-end justify-between">
            <div v-if="qrCodeDataUrl" class="flex items-center gap-3">
              <img :src="qrCodeDataUrl" class="w-16 h-16" alt="QR Code" />
              <p class="text-xs text-warm-gray-400">扫码查看<br/>完整胶囊</p>
            </div>
            
            <div class="text-right">
              <p class="text-sm text-warm-gray-500 font-serif-sc italic">
                —— 写给未来的自己
              </p>
              <div class="mt-2 flex items-center justify-end gap-1">
                <span class="text-lg">💌</span>
                <span class="text-sm text-warm-gray-600 font-serif-sc">时间胶囊</span>
              </div>
              <div class="mt-2 flex gap-1 justify-end">
                <span v-for="(emoji, i) in decorEmojis.slice(3)" :key="i" class="text-lg">{{ emoji }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-soft-pink-200 via-cream-yellow-200 to-mint-green-200"></div>
      <div class="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-mint-green-200 via-cream-yellow-200 to-soft-pink-200"></div>
    </div>
  </div>
</template>
