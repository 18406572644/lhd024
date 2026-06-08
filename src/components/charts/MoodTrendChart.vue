<script setup lang="ts">
import { computed } from 'vue';
import type { MoodTrendPoint, MoodType } from '../../types';
import { MOODS } from '../../types';

const props = defineProps<{
  data: MoodTrendPoint[];
}>();

const width = 600;
const height = 280;
const padding = { top: 20, right: 20, bottom: 40, left: 40 };
const chartWidth = width - padding.left - padding.right;
const chartHeight = height - padding.top - padding.bottom;

const getMoodColor = (mood: MoodType): string => {
  const colors: Record<MoodType, string> = {
    happy: '#FCD34D',
    sad: '#7DD3FC',
    peaceful: '#6EE7B7',
    excited: '#FDA4AF',
    grateful: '#C084FC',
    confused: '#D4C8B8',
  };
  return colors[mood];
};

const yAxisMax = 5;
const yAxisMin = 1;

const getY = (value: number) => {
  return padding.top + chartHeight - ((value - yAxisMin) / (yAxisMax - yAxisMin)) * chartHeight;
};

const getX = (index: number) => {
  return padding.left + (index / (props.data.length - 1)) * chartWidth;
};

const linePath = computed(() => {
  return props.data
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(point.moodIndex || 3)}`)
    .join(' ');
});

const areaPath = computed(() => {
  const startX = padding.left;
  const endX = padding.left + chartWidth;
  const bottomY = padding.top + chartHeight;
  
  const linePoints = props.data
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(point.moodIndex || 3)}`)
    .join(' ');
    
  return `${linePoints} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
});

const moodTypes: MoodType[] = ['happy', 'excited', 'grateful', 'peaceful', 'confused', 'sad'];

const getMoodName = (mood: MoodType) => {
  return MOODS.find(m => m.id === mood)?.name || '';
};

const getMoodEmoji = (mood: MoodType) => {
  return MOODS.find(m => m.id === mood)?.emoji || '';
};
</script>

<template>
  <div class="w-full overflow-x-auto">
    <svg :width="width" :height="height" class="min-w-full">
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FDA4AF" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#FDA4AF" stop-opacity="0.05" />
        </linearGradient>
      </defs>
      
      <g v-for="i in 5" :key="'grid-' + i" stroke="#E7E0D5" stroke-dasharray="3,3" opacity="0.5">
        <line
          :x1="padding.left"
          :y1="padding.top + ((i - 1) * (chartHeight / 4))"
          :x2="width - padding.right"
          :y2="padding.top + ((i - 1) * (chartHeight / 4))"
        />
      </g>
      
      <g fill="#8B8178" font-size="12" text-anchor="end">
        <text v-for="i in 5" :key="'label-' + i"
          :x="padding.left - 8"
          :y="padding.top + ((5 - i) * (chartHeight / 4)) + 4"
        >
          {{ i }}
        </text>
      </g>
      
      <g fill="#8B8178" font-size="12" text-anchor="middle">
        <text
          v-for="(point, i) in data"
          :key="'xlabel-' + i"
          :x="getX(i)"
          :y="height - 15"
        >
          {{ point.month }}
        </text>
      </g>
      
      <path
        :d="areaPath"
        fill="url(#areaGradient)"
        class="transition-all duration-500"
      />
      
      <path
        :d="linePath"
        fill="none"
        stroke="#FDA4AF"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-all duration-500"
      />
      
      <g v-for="(point, i) in data"
        :key="'point-' + i"
        :transform="'translate(' + getX(i) + ', ' + getY(point.moodIndex || 3) + ')'"
      >
        <circle
          r="6"
          fill="white"
          stroke="#FDA4AF"
          stroke-width="2"
          class="transition-all duration-300 hover:r-8 cursor-pointer"
        />
        <title>{{ point.month }}: 心情指数 {{ point.moodIndex || '暂无' }}</title>
      </g>
    </svg>
    
    <div class="flex items-center justify-center gap-4 mt-4 flex-wrap">
      <div
        v-for="mood in moodTypes"
        :key="mood"
        class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-soft"
      >
        <span class="text-sm">{{ getMoodEmoji(mood) }}</span>
        <span class="text-xs text-warm-gray-600">{{ getMoodName(mood) }}</span>
        <div
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: getMoodColor(mood) }"
        ></div>
      </div>
    </div>
  </div>
</template>
