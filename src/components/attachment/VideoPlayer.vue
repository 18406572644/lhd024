<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Play, Pause, Maximize2, Volume2, VolumeX, Download } from 'lucide-vue-next';
import type { Attachment } from '../../types';
import { getAttachmentDataUrl, formatDuration } from '../../utils/attachmentStorage';

const props = defineProps<{
  attachment: Attachment;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const videoUrl = ref<string | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isMuted = ref(true);
const volume = ref(1);
const loading = ref(true);
const isFullscreen = ref(false);
const showControls = ref(true);
let controlsTimeout: number | null = null;

const progress = computed(() => 
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
);

const formattedCurrentTime = computed(() => formatDuration(currentTime.value));
const formattedDuration = computed(() => formatDuration(duration.value || props.attachment.duration || 0));

onMounted(async () => {
  await loadVideo();
});

async function loadVideo() {
  loading.value = true;
  const url = await getAttachmentDataUrl(props.attachment.id);
  if (url) {
    videoUrl.value = url;
  }
  loading.value = false;
}

function handleTimeUpdate() {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime;
  }
}

function handleLoadedMetadata() {
  if (videoRef.value) {
    duration.value = videoRef.value.duration;
  }
}

function handleEnded() {
  isPlaying.value = false;
  currentTime.value = 0;
  showControls.value = true;
  if (videoRef.value) {
    videoRef.value.currentTime = 0;
  }
}

function togglePlay() {
  if (!videoRef.value) return;
  
  if (isPlaying.value) {
    videoRef.value.pause();
    isPlaying.value = false;
    showControls.value = true;
  } else {
    videoRef.value.play();
    isPlaying.value = true;
    resetControlsTimeout();
  }
}

function handleSeek(e: MouseEvent) {
  if (!videoRef.value || !duration.value) return;
  
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const newTime = percent * duration.value;
  
  videoRef.value.currentTime = newTime;
  currentTime.value = newTime;
}

function toggleMute() {
  if (!videoRef.value) return;
  
  isMuted.value = !isMuted.value;
  videoRef.value.muted = isMuted.value;
  resetControlsTimeout();
}

function handleVolumeChange(e: Event) {
  const target = e.target as HTMLInputElement;
  volume.value = parseFloat(target.value);
  if (videoRef.value) {
    videoRef.value.volume = volume.value;
  }
  if (volume.value > 0) {
    isMuted.value = false;
    if (videoRef.value) {
      videoRef.value.muted = false;
    }
  }
  resetControlsTimeout();
}

function toggleFullscreen() {
  if (!containerRef.value) return;
  
  if (!document.fullscreenElement) {
    containerRef.value.requestFullscreen();
    isFullscreen.value = true;
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
  resetControlsTimeout();
}

function downloadVideo() {
  if (videoUrl.value) {
    const a = document.createElement('a');
    a.href = videoUrl.value;
    a.download = props.attachment.name || 'video.webm';
    a.click();
  }
}

function resetControlsTimeout() {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
  }
  showControls.value = true;
  if (isPlaying.value) {
    controlsTimeout = window.setTimeout(() => {
      showControls.value = false;
    }, 3000);
  }
}

function handleMouseMove() {
  resetControlsTimeout();
}

function handlePlayClick() {
  togglePlay();
}

watch(() => props.attachment.id, async () => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }
  await loadVideo();
});

onUnmounted(() => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
  }
});
</script>

<template>
  <div 
    ref="containerRef"
    class="relative bg-warm-gray-900 rounded-2xl overflow-hidden group"
    @mousemove="handleMouseMove"
  >
    <div class="relative aspect-video">
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>

      <video
        v-if="videoUrl"
        ref="videoRef"
        :src="videoUrl"
        class="w-full h-full object-contain"
        :muted="isMuted"
        :volume="volume"
        playsinline
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @ended="handleEnded"
        @click="handlePlayClick"
        preload="metadata"
      />

      <button
        v-if="!isPlaying && !loading"
        @click="handlePlayClick"
        class="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors"
      >
        <div class="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
          <Play class="w-10 h-10 text-white ml-1" />
        </div>
      </button>

      <Transition name="fade">
        <div 
          v-if="showControls || !isPlaying"
          class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4"
        >
          <div class="space-y-3">
            <div
              class="relative h-1.5 bg-white/30 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all"
              @click="handleSeek"
            >
              <div
                class="h-full bg-white transition-all duration-100"
                :style="{ width: progress + '%' }"
              />
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <button
                  @click="togglePlay"
                  class="text-white hover:text-soft-pink-300 transition-colors"
                >
                  <Play v-if="!isPlaying" class="w-6 h-6" />
                  <Pause v-else class="w-6 h-6" />
                </button>

                <span class="text-white/80 text-sm">
                  {{ formattedCurrentTime }} / {{ formattedDuration }}
                </span>

                <div class="flex items-center gap-2">
                  <button
                    @click="toggleMute"
                    class="text-white/80 hover:text-white transition-colors"
                  >
                    <VolumeX v-if="isMuted || volume === 0" class="w-5 h-5" />
                    <Volume2 v-else class="w-5 h-5" />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    :value="isMuted ? 0 : volume"
                    @input="handleVolumeChange"
                    class="w-20 accent-white"
                  />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="downloadVideo"
                  class="p-2 text-white/80 hover:text-white transition-colors"
                  title="下载"
                >
                  <Download class="w-5 h-5" />
                </button>
                <button
                  @click="toggleFullscreen"
                  class="p-2 text-white/80 hover:text-white transition-colors"
                  title="全屏"
                >
                  <Maximize2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
