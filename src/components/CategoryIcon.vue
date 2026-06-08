<script setup lang="ts">
import { computed } from 'vue';
import type { CapsuleCategory } from '../types';
import { CATEGORIES } from '../types';

const props = defineProps<{
  category: CapsuleCategory;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}>();

const categoryInfo = computed(() => 
  CATEGORIES.find(c => c.id === props.category) || CATEGORIES[5]
);

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-10 h-10 text-lg';
    case 'lg': return 'w-16 h-16 text-3xl';
    default: return 'w-12 h-12 text-2xl';
  }
});
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div 
      :class="[
        'rounded-full flex items-center justify-center transition-all duration-300',
        sizeClasses,
        categoryInfo.bgColor,
        'hover:scale-110 hover:shadow-soft'
      ]"
    >
      {{ categoryInfo.emoji }}
    </div>
    <span v-if="showName" class="text-sm text-warm-gray-600 font-medium">
      {{ categoryInfo.name }}
    </span>
  </div>
</template>
