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
      return props.capsule.content.length > 120 
        ? props.capsule.content.slice(0, 120) + '...'
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

const daysTraveled = computed(() => {
  return Math.ceil((new Date(props.capsule.openAt).getTime() - new Date(props.capsule.createdAt).getTime()) / (1000 * 60 * 60 * 24));
});
</script>

<template>
  <div 
    class="vintage-postcard relative w-[480px] h-[680px] overflow-hidden"
    :style="backgroundStyle"
  >
    <div 
      class="absolute inset-0"
      :class="customBackground ? 'bg-amber-50/95' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50'"
    >
      <div class="absolute inset-0 opacity-10" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C8B75' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;);"></div>

      <div class="relative z-10 p-8 h-full flex flex-col" style="border: 12px solid #FDF6E3; box-shadow: inset 0 0 0 1px #D4A574;">
        
        <div class="absolute top-0 left-0 w-full" style="height: 8px; background: repeating-linear-gradient(90deg, #D4A574 0px, #D4A574 8px, transparent 8px, transparent 16px);"></div>
        <div class="absolute bottom-0 left-0 w-full" style="height: 8px; background: repeating-linear-gradient(90deg, #D4A574 0px, #D4A574 8px, transparent 8px, transparent 16px);"></div>
        <div class="absolute top-0 left-0 h-full" style="width: 8px; background: repeating-linear-gradient(0deg, #D4A574 0px, #D4A574 8px, transparent 8px, transparent 16px);"></div>
        <div class="absolute top-0 right-0 h-full" style="width: 8px; background: repeating-linear-gradient(0deg, #D4A574 0px, #D4A574 8px, transparent 8px, transparent 16px);"></div>

        <div class="flex items-start justify-between mb-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-3xl">{{ categoryInfo?.emoji }}</span>
              <span class="text-2xl">{{ moodInfo?.emoji }}</span>
            </div>
            <div class="text-xs text-amber-700 font-serif-sc">
              {{ formatDate(capsule.createdAt) }}
            </div>
          </div>
          
          <div class="text-right">
            <div class="inline-block border-2 border-amber-600 px-3 py-1 rounded">
              <div class="text-xs text-amber-800 font-bold">时光邮票</div>
              <div class="text-[10px] text-amber-600">TIME CAPSULE</div>
            </div>
            <div class="mt-2 text-[10px] text-amber-600">
              穿越 {{ daysTraveled }} 天
            </div>
          </div>
        </div>

        <div class="border-t-2 border-dashed border-amber-300 my-2"></div>

        <h2 class="font-serif-sc text-2xl font-bold text-amber-900 mb-4 mt-2">
          {{ capsule.title }}
        </h2>

        <div class="flex items-center gap-2 mb-4 text-sm text-amber-700">
          <span>#{{ categoryInfo?.name }}</span>
          <span class="text-amber-400">·</span>
          <span>#{{ moodInfo?.name }}</span>
          <span v-for="tag in capsule.tags.slice(0, 2)" :key="tag" class="text-amber-600">
            #{{ tag }}
          </span>
        </div>

        <div v-if="displayContent" class="flex-1 overflow-hidden">
          <div class="bg-amber-100/50 rounded-lg p-4 h-full">
            <p class="text-amber-800 leading-loose whitespace-pre-wrap font-serif-sc text-sm">
              {{ displayContent }}
            </p>
          </div>
        </div>

        <div class="mt-4 flex items-end justify-between">
          <div class="flex flex-wrap gap-1">
            <span v-for="(emoji, i) in decorEmojis" :key="i" class="text-xl">{{ emoji }}</span>
          </div>

          <div v-if="qrCodeDataUrl" class="flex flex-col items-center">
            <div class="bg-white p-2 border-2 border-amber-400 rounded">
              <img :src="qrCodeDataUrl" class="w-14 h-14" alt="QR Code" />
            </div>
            <span class="text-[10px] text-amber-600 mt-1">扫码查看</span>
          </div>
        </div>

        <div class="border-t-2 border-dashed border-amber-300 my-4"></div>

        <div class="text-center text-amber-600 font-serif-sc text-sm italic">
          "记录此刻，寄语未来"
          <div class="mt-1 flex items-center justify-center gap-1">
            <span>💌</span>
            <span class="text-xs">时间胶囊 · 珍藏美好</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
