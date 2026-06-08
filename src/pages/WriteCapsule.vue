<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Calendar, Tag, Lock, Unlock, Send, Sparkles, Heart, Globe, Image, Mic, Video, X, Edit2, AlertTriangle, Play } from 'lucide-vue-next';
import type { CapsuleCategory, MoodType, Attachment, ImageEditConfig } from '../types';
import { CATEGORIES, MOODS, PRESET_TIMES, ATTACHMENT_LIMITS, IMAGE_FILTERS } from '../types';
import { useCapsuleOperation } from '../composables/useCapsules';
import { addMonths, formatDate, dayjs } from '../utils/date';
import { validateFileSize, formatFileSize, formatDuration, getStorageStats } from '../utils/attachmentStorage';
import ImageEditor from '../components/attachment/ImageEditor.vue';
import AudioRecorder from '../components/attachment/AudioRecorder.vue';
import VideoRecorder from '../components/attachment/VideoRecorder.vue';

const router = useRouter();
const { createCapsule, loading } = useCapsuleOperation();

const title = ref('');
const content = ref('');
const category = ref<CapsuleCategory>('growth');
const mood = ref<MoodType>('peaceful');
const tags = ref<string[]>([]);
const tagInput = ref('');
const openAt = ref('');
const isPrivate = ref(false);
const isPublic = ref(false);
const email = ref('');
const showSuccess = ref(false);

interface PendingAttachment {
  file: File;
  type: 'image' | 'audio' | 'video';
  previewUrl: string;
  duration?: number;
  editConfig?: ImageEditConfig;
}

const pendingAttachments = ref<PendingAttachment[]>([]);
const activeAttachmentType = ref<'image' | 'audio' | 'video' | null>(null);
const showImageEditor = ref(false);
const editingImageIndex = ref(-1);
const editingImageUrl = ref('');
const storageWarning = ref<string | null>(null);

const imageCount = computed(() => pendingAttachments.value.filter(a => a.type === 'image').length);
const audioCount = computed(() => pendingAttachments.value.filter(a => a.type === 'audio').length);
const videoCount = computed(() => pendingAttachments.value.filter(a => a.type === 'video').length);

const canAddImage = computed(() => imageCount.value < ATTACHMENT_LIMITS.MAX_IMAGES);
const canAddAudio = computed(() => audioCount.value === 0);
const canAddVideo = computed(() => videoCount.value === 0);

const totalAttachmentSize = computed(() => 
  pendingAttachments.value.reduce((sum, a) => sum + a.file.size, 0)
);

const customDate = computed(() => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
});

const minDate = computed(() => {
  return dayjs().add(1, 'day').format('YYYY-MM-DD');
});

const canSubmit = computed(() => {
  return title.value.trim() && content.value.trim() && openAt.value;
});

function selectPreset(months: number) {
  openAt.value = addMonths(new Date(), months).split('T')[0];
}

function addTag() {
  const tag = tagInput.value.trim();
  if (tag && !tags.value.includes(tag) && tags.value.length < 5) {
    tags.value.push(tag);
    tagInput.value = '';
  }
}

function removeTag(tag: string) {
  tags.value = tags.value.filter(t => t !== tag);
}

function handleTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTag();
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return;
  
  try {
    const openDate = new Date(openAt.value);
    openDate.setHours(9, 0, 0, 0);
    
    const attachments = pendingAttachments.value.map(a => ({
      file: a.file,
      type: a.type,
      duration: a.duration,
      editConfig: a.editConfig,
    }));
    
    await createCapsule({
      title: title.value.trim(),
      content: content.value.trim(),
      category: category.value,
      mood: mood.value,
      tags: tags.value,
      openAt: openDate.toISOString(),
      isPrivate: isPrivate.value,
      isPublic: isPublic.value,
      email: email.value || undefined,
    }, attachments);
    
    cleanupAttachments();
    showSuccess.value = true;
    
    setTimeout(() => {
      router.push('/');
    }, 2000);
  } catch (e) {
    console.error('Failed to create capsule:', e);
  }
}

async function checkStorageSpace(fileSize: number): Promise<boolean> {
  try {
    const stats = await getStorageStats();
    const projectedUsage = stats.usedSize + fileSize + totalAttachmentSize.value;
    if (projectedUsage > ATTACHMENT_LIMITS.MAX_TOTAL_STORAGE) {
      const available = ATTACHMENT_LIMITS.MAX_TOTAL_STORAGE - stats.usedSize;
      storageWarning.value = `存储空间不足！剩余 ${formatFileSize(available)}，请先清理部分附件。`;
      setTimeout(() => { storageWarning.value = null; }, 5000);
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

async function handleImageUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  const remainingSlots = ATTACHMENT_LIMITS.MAX_IMAGES - imageCount.value;
  const filesToProcess = Array.from(files).slice(0, remainingSlots);

  for (const file of filesToProcess) {
    const validation = validateFileSize(file, 'image');
    if (!validation.valid) {
      alert(validation.message);
      continue;
    }

    const hasSpace = await checkStorageSpace(file.size);
    if (!hasSpace) continue;

    const previewUrl = URL.createObjectURL(file);
    pendingAttachments.value.push({
      file,
      type: 'image',
      previewUrl,
      editConfig: { rotation: 0 },
    });
  }

  input.value = '';
}

function openImageEditor(index: number) {
  const attachment = pendingAttachments.value[index];
  if (attachment.type !== 'image') return;
  
  editingImageIndex.value = index;
  editingImageUrl.value = attachment.previewUrl;
  showImageEditor.value = true;
}

function handleImageEditSave(config: ImageEditConfig, editedFile: File) {
  if (editingImageIndex.value === -1) return;

  const attachment = pendingAttachments.value[editingImageIndex.value];
  if (attachment.previewUrl) {
    URL.revokeObjectURL(attachment.previewUrl);
  }

  const newPreviewUrl = URL.createObjectURL(editedFile);
  pendingAttachments.value[editingImageIndex.value] = {
    ...attachment,
    file: editedFile,
    previewUrl: newPreviewUrl,
    editConfig: config,
  };

  showImageEditor.value = false;
  editingImageIndex.value = -1;
  editingImageUrl.value = '';
}

function handleImageEditCancel() {
  showImageEditor.value = false;
  editingImageIndex.value = -1;
  editingImageUrl.value = '';
}

function handleAudioSave(file: File, duration: number) {
  const previewUrl = URL.createObjectURL(file);
  pendingAttachments.value.push({
    file,
    type: 'audio',
    previewUrl,
    duration,
  });
  activeAttachmentType.value = null;
}

function handleVideoSave(file: File, duration: number) {
  const previewUrl = URL.createObjectURL(file);
  pendingAttachments.value.push({
    file,
    type: 'video',
    previewUrl,
    duration,
  });
  activeAttachmentType.value = null;
}

function removeAttachment(index: number) {
  const attachment = pendingAttachments.value[index];
  if (attachment.previewUrl) {
    URL.revokeObjectURL(attachment.previewUrl);
  }
  pendingAttachments.value.splice(index, 1);
}

function getFilterStyle(config?: ImageEditConfig): string {
  if (!config?.filter) return 'none';
  return IMAGE_FILTERS.find(f => f.id === config.filter)?.cssFilter || 'none';
}

function cleanupAttachments() {
  for (const attachment of pendingAttachments.value) {
    if (attachment.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
  }
  pendingAttachments.value = [];
}

function handleCancel() {
  if (title.value || content.value || pendingAttachments.value.length > 0) {
    if (confirm('确定要离开吗？当前内容和附件将不会保存。')) {
      cleanupAttachments();
      router.push('/');
    }
  } else {
    cleanupAttachments();
    router.push('/');
  }
}

onMounted(async () => {
  await checkStorageSpace(0);
});
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div v-if="showSuccess" class="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900/30 backdrop-blur-sm">
        <div class="bg-white rounded-3xl p-12 text-center shadow-soft animate-scale-in max-w-md mx-4">
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-soft-pink-100 to-cream-yellow-100 flex items-center justify-center mx-auto mb-6 animate-heart-beat">
            <Sparkles class="w-12 h-12 text-soft-pink-400" />
          </div>
          <h2 class="font-serif-sc text-2xl font-semibold text-warm-gray-800 mb-3">
            胶囊已封存成功！
          </h2>
          <p class="text-warm-gray-600 mb-6">
            这封信已经被小心翼翼地收藏起来，等待着在未来的某一天，与你再次相遇。
          </p>
          <p class="text-sm text-warm-gray-400">
            即将跳转到首页...
          </p>
        </div>
      </div>

      <div class="mb-8 animate-fade-in">
        <h1 class="font-serif-sc text-3xl font-bold text-warm-gray-800 mb-2">
          给未来写一封信 ✨
        </h1>
        <p class="text-warm-gray-600">
          把此刻的心情、想说的话，都放进这个小小的胶囊里吧。
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <div class="card-soft animate-slide-up" style="animation-delay: 0.1s">
          <label class="block text-sm font-medium text-warm-gray-700 mb-2">
            <span class="text-soft-pink-400 mr-1">♥</span> 信件标题
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="给这封信起个温暖的名字吧"
            class="input-soft text-lg font-serif-sc"
            maxlength="50"
          />
        </div>

        <div class="card-soft animate-slide-up" style="animation-delay: 0.2s">
          <label class="block text-sm font-medium text-warm-gray-700 mb-2">
            <span class="text-cream-yellow-400 mr-1">✉️</span> 信件内容
          </label>
          <div class="letter-paper min-h-[300px]">
            <textarea
              v-model="content"
              placeholder="亲爱的未来的自己...

此刻，我正坐在窗前，窗外的阳光正好。我想对你说..."
              class="w-full min-h-[400px] bg-transparent border-none outline-none resize-none font-serif-sc text-lg text-warm-gray-700 leading-loose letter-textarea"
            ></textarea>
          </div>
          <p class="text-right text-sm text-warm-gray-400 mt-2">
            {{ content.length }} 字
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card-soft animate-slide-up" style="animation-delay: 0.3s">
            <label class="block text-sm font-medium text-warm-gray-700 mb-3">
              <span class="text-mint-green-400 mr-1">📂</span> 选择分类
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="cat in CATEGORIES"
                :key="cat.id"
                type="button"
                @click="category = cat.id"
                :class="[
                  'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300',
                  category === cat.id
                    ? [cat.bgColor, 'shadow-soft scale-105']
                    : 'bg-warm-gray-50 hover:bg-warm-gray-100'
                ]"
              >
                <span class="text-2xl">{{ cat.emoji }}</span>
                <span class="text-xs font-medium text-warm-gray-600">{{ cat.name }}</span>
              </button>
            </div>
          </div>

          <div class="card-soft animate-slide-up" style="animation-delay: 0.4s">
            <label class="block text-sm font-medium text-warm-gray-700 mb-3">
              <span class="text-lavender-300 mr-1">😊</span> 此刻的心情
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="m in MOODS"
                :key="m.id"
                type="button"
                @click="mood = m.id"
                :class="[
                  'flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300',
                  mood === m.id
                    ? [m.color, 'shadow-soft scale-105']
                    : 'bg-warm-gray-50 hover:bg-warm-gray-100'
                ]"
              >
                <span class="text-2xl">{{ m.emoji }}</span>
                <span class="text-xs font-medium text-warm-gray-600">{{ m.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="card-soft animate-slide-up" style="animation-delay: 0.5s">
          <label class="block text-sm font-medium text-warm-gray-700 mb-3">
            <Tag class="w-4 h-4 inline-block mr-1 text-soft-pink-400" />
            添加标签
            <span class="text-warm-gray-400 text-xs ml-2">(最多5个，按回车添加)</span>
          </label>
          <div class="flex gap-3">
            <input
              v-model="tagInput"
              type="text"
              placeholder="添加一个标签，比如：梦想、旅行、感恩..."
              class="input-soft flex-1"
              @keydown="handleTagKeydown"
              maxlength="10"
            />
            <button
              type="button"
              @click="addTag"
              class="btn-secondary"
              :disabled="tags.length >= 5"
            >
              添加
            </button>
          </div>
          <div v-if="tags.length > 0" class="flex flex-wrap gap-2 mt-3">
            <span
              v-for="tag in tags"
              :key="tag"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-soft-pink-100 text-warm-gray-700"
            >
              #{{ tag }}
              <button type="button" @click="removeTag(tag)" class="hover:text-soft-pink-400">
                ×
              </button>
            </span>
          </div>
        </div>

        <div class="card-soft animate-slide-up" style="animation-delay: 0.55s">
          <label class="block text-sm font-medium text-warm-gray-700 mb-3">
            <Image class="w-4 h-4 inline-block mr-1 text-soft-pink-400" />
            多媒体附件
          </label>
          
          <Transition name="fade">
            <div 
              v-if="storageWarning" 
              class="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2"
            >
              <AlertTriangle class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-amber-700">{{ storageWarning }}</p>
            </div>
          </Transition>

          <div class="flex gap-3 mb-4">
            <label class="flex-1 flex flex-col items-center gap-2 p-4 border-2 border-dashed border-warm-gray-200 rounded-2xl cursor-pointer hover:border-soft-pink-300 hover:bg-soft-pink-50 transition-all" :class="{ 'opacity-50 cursor-not-allowed': !canAddImage }">
              <Image class="w-6 h-6 text-soft-pink-400" />
              <span class="text-xs text-warm-gray-600">图片</span>
              <span class="text-xs text-warm-gray-400">{{ imageCount }}/{{ ATTACHMENT_LIMITS.MAX_IMAGES }}</span>
              <input
                v-if="canAddImage"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleImageUpload"
              />
            </label>

            <button
              type="button"
              @click="activeAttachmentType = 'audio'"
              :disabled="!canAddAudio"
              class="flex-1 flex flex-col items-center gap-2 p-4 border-2 border-dashed border-warm-gray-200 rounded-2xl hover:border-cream-yellow-300 hover:bg-cream-yellow-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic class="w-6 h-6 text-cream-yellow-500" />
              <span class="text-xs text-warm-gray-600">语音</span>
              <span class="text-xs text-warm-gray-400">{{ audioCount }}/1 · 5分钟</span>
            </button>

            <button
              type="button"
              @click="activeAttachmentType = 'video'"
              :disabled="!canAddVideo"
              class="flex-1 flex flex-col items-center gap-2 p-4 border-2 border-dashed border-warm-gray-200 rounded-2xl hover:border-sky-blue-300 hover:bg-sky-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Video class="w-6 h-6 text-sky-blue-400" />
              <span class="text-xs text-warm-gray-600">视频</span>
              <span class="text-xs text-warm-gray-400">{{ videoCount }}/1 · 15秒</span>
            </button>
          </div>

          <div v-if="pendingAttachments.length > 0" class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-warm-gray-500">
                已添加 {{ pendingAttachments.length }} 个附件
                <span v-if="totalAttachmentSize > 0" class="text-warm-gray-400">
                  · {{ formatFileSize(totalAttachmentSize) }}
                </span>
              </span>
            </div>

            <div v-if="imageCount > 0" class="grid grid-cols-3 gap-2">
              <div
                v-for="(attachment, index) in pendingAttachments.filter(a => a.type === 'image')"
                :key="index"
                class="relative aspect-square rounded-xl overflow-hidden group"
              >
                <img
                  :src="attachment.previewUrl"
                  alt="Preview"
                  class="w-full h-full object-cover"
                  :style="{ filter: getFilterStyle(attachment.editConfig) }"
                />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    @click="openImageEditor(pendingAttachments.indexOf(attachment))"
                    class="p-2 rounded-full bg-white/90 text-warm-gray-700 hover:bg-white transition-colors"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    @click="removeAttachment(pendingAttachments.indexOf(attachment))"
                    class="p-2 rounded-full bg-red-500/90 text-white hover:bg-red-500 transition-colors"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="audioCount > 0" class="space-y-2">
              <div
                v-for="(attachment, index) in pendingAttachments.filter(a => a.type === 'audio')"
                :key="index"
                class="flex items-center gap-3 p-3 bg-cream-yellow-50 rounded-xl"
              >
                <div class="w-10 h-10 rounded-full bg-cream-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Mic class="w-5 h-5 text-cream-yellow-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-warm-gray-800 truncate">语音录音</p>
                  <p class="text-xs text-warm-gray-500">
                    {{ attachment.duration ? formatDuration(attachment.duration) : '' }} · 
                    {{ formatFileSize(attachment.file.size) }}
                  </p>
                </div>
                <button
                  type="button"
                  @click="removeAttachment(pendingAttachments.indexOf(attachment))"
                  class="p-2 rounded-full hover:bg-red-100 text-warm-gray-400 hover:text-red-500 transition-colors"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-if="videoCount > 0" class="space-y-2">
              <div
                v-for="(attachment, index) in pendingAttachments.filter(a => a.type === 'video')"
                :key="index"
                class="relative rounded-xl overflow-hidden"
              >
                <video
                  :src="attachment.previewUrl"
                  class="w-full h-40 object-cover"
                  muted
                  playsinline
                />
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                    <Play class="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex items-center justify-between">
                  <span class="text-white text-xs">
                    {{ attachment.duration ? formatDuration(attachment.duration) : '' }} · 
                    {{ formatFileSize(attachment.file.size) }}
                  </span>
                  <button
                    type="button"
                    @click="removeAttachment(pendingAttachments.indexOf(attachment))"
                    class="p-1.5 rounded-full bg-red-500/90 text-white hover:bg-red-500 transition-colors"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-soft animate-slide-up" style="animation-delay: 0.6s">
          <label class="block text-sm font-medium text-warm-gray-700 mb-3">
            <Calendar class="w-4 h-4 inline-block mr-1 text-cream-yellow-400" />
            选择开启时间
          </label>
          <p class="text-sm text-warm-gray-500 mb-4">
            这封信将在你选择的时间自动开启，给未来的你一个惊喜 ✨
          </p>
          
          <div class="mb-4">
            <p class="text-xs text-warm-gray-500 mb-2">快捷选择：</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in PRESET_TIMES"
                :key="preset.months"
                type="button"
                @click="selectPreset(preset.months)"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  openAt === addMonths(new Date(), preset.months).split('T')[0]
                    ? 'bg-cream-yellow-200 text-warm-gray-800 shadow-soft'
                    : 'bg-warm-gray-100 text-warm-gray-600 hover:bg-warm-gray-200'
                ]"
              >
                {{ preset.label }}后
              </button>
            </div>
          </div>
          
          <div>
            <p class="text-xs text-warm-gray-500 mb-2">或自定义日期：</p>
            <input
              v-model="openAt"
              type="date"
              :min="minDate"
              class="input-soft"
            />
          </div>
          
          <p v-if="openAt" class="text-sm text-mint-green-600 mt-3 flex items-center gap-2">
            <Heart class="w-4 h-4 animate-pulse" />
            将在 {{ formatDate(openAt) }} 开启这封信
          </p>
        </div>

        <div class="card-soft animate-slide-up" style="animation-delay: 0.7s">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <component :is="isPrivate ? Lock : Unlock" class="w-4 h-4 text-lavender-300" />
                <span class="text-sm font-medium text-warm-gray-700">设为私密胶囊</span>
              </div>
              <p class="text-sm text-warm-gray-500">
                私密胶囊在查看时需要额外输入密码验证
              </p>
            </div>
            <button
              type="button"
              @click="isPrivate = !isPrivate"
              :class="[
                'relative w-14 h-8 rounded-full transition-colors duration-300',
                isPrivate ? 'bg-lavender-200' : 'bg-warm-gray-200'
              ]"
            >
              <span
                :class="[
                  'absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300',
                  isPrivate ? 'left-7' : 'left-1'
                ]"
              ></span>
            </button>
          </div>
        </div>

        <div class="card-soft animate-slide-up" style="animation-delay: 0.75s">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Globe class="w-4 h-4 text-mint-green-300" />
                <span class="text-sm font-medium text-warm-gray-700">公开分享</span>
              </div>
              <p class="text-sm text-warm-gray-500">
                开启后可生成分享链接和二维码，他人可通过链接查看此胶囊
              </p>
            </div>
            <button
              type="button"
              @click="isPublic = !isPublic"
              :class="[
                'relative w-14 h-8 rounded-full transition-colors duration-300',
                isPublic ? 'bg-mint-green-200' : 'bg-warm-gray-200'
              ]"
            >
              <span
                :class="[
                  'absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300',
                  isPublic ? 'left-7' : 'left-1'
                ]"
              ></span>
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center mt-12 pb-8">
          <button
            type="button"
            @click="handleCancel"
            class="btn-secondary px-8"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="!canSubmit || loading"
            class="btn-primary px-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <Send v-else class="w-5 h-5" />
            {{ loading ? '封存中...' : '封存胶囊' }}
          </button>
        </div>
      </form>
    </div>

    <Transition name="fade">
      <div 
        v-if="showImageEditor" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900/70 backdrop-blur-sm p-4"
      >
        <div class="w-full max-w-4xl max-h-[90vh] overflow-auto">
          <ImageEditor
            v-if="editingImageUrl"
            :show="showImageEditor"
            :image-url="editingImageUrl"
            @save="handleImageEditSave"
            @close="handleImageEditCancel"
          />
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div 
        v-if="activeAttachmentType === 'audio'" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900/70 backdrop-blur-sm p-4"
      >
        <div class="w-full max-w-lg">
          <AudioRecorder
            @save="handleAudioSave"
            @cancel="activeAttachmentType = null"
          />
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div 
        v-if="activeAttachmentType === 'video'" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900/70 backdrop-blur-sm p-4"
      >
        <div class="w-full max-w-lg">
          <VideoRecorder
            @save="handleVideoSave"
            @cancel="activeAttachmentType = null"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>
