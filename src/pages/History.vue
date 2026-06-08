<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Clock, ChevronRight } from 'lucide-vue-next';
import CapsuleCard from '@/components/CapsuleCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useCapsules } from '@/composables/useCapsules';
import { formatDate } from '../utils/date';

const router = useRouter();
const { capsules, loading } = useCapsules();

const openedCapsules = computed(() => 
  capsules.value
    .filter(c => c.isOpened)
    .sort((a, b) => new Date(b.openAt).getTime() - new Date(a.openAt).getTime())
);

const timelineGroups = computed(() => {
  const groups: Record<string, typeof capsules.value> = {};
  openedCapsules.value.forEach(capsule => {
    const date = formatDate(capsule.openAt, 'YYYY年MM月');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(capsule);
  });
  return groups;
});

function goToWrite() {
  router.push('/write');
}

function goToDetail(id: string) {
  router.push(`/capsule/${id}`);
}
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="mb-8 animate-fade-in">
        <h1 class="font-serif-sc text-3xl font-bold text-warm-gray-800 mb-2">
          历史胶囊 📖
        </h1>
        <p class="text-warm-gray-600">
          时光的礼物，在这里静静等待被翻阅
        </p>
      </div>

      <div v-if="loading" class="space-y-8">
        <div v-for="i in 3" :key="i" class="card-soft animate-pulse h-48"></div>
      </div>
      
      <div v-else-if="openedCapsules.length === 0" class="py-16">
        <EmptyState
          icon="⏳"
          title="还没有已开启的胶囊"
          description="耐心等待吧，时间会把最好的礼物留给你。那些封存的信件，会在恰当的时候与你重逢。"
          action-text="去写新胶囊"
          @action="goToWrite"
        />
      </div>
      
      <div v-else class="relative">
        <div class="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-soft-pink-200 via-cream-yellow-200 to-mint-green-200"></div>
        
        <div v-for="(group, date) in timelineGroups" :key="date" class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-full bg-soft-pink-100 flex items-center justify-center z-10 relative md:mx-auto">
              <Clock class="w-5 h-5 text-soft-pink-400" />
            </div>
            <h2 class="font-serif-sc text-xl font-semibold text-warm-gray-800">
              {{ date }}
            </h2>
          </div>
          
          <div class="space-y-6 ml-16 md:ml-0">
            <div
              v-for="(capsule, index) in group"
              :key="capsule.id"
              :class="[
                'relative md:grid md:grid-cols-2 md:gap-8',
                index % 2 === 0 ? '' : 'md:[&>*:first-child]:order-2'
              ]"
            >
              <div class="hidden md:flex items-center justify-center">
                <div class="w-4 h-4 rounded-full bg-cream-yellow-300 z-10 shadow-soft animate-pulse-soft"></div>
              </div>
              
              <div class="md:w-full">
                <div 
                  @click="goToDetail(capsule.id)"
                  class="card-soft card-hover cursor-pointer group"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <span class="text-2xl">
                        {{ capsule.mood === 'happy' ? '😊' : capsule.mood === 'grateful' ? '🙏' : capsule.mood === 'peaceful' ? '😌' : capsule.mood === 'excited' ? '🎉' : capsule.mood === 'sad' ? '😢' : '😵‍💫' }}
                      </span>
                      <span class="text-sm text-warm-gray-500">
                        {{ formatDate(capsule.openAt, 'MM月DD日开启') }}
                      </span>
                    </div>
                    <ChevronRight class="w-5 h-5 text-warm-gray-300 group-hover:text-soft-pink-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800 mb-2 group-hover:text-soft-pink-400 transition-colors">
                    {{ capsule.title }}
                  </h3>
                  
                  <p class="text-sm text-warm-gray-500 line-clamp-3 mb-4">
                    {{ capsule.content }}
                  </p>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="tag in capsule.tags.slice(0, 3)"
                        :key="tag"
                        class="text-xs px-2 py-0.5 rounded-full bg-warm-gray-100 text-warm-gray-500"
                      >
                        #{{ tag }}
                      </span>
                    </div>
                    <span class="text-xs text-mint-green-600 flex items-center gap-1">
                      点击查看详情
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center py-12">
          <div class="inline-flex items-center gap-2 text-warm-gray-400">
            <span class="text-2xl">✨</span>
            <span class="font-serif-sc">更多故事，还在书写中...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
