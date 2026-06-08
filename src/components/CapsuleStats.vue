<script setup lang="ts">
import { computed } from 'vue';
import { Inbox, Clock, CheckCircle, Bell } from 'lucide-vue-next';
import type { CapsuleStats } from '../types';

const props = defineProps<{
  stats: CapsuleStats;
}>();

const statItems = computed(() => [
  {
    label: '总胶囊',
    value: props.stats.total,
    icon: Inbox,
    bgGradient: 'from-soft-pink-100 to-soft-pink-50',
    iconBg: 'bg-soft-pink-200',
    iconColor: 'text-soft-pink-400',
    shadow: 'hover:shadow-glow-pink',
  },
  {
    label: '待开启',
    value: props.stats.pending,
    icon: Clock,
    bgGradient: 'from-cream-yellow-100 to-cream-yellow-50',
    iconBg: 'bg-cream-yellow-200',
    iconColor: 'text-cream-yellow-400',
    shadow: 'hover:shadow-glow-yellow',
  },
  {
    label: '已开启',
    value: props.stats.opened,
    icon: CheckCircle,
    bgGradient: 'from-mint-green-100 to-mint-green-50',
    iconBg: 'bg-mint-green-200',
    iconColor: 'text-mint-green-400',
    shadow: 'hover:shadow-glow-green',
  },
  {
    label: '即将开启',
    value: props.stats.comingSoon,
    icon: Bell,
    bgGradient: 'from-lavender-100 to-lavender-50',
    iconBg: 'bg-lavender-200',
    iconColor: 'text-lavender-300',
    shadow: 'hover:shadow-glow-purple',
  },
]);
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div
      v-for="(item, index) in statItems"
      :key="item.label"
      :class="[
        'rounded-3xl p-5 transition-all duration-500 cursor-pointer',
        'bg-gradient-to-br',
        item.bgGradient,
        item.shadow,
        'hover:-translate-y-1',
        'animate-slide-up'
      ]"
      :style="{ animationDelay: `${index * 0.1}s` }"
    >
      <div class="flex items-center justify-between mb-3">
        <div :class="['w-10 h-10 rounded-2xl flex items-center justify-center', item.iconBg]">
          <component :is="item.icon" :class="['w-5 h-5', item.iconColor]" />
        </div>
        <span class="text-3xl font-serif-sc font-bold text-warm-gray-800">
          {{ item.value }}
        </span>
      </div>
      <p class="text-sm text-warm-gray-600 font-medium">{{ item.label }}</p>
    </div>
  </div>
</template>
