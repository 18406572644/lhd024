import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCapsulesStore } from '../stores/capsules';
import type { FilterOptions, SearchResult } from '../types';

export function useSearchFilter() {
  const store = useCapsulesStore();
  const { searchHistory } = storeToRefs(store);

  const searchKeyword = ref('');
  const debouncedKeyword = ref('');
  const isSearching = ref(false);
  let debounceTimer: number | null = null;

  const filters = ref<FilterOptions>({
    moods: [],
    categories: [],
    status: [],
    createdAtStart: null,
    createdAtEnd: null,
    openAtStart: null,
    openAtEnd: null,
  });

  const hasActiveFilters = computed(() => {
    return (
      searchKeyword.value.trim() !== '' ||
      filters.value.moods.length > 0 ||
      filters.value.categories.length > 0 ||
      filters.value.status.length > 0 ||
      filters.value.createdAtStart !== null ||
      filters.value.createdAtEnd !== null ||
      filters.value.openAtStart !== null ||
      filters.value.openAtEnd !== null
    );
  });

  const activeFilterCount = computed(() => {
    let count = 0;
    if (filters.value.moods.length > 0) count++;
    if (filters.value.categories.length > 0) count++;
    if (filters.value.status.length > 0) count++;
    if (filters.value.createdAtStart || filters.value.createdAtEnd) count++;
    if (filters.value.openAtStart || filters.value.openAtEnd) count++;
    return count;
  });

  const searchResults = computed<SearchResult[]>(() => {
    return store.searchAndFilter(debouncedKeyword.value, filters.value);
  });

  watch(
    searchKeyword,
    (newVal) => {
      isSearching.value = true;
      
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = window.setTimeout(() => {
        debouncedKeyword.value = newVal;
        isSearching.value = false;
        
        if (newVal.trim()) {
          store.addToSearchHistory(newVal);
        }
      }, 300);
    },
    { immediate: true }
  );

  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword;
  }

  function clearSearch() {
    searchKeyword.value = '';
    debouncedKeyword.value = '';
  }

  function setMoodFilter(moods: FilterOptions['moods']) {
    filters.value.moods = [...moods];
  }

  function toggleMood(mood: FilterOptions['moods'][0]) {
    const index = filters.value.moods.indexOf(mood);
    if (index === -1) {
      filters.value.moods.push(mood);
    } else {
      filters.value.moods.splice(index, 1);
    }
  }

  function setCategoryFilter(categories: FilterOptions['categories']) {
    filters.value.categories = [...categories];
  }

  function toggleCategory(category: FilterOptions['categories'][0]) {
    const index = filters.value.categories.indexOf(category);
    if (index === -1) {
      filters.value.categories.push(category);
    } else {
      filters.value.categories.splice(index, 1);
    }
  }

  function setStatusFilter(status: FilterOptions['status']) {
    filters.value.status = [...status];
  }

  function toggleStatus(status: FilterOptions['status'][0]) {
    const index = filters.value.status.indexOf(status);
    if (index === -1) {
      filters.value.status.push(status);
    } else {
      filters.value.status.splice(index, 1);
    }
  }

  function setDateRange(type: 'createdAt' | 'openAt', start: string | null, end: string | null) {
    if (type === 'createdAt') {
      filters.value.createdAtStart = start;
      filters.value.createdAtEnd = end;
    } else {
      filters.value.openAtStart = start;
      filters.value.openAtEnd = end;
    }
  }

  function resetFilters() {
    filters.value = {
      moods: [],
      categories: [],
      status: [],
      createdAtStart: null,
      createdAtEnd: null,
      openAtStart: null,
      openAtEnd: null,
    };
  }

  function clearAll() {
    clearSearch();
    resetFilters();
  }

  function clearSearchHistory() {
    store.clearSearchHistory();
  }

  function removeSearchHistoryItem(id: string) {
    store.removeFromSearchHistory(id);
  }

  function highlightText(text: string, keywords: string[]): string {
    return store.highlightText(text, keywords);
  }

  return {
    searchKeyword,
    debouncedKeyword,
    isSearching,
    filters,
    searchResults,
    searchHistory,
    hasActiveFilters,
    activeFilterCount,
    setSearchKeyword,
    clearSearch,
    setMoodFilter,
    toggleMood,
    setCategoryFilter,
    toggleCategory,
    setStatusFilter,
    toggleStatus,
    setDateRange,
    resetFilters,
    clearAll,
    clearSearchHistory,
    removeSearchHistoryItem,
    highlightText,
  };
}
