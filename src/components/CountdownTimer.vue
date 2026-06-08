<script setup lang="ts">
import { useCountdown } from '../composables/useCapsules';

const props = defineProps<{
  openAt: string;
  size?: 'sm' | 'md' | 'lg';
}>();

const { countdown, formatted } = useCountdown(props.openAt);
</script>

<template>
  <div class="flex flex-col items-center">
    <div 
      :class="[
        'flex items-center gap-2 md:gap-4',
        size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-110' : ''
      ]"
    >
      <div class="flex flex-col items-center">
        <div class="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-soft-pink-100 to-soft-pink-50 flex items-center justify-center shadow-soft">
          <span class="text-2xl md:text-3xl font-serif-sc font-bold text-soft-pink-400">
            {{ countdown.days.toString().padStart(2, '0') }}
          </span>
        </div>
        <span class="text-xs text-warm-gray-500 mt-1">天</span>
      </div>
      <span class="text-2xl text-warm-gray-300 font-bold animate-pulse-soft">:</span>
      <div class="flex flex-col items-center">
        <div class="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-cream-yellow-100 to-cream-yellow-50 flex items-center justify-center shadow-soft">
          <span class="text-2xl md:text-3xl font-serif-sc font-bold text-cream-yellow-400">
            {{ countdown.hours.toString().padStart(2, '0') }}
          </span>
        </div>
        <span class="text-xs text-warm-gray-500 mt-1">时</span>
      </div>
      <span class="text-2xl text-warm-gray-300 font-bold animate-pulse-soft">:</span>
      <div class="flex flex-col items-center">
        <div class="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-mint-green-100 to-mint-green-50 flex items-center justify-center shadow-soft">
          <span class="text-2xl md:text-3xl font-serif-sc font-bold text-mint-green-400">
            {{ countdown.minutes.toString().padStart(2, '0') }}
          </span>
        </div>
        <span class="text-xs text-warm-gray-500 mt-1">分</span>
      </div>
      <span class="text-2xl text-warm-gray-300 font-bold animate-pulse-soft hidden md:block">:</span>
      <div class="flex flex-col items-center hidden md:flex">
        <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-lavender-100 to-lavender-50 flex items-center justify-center shadow-soft">
          <span class="text-3xl font-serif-sc font-bold text-lavender-300">
            {{ countdown.seconds.toString().padStart(2, '0') }}
          </span>
        </div>
        <span class="text-xs text-warm-gray-500 mt-1">秒</span>
      </div>
    </div>
    <p class="mt-4 text-sm text-warm-gray-500">
      {{ formatted }}后开启
    </p>
  </div>
</template>
