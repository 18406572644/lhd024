import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Settings } from '../types';
import * as api from '../utils/api';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({
    id: '',
    hasPassword: false,
    passwordHash: '',
    theme: 'soft',
    autoLock: false,
    autoLockTime: 5,
  });
  const isUnlocked = ref(false);
  const loading = ref(false);

  const hasPassword = computed(() => settings.value.hasPassword);

  async function loadSettings() {
    loading.value = true;
    try {
      settings.value = await api.getSettings();
      if (!settings.value.hasPassword) {
        isUnlocked.value = true;
      }
    } finally {
      loading.value = false;
    }
  }

  async function updateSettings(data: Partial<Settings>) {
    settings.value = await api.updateSettings(data);
    return settings.value;
  }

  async function verifyPassword(password: string) {
    const valid = await api.verifyPassword(password);
    if (valid) {
      isUnlocked.value = true;
    }
    return valid;
  }

  async function setPassword(password: string) {
    const success = await api.setPassword(password);
    if (success) {
      settings.value.hasPassword = true;
      isUnlocked.value = true;
    }
    return success;
  }

  async function removePassword() {
    const success = await api.removePassword();
    if (success) {
      settings.value.hasPassword = false;
      settings.value.passwordHash = '';
    }
    return success;
  }

  function lock() {
    isUnlocked.value = false;
  }

  return {
    settings,
    isUnlocked,
    loading,
    hasPassword,
    loadSettings,
    updateSettings,
    verifyPassword,
    setPassword,
    removePassword,
    lock,
  };
});
