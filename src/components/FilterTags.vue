<script setup lang="ts">
import { computed } from 'vue';
import { X } from 'lucide-vue-next';
import { CATEGORIES, MOODS } from '../types';
import type { FilterOptions, MoodType, CapsuleCategory } from '../types';

const props = defineProps<{
  filters: FilterOptions;
  searchKeyword: string;
}>();

const emit = defineEmits<{
  removeMood: [mood: MoodType];
  removeCategory: [category: CapsuleCategory];
  removeStatus: [status: 'pending' | 'opened' | 'comingSoon' | 'private'];
  removeDateRange: [type: 'createdAt' | 'openAt'];
  clearAll: [];
  clearSearch: [];
}>();

const statusLabels: Record<string, string> = {
  pending: '待开启',
  opened: '已开启',
  comingSoon: '即将开启',
  private: '私密胶囊',
};

const activeTags = computed(() => {
  const tags: Array<{
    id: string;
    label: string;
    type: 'search' | 'mood' | 'category' | 'status' | 'createdAt' | 'openAt';
    value: any;
  }> = [];

  if (props.searchKeyword.trim()) {
    tags.push({
      id: `search-${props.searchKeyword}`,
      label: `"${props.searchKeyword}"`,
      type: 'search',
      value: props.searchKeyword,
    });
  }

  props.filters.moods.forEach(mood => {
    const moodInfo = MOODS.find(m => m.id === mood);
    if (moodInfo) {
      tags.push({
        id: `mood-${mood}`,
        label: `${moodInfo.emoji} ${moodInfo.name}`,
        type: 'mood',
        value: mood,
      });
    }
  });

  props.filters.categories.forEach(category => {
    const categoryInfo = CATEGORIES.find(c => c.id === category);
    if (categoryInfo) {
      tags.push({
        id: `category-${category}`,
        label: `${categoryInfo.emoji} ${categoryInfo.name}`,
        type: 'category',
        value: category,
      });
    }
  });

  props.filters.status.forEach(status => {
    tags.push({
      id: `status-${status}`,
      label: statusLabels[status] || status,
      type: 'status',
      value: status,
    });
  });

  if (props.filters.createdAtStart || props.filters.createdAtEnd) {
    const start = props.filters.createdAtStart || '开始';
    const end = props.filters.createdAtEnd || '结束';
    tags.push({
      id: 'createdAt-range',
      label: `创建: ${start} ~ ${end}`,
      type: 'createdAt',
      value: null,
    });
  }

  if (props.filters.openAtStart || props.filters.openAtEnd) {
    const start = props.filters.openAtStart || '开始';
    const end = props.filters.openAtEnd || '结束';
    tags.push({
      id: 'openAt-range',
      label: `开启: ${start} ~ ${end}`,
      type: 'openAt',
      value: null,
    });
  }

  return tags;
});

function removeTag(tag: typeof activeTags.value[0]) {
  switch (tag.type) {
    case 'search':
      emit('clearSearch');
      break;
    case 'mood':
      emit('removeMood', tag.value);
      break;
    case 'category':
      emit('removeCategory', tag.value);
      break;
    case 'status':
      emit('removeStatus', tag.value);
      break;
    case 'createdAt':
      emit('removeDateRange', 'createdAt');
      break;
    case 'openAt':
      emit('removeDateRange', 'openAt');
      break;
  }
}

const tagColors: Record<string, string> = {
  search: 'bg-soft-pink-100 text-soft-pink-700',
  mood: 'bg-cream-yellow-100 text-cream-yellow-700',
  category: 'bg-lavender-100 text-lavender-700',
  status: 'bg-mint-green-100 text-mint-green-700',
  createdAt: 'bg-sky-blue-100 text-sky-blue-700',
  openAt: 'bg-warm-gray-100 text-warm-gray-700',
};
</script>

<template>
  <div v-if="activeTags.length > 0" class="flex flex-wrap items-center gap-2 animate-fade-in">
    <TransitionGroup name="tag">
      <div
        v-for="tag in activeTags"
        :key="tag.id"
        :class="[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
          tagColors[tag.type]
        ]"
      >
        <span>{{ tag.label }}</span>
        <button
          @click="removeTag(tag)"
          class="p-0.5 rounded-full hover:bg-white/50 transition-colors"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </TransitionGroup>

    <button
      v-if="activeTags.length > 1"
      @click="$emit('clearAll')"
      class="text-sm text-warm-gray-500 hover:text-soft-pink-500 transition-colors ml-2"
    >
      清除全部
    </button>
  </div>
</template>

<style scoped>
.tag-enter-active,
.tag-leave-active {
  transition: all 0.3s ease;
}

.tag-enter-from,
.tag-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.tag-move {
  transition: transform 0.3s ease;
}
</style>
