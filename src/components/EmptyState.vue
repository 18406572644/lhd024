<script setup lang="ts">
defineProps<{
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}>();

const emit = defineEmits<{
  action: [];
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
    <div class="text-7xl mb-6 animate-float">
      {{ icon || '📭' }}
    </div>
    <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-3">
      {{ title }}
    </h3>
    <p class="text-warm-gray-500 mb-8 max-w-md">
      {{ description }}
    </p>
    <button
      v-if="actionText"
      @click="emit('action')"
      class="btn-primary animate-pulse-soft"
    >
      {{ actionText }}
    </button>
  </div>
</template>
