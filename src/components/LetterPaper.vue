<script setup lang="ts">
import { formatDate } from '../utils/date';

defineProps<{
  title: string;
  content: string;
  createdAt: string;
  moodEmoji?: string;
  categoryEmoji?: string;
}>();
</script>

<template>
  <div class="letter-paper shadow-soft noise-bg animate-fade-in">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <span v-if="categoryEmoji" class="text-2xl">{{ categoryEmoji }}</span>
        <span v-if="moodEmoji" class="text-2xl">{{ moodEmoji }}</span>
      </div>
      <span class="text-sm text-warm-gray-400 font-serif-sc">
        {{ formatDate(createdAt) }}
      </span>
    </div>

    <h2 class="font-serif-sc text-2xl font-semibold text-warm-gray-800 mb-6 pb-4 border-b border-cream-yellow-200">
      {{ title }}
    </h2>

    <div class="min-h-[300px]">
      <p 
        class="text-warm-gray-700 leading-loose whitespace-pre-wrap font-serif-sc text-lg"
        style="letter-spacing: 0.5px;"
      >
        {{ content }}
      </p>
    </div>

    <div class="mt-8 pt-6 border-t border-cream-yellow-200 flex justify-end">
      <div class="text-right">
        <p class="text-sm text-warm-gray-400 font-serif-sc italic">
          —— 写给未来的自己
        </p>
        <div class="mt-2 flex items-center justify-end gap-1">
          <span class="text-xl">💌</span>
          <span class="text-sm text-warm-gray-500 font-serif-sc">时间胶囊</span>
        </div>
      </div>
    </div>
  </div>
</template>
