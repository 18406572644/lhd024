<script setup lang="ts">
import { computed } from 'vue';
import type { MoodDistribution, MoodType } from '../../types';
import { MOODS } from '../../types';

const props = defineProps<{
  data: MoodDistribution[];
  selectedMood: MoodType | null;
}>();

const emit = defineEmits<{
  (e: 'select', mood: MoodType | null): void;
}>();

const size = 200;
const center = size / 2;
const radius = 80;
const innerRadius = 50;

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

const getMoodInfo = (mood: MoodType) => {
  return MOODS.find(m => m.id === mood);
};

const slices = computed(() => {
  const total = props.data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) return [];
  
  let startAngle = -Math.PI / 2;
  return props.data.map(d => {
    const angle = (d.count / total) * Math.PI * 2;
    const endAngle = startAngle + angle;
    
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    
    const ix1 = center + innerRadius * Math.cos(startAngle);
    const iy1 = center + innerRadius * Math.sin(startAngle);
    const ix2 = center + innerRadius * Math.cos(endAngle);
    const iy2 = center + innerRadius * Math.sin(endAngle);
    
    const largeArc = angle > Math.PI ? 1 : 0;
    
    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');
    
    const slice = {
      ...d,
      path,
      color: getMoodColor(d.mood),
      isSelected: props.selectedMood === d.mood,
    };
    
    startAngle = endAngle;
    return slice;
  });
});

const handleClick = (mood: MoodType) => {
  if (props.selectedMood === mood) {
    emit('select', null);
  } else {
    emit('select', mood);
  }
};

const getMoodEmoji = (mood: MoodType) => {
  return getMoodInfo(mood)?.emoji || '';
};

const getMoodName = (mood: MoodType) => {
  return getMoodInfo(mood)?.name || '';
};
</script>

<template>
  <div class="flex flex-col lg:flex-row items-center gap-8">
    <div class="relative">
      <svg :width="size" :height="size" class="transform transition-transform duration-300">
        <g>
          <path
            v-for="slice in slices"
            :key="slice.mood"
            :d="slice.path"
            :fill="slice.color"
            :opacity="selectedMood && !slice.isSelected ? 0.3 : 1"
            :class="[
              'cursor-pointer transition-all duration-300',
              slice.isSelected ? 'stroke-warm-gray-400 stroke-2' : 'hover:opacity-80'
            ]"
            @click="handleClick(slice.mood)"
          />
        </g>
        <text
          x="50%"
          y="45%"
          text-anchor="middle"
          class="text-3xl font-serif-sc font-bold fill-warm-gray-800"
        >
          {{ data.reduce((s, d) => s + d.count, 0) }}
        </text>
        <text
          x="50%"
          y="60%"
          text-anchor="middle"
          class="text-xs fill-warm-gray-500"
        >
          总记录
        </text>
      </svg>
    </div>
    
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <button
        v-for="item in data"
        :key="item.mood"
        @click="handleClick(item.mood)"
        :class="[
          'flex flex-col items-center p-4 rounded-2xl transition-all duration-300',
          selectedMood === item.mood
            ? 'bg-white shadow-soft scale-105'
            : 'bg-warm-gray-50 hover:bg-white hover:shadow-softer'
        ]"
      >
        <span class="text-3xl mb-2">{{ getMoodEmoji(item.mood) }}</span>
        <span class="font-medium text-warm-gray-700">{{ getMoodName(item.mood) }}</span>
        <span class="text-sm text-warm-gray-500">{{ item.count }}次 · {{ item.percentage }}%</span>
      </button>
    </div>
  </div>
</template>
