<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import CapsuleCard from '@/components/CapsuleCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useCapsules } from '@/composables/useCapsules';
import { CATEGORIES } from '../types';
import type { CapsuleCategory } from '../types';

const router = useRouter();
const { capsules, loading } = useCapsules();

const selectedCategory = ref<CapsuleCategory | 'all'>('all');

const categoryCounts = computed(() => {
  const counts: Record<string, number> = { all: capsules.value.length };
  CATEGORIES.forEach(cat => {
    counts[cat.id] = capsules.value.filter(c => c.category === cat.id).length;
  });
  return counts;
});

const filteredCapsules = computed(() => {
  if (selectedCategory.value === 'all') {
    return capsules.value;
  }
  return capsules.value.filter(c => c.category === selectedCategory.value);
});

function goToWrite() {
  router.push('/write');
}
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 animate-fade-in">
        <h1 class="font-serif-sc text-3xl font-bold text-warm-gray-800 mb-2">
          胶囊分类 📂
        </h1>
        <p class="text-warm-gray-600">
          按照不同的分类，浏览你写给未来的信
        </p>
      </div>

      <div class="mb-8">
        <div class="grid grid-cols-3 md:grid-cols-7 gap-4">
          <button
            @click="selectedCategory = 'all'"
            :class="[
              'flex flex-col items-center gap-2 p-4 rounded-3xl transition-all duration-300 animate-scale-in',
              selectedCategory === 'all'
                ? 'bg-gradient-to-br from-soft-pink-100 to-cream-yellow-100 shadow-soft scale-105'
                : 'bg-white hover:bg-warm-gray-50 border border-warm-gray-100'
            ]"
          >
            <div class="w-12 h-12 rounded-full bg-soft-pink-100 flex items-center justify-center text-2xl">
              📦
            </div>
            <span class="text-sm font-medium text-warm-gray-700">全部</span>
            <span class="text-xs text-warm-gray-500">{{ categoryCounts.all }}</span>
          </button>
          
          <button
            v-for="(cat, index) in CATEGORIES"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            :class="[
              'flex flex-col items-center gap-2 p-4 rounded-3xl transition-all duration-300 animate-scale-in',
              selectedCategory === cat.id
                ? [cat.bgColor, 'shadow-soft scale-105']
                : 'bg-white hover:bg-warm-gray-50 border border-warm-gray-100'
            ]"
            :style="{ animationDelay: `${(index + 1) * 0.1}s` }"
          >
            <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-2xl', cat.bgColor]">
              {{ cat.emoji }}
            </div>
            <span class="text-sm font-medium text-warm-gray-700">{{ cat.name }}</span>
            <span class="text-xs text-warm-gray-500">{{ categoryCounts[cat.id] || 0 }}</span>
          </button>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-4">
          {{ selectedCategory === 'all' ? '全部胶囊' : CATEGORIES.find(c => c.id === selectedCategory)?.name + '分类' }}
        </h2>

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="card-soft animate-pulse h-48"></div>
        </div>
        
        <div v-else-if="filteredCapsules.length === 0" class="py-12">
          <EmptyState
            :icon="selectedCategory === 'all' ? '📭' : CATEGORIES.find(c => c.id === selectedCategory)?.emoji || '📦'"
            :title="selectedCategory === 'all' ? '还没有胶囊' : `暂无${CATEGORIES.find(c => c.id === selectedCategory)?.name}分类的胶囊`"
            :description="selectedCategory === 'all' ? '开始写第一封给未来的信吧，让时间替你保管这份珍贵的记忆。' : `这个分类还没有胶囊，去写一封${CATEGORIES.find(c => c.id === selectedCategory)?.name}相关的信吧～`"
            action-text="去写胶囊"
            @action="goToWrite"
          />
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CapsuleCard
            v-for="capsule in filteredCapsules"
            :key="capsule.id"
            :capsule="capsule"
          />
        </div>
      </div>
    </div>
  </div>
</template>
