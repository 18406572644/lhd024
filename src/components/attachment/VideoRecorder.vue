<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Video as VideoIcon, Square, Play, Pause, RotateCcw, Check, X, Maximize2 } from 'lucide-vue-next';
import { ATTACHMENT_LIMITS } from '../../types';
import { formatDuration, formatFileSize } from '../../utils/attachmentStorage';

const emit = defineEmits<{
  (e: 'save', file: File, duration: number): void;
  (e: 'cancel'): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isRecording = ref(false);
const isPlaying = ref(false);
const recordingTime = ref(0);
const videoUrl = ref<string | null>(null);
const recordedBlob = ref<Blob | null>(null);
const playbackTime = ref(0);
const playbackDuration = ref(0);

let mediaRecorder: MediaRecorder | null = null;
let videoChunks: Blob[] = [];
let recordingTimer: number | null = null;
let stream: MediaStream | null = null;
let videoElement: HTMLVideoElement | null = null;

const maxDuration = ATTACHMENT_LIMITS.MAX_VIDEO_DURATION;
const isMaxDuration = computed(() => recordingTime.value >= maxDuration);
const progressPercentage = computed(() => (recordingTime.value / maxDuration) * 100);
const playbackProgress = computed(() => 
  playbackDuration.value > 0 ? (playbackTime.value / playbackDuration.value) * 100 : 0
);

async function startRecording() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      }
    });

    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      videoRef.value.muted = true;
      videoRef.value.play();
    }

    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'];
    const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
    
    mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 2500000 } : undefined);
    videoChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        videoChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(videoChunks, { type: mimeType || 'video/webm' });
      recordedBlob.value = blob;
      videoUrl.value = URL.createObjectURL(blob);
      
      videoElement = document.createElement('video');
      videoElement.src = videoUrl.value;
      videoElement.onloadedmetadata = () => {
        playbackDuration.value = videoElement!.duration;
      };
    };

    mediaRecorder.start(100);
    isRecording.value = true;
    recordingTime.value = 0;

    recordingTimer = window.setInterval(() => {
      recordingTime.value++;
      if (isMaxDuration.value) {
        stopRecording();
      }
    }, 1000);
  } catch (error) {
    console.error('Failed to start recording:', error);
    alert('无法访问摄像头，请检查权限设置');
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    isRecording.value = false;
    
    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    
    if (videoRef.value) {
      videoRef.value.srcObject = null;
    }
  }
}

function togglePlayback() {
  if (!videoElement) return;
  
  if (isPlaying.value) {
    videoElement.pause();
    isPlaying.value = false;
  } else {
    videoElement.play();
    isPlaying.value = true;
    
    const updateTime = () => {
      if (videoElement && isPlaying.value) {
        playbackTime.value = videoElement.currentTime;
        requestAnimationFrame(updateTime);
      }
    };
    updateTime();
  }
  
  videoElement.onended = () => {
    isPlaying.value = false;
    playbackTime.value = 0;
  };
}

function reRecord() {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
    videoUrl.value = null;
  }
  if (videoElement) {
    videoElement.pause();
    videoElement = null;
  }
  recordedBlob.value = null;
  recordingTime.value = 0;
  playbackTime.value = 0;
  playbackDuration.value = 0;
  isPlaying.value = false;
}

function handleSave() {
  if (!recordedBlob.value || recordingTime.value < 1) {
    alert('视频时间太短，请至少录制1秒');
    return;
  }
  
  const file = new File(
    [recordedBlob.value], 
    `video-${Date.now()}.webm`, 
    { type: recordedBlob.value.type }
  );
  
  emit('save', file, recordingTime.value);
  cleanup();
}

function handleCancel() {
  cleanup();
  emit('cancel');
}

function openFullscreenPreview() {
  if (videoUrl.value) {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<video src="${videoUrl.value}" controls autoplay style="max-width:100%;max-height:90vh" />`);
    }
  }
}

function handlePlaybackSeek(e: MouseEvent) {
  if (videoElement) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoElement.currentTime = percent * playbackDuration.value;
    playbackTime.value = videoElement.currentTime;
  }
}

function cleanup() {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }
  if (videoElement) {
    videoElement.pause();
    videoElement = null;
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  if (recordingTimer) {
    clearInterval(recordingTimer);
  }
}

onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <div class="bg-white rounded-2xl p-6 space-y-6">
    <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800 flex items-center gap-2">
      <VideoIcon class="w-5 h-5 text-sky-blue-400" />
      录制短视频
      <span class="text-xs text-warm-gray-400 font-normal">
        (最长 {{ maxDuration }} 秒)
      </span>
    </h3>

    <div v-if="!recordedBlob" class="space-y-6">
      <div class="relative aspect-video bg-warm-gray-900 rounded-2xl overflow-hidden">
        <video
          v-if="isRecording"
          ref="videoRef"
          class="w-full h-full object-cover"
          autoplay
          muted
          playsinline
        />
        <div v-else class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="w-20 h-20 rounded-full bg-sky-blue-100 flex items-center justify-center mb-4">
            <VideoIcon class="w-10 h-10 text-sky-blue-400" />
          </div>
          <p class="text-warm-gray-400 text-sm">点击下方按钮开始录制</p>
        </div>

        <div v-if="isRecording" class="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span class="text-white text-sm font-medium">
            {{ formatDuration(recordingTime) }}
          </span>
        </div>
      </div>

      <div v-if="isRecording" class="space-y-2">
        <div class="flex justify-between text-xs text-warm-gray-500">
          <span>已录制</span>
          <span>{{ formatDuration(recordingTime) }} / {{ formatDuration(maxDuration) }}</span>
        </div>
        <div class="h-2 bg-warm-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-sky-blue-400 to-lavender-400 transition-all duration-300"
            :style="{ width: progressPercentage + '%' }"
          />
        </div>
      </div>

      <div class="flex justify-center gap-4">
        <button
          v-if="!isRecording"
          @click="startRecording"
          class="px-8 py-3 rounded-full bg-gradient-to-r from-sky-blue-400 to-lavender-400 text-white shadow-soft hover:shadow-lg transition-all flex items-center gap-2 font-medium"
        >
          <VideoIcon class="w-5 h-5" />
          开始录制
        </button>

        <button
          v-else
          @click="stopRecording"
          class="px-8 py-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all flex items-center gap-2 font-medium"
        >
          <Square class="w-5 h-5" />
          结束录制
        </button>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="space-y-4">
        <div class="relative aspect-video bg-warm-gray-900 rounded-2xl overflow-hidden group">
          <video
            v-if="videoUrl"
            :src="videoUrl"
            class="w-full h-full object-contain"
            :muted="!isPlaying"
            :autoplay="false"
            playsinline
          />
          
          <button
            v-if="!isPlaying"
            @click="togglePlayback"
            class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
          >
            <div class="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play class="w-10 h-10 text-white ml-1" />
            </div>
          </button>

          <button
            v-if="isPlaying"
            @click="togglePlayback"
            class="absolute bottom-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pause class="w-5 h-5" />
          </button>

          <div class="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
            <span class="text-white text-sm">
              {{ formatDuration(playbackTime) }} / {{ formatDuration(playbackDuration) }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between p-4 bg-warm-gray-50 rounded-2xl">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-sky-blue-100 flex items-center justify-center">
              <VideoIcon class="w-6 h-6 text-sky-blue-400" />
            </div>
            <div>
              <p class="font-medium text-warm-gray-800">短视频</p>
              <p class="text-sm text-warm-gray-500">
                时长 {{ formatDuration(recordingTime) }} · 
                {{ formatFileSize(recordedBlob.size) }}
              </p>
            </div>
          </div>
          <button
            @click="openFullscreenPreview"
            class="p-2 rounded-full hover:bg-warm-gray-200 text-warm-gray-500 transition-colors"
            title="全屏预览"
          >
            <Maximize2 class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-2">
          <div class="h-2 bg-warm-gray-100 rounded-full overflow-hidden cursor-pointer" @click="handlePlaybackSeek">
            <div
              class="h-full bg-gradient-to-r from-sky-blue-400 to-lavender-400 transition-all duration-100"
              :style="{ width: playbackProgress + '%' }"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-3">
        <button
          @click="reRecord"
          class="px-6 py-2.5 rounded-full bg-warm-gray-100 text-warm-gray-600 hover:bg-warm-gray-200 transition-all flex items-center gap-2 font-medium"
        >
          <RotateCcw class="w-4 h-4" />
          重新录制
        </button>
        <button
          @click="handleCancel"
          class="px-6 py-2.5 rounded-full border border-warm-gray-200 text-warm-gray-600 hover:bg-warm-gray-50 transition-all flex items-center gap-2 font-medium"
        >
          <X class="w-4 h-4" />
          取消
        </button>
        <button
          @click="handleSave"
          class="px-6 py-2.5 rounded-full bg-gradient-to-r from-mint-green-400 to-sky-blue-400 text-white shadow-soft hover:shadow-lg transition-all flex items-center gap-2 font-medium"
        >
          <Check class="w-4 h-4" />
          使用此视频
        </button>
      </div>
    </div>
  </div>
</template>
