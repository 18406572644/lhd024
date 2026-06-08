import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Capsule, CapsuleStats, CapsuleCategory, Attachment } from '../types';
import * as api from '../utils/api';

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

  return {
    capsules,
    stats,
    loading,
    newlyOpened,
    pendingCapsules,
    openedCapsules,
    comingSoonCapsules,
    getCapsulesByCategory,
    loadCapsules,
    loadStats,
    getCapsuleById,
    createCapsule,
    updateCapsule,
    deleteCapsule,
    checkScheduledCapsules,
    clearNewlyOpened,
  };
});
