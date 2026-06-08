<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Lock, Unlock, Calendar, Eye } from 'lucide-vue-next';
import type { Capsule } from '../types';
import { CATEGORIES, MOODS } from '../types';
import { formatDate, isPast, isComingSoon } from '../utils/date';
import { useCountdown } from '../composables/useCapsules';

const props = defineProps<{
  capsule: Capsule;
  showActions?: boolean;
}>();

const emit = defineEmits<{
  delete: [id: string];
}>();

const router = useRouter();

const categoryInfo = computed(() => 
  CATEGORIES.find(c => c.id === props.capsule.category) || CATEGORIES[5]
);

const moodInfo = computed(() => 
  MOODS.find(m => m.id === props.capsule.mood) || MOODS[0]
);

const isOpened = computed(() => 
  props.capsule.isOpened || isPast(props.capsule.openAt)
);

const isSoon = computed(() => 
  !isOpened.value && isComingSoon(props.capsule.openAt)
);

const { formatted: countdownText } = useCountdown(props.capsule.openAt);

function goToDetail() {
  router.push(`/capsule/${props.capsule.id}`);
}

function handleDelete(e: Event) {
  e.stopPropagation();
  emit('delete', props.capsule.id);
}
</script>

<template>
  <div
    @click="goToDetail"
    :class="[
      'card-soft card-hover cursor-pointer group animate-scale-in relative overflow-hidden noise-bg',
      isOpened ? 'border-l-4 border-l-mint-green-300' : 'border-l-4 border-l-soft-pink-200',
      isSoon ? 'ring-2 ring-cream-yellow-300 ring-offset-2 animate-pulse-soft' : ''
    ]"
  >
    <div class="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
      <div :class="['w-full h-full rounded-full -mr-8 -mt-8', categoryInfo.bgColor]"></div>
    </div>

    <div class="relative z-10">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <span :class="['tag-soft', categoryInfo.bgColor, 'text-warm-gray-700']">
            <span class="mr-1">{{ categoryInfo.emoji }}</span>
            {{ categoryInfo.name }}
          </span>
          <span v-if="capsule.isPrivate" class="text-sm">🔒</span>
        </div>
        <div class="flex items-center gap-1">
          <span v-if="isOpened" class="flex items-center gap-1 text-xs text-mint-green-600">
            <Unlock class="w-3 h-3" />
            已开启
          </span>
          <span v-else-if="isSoon" class="flex items-center gap-1 text-xs text-cream-yellow-600">
            <Calendar class="w-3 h-3" />
            即将开启
          </span>
          <span v-else class="flex items-center gap-1 text-xs text-warm-gray-500">
            <Lock class="w-3 h-3" />
            封存中
          </span>
        </div>
      </div>

      <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800 mb-2 line-clamp-1 group-hover:text-soft-pink-400 transition-colors">
        {{ capsule.title }}
      </h3>

      <p class="text-sm text-warm-gray-500 mb-3 line-clamp-2">
        {{ isOpened ? capsule.content : '这封信还没有到开启的时间，让我们一起耐心等待吧 ✨' }}
      </p>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span :class="['tag-soft text-xs', moodInfo.color]">
            {{ moodInfo.emoji }} {{ moodInfo.name }}
          </span>
          <span class="text-xs text-warm-gray-400">
            {{ formatDate(capsule.createdAt, 'MM/DD') }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="!isOpened" class="text-xs text-soft-pink-400 font-medium">
            {{ countdownText }}
          </span>
          <span v-else class="text-xs text-warm-gray-400 flex items-center gap-1">
            <Eye class="w-3 h-3" />
            点击查看
          </span>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-1">
        <span
          v-for="tag in capsule.tags.slice(0, 3)"
          :key="tag"
          class="text-xs px-2 py-0.5 rounded-full bg-warm-gray-100 text-warm-gray-500"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>
