import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Capsule, CapsuleStats, CapsuleCategory, Attachment, FilterOptions, SearchResult, SearchHistoryItem, MoodType, MoodDistribution, MoodTrendPoint, CategoryStats, WritingHabitData, Achievement, GrowthOverview, GrowthStats, MOOD_VALUES, ACHIEVEMENTS, TIME_PERIODS, WritingDayData } from '../types';
import { MOOD_VALUES as MOOD_VALUES_CONST, ACHIEVEMENTS as ACHIEVEMENTS_CONST, TIME_PERIODS as TIME_PERIODS_CONST, CATEGORIES, MOODS } from '../types';
import * as api from '../utils/api';
import { dayjs, formatDate, fromNow } from '../utils/date';

const PINYIN_MAP: Record<string, string[]> = {
  '开': ['k', 'kai'], '心': ['x', 'xin'], '难': ['n', 'nan'], '过': ['g', 'guo'],
  '平': ['p', 'ping'], '静': ['j', 'jing'], '激': ['j', 'ji'], '动': ['d', 'dong'],
  '感': ['g', 'gan'], '恩': ['e', 'en'], '迷': ['m', 'mi'], '茫': ['m', 'mang'],
  '梦': ['m', 'meng'], '想': ['x', 'xiang'], '亲': ['q', 'qin'], '情': ['q', 'qing'],
  '友': ['y', 'you'], '爱': ['a', 'ai'], '成': ['c', 'cheng'],
  '长': ['z', 'zhang'], '其': ['q', 'qi'], '他': ['t', 'ta'], '家': ['j', 'jia'],
  '庭': ['t', 'ting'], '谊': ['y', 'yi'], '未': ['w', 'wei'],
  '来': ['l', 'lai'], '现': ['x', 'xian'], '在': ['z', 'zai'], '时': ['s', 'shi'],
  '光': ['g', 'guang'], '回': ['h', 'hui'], '忆': ['y', 'yi'], '祝': ['z', 'zhu'],
  '福': ['f', 'fu'], '愿': ['y', 'yuan'], '望': ['w', 'wang'], '生': ['s', 'sheng'],
  '活': ['h', 'huo'], '日': ['r', 'ri'], '记': ['j', 'ji'], '旅': ['l', 'lv'],
  '行': ['x', 'xing'], '学': ['x', 'xue'], '习': ['x', 'xi'], '工': ['g', 'gong'],
  '作': ['z', 'zuo'], '谢': ['x', 'xie'], '对': ['d', 'dui'],
  '不': ['b', 'bu'], '起': ['q', 'qi'], '再': ['z', 'zai'], '见': ['j', 'jian'],
};

function getPinyinInitials(text: string): string[] {
  const results: string[] = [];
  for (const char of text) {
    if (PINYIN_MAP[char]) {
      results.push(...PINYIN_MAP[char]);
    }
  }
  return results;
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function fuzzyMatch(text: string, keyword: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);
  
  if (normalizedText.includes(normalizedKeyword)) {
    return true;
  }
  
  const pinyinInitials = getPinyinInitials(text);
  for (const initial of pinyinInitials) {
    if (initial.includes(normalizedKeyword)) {
      return true;
    }
  }
  
  return false;
}

export const useCapsulesStore = defineStore('capsules', () => {
  const capsules = ref<Capsule[]>([]);
  const stats = ref<CapsuleStats>({
    total: 0,
    pending: 0,
    opened: 0,
    comingSoon: 0,
  });
  const loading = ref(false);
  const newlyOpened = ref<Capsule[]>([]);
  const searchHistory = ref<SearchHistoryItem[]>([]);
  const MAX_SEARCH_HISTORY = 5;

  const pendingCapsules = computed(() => 
    capsules.value.filter(c => !c.isOpened)
  );

  const openedCapsules = computed(() => 
    capsules.value.filter(c => c.isOpened)
  );

  const comingSoonCapsules = computed(() => 
    capsules.value.filter(c => !c.isOpened && 
      new Date(c.openAt).getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000)
  );

  function getCapsulesByCategory(category: CapsuleCategory) {
    return capsules.value.filter(c => c.category === category);
  }

  async function loadCapsules() {
    loading.value = true;
    try {
      capsules.value = await api.getCapsules();
      stats.value = await api.getCapsuleStats();
    } finally {
      loading.value = false;
    }
  }

  async function loadStats() {
    stats.value = await api.getCapsuleStats();
  }

  async function getCapsuleById(id: string) {
    return await api.getCapsuleById(id);
  }

  async function createCapsule(
    data: Omit<Capsule, 'id' | 'createdAt' | 'isOpened' | 'attachments'>,
    attachments?: { file: File; type: 'image' | 'audio' | 'video'; duration?: number; editConfig?: Attachment['editConfig'] }[]
  ) {
    const newCapsule = await api.createCapsule({ ...data, attachments });
    capsules.value.unshift(newCapsule);
    await loadStats();
    return newCapsule;
  }

  async function updateCapsule(id: string, data: Partial<Capsule>) {
    const updated = await api.updateCapsule(id, data);
    if (updated) {
      const index = capsules.value.findIndex(c => c.id === id);
      if (index !== -1) {
        capsules.value[index] = updated;
      }
      await loadStats();
    }
    return updated;
  }

  async function deleteCapsule(id: string) {
    const success = await api.deleteCapsule(id);
    if (success) {
      capsules.value = capsules.value.filter(c => c.id !== id);
      await loadStats();
    }
    return success;
  }

  async function checkScheduledCapsules() {
    const newly = await api.checkScheduledCapsules();
    if (newly.length > 0) {
      newlyOpened.value = newly;
      await loadCapsules();
    }
    return newly;
  }

  function clearNewlyOpened() {
    newlyOpened.value = [];
  }

  function searchCapsules(keyword: string): SearchResult[] {
    if (!keyword.trim()) return [];
    
    const results: SearchResult[] = [];
    
    for (const capsule of capsules.value) {
      let matchScore = 0;
      let matchType: 'title' | 'content' | 'tag' | null = null;
      const matchedKeywords: string[] = [];
      
      if (fuzzyMatch(capsule.title, keyword)) {
        matchScore = 100;
        matchType = 'title';
        matchedKeywords.push(keyword);
      }
      
      if (fuzzyMatch(capsule.content, keyword)) {
        const contentScore = 50;
        if (contentScore > matchScore) {
          matchScore = contentScore;
          matchType = 'content';
        }
        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }
      
      for (const tag of capsule.tags) {
        if (fuzzyMatch(tag, keyword)) {
          const tagScore = 25;
          if (tagScore > matchScore) {
            matchScore = tagScore;
            matchType = 'tag';
          }
          if (!matchedKeywords.includes(keyword)) {
            matchedKeywords.push(keyword);
          }
          break;
        }
      }
      
      if (matchType && matchedKeywords.length > 0) {
        results.push({
          capsule,
          matchScore,
          matchType,
          matchedKeywords,
        });
      }
    }
    
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  function filterCapsules(filters: FilterOptions): Capsule[] {
    return capsules.value.filter(capsule => {
      if (filters.moods.length > 0 && !filters.moods.includes(capsule.mood)) {
        return false;
      }
      
      if (filters.categories.length > 0 && !filters.categories.includes(capsule.category)) {
        return false;
      }
      
      if (filters.status.length > 0) {
        const now = Date.now();
        const openAt = new Date(capsule.openAt).getTime();
        const isComingSoon = !capsule.isOpened && (openAt - now <= 7 * 24 * 60 * 60 * 1000);
        
        const statusMatch = filters.status.some(status => {
          switch (status) {
            case 'pending':
              return !capsule.isOpened;
            case 'opened':
              return capsule.isOpened;
            case 'comingSoon':
              return isComingSoon;
            case 'private':
              return capsule.isPrivate;
            default:
              return false;
          }
        });
        
        if (!statusMatch) return false;
      }
      
      if (filters.createdAtStart) {
        const createdAt = new Date(capsule.createdAt).getTime();
        const startAt = new Date(filters.createdAtStart).getTime();
        if (createdAt < startAt) return false;
      }
      
      if (filters.createdAtEnd) {
        const createdAt = new Date(capsule.createdAt).getTime();
        const endAt = new Date(filters.createdAtEnd).getTime() + 24 * 60 * 60 * 1000;
        if (createdAt > endAt) return false;
      }
      
      if (filters.openAtStart) {
        const openAt = new Date(capsule.openAt).getTime();
        const startAt = new Date(filters.openAtStart).getTime();
        if (openAt < startAt) return false;
      }
      
      if (filters.openAtEnd) {
        const openAt = new Date(capsule.openAt).getTime();
        const endAt = new Date(filters.openAtEnd).getTime() + 24 * 60 * 60 * 1000;
        if (openAt > endAt) return false;
      }
      
      return true;
    });
  }

  function searchAndFilter(keyword: string, filters: FilterOptions): SearchResult[] {
    const searchResults = keyword.trim() ? searchCapsules(keyword) : null;
    const filteredCapsules = filterCapsules(filters);
    
    if (searchResults) {
      const filteredIds = new Set(filteredCapsules.map(c => c.id));
      return searchResults.filter(r => filteredIds.has(r.capsule.id));
    }
    
    return filteredCapsules.map(capsule => ({
      capsule,
      matchScore: 0,
      matchType: 'title' as const,
      matchedKeywords: [],
    }));
  }

  function addToSearchHistory(keyword: string) {
    if (!keyword.trim()) return;
    
    searchHistory.value = searchHistory.value.filter(h => h.keyword !== keyword);
    
    searchHistory.value.unshift({
      id: Date.now().toString(),
      keyword: keyword.trim(),
      timestamp: Date.now(),
    });
    
    if (searchHistory.value.length > MAX_SEARCH_HISTORY) {
      searchHistory.value = searchHistory.value.slice(0, MAX_SEARCH_HISTORY);
    }
  }

  function removeFromSearchHistory(id: string) {
    searchHistory.value = searchHistory.value.filter(h => h.id !== id);
  }

  function clearSearchHistory() {
    searchHistory.value = [];
  }

  function highlightText(text: string, keywords: string[]): string {
    if (!keywords.length) return text;
    
    let result = text;
    for (const keyword of keywords) {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      result = result.replace(regex, '<mark class="bg-cream-yellow-200 px-0.5 rounded">$1</mark>');
    }
    return result;
  }

  const totalWords = computed(() => {
    return capsules.value.reduce((sum, c) => sum + c.title.length + c.content.length, 0);
  });

  const firstCapsuleDate = computed(() => {
    if (capsules.value.length === 0) return '';
    const sorted = [...capsules.value].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return sorted[0].createdAt;
  });

  const streakDays = computed((): number => {
    if (capsules.value.length === 0) return 0;
    
    const dateSet = new Set(
      capsules.value.map(c => dayjs(c.createdAt).format('YYYY-MM-DD'))
    );
    
    let streak = 0;
    let currentDate = dayjs();
    
    while (dateSet.has(currentDate.format('YYYY-MM-DD'))) {
      streak++;
      currentDate = currentDate.subtract(1, 'day');
    }
    
    return streak;
  });

  const usedMoods = computed(() => {
    return new Set(capsules.value.map(c => c.mood));
  });

  const usedCategories = computed(() => {
    return new Set(capsules.value.map(c => c.category));
  });

  function getGrowthOverview(): GrowthOverview {
    return {
      totalWords: totalWords.value,
      totalCapsules: capsules.value.length,
      streakDays: streakDays.value,
      firstCapsuleAgo: firstCapsuleDate.value ? fromNow(firstCapsuleDate.value) : '暂无记录',
      firstCapsuleDate: firstCapsuleDate.value ? formatDate(firstCapsuleDate.value) : '',
    };
  }

  function getMoodDistribution(): MoodDistribution[] {
    if (capsules.value.length === 0) return [];
    
    const counts: Record<MoodType, number> = {
      happy: 0, sad: 0, peaceful: 0, excited: 0, grateful: 0, confused: 0,
    };
    
    capsules.value.forEach(c => {
      counts[c.mood]++;
    });
    
    const total = capsules.value.length;
    return MOODS.map(mood => ({
      mood: mood.id,
      count: counts[mood.id],
      percentage: total > 0 ? Math.round((counts[mood.id] / total) * 100) : 0,
    })).filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  function getMoodTrend(): MoodTrendPoint[] {
    const months: MoodTrendPoint[] = [];
    const now = dayjs();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = now.subtract(i, 'month');
      const monthStr = monthDate.format('YYYY-MM');
      const monthCapsules = capsules.value.filter(c => 
        dayjs(c.createdAt).format('YYYY-MM') === monthStr
      );
      
      const moodCounts: Record<MoodType, number> = {
        happy: 0, sad: 0, peaceful: 0, excited: 0, grateful: 0, confused: 0,
      };
      
      monthCapsules.forEach(c => {
        moodCounts[c.mood]++;
      });
      
      const totalMoodValues = monthCapsules.reduce((sum, c) => sum + MOOD_VALUES_CONST[c.mood], 0);
      const moodIndex = monthCapsules.length > 0 
        ? Math.round((totalMoodValues / monthCapsules.length) * 10) / 10
        : 0;
      
      months.push({
        month: monthDate.format('M月'),
        moodIndex,
        moodCounts,
      });
    }
    
    return months;
  }

  function getCategoryStats(): CategoryStats[] {
    if (capsules.value.length === 0) return [];
    
    const counts: Record<CapsuleCategory, number> = {
      dream: 0, family: 0, friendship: 0, love: 0, growth: 0, other: 0,
    };
    
    capsules.value.forEach(c => {
      counts[c.category]++;
    });
    
    const total = capsules.value.length;
    return CATEGORIES.map(cat => ({
      category: cat.id,
      count: counts[cat.id],
      percentage: total > 0 ? Math.round((counts[cat.id] / total) * 100) : 0,
    })).filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  function getWritingHabits(): WritingHabitData {
    const heatmap: WritingDayData[] = [];
    const today = dayjs();
    const oneYearAgo = today.subtract(364, 'day');
    
    const dateCounts: Record<string, number> = {};
    
    capsules.value.forEach(c => {
      const dateStr = dayjs(c.createdAt).format('YYYY-MM-DD');
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });
    
    let current = oneYearAgo;
    while (current.isBefore(today) || current.isSame(today, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      const count = dateCounts[dateStr] || 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 1) level = 1;
      if (count >= 3) level = 2;
      if (count >= 5) level = 3;
      if (count >= 8) level = 4;
      
      heatmap.push({ date: dateStr, count, level });
      current = current.add(1, 'day');
    }
    
    const timeCounts: Record<string, number> = {
      dawn: 0, morning: 0, afternoon: 0, evening: 0,
    };
    
    capsules.value.forEach(c => {
      const hour = dayjs(c.createdAt).hour();
      const period = TIME_PERIODS_CONST.find(p => hour >= p.range[0] && hour < p.range[1]);
      if (period) {
        timeCounts[period.period]++;
      }
    });
    
    const total = capsules.value.length;
    const timeDistribution = TIME_PERIODS_CONST.map(p => ({
      period: p.period,
      label: p.label,
      count: timeCounts[p.period],
      percentage: total > 0 ? Math.round((timeCounts[p.period] / total) * 100) : 0,
    }));
    
    return { heatmap, timeDistribution };
  }

  function getAchievements(): Achievement[] {
    const words = totalWords.value;
    const total = capsules.value.length;
    const streak = streakDays.value;
    const moods = usedMoods.value;
    const cats = usedCategories.value;
    
    return ACHIEVEMENTS_CONST.map(a => {
      let isUnlocked = false;
      let unlockedAt: string | null = null;
      
      switch (a.id) {
        case 'first_capsule':
          isUnlocked = total >= 1;
          break;
        case 'streak_7':
          isUnlocked = streak >= 7;
          break;
        case 'streak_30':
          isUnlocked = streak >= 30;
          break;
        case 'capsules_10':
          isUnlocked = total >= 10;
          break;
        case 'capsules_50':
          isUnlocked = total >= 50;
          break;
        case 'capsules_100':
          isUnlocked = total >= 100;
          break;
        case 'words_1000':
          isUnlocked = words >= 1000;
          break;
        case 'words_10000':
          isUnlocked = words >= 10000;
          break;
        case 'all_moods':
          isUnlocked = moods.size >= 6;
          break;
        case 'all_categories':
          isUnlocked = cats.size >= 6;
          break;
      }
      
      if (isUnlocked && capsules.value.length > 0) {
        const sorted = [...capsules.value].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        unlockedAt = sorted[0]?.createdAt || null;
      }
      
      return { ...a, isUnlocked, unlockedAt };
    });
  }

  function getGrowthStats(): GrowthStats {
    return {
      overview: getGrowthOverview(),
      moodDistribution: getMoodDistribution(),
      moodTrend: getMoodTrend(),
      categoryStats: getCategoryStats(),
      writingHabits: getWritingHabits(),
      achievements: getAchievements(),
    };
  }

  function getCapsulesByMood(mood: MoodType): Capsule[] {
    return capsules.value.filter(c => c.mood === mood);
  }

  return {
    capsules,
    stats,
    loading,
    newlyOpened,
    searchHistory,
    pendingCapsules,
    openedCapsules,
    comingSoonCapsules,
    totalWords,
    firstCapsuleDate,
    streakDays,
    usedMoods,
    usedCategories,
    getCapsulesByCategory,
    getCapsulesByMood,
    loadCapsules,
    loadStats,
    getCapsuleById,
    createCapsule,
    updateCapsule,
    deleteCapsule,
    checkScheduledCapsules,
    clearNewlyOpened,
    searchCapsules,
    filterCapsules,
    searchAndFilter,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
    highlightText,
    getGrowthOverview,
    getMoodDistribution,
    getMoodTrend,
    getCategoryStats,
    getWritingHabits,
    getAchievements,
    getGrowthStats,
  };
});
