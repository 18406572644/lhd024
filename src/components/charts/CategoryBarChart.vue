<script setup lang="ts">
import { computed } from 'vue';
import type { CategoryStats, CapsuleCategory } from '../../types';
import { CATEGORIES } from '../../types';

const props = defineProps<{
  data: CategoryStats[];
}>();

const emit = defineEmits<{
  (e: 'select', category: CapsuleCategory): void;
}>();

const width = 500;
const height = 280;
const padding = { top: 20, right: 20, bottom: 60, left: 50 };
const chartWidth = width - padding.left - padding.right;
const chartHeight = height - padding.top - padding.bottom;

const getCategoryInfo = (category: CapsuleCategory) => {
  return CATEGORIES.find(c => c.id === category);
};

const getCategoryColor = (category: CapsuleCategory): string => {
  const colors: Record<CapsuleCategory, string> = {
    dream: '#C084FC',
    family: '#FDA4AF',
    friendship: '#6EE7B7',
    love: '#FB7185',
    growth: '#4ADE80',
    other: '#FCD34D',
  };
  return colors[category];
};

const maxCount = computed(() => {
  return Math.max(...props.data.map(d => d.count), 1);
});

const barWidth = computed(() => {
  if (props.data.length === 0) return 0;
  const availableWidth = chartWidth;
  const gap = 20;
  return (availableWidth - gap * (props.data.length - 1)) / props.data.length;
});

const getBarHeight = (count: number) => {
  return (count / maxCount.value) * chartHeight;
};

const getX = (index: number) => {
  const barW = barWidth.value;
  const gap = 20;
  return padding.left + index * (barW + gap);
};

const handleClick = (category: CapsuleCategory) => {
  emit('select', category);
};
</script>

<template>
  <div class="w-full overflow-x-auto">
    <svg :width="width" :height="height" class="min-w-full">
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FDA4AF" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#FDA4AF" stop-opacity="0.4" />
        </linearGradient>
      </defs>
      
      <g stroke="#E7E0D5" stroke-dasharray="3,3" opacity="0.5">
        <line
          v-for="i in 5"
          :key="'grid-' + i"
          :x1="padding.left"
          :y1="padding.top + ((i - 1) * (chartHeight / 4))"
          :x2="width - padding.right"
          :y2="padding.top + ((i - 1) * (chartHeight / 4))"
        />
      </g>
      
      <g fill="#8B8178" font-size="12" text-anchor="end">
        <text
          v-for="i in 5"
          :key="'label-' + i"
          :x="padding.left - 8"
          :y="padding.top + ((5 - i) * (chartHeight / 4)) + 4"
        >
          {{ Math.round(maxCount / 4 * (i - 1)) }}
        </text>
      </g>
      
      <g v-for="(item, index) in data" :key="'bar-group-' + index">
        <g
          @click="handleClick(item.category)"
          class="cursor-pointer"
        >
          <rect
            :x="getX(index)"
            :y="padding.top + chartHeight - getBarHeight(item.count)"
            :width="barWidth"
            :height="getBarHeight(item.count)"
            rx="8"
            :fill="getCategoryColor(item.category)"
            opacity="0.7"
            class="transition-all duration-300 hover:opacity-100"
          />
          <rect
            :x="getX(index)"
            :y="padding.top + chartHeight - getBarHeight(item.count)"
            :width="barWidth"
            :height="getBarHeight(item.count)"
            rx="8"
            fill="url(#barGradient)"
            opacity="0"
            class="transition-all duration-300 hover:opacity-100"
          />
          
          <text
            :x="getX(index) + barWidth / 2"
            :y="padding.top + chartHeight - getBarHeight(item.count) - 8"
            text-anchor="middle"
            class="text-sm font-bold fill-warm-gray-800"
          >
            {{ item.count }}
          </text>
        </g>
        
        <g class="pointer-events-none">
          <text
            :x="getX(index) + barWidth / 2"
            :y="height - 30"
            text-anchor="middle"
            class="text-2xl"
          >
            {{ getCategoryInfo(item.category)?.emoji }}
          </text>
          <text
            :x="getX(index) + barWidth / 2"
            :y="height - 10"
            text-anchor="middle"
            class="text-xs fill-warm-gray-600"
          >
            {{ getCategoryInfo(item.category)?.name }}
          </text>
        </g>
      </g>
    </svg>
    
    <div class="flex items-center justify-center gap-4 mt-4 flex-wrap">
      <div
        v-for="item in data"
        :key="item.category"
        @click="handleClick(item.category)"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-soft cursor-pointer hover:scale-105 transition-transform"
      >
        <span class="text-sm">{{ getCategoryInfo(item.category)?.emoji }}</span>
        <span class="text-sm text-warm-gray-700">{{ getCategoryInfo(item.category)?.name }}</span>
        <span class="text-xs text-warm-gray-500">{{ item.percentage }}%</span>
      </div>
    </div>
  </div>
</template>
