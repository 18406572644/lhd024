<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-vue-next';
import type { Attachment } from '../../types';
import { getAttachmentDataUrl, formatDuration } from '../../utils/attachmentStorage';

const props = defineProps<{
  attachment: Attachment;
}>();

const audioRef = ref<HTMLAudioElement | null>(null);
const audioUrl = ref<string | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isMuted = ref(false);
const volume = ref(1);
const loading = ref(true);

const progress = computed(() => 
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
);

const formattedCurrentTime = computed(() => formatDuration(currentTime.value));
const formattedDuration = computed(() => formatDuration(duration.value || props.attachment.duration || 0));

onMounted(async () => {
  await loadAudio();
});

async function loadAudio() {
  loading.value = true;
  const url = await getAttachmentDataUrl(props.attachment.id);
  if (url) {
    audioUrl.value = url;
  }
  loading.value = false;
}

function handleTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime;
  }
}

function handleLoadedMetadata() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration;
  }
}

function handleEnded() {
  isPlaying.value = false;
  currentTime.value = 0;
  if (audioRef.value) {
    audioRef.value.currentTime = 0;
  }
}

function togglePlay() {
  if (!audioRef.value) return;
  
  if (isPlaying.value) {
    audioRef.value.pause();
    isPlaying.value = false;
  } else {
    audioRef.value.play();
    isPlaying.value = true;
  }
}

function handleSeek(e: MouseEvent) {
  if (!audioRef.value || !duration.value) return;
  
  const target = e.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const newTime = percent * duration.value;
  
  audioRef.value.currentTime = newTime;
  currentTime.value = newTime;
}

function toggleMute() {
  if (!audioRef.value) return;
  
  isMuted.value = !isMuted.value;
  audioRef.value.muted = isMuted.value;
}

function handleVolumeChange(e: Event) {
  const target = e.target as HTMLInputElement;
  volume.value = parseFloat(target.value);
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
  }
  if (volume.value > 0) {
    isMuted.value = false;
  }
}

function downloadAudio() {
  if (audioUrl.value) {
    const a = document.createElement('a');
    a.href = audioUrl.value;
    a.download = props.attachment.name || 'audio.webm';
    a.click();
  }
}

watch(() => props.attachment.id, async () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
  await loadAudio();
});

onUnmounted(() => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});
</script>

<template>
  <div class="bg-white rounded-2xl p-4 shadow-soft border border-warm-gray-100">
    <div class="flex items-center gap-4">
      <button
        @click="togglePlay"
        :disabled="loading || !audioUrl"
        class="w-14 h-14 rounded-full bg-gradient-to-r from-soft-pink-400 to-cream-yellow-400 text-white shadow-soft hover:shadow-lg transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-50"
      >
        <div v-if="loading" class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <Play v-else-if="!isPlaying" class="w-6 h-6 ml-1" />
        <Pause v-else class="w-6 h-6" />
      </button>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-2">
          <p class="font-medium text-warm-gray-800 text-sm truncate">{{ attachment.name }}</p>
          <span class="text-xs text-warm-gray-400 flex-shrink-0">
            {{ formattedCurrentTime }} / {{ formattedDuration }}
          </span>
        </div>

        <div
          class="relative h-2 bg-warm-gray-100 rounded-full overflow-hidden cursor-pointer group"
          @click="handleSeek"
        >
          <div
            class="h-full bg-gradient-to-r from-soft-pink-400 to-cream-yellow-400 transition-all duration-100"
            :style="{ width: progress + '%' }"
          />
          <div
            class="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            :style="{ left: 'calc(' + progress + '% - 8px)' }"
          />
        </div>
      </div>

      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          @click="toggleMute"
          class="p-2 rounded-full hover:bg-warm-gray-100 text-warm-gray-500 transition-colors"
        >
          <VolumeX v-if="isMuted || volume === 0" class="w-5 h-5" />
          <Volume2 v-else class="w-5 h-5" />
        </button>
        <input
          v-if="!isMuted"
          type="range"
          min="0"
          max="1"
          step="0.1"
          :value="volume"
          @input="handleVolumeChange"
          class="w-20 accent-soft-pink-400"
        />
        <button
          @click="downloadAudio"
          class="p-2 rounded-full hover:bg-warm-gray-100 text-warm-gray-500 transition-colors"
          title="下载"
        >
          <Download class="w-5 h-5" />
        </button>
      </div>
    </div>

    <audio
      ref="audioRef"
      v-if="audioUrl"
      :src="audioUrl"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @ended="handleEnded"
      preload="metadata"
    />
  </div>
</template>
