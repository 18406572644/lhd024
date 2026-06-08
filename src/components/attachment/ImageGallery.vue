<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-vue-next';
import type { Attachment } from '../../types';
import { getAttachmentDataUrl } from '../../utils/attachmentStorage';
import { IMAGE_FILTERS } from '../../types';

const props = defineProps<{
  attachments: Attachment[];
  initialIndex?: number;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const currentIndex = ref(0);
const imageUrls = ref<Map<string, string>>(new Map());
const loading = ref(false);

const imageAttachments = computed(() => 
  props.attachments.filter(a => a.type === 'image')
);

const currentImage = computed(() => imageAttachments.value[currentIndex.value]);
const currentFilter = computed(() => {
  const config = currentImage.value?.editConfig;
  if (!config?.filter) return 'none';
  return IMAGE_FILTERS.find(f => f.id === config.filter)?.cssFilter || 'none';
});

watch(() => props.show, async (val) => {
  if (val) {
    currentIndex.value = props.initialIndex || 0;
    await loadAllImages();
  }
});

async function loadAllImages() {
  loading.value = true;
  for (const attachment of imageAttachments.value) {
    if (!imageUrls.value.has(attachment.id)) {
      const url = await getAttachmentDataUrl(attachment.id);
      if (url) {
        imageUrls.value.set(attachment.id, url);
      }
    }
  }
  loading.value = false;
}

function nextImage() {
  if (currentIndex.value < imageAttachments.value.length - 1) {
    currentIndex.value++;
  }
}

function prevImage() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function handleClose() {
  emit('close');
}

function downloadImage() {
  const url = imageUrls.value.get(currentImage.value?.id || '');
  if (url && currentImage.value) {
    const a = document.createElement('a');
    a.href = url;
    a.download = currentImage.value.name || 'image.jpg';
    a.click();
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="show && imageAttachments.length > 0" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        @click.self="handleClose"
      >
        <button
          @click="handleClose"
          class="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        >
          <X class="w-6 h-6" />
        </button>

        <button
          v-if="currentIndex > 0"
          @click="prevImage"
          class="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        >
          <ChevronLeft class="w-8 h-8" />
        </button>

        <button
          v-if="currentIndex < imageAttachments.length - 1"
          @click="nextImage"
          class="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        >
          <ChevronRight class="w-8 h-8" />
        </button>

        <div class="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center">
          <div v-if="loading" class="flex items-center justify-center h-96">
            <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
          
          <div v-else class="relative max-w-full max-h-[75vh] flex items-center justify-center">
            <img
              v-if="currentImage && imageUrls.get(currentImage.id)"
              :src="imageUrls.get(currentImage.id)"
              :alt="currentImage.name"
              class="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl animate-fade-in"
              :style="{ filter: currentFilter }"
            />
          </div>

          <div class="mt-6 flex items-center gap-6">
            <span class="text-white/80 text-sm">
              {{ currentIndex + 1 }} / {{ imageAttachments.length }}
            </span>
            <button
              @click="downloadImage"
              class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              <Download class="w-4 h-4" />
              下载原图
            </button>
          </div>

          <div v-if="imageAttachments.length > 1" class="mt-4 flex gap-2 max-w-full overflow-x-auto px-4 py-2">
            <button
              v-for="(attachment, index) in imageAttachments"
              :key="attachment.id"
              @click="currentIndex = index"
              :class="[
                'relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300',
                currentIndex === index ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
              ]"
            >
              <img
                v-if="imageUrls.get(attachment.id)"
                :src="imageUrls.get(attachment.id)"
                :alt="attachment.name"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
