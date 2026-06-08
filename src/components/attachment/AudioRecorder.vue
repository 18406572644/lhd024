<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Mic, Square, Play, Pause, RotateCcw, Check, X, Volume2 } from 'lucide-vue-next';
import { ATTACHMENT_LIMITS } from '../../types';
import { formatDuration, formatFileSize } from '../../utils/attachmentStorage';

const emit = defineEmits<{
  (e: 'save', file: File, duration: number): void;
  (e: 'cancel'): void;
}>();

const isRecording = ref(false);
const isPaused = ref(false);
const isPlaying = ref(false);
const recordingTime = ref(0);
const audioUrl = ref<string | null>(null);
const recordedBlob = ref<Blob | null>(null);
const waveformData = ref<number[]>([]);
const playbackTime = ref(0);
const playbackDuration = ref(0);

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingTimer: number | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let animationFrame: number | null = null;
let audioElement: HTMLAudioElement | null = null;
let stream: MediaStream | null = null;

const maxDuration = ATTACHMENT_LIMITS.MAX_AUDIO_DURATION;
const isMaxDuration = computed(() => recordingTime.value >= maxDuration);
const progressPercentage = computed(() => (recordingTime.value / maxDuration) * 100);
const playbackProgress = computed(() => 
  playbackDuration.value > 0 ? (playbackTime.value / playbackDuration.value) * 100 : 0
);

async function startRecording() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      } 
    });

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4'];
    const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
    
    mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
      recordedBlob.value = blob;
      audioUrl.value = URL.createObjectURL(blob);
      
      audioElement = new Audio(audioUrl.value);
      audioElement.onloadedmetadata = () => {
        playbackDuration.value = audioElement!.duration;
      };
      audioElement.ontimeupdate = () => {
        playbackTime.value = audioElement!.currentTime;
      };
      audioElement.onended = () => {
        isPlaying.value = false;
        playbackTime.value = 0;
      };
    };

    mediaRecorder.start(100);
    isRecording.value = true;
    isPaused.value = false;
    recordingTime.value = 0;
    waveformData.value = [];

    recordingTimer = window.setInterval(() => {
      recordingTime.value++;
      if (isMaxDuration.value) {
        stopRecording();
      }
    }, 1000);

    drawWaveform();
  } catch (error) {
    console.error('Failed to start recording:', error);
    alert('无法访问麦克风，请检查权限设置');
  }
}

function drawWaveform() {
  if (!analyser) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  const updateWaveform = () => {
    if (!analyser || !isRecording.value) return;
    
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    const normalized = average / 255;
    
    waveformData.value.push(normalized);
    if (waveformData.value.length > 100) {
      waveformData.value = waveformData.value.slice(-100);
    }
    
    animationFrame = requestAnimationFrame(updateWaveform);
  };
  
  updateWaveform();
}

function pauseRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
    isPaused.value = true;
    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }
  }
}

function resumeRecording() {
  if (mediaRecorder && mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
    isPaused.value = false;
    recordingTimer = window.setInterval(() => {
      recordingTime.value++;
      if (isMaxDuration.value) {
        stopRecording();
      }
    }, 1000);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    isRecording.value = false;
    isPaused.value = false;
    
    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  }
}

function togglePlayback() {
  if (!audioElement) return;
  
  if (isPlaying.value) {
    audioElement.pause();
    isPlaying.value = false;
  } else {
    audioElement.play();
    isPlaying.value = true;
  }
}

function reRecord() {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = null;
  }
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }
  recordedBlob.value = null;
  recordingTime.value = 0;
  playbackTime.value = 0;
  playbackDuration.value = 0;
  waveformData.value = [];
  isPlaying.value = false;
}

function handleSave() {
  if (!recordedBlob.value || recordingTime.value < 1) {
    alert('录音时间太短，请至少录制1秒');
    return;
  }
  
  const file = new File(
    [recordedBlob.value], 
    `voice-${Date.now()}.webm`, 
    { type: recordedBlob.value.type }
  );
  
  emit('save', file, recordingTime.value);
  cleanup();
}

function handleCancel() {
  cleanup();
  emit('cancel');
}

function cleanup() {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  if (audioContext) {
    audioContext.close();
  }
  if (recordingTimer) {
    clearInterval(recordingTimer);
  }
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
}

onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <div class="bg-white rounded-2xl p-6 space-y-6">
    <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800 flex items-center gap-2">
      <Mic class="w-5 h-5 text-soft-pink-400" />
      录制语音
      <span class="text-xs text-warm-gray-400 font-normal">
        (最长 {{ Math.floor(maxDuration / 60) }} 分钟)
      </span>
    </h3>

    <div v-if="!recordedBlob" class="space-y-6">
      <div class="relative h-32 bg-gradient-to-r from-warm-gray-50 to-soft-pink-50 rounded-2xl overflow-hidden flex items-center justify-center">
        <div v-if="isRecording" class="absolute inset-0 flex items-end justify-center gap-0.5 px-4 pb-4">
          <div
            v-for="(height, index) in waveformData"
            :key="index"
            class="w-1.5 bg-gradient-to-t from-soft-pink-400 to-cream-yellow-400 rounded-full transition-all duration-75"
            :style="{ height: Math.max(8, height * 100) + '%' }"
          />
        </div>

        <div v-else class="text-center">
          <div class="w-16 h-16 rounded-full bg-soft-pink-100 flex items-center justify-center mx-auto mb-3">
            <Mic class="w-8 h-8 text-soft-pink-400" />
          </div>
          <p class="text-warm-gray-500 text-sm">点击下方按钮开始录制</p>
        </div>

        <div class="absolute top-3 right-3 flex items-center gap-2">
          <div v-if="isRecording" class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span class="text-sm text-warm-gray-600 font-medium">
              {{ formatDuration(recordingTime) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="isRecording" class="space-y-2">
        <div class="flex justify-between text-xs text-warm-gray-500">
          <span>已录制</span>
          <span>{{ formatDuration(recordingTime) }} / {{ formatDuration(maxDuration) }}</span>
        </div>
        <div class="h-2 bg-warm-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-soft-pink-400 to-cream-yellow-400 transition-all duration-300"
            :style="{ width: progressPercentage + '%' }"
          />
        </div>
      </div>

      <div class="flex justify-center gap-4">
        <button
          v-if="!isRecording"
          @click="startRecording"
          class="px-8 py-3 rounded-full bg-gradient-to-r from-soft-pink-400 to-cream-yellow-400 text-white shadow-soft hover:shadow-lg transition-all flex items-center gap-2 font-medium"
        >
          <Mic class="w-5 h-5" />
          开始录制
        </button>

        <template v-else>
          <button
            v-if="!isPaused"
            @click="pauseRecording"
            class="px-6 py-3 rounded-full bg-warm-gray-100 text-warm-gray-600 hover:bg-warm-gray-200 transition-all flex items-center gap-2 font-medium"
          >
            <Pause class="w-5 h-5" />
            暂停
          </button>
          <button
            v-else
            @click="resumeRecording"
            class="px-6 py-3 rounded-full bg-mint-green-100 text-mint-green-600 hover:bg-mint-green-200 transition-all flex items-center gap-2 font-medium"
          >
            <Play class="w-5 h-5" />
            继续
          </button>
          <button
            @click="stopRecording"
            class="px-6 py-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all flex items-center gap-2 font-medium"
          >
            <Square class="w-5 h-5" />
            结束
          </button>
        </template>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-warm-gray-50 rounded-2xl">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-soft-pink-100 flex items-center justify-center">
              <Volume2 class="w-6 h-6 text-soft-pink-400" />
            </div>
            <div>
              <p class="font-medium text-warm-gray-800">语音录音</p>
              <p class="text-sm text-warm-gray-500">
                时长 {{ formatDuration(recordingTime) }} · 
                {{ formatFileSize(recordedBlob.size) }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-xs text-warm-gray-500">
            <span>{{ formatDuration(playbackTime) }}</span>
            <span>{{ formatDuration(playbackDuration) }}</span>
          </div>
          <div class="h-2 bg-warm-gray-100 rounded-full overflow-hidden cursor-pointer" @click="(e) => {
            if (audioElement) {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              audioElement.currentTime = percent * playbackDuration;
            }
          }">
            <div
              class="h-full bg-gradient-to-r from-soft-pink-400 to-cream-yellow-400 transition-all duration-100"
              :style="{ width: playbackProgress + '%' }"
            />
          </div>
        </div>

        <div class="flex items-center justify-center gap-4">
          <button
            @click="togglePlayback"
            class="w-14 h-14 rounded-full bg-gradient-to-r from-soft-pink-400 to-cream-yellow-400 text-white shadow-soft hover:shadow-lg transition-all flex items-center justify-center"
          >
            <Play v-if="!isPlaying" class="w-6 h-6 ml-1" />
            <Pause v-else class="w-6 h-6" />
          </button>
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
          使用此录音
        </button>
      </div>
    </div>
  </div>
</template>
