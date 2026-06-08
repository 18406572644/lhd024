<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { FileText, Calendar, Flame, Clock, Award, TrendingUp, PieChart, BarChart3, PenTool, X } from 'lucide-vue-next';
import { useCapsules } from '../composables/useCapsules';
import MoodPieChart from '../components/charts/MoodPieChart.vue';
import MoodTrendChart from '../components/charts/MoodTrendChart.vue';
import CategoryBarChart from '../components/charts/CategoryBarChart.vue';
import WritingHeatmap from '../components/charts/WritingHeatmap.vue';
import CapsuleCard from '../components/CapsuleCard.vue';
import type { MoodType, CapsuleCategory, GrowthStats, Capsule } from '../types';
import { MOODS, CATEGORIES } from '../types';
import { formatDate } from '../utils/date';
import { useGreeting } from '../composables/useGreeting';

const router = useRouter();
const { greeting, formattedDate } = useGreeting();
const { 
  capsules, 
  loading, 
  loadData, 
  getGrowthStats, 
  getCapsulesByMood,
  getCapsulesByCategory,
} = useCapsules();

const growthStats = ref<GrowthStats | null>(null);
const selectedMood = ref<MoodType | null>(null);
const filteredCapsules = ref<Capsule[]>([]);
const showFilteredModal = ref(false);
const activeTab = ref<'overview' | 'mood' | 'trend' | 'category' | 'habit' | 'achievement'>('overview');

const overviewItems = computed(() => {
  if (!growthStats.value) return [];
  const { overview } = growthStats.value;
  return [
    {
      label: '总字数',
      value: overview.totalWords.toLocaleString(),
      icon: FileText,
      bgGradient: 'from-soft-pink-100 to-soft-pink-50',
      iconBg: 'bg-soft-pink-200',
      iconColor: 'text-soft-pink-400',
      shadow: 'hover:shadow-glow-pink',
      suffix: '字',
    },
    {
      label: '总胶囊',
      value: overview.totalCapsules,
      icon: PieChart,
      bgGradient: 'from-cream-yellow-100 to-cream-yellow-50',
      iconBg: 'bg-cream-yellow-200',
      iconColor: 'text-cream-yellow-400',
      shadow: 'hover:shadow-glow-yellow',
      suffix: '颗',
    },
    {
      label: '连续记录',
      value: overview.streakDays,
      icon: Flame,
      bgGradient: 'from-mint-green-100 to-mint-green-50',
      iconBg: 'bg-mint-green-200',
      iconColor: 'text-mint-green-400',
      shadow: 'hover:shadow-glow-green',
      suffix: '天',
    },
    {
      label: '记录历史',
      value: overview.firstCapsuleAgo,
      icon: Clock,
      bgGradient: 'from-lavender-100 to-lavender-50',
      iconBg: 'bg-lavender-200',
      iconColor: 'text-lavender-300',
      shadow: 'hover:shadow-glow-purple',
      suffix: '',
    },
  ];
});

const warmMessages = [
  '这一年，你过得好吗？💕',
  '每一个字，都是时光的礼物 ✨',
  '记录是最好的陪伴 📝',
  '你的成长，我们一起见证 🌱',
  '愿温柔常伴你左右 🌸',
  '时光会记得你的每一份认真 ⏰',
];

const randomMessage = computed(() => {
  return warmMessages[Math.floor(Math.random() * warmMessages.length)];
});

const unlockedCount = computed(() => {
  return growthStats.value?.achievements.filter(a => a.isUnlocked).length || 0;
});

const totalAchievements = computed(() => {
  return growthStats.value?.achievements.length || 0;
});

onMounted(async () => {
  await loadData();
  growthStats.value = getGrowthStats();
});

function handleMoodSelect(mood: MoodType | null) {
  selectedMood.value = mood;
  if (mood) {
    filteredCapsules.value = getCapsulesByMood(mood);
    showFilteredModal.value = true;
  } else {
    filteredCapsules.value = [];
    showFilteredModal.value = false;
  }
}

function handleCategorySelect(category: CapsuleCategory) {
  router.push({ 
    path: '/categories', 
    query: { category } 
  });
}

function handleDateSelect(date: string) {
  const startDate = date;
  const endDate = date;
  router.push({
    path: '/history',
    query: { startDate, endDate }
  });
}

function getMoodName(mood: MoodType) {
  return MOODS.find(m => m.id === mood)?.name || '';
}

function getMoodEmoji(mood: MoodType) {
  return MOODS.find(m => m.id === mood)?.emoji || '';
}

function closeFilteredModal() {
  showFilteredModal.value = false;
  selectedMood.value = null;
  filteredCapsules.value = [];
}

function goToCapsule(id: string) {
  router.push(`/capsule/${id}`);
}

function refreshStats() {
  growthStats.value = getGrowthStats();
}

const tabs = [
  { key: 'overview', label: '数据概览', icon: TrendingUp },
  { key: 'mood', label: '心情分布', icon: PieChart },
  { key: 'trend', label: '心情趋势', icon: TrendingUp },
  { key: 'category', label: '分类统计', icon: BarChart3 },
  { key: 'habit', label: '写作习惯', icon: PenTool },
  { key: 'achievement', label: '成就徽章', icon: Award },
];
</script>

<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8 animate-fade-in">
        <p class="text-sm text-warm-gray-500 mb-2">{{ formattedDate }}</p>
        <h1 class="font-serif-sc text-3xl md:text-4xl font-bold text-warm-gray-800 mb-3">
          我的成长 🌱
        </h1>
        <p class="text-warm-gray-600 italic">
          {{ randomMessage }}
        </p>
      </div>
      
      <div class="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-soft">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key as typeof activeTab"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300',
            activeTab === tab.key
              ? 'bg-soft-pink-200 text-warm-gray-800 shadow-soft'
              : 'bg-white text-warm-gray-600 hover:bg-warm-gray-50 border border-warm-gray-200'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
      
      <div v-if="loading" class="space-y-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="card-soft animate-pulse h-32"></div>
        </div>
        <div class="card-soft animate-pulse h-96"></div>
      </div>
      
      <div v-else-if="growthStats" class="space-y-6">
        <Transition name="fade" mode="out-in">
          <div v-show="activeTab === 'overview'" key="overview" class="space-y-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="(item, index) in overviewItems"
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
                </div>
                <div class="flex items-baseline gap-1 mb-1">
                  <span class="text-3xl font-serif-sc font-bold text-warm-gray-800">
                    {{ item.value }}
                  </span>
                  <span class="text-sm text-warm-gray-500">{{ item.suffix }}</span>
                </div>
                <p class="text-sm text-warm-gray-600 font-medium">{{ item.label }}</p>
                <p v-if="item.label === '记录历史' && growthStats.overview.firstCapsuleDate" class="text-xs text-warm-gray-400 mt-1">
                  始于 {{ growthStats.overview.firstCapsuleDate }}
                </p>
              </div>
            </div>
            
            <div class="card-soft animate-slide-up" style="animation-delay: 0.2s;">
              <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-6">
                心情分布
              </h3>
              <MoodPieChart
                :data="growthStats.moodDistribution"
                :selected-mood="selectedMood"
                @select="handleMoodSelect"
              />
            </div>
            
            <div class="card-soft animate-slide-up" style="animation-delay: 0.3s;">
              <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-6">
                分类统计
              </h3>
              <CategoryBarChart
                :data="growthStats.categoryStats"
                @select="handleCategorySelect"
              />
            </div>
          </div>
          
          <div v-show="activeTab === 'mood'" key="mood" class="card-soft animate-fade-in">
            <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-2">
              心情分布
            </h3>
            <p class="text-warm-gray-500 text-sm mb-6">
              点击心情图标或色块，可查看对应心情的所有胶囊 ✨
            </p>
            <MoodPieChart
              :data="growthStats.moodDistribution"
              :selected-mood="selectedMood"
              @select="handleMoodSelect"
            />
          </div>
          
          <div v-show="activeTab === 'trend'" key="trend" class="card-soft animate-fade-in">
            <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-2">
              心情趋势
            </h3>
            <p class="text-warm-gray-500 text-sm mb-6">
              最近12个月的心情变化，开心=5，难过=1 📈
            </p>
            <MoodTrendChart :data="growthStats.moodTrend" />
          </div>
          
          <div v-show="activeTab === 'category'" key="category" class="card-soft animate-fade-in">
            <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-2">
              分类统计
            </h3>
            <p class="text-warm-gray-500 text-sm mb-6">
              点击柱子可跳转至对应分类页面 📊
            </p>
            <CategoryBarChart
              :data="growthStats.categoryStats"
              @select="handleCategorySelect"
            />
          </div>
          
          <div v-show="activeTab === 'habit'" key="habit" class="card-soft animate-fade-in">
            <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-2">
              写作习惯
            </h3>
            <p class="text-warm-gray-500 text-sm mb-6">
              过去一年的写作活跃度热力图 🗓️
            </p>
            <WritingHeatmap
              :data="growthStats.writingHabits"
              @select-date="handleDateSelect"
            />
          </div>
          
          <div v-show="activeTab === 'achievement'" key="achievement" class="card-soft animate-fade-in">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800">
                  成就徽章
                </h3>
                <p class="text-warm-gray-500 text-sm">
                  已解锁 {{ unlockedCount }}/{{ totalAchievements }} 个成就
                </p>
              </div>
              <div class="w-20 h-20 relative">
                <svg class="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#E7E0D5"
                    stroke-width="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#FDA4AF"
                    stroke-width="8"
                    fill="none"
                    stroke-linecap="round"
                    :stroke-dasharray="totalAchievements > 0 ? `${(unlockedCount / totalAchievements) * 201} 201` : '0 201'"
                    class="transition-all duration-1000"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-xl font-bold text-warm-gray-800">
                    {{ totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0 }}%
                  </span>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div
                v-for="achievement in growthStats.achievements"
                :key="achievement.id"
                :class="[
                  'rounded-2xl p-4 text-center transition-all duration-300',
                  achievement.isUnlocked
                    ? 'bg-gradient-to-br from-soft-pink-50 to-cream-yellow-50 shadow-soft hover:scale-105'
                    : 'bg-warm-gray-50 opacity-60'
                ]"
              >
                <div 
                  :class="[
                    'text-4xl mb-2 transition-transform duration-300',
                    achievement.isUnlocked ? 'animate-float-slow' : 'grayscale'
                  ]"
                >
                  {{ achievement.icon }}
                </div>
                <h4 :class="[
                  'font-medium text-sm mb-1',
                  achievement.isUnlocked ? 'text-warm-gray-800' : 'text-warm-gray-400'
                ]">
                  {{ achievement.name }}
                </h4>
                <p class="text-xs text-warm-gray-500">
                  {{ achievement.description }}
                </p>
                <p v-if="achievement.isUnlocked && achievement.unlockedAt" class="text-xs text-soft-pink-400 mt-2">
                  ✨ 已解锁
                </p>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      
      <div v-else class="card-soft text-center py-16">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-2">
          还没有成长数据
        </h3>
        <p class="text-warm-gray-500 mb-6">
          开始写下第一颗胶囊，记录你的成长吧～
        </p>
        <button
          @click="router.push('/write')"
          class="btn-primary"
        >
          写第一颗胶囊
        </button>
      </div>
    </div>
    
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showFilteredModal"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          @click.self="closeFilteredModal"
        >
          <div class="bg-warm-gray-50 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div class="sticky top-0 bg-white border-b border-warm-gray-100 p-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ selectedMood ? getMoodEmoji(selectedMood) : '' }}</span>
                <div>
                  <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800">
                    {{ selectedMood ? getMoodName(selectedMood) : '' }}的胶囊
                  </h3>
                  <p class="text-sm text-warm-gray-500">共 {{ filteredCapsules.length }} 颗</p>
                </div>
              </div>
              <button
                @click="closeFilteredModal"
                class="p-2 rounded-full hover:bg-warm-gray-100 transition-colors"
              >
                <X class="w-5 h-5 text-warm-gray-600" />
              </button>
            </div>
            
            <div class="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div v-if="filteredCapsules.length === 0" class="text-center py-12">
                <div class="text-4xl mb-3">🔍</div>
                <p class="text-warm-gray-500">暂无相关胶囊</p>
              </div>
              
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CapsuleCard
                  v-for="capsule in filteredCapsules"
                  :key="capsule.id"
                  :capsule="capsule"
                  @click="goToCapsule(capsule.id)"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
