<script setup lang="ts">
import { computed } from 'vue';
import type { WritingHabitData, TimeDistribution, WritingDayData } from '../../types';

const props = defineProps<{
  data: WritingHabitData;
}>();

const emit = defineEmits<{
  (e: 'selectDate', date: string): void;
}>();

const cellSize = 12;
const cellGap = 3;
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const weeks = computed(() => {
  const result: WritingDayData[][] = [];
  let currentWeek: (WritingDayData | null)[] = [];
  
  const firstDay = new Date(props.data.heatmap[0]?.date || new Date());
  const firstDayOfWeek = firstDay.getDay();
  
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  props.data.heatmap.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      result.push(currentWeek as WritingDayData[]);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    result.push(currentWeek as WritingDayData[]);
  }
  
  return result;
});

const monthLabels = computed(() => {
  const labels: { month: string; x: number }[] = [];
  let lastMonth = -1;
  
  weeks.value.forEach((week, weekIndex) => {
    const firstDay = week.find(d => d !== null);
    if (firstDay) {
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        labels.push({ month: months[month], x: weekIndex });
        lastMonth = month;
      }
    }
  });
  
  return labels;
});

const getLevelColor = (level: number) => {
  const colors = [
    '#F5F0E8',
    '#FECDD3',
    '#FDA4AF',
    '#FB7185',
    '#F43F5E',
  ];
  return colors[level] || colors[0];
};

const handleClick = (day: WritingDayData) => {
  if (day && day.count > 0) {
    emit('selectDate', day.date);
  }
};

const timePeriodColors: Record<string, string> = {
  dawn: '#A5B4FC',
  morning: '#FCD34D',
  afternoon: '#6EE7B7',
  evening: '#C084FC',
};

const maxTimeCount = computed(() => {
  return Math.max(...props.data.timeDistribution.map(t => t.count), 1);
});

const getTimeBarWidth = (count: number) => {
  return (count / maxTimeCount.value) * 100;
};
</script>

<template>
  <div class="space-y-8">
    <div>
      <div class="overflow-x-auto pb-4">
        <div class="min-w-fit">
          <div class="flex mb-2 ml-8">
            <div
              v-for="label in monthLabels"
              :key="label.month + '-' + label.x"
              class="text-xs text-warm-gray-500"
              :style="{ marginLeft: label.x === 0 ? 0 : `${(label.x - (monthLabels[monthLabels.indexOf(label) - 1]?.x || 0) - 1) * (cellSize + cellGap) + cellGap}px` }"
            >
              {{ label.month }}
            </div>
          </div>
          
          <div class="flex">
            <div class="mr-2 flex flex-col justify-around text-xs text-warm-gray-500 pr-1">
              <span v-for="(day, i) in weekDays" :key="day" v-show="i % 2 === 0">
                {{ day }}
              </span>
            </div>
            
            <div class="flex gap-1">
              <div
                v-for="(week, weekIndex) in weeks"
                :key="weekIndex"
                class="flex flex-col gap-1"
              >
                <div
                  v-for="(day, dayIndex) in week"
                  :key="dayIndex"
                  :class="[
                    'rounded-sm transition-all duration-200',
                    day && day.count > 0 ? 'cursor-pointer hover:scale-125' : ''
                  ]"
                  :style="{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: day ? getLevelColor(day.level) : 'transparent',
                  }"
                  @click="day && handleClick(day)"
                  :title="day ? `${day.date}: ${day.count}篇` : ''"
                ></div>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-end gap-2 mt-4 text-xs text-warm-gray-500">
            <span>少</span>
            <div
              v-for="i in 5"
              :key="i"
              class="rounded-sm"
              :style="{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: getLevelColor(i - 1),
              }"
            ></div>
            <span>多</span>
          </div>
        </div>
      </div>
    </div>
    
    <div>
      <h4 class="text-sm font-medium text-warm-gray-700 mb-4">写作时间段分布</h4>
      <div class="space-y-3">
        <div
          v-for="time in data.timeDistribution"
          :key="time.period"
          class="flex items-center gap-3"
        >
          <span class="w-16 text-sm text-warm-gray-600">{{ time.label }}</span>
          <div class="flex-1 h-8 bg-warm-gray-100 rounded-full overflow-hidden relative">
            <div
              class="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
              :style="{
                width: `${getTimeBarWidth(time.count)}%`,
                backgroundColor: timePeriodColors[time.period],
                minWidth: time.count > 0 ? '40px' : '0',
              }"
            >
              <span
                v-if="time.count > 0"
                class="text-xs font-medium text-white"
              >
                {{ time.count }}
              </span>
            </div>
          </div>
          <span class="w-12 text-right text-sm text-warm-gray-500">{{ time.percentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
