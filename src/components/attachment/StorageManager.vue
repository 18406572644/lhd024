<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { HardDrive, Image, Mic, Video, Trash2, AlertTriangle, RefreshCw, Check } from 'lucide-vue-next';
import type { StorageStats } from '../../types';
import { getStorageStats, clearAllAttachments, clearOrphanedAttachments, formatFileSize } from '../../utils/attachmentStorage';
import * as api from '../../utils/api';

const stats = ref<StorageStats | null>(null);
const loading = ref(false);
const showClearConfirm = ref(false);
const showOrphanedConfirm = ref(false);
const orphanedCount = ref(0);
const actionSuccess = ref('');

const usageColor = computed(() => {
  if (!stats.value) return 'bg-warm-gray-200';
  const percent = stats.value.usagePercentage;
  if (percent >= 90) return 'bg-red-400';
  if (percent >= 70) return 'bg-amber-400';
  return 'bg-gradient-to-r from-soft-pink-400 to-cream-yellow-400';
});

const isNearLimit = computed(() => stats.value && stats.value.usagePercentage >= 80);

async function loadStats() {
  loading.value = true;
  try {
    stats.value = await getStorageStats();
  } catch (error) {
    console.error('Failed to load storage stats:', error);
  } finally {
    loading.value = false;
  }
}

async function checkOrphanedAttachments() {
  try {
    const capsules = await api.getCapsules();
    const validIds = capsules.map(c => c.id);
    const count = await clearOrphanedAttachments(validIds);
    orphanedCount.value = count;
    showOrphanedConfirm.value = true;
  } catch (error) {
    console.error('Failed to check orphaned attachments:', error);
  }
}

async function cleanOrphanedAttachments() {
  try {
    const capsules = await api.getCapsules();
    const validIds = capsules.map(c => c.id);
    const deleted = await clearOrphanedAttachments(validIds);
    
    showSuccess(`已清理 ${deleted} 个孤立附件`);
    showOrphanedConfirm.value = false;
    await loadStats();
  } catch (error) {
    console.error('Failed to clean orphaned attachments:', error);
  }
}

async function handleClearAll() {
  try {
    const success = await clearAllAttachments();
    if (success) {
      showSuccess('已清理所有附件');
      showClearConfirm.value = false;
      await loadStats();
    }
  } catch (error) {
    console.error('Failed to clear attachments:', error);
  }
}

function showSuccess(message: string) {
  actionSuccess.value = message;
  setTimeout(() => {
    actionSuccess.value = '';
  }, 3000);
}

onMounted(async () => {
  await loadStats();
  await checkOrphanedAttachments();
});
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-soft border border-warm-gray-100 space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800 flex items-center gap-2">
        <HardDrive class="w-5 h-5 text-lavender-400" />
        存储空间管理
      </h3>
      <button
        @click="loadStats"
        :disabled="loading"
        class="p-2 rounded-full hover:bg-warm-gray-100 text-warm-gray-500 transition-colors disabled:opacity-50"
        title="刷新"
      >
        <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': loading }" />
      </button>
    </div>

    <Transition name="fade">
      <div 
        v-if="actionSuccess" 
        class="flex items-center gap-2 p-3 bg-mint-green-50 text-mint-green-700 rounded-xl text-sm"
      >
        <Check class="w-4 h-4" />
        {{ actionSuccess }}
      </div>
    </Transition>

    <div v-if="stats" class="space-y-4">
      <div v-if="isNearLimit" class="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
        <AlertTriangle class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-medium text-amber-700">存储空间即将用尽</p>
          <p class="text-sm text-amber-600 mt-1">
            已使用 {{ stats.usagePercentage.toFixed(1) }}% 的存储空间，建议清理不需要的附件。
          </p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-warm-gray-600">已使用空间</span>
          <span class="font-medium text-warm-gray-800">
            {{ formatFileSize(stats.usedSize) }} / {{ formatFileSize(stats.totalSize) }}
          </span>
        </div>
        <div class="h-3 bg-warm-gray-100 rounded-full overflow-hidden">
          <div
            :class="[usageColor, 'h-full transition-all duration-500 rounded-full']"
            :style="{ width: stats.usagePercentage + '%' }"
          />
        </div>
        <div class="flex justify-between text-xs text-warm-gray-400">
          <span>剩余 {{ formatFileSize(stats.availableSize) }}</span>
          <span>{{ stats.usagePercentage.toFixed(1) }}%</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 pt-4">
        <div class="text-center p-4 bg-soft-pink-50 rounded-xl">
          <div class="w-12 h-12 rounded-full bg-soft-pink-100 flex items-center justify-center mx-auto mb-2">
            <Image class="w-6 h-6 text-soft-pink-500" />
          </div>
          <p class="text-2xl font-bold text-warm-gray-800">{{ stats.imageCount }}</p>
          <p class="text-xs text-warm-gray-500">图片</p>
        </div>
        <div class="text-center p-4 bg-cream-yellow-50 rounded-xl">
          <div class="w-12 h-12 rounded-full bg-cream-yellow-100 flex items-center justify-center mx-auto mb-2">
            <Mic class="w-6 h-6 text-cream-yellow-600" />
          </div>
          <p class="text-2xl font-bold text-warm-gray-800">{{ stats.audioCount }}</p>
          <p class="text-xs text-warm-gray-500">语音</p>
        </div>
        <div class="text-center p-4 bg-sky-blue-50 rounded-xl">
          <div class="w-12 h-12 rounded-full bg-sky-blue-100 flex items-center justify-center mx-auto mb-2">
            <Video class="w-6 h-6 text-sky-blue-500" />
          </div>
          <p class="text-2xl font-bold text-warm-gray-800">{{ stats.videoCount }}</p>
          <p class="text-xs text-warm-gray-500">视频</p>
        </div>
      </div>

      <div class="pt-4 space-y-3">
        <div v-if="orphanedCount > 0" class="p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium text-amber-700 flex items-center gap-2">
                <AlertTriangle class="w-4 h-4" />
                发现 {{ orphanedCount }} 个孤立附件
              </p>
              <p class="text-sm text-amber-600 mt-1">
                这些附件没有关联的胶囊，可以安全删除以释放空间。
              </p>
            </div>
            <button
              @click="showOrphanedConfirm = true"
              class="px-3 py-1.5 rounded-full text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors flex-shrink-0"
            >
              清理
            </button>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="showClearConfirm = true"
            class="flex-1 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Trash2 class="w-4 h-4" />
            清理所有附件
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-soft-pink-200 border-t-soft-pink-400 rounded-full animate-spin" />
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="showClearConfirm" 
          class="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900/50 backdrop-blur-sm p-4"
        >
          <div class="bg-white rounded-2xl p-6 max-w-md w-full animate-scale-in shadow-soft">
            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle class="w-8 h-8 text-red-500" />
            </div>
            <h3 class="text-xl font-semibold text-warm-gray-800 text-center mb-2">
              确认清理所有附件？
            </h3>
            <p class="text-warm-gray-500 text-center mb-6">
              此操作将删除所有已上传的图片、语音和视频附件，且无法恢复。
              胶囊的文字内容不会受到影响。
            </p>
            <div class="flex gap-3">
              <button
                @click="showClearConfirm = false"
                class="flex-1 px-4 py-2.5 rounded-full bg-warm-gray-100 text-warm-gray-600 hover:bg-warm-gray-200 transition-colors font-medium"
              >
                取消
              </button>
              <button
                @click="handleClearAll"
                class="flex-1 px-4 py-2.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
              >
                确认清理
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="fade">
        <div 
          v-if="showOrphanedConfirm" 
          class="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900/50 backdrop-blur-sm p-4"
        >
          <div class="bg-white rounded-2xl p-6 max-w-md w-full animate-scale-in shadow-soft">
            <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 class="w-8 h-8 text-amber-500" />
            </div>
            <h3 class="text-xl font-semibold text-warm-gray-800 text-center mb-2">
              清理孤立附件
            </h3>
            <p class="text-warm-gray-500 text-center mb-6">
              将删除 {{ orphanedCount }} 个没有关联胶囊的附件，释放存储空间。
              此操作不会影响现有的胶囊内容。
            </p>
            <div class="flex gap-3">
              <button
                @click="showOrphanedConfirm = false"
                class="flex-1 px-4 py-2.5 rounded-full bg-warm-gray-100 text-warm-gray-600 hover:bg-warm-gray-200 transition-colors font-medium"
              >
                取消
              </button>
              <button
                @click="cleanOrphanedAttachments"
                class="flex-1 px-4 py-2.5 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors font-medium"
              >
                确认清理
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
