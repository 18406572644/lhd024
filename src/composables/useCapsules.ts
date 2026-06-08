import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCapsulesStore } from '../stores/capsules';
import { getCountdown, formatCountdown } from '../utils/date';
import type { Capsule } from '../types';

export function useCapsules() {
  const store = useCapsulesStore();
  const { 
    capsules, 
    stats, 
    loading, 
    newlyOpened, 
    pendingCapsules, 
    openedCapsules, 
    comingSoonCapsules 
  } = storeToRefs(store);
  const checkInterval = ref<number | null>(null);

  async function loadData() {
    await store.loadCapsules();
  }

  async function checkScheduled() {
    const newly = await store.checkScheduledCapsules();
    return newly;
  }

  function startAutoCheck() {
    if (checkInterval.value) return;
    checkInterval.value = window.setInterval(() => {
      checkScheduled();
    }, 60 * 1000);
  }

  function stopAutoCheck() {
    if (checkInterval.value) {
      clearInterval(checkInterval.value);
      checkInterval.value = null;
    }
  }

  onMounted(() => {
    loadData();
    startAutoCheck();
  });

  onUnmounted(() => {
    stopAutoCheck();
  });

  return {
    capsules,
    stats,
    loading,
    newlyOpened,
    pendingCapsules,
    openedCapsules,
    comingSoonCapsules,
    loadCapsules: store.loadCapsules,
    createCapsule: store.createCapsule,
    updateCapsule: store.updateCapsule,
    deleteCapsule: store.deleteCapsule,
    getCapsuleById: store.getCapsuleById,
    checkScheduledCapsules: store.checkScheduledCapsules,
    clearNewlyOpened: store.clearNewlyOpened,
    getCapsulesByCategory: store.getCapsulesByCategory,
    loadData,
    checkScheduled,
  };
}

export function useCountdown(openAt: string) {
  const countdown = ref(getCountdown(openAt));
  const formatted = ref(formatCountdown(countdown.value));
  let interval: number | null = null;

  function update() {
    countdown.value = getCountdown(openAt);
    formatted.value = formatCountdown(countdown.value);
  }

  function start() {
    update();
    if (interval) clearInterval(interval);
    interval = window.setInterval(update, 1000);
  }

  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  onMounted(start);
  onUnmounted(stop);

  return {
    countdown,
    formatted,
    start,
    stop,
  };
}

export function useCapsuleOperation() {
  const store = useCapsulesStore();
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function createCapsule(data: Omit<Capsule, 'id' | 'createdAt' | 'isOpened'>) {
    loading.value = true;
    error.value = null;
    try {
      return await store.createCapsule(data);
    } catch (e) {
      error.value = '创建胶囊失败，请重试';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCapsule(id: string) {
    loading.value = true;
    error.value = null;
    try {
      return await store.deleteCapsule(id);
    } catch (e) {
      error.value = '删除胶囊失败，请重试';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function openCapsule(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const capsule = await store.getCapsuleById(id);
      if (capsule && !capsule.isOpened) {
        return await store.updateCapsule(id, { isOpened: true });
      }
      return capsule;
    } catch (e) {
      error.value = '打开胶囊失败，请重试';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    createCapsule,
    deleteCapsule,
    openCapsule,
  };
}
