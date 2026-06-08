<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PenSquare, Sparkles, Gift } from 'lucide-vue-next';
import CapsuleCard from '@/components/CapsuleCard.vue';
import CapsuleStats from '@/components/CapsuleStats.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useCapsules } from '@/composables/useCapsules';
import { useGreeting } from '@/composables/useGreeting';
import { formatDate } from '@/utils/date';

const router = useRouter();
const { greeting, encouragement, formattedDate, currentHour } = useGreeting();
const { capsules, stats, loading, newlyOpened, clearNewlyOpened, loadData } = useCapsules();

const showNotification = ref(false);
const activeTab = ref<'all' | 'pending' | 'opened'>('all');

const filteredCapsules = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return capsules.value.filter(c => !c.isOpened);
    case 'opened':
      return capsules.value.filter(c => c.isOpened);
    default:
      return capsules.value;
  }
});

const bgGradient = computed(() => {
  const hour = currentHour.value;
  if (hour >= 5 && hour < 12) {
    return 'from-soft-pink-100/50 via-cream-yellow-100/30 to-transparent';
  } else if (hour >= 12 && hour < 18) {
    return 'from-cream-yellow-100/50 via-mint-green-100/30 to-transparent';
  } else if (hour >= 18 && hour < 23) {
    return 'from-lavender-100/50 via-soft-pink-100/30 to-transparent';
  } else {
    return 'from-sky-blue-100/50 via-lavender-100/30 to-transparent';
  }
});

onMounted(() => {
  loadData();
  if (newlyOpened.value.length > 0) {
    showNotification.value = true;
  }
});

function goToWrite() {
  router.push('/write');
}

function handleDelete(id: string) {
  if (confirm('确定要删除这个胶囊吗？')) {
    // delete logic handled in component
  }
}
</script>

<template>
  <div class="min-h-screen">
    <div :class="['absolute inset-0 bg-gradient-to-b opacity-50 pointer-events-none', bgGradient]"></div>
    
    <div class="absolute top-10 right-10 text-4xl star animate-float opacity-40">✨</div>
    <div class="absolute top-32 left-20 text-3xl star animate-float-slow opacity-30">⭐</div>
    <div class="absolute top-48 right-1/4 text-2xl star opacity-25">🌟</div>
    
    <div class="container mx-auto px-4 py-8 relative">
      <div class="mb-10 animate-fade-in">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p class="text-sm text-warm-gray-500 mb-2">{{ formattedDate }}</p>
            <h1 class="font-serif-sc text-3xl md:text-4xl font-bold text-warm-gray-800 mb-3">
              {{ greeting }}
            </h1>
            <p class="text-warm-gray-600 flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-cream-yellow-400" />
              <span class="italic">{{ encouragement }}</span>
            </p>
          </div>
          <button
            @click="goToWrite"
            class="btn-primary self-start md:self-auto flex items-center gap-2 shadow-soft animate-pulse-soft"
          >
            <PenSquare class="w-5 h-5" />
            写一封信给未来
          </button>
        </div>
      </div>

      <Transition name="slide-up">
        <div v-if="showNotification && newlyOpened.length > 0" class="mb-8 animate-slide-up">
          <div class="bg-gradient-to-r from-mint-green-100 to-cream-yellow-100 rounded-3xl p-6 shadow-soft border border-mint-green-200">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-soft animate-heart-beat">
                <Gift class="w-8 h-8 text-mint-green-400" />
              </div>
              <div class="flex-1">
                <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-1">
                  🎉 有新的胶囊可以开启了！
                </h3>
                <p class="text-warm-gray-600">
                  你有 {{ newlyOpened.length }} 个胶囊已经到了开启时间，快去看看吧～
                </p>
              </div>
              <button
                @click="showNotification = false; clearNewlyOpened()"
                class="btn-secondary"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <div class="mb-10">
        <CapsuleStats :stats="stats" />
      </div>

      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-serif-sc text-xl font-semibold text-warm-gray-800">
            我的胶囊
          </h2>
        </div>
        
        <div class="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-soft">
          <button
            v-for="tab in [
              { key: 'all', label: '全部' },
              { key: 'pending', label: '封存中' },
              { key: 'opened', label: '已开启' },
            ]"
            :key="tab.key"
            @click="activeTab = tab.key as 'all' | 'pending' | 'opened'"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap',
              activeTab === tab.key
                ? 'bg-soft-pink-200 text-warm-gray-800 shadow-soft'
                : 'bg-white text-warm-gray-600 hover:bg-warm-gray-50 border border-warm-gray-200'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="card-soft animate-pulse h-48"></div>
        </div>
        
        <div v-else-if="filteredCapsules.length === 0" class="py-12">
          <EmptyState
            icon="💌"
            title="还没有胶囊"
            :description="activeTab === 'pending' ? '目前没有封存中的胶囊，去写一封给未来的信吧～' : activeTab === 'opened' ? '还没有已开启的胶囊，耐心等待时间的礼物吧～' : '开始写第一封给未来的信吧，让时间替你保管这份珍贵的记忆。'"
            action-text="写第一个胶囊"
            @action="goToWrite"
          />
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CapsuleCard
            v-for="capsule in filteredCapsules"
            :key="capsule.id"
            :capsule="capsule"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>
  </div>
</template>
