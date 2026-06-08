<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { X, RotateCw, Crop, Type, Check, ZoomIn, ZoomOut } from 'lucide-vue-next';
import type { ImageEditConfig, WatermarkConfig } from '../../types';
import { IMAGE_FILTERS, WATERMARK_POSITIONS } from '../../types';

const props = defineProps<{
  imageUrl: string;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', config: ImageEditConfig, editedFile: File): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);
const activeTab = ref<'crop' | 'filter' | 'watermark'>('filter');

const rotation = ref(0);
const zoom = ref(1);
const selectedFilter = ref('none');
const showWatermark = ref(false);
const watermarkText = ref('');
const watermarkPosition = ref<WatermarkConfig['position']>('bottom-right');
const watermarkOpacity = ref(0.5);
const watermarkFontSize = ref(24);
const watermarkColor = ref('#ffffff');

const cropStart = ref<{ x: number; y: number } | null>(null);
const cropEnd = ref<{ x: number; y: number } | null>(null);
const isCropping = ref(false);
const cropArea = ref<{ x: number; y: number; width: number; height: number } | null>(null);

const originalImage = ref<HTMLImageElement | null>(null);
const canvasScale = ref(1);

const currentFilter = computed(() => {
  return IMAGE_FILTERS.find(f => f.id === selectedFilter.value)?.cssFilter || 'none';
});

const watermarkStyle = computed(() => {
  const positionStyles: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };
  return positionStyles[watermarkPosition.value] || positionStyles['bottom-right'];
});

watch(() => props.show, (val) => {
  if (val && props.imageUrl) {
    loadImage();
    resetConfig();
  }
});

function loadImage() {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    originalImage.value = img;
    renderCanvas();
  };
  img.src = props.imageUrl;
}

function resetConfig() {
  rotation.value = 0;
  zoom.value = 1;
  selectedFilter.value = 'none';
  showWatermark.value = false;
  watermarkText.value = '';
  watermarkPosition.value = 'bottom-right';
  watermarkOpacity.value = 0.5;
  watermarkFontSize.value = 24;
  watermarkColor.value = '#ffffff';
  cropArea.value = null;
  cropStart.value = null;
  cropEnd.value = null;
}

function renderCanvas() {
  if (!canvasRef.value || !originalImage.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = originalImage.value;
  const containerWidth = 600;
  const containerHeight = 400;
  const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
  canvasScale.value = scale;

  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.save();
  ctx.filter = currentFilter.value;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.translate(centerX, centerY);
  ctx.rotate((rotation.value * Math.PI) / 180);
  ctx.scale(zoom.value, zoom.value);
  ctx.translate(-centerX, -centerY);

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  if (showWatermark.value && watermarkText.value) {
    drawWatermark(ctx, canvas.width, canvas.height);
  }

  if (cropArea.value && activeTab.value === 'crop') {
    drawCropOverlay(ctx, canvas.width, canvas.height);
  }
}

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.globalAlpha = watermarkOpacity.value;
  ctx.font = `${watermarkFontSize.value}px serif`;
  ctx.fillStyle = watermarkColor.value;
  ctx.textBaseline = 'middle';

  const text = watermarkText.value;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = watermarkFontSize.value;

  let x = 0;
  let y = 0;
  const padding = 16;

  switch (watermarkPosition.value) {
    case 'top-left':
      x = padding;
      y = padding + textHeight / 2;
      ctx.textAlign = 'left';
      break;
    case 'top-right':
      x = width - padding;
      y = padding + textHeight / 2;
      ctx.textAlign = 'right';
      break;
    case 'bottom-left':
      x = padding;
      y = height - padding - textHeight / 2;
      ctx.textAlign = 'left';
      break;
    case 'bottom-right':
      x = width - padding;
      y = height - padding - textHeight / 2;
      ctx.textAlign = 'right';
      break;
    case 'center':
      x = width / 2;
      y = height / 2;
      ctx.textAlign = 'center';
      break;
  }

  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawCropOverlay(ctx: CanvasRenderingContext2D, width: number, height: number) {
  if (!cropArea.value) return;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, width, height);

  const { x, y, width: cropW, height: cropH } = cropArea.value;
  ctx.clearRect(x, y, cropW, cropH);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, cropW, cropH);
  ctx.restore();
}

function handleCanvasMouseDown(e: MouseEvent) {
  if (activeTab.value !== 'crop' || !canvasRef.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  isCropping.value = true;
  cropStart.value = { x, y };
  cropEnd.value = { x, y };
  updateCropArea();
}

function handleCanvasMouseMove(e: MouseEvent) {
  if (!isCropping.value || !canvasRef.value || !cropStart.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  const x = Math.max(0, Math.min(e.clientX - rect.left, canvasRef.value.width));
  const y = Math.max(0, Math.min(e.clientY - rect.top, canvasRef.value.height));

  cropEnd.value = { x, y };
  updateCropArea();
}

function handleCanvasMouseUp() {
  isCropping.value = false;
  renderCanvas();
}

function updateCropArea() {
  if (!cropStart.value || !cropEnd.value) return;

  const x = Math.min(cropStart.value.x, cropEnd.value.x);
  const y = Math.min(cropStart.value.y, cropEnd.value.y);
  const width = Math.abs(cropEnd.value.x - cropStart.value.x);
  const height = Math.abs(cropEnd.value.y - cropStart.value.y);

  if (width > 10 && height > 10) {
    cropArea.value = { x, y, width, height };
  }
  renderCanvas();
}

function rotateImage() {
  rotation.value = (rotation.value + 90) % 360;
  renderCanvas();
}

function zoomIn() {
  zoom.value = Math.min(zoom.value + 0.1, 3);
  renderCanvas();
}

function zoomOut() {
  zoom.value = Math.max(zoom.value - 0.1, 0.5);
  renderCanvas();
}

function applyCrop() {
  if (!cropArea.value || !originalImage.value || !canvasRef.value) return;

  const canvas = canvasRef.value;
  const scale = canvasScale.value;
  const actualCrop = {
    x: cropArea.value.x / scale,
    y: cropArea.value.y / scale,
    width: cropArea.value.width / scale,
    height: cropArea.value.height / scale,
  };

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = actualCrop.width;
  tempCanvas.height = actualCrop.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  tempCtx.filter = currentFilter.value;
  tempCtx.drawImage(
    originalImage.value,
    actualCrop.x,
    actualCrop.y,
    actualCrop.width,
    actualCrop.height,
    0,
    0,
    actualCrop.width,
    actualCrop.height
  );

  if (showWatermark.value && watermarkText.value) {
    drawWatermark(tempCtx, actualCrop.width, actualCrop.height);
  }

  tempCanvas.toBlob((blob) => {
    if (!blob) return;
    const file = new File([blob], 'edited-image.jpg', { type: 'image/jpeg' });

    const config: ImageEditConfig = {
      crop: actualCrop,
      filter: selectedFilter.value,
      watermark: showWatermark.value
        ? {
            text: watermarkText.value,
            position: watermarkPosition.value,
            opacity: watermarkOpacity.value,
            fontSize: watermarkFontSize.value,
            color: watermarkColor.value,
          }
        : undefined,
      rotation: rotation.value,
    };

    emit('save', config, file);
  }, 'image/jpeg', 0.9);
}

function saveImage() {
  if (cropArea.value) {
    applyCrop();
    return;
  }

  if (!originalImage.value) return;

  const canvas = document.createElement('canvas');
  canvas.width = originalImage.value.width;
  canvas.height = originalImage.value.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.filter = currentFilter.value;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation.value * Math.PI) / 180);
  ctx.translate(-centerX, -centerY);

  ctx.drawImage(originalImage.value, 0, 0);
  ctx.restore();

  if (showWatermark.value && watermarkText.value) {
    drawWatermark(ctx, canvas.width, canvas.height);
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const file = new File([blob], 'edited-image.jpg', { type: 'image/jpeg' });

    const config: ImageEditConfig = {
      filter: selectedFilter.value,
      watermark: showWatermark.value
        ? {
            text: watermarkText.value,
            position: watermarkPosition.value,
            opacity: watermarkOpacity.value,
            fontSize: watermarkFontSize.value,
            color: watermarkColor.value,
          }
        : undefined,
      rotation: rotation.value,
    };

    emit('save', config, file);
  }, 'image/jpeg', 0.9);
}

function handleClose() {
  resetConfig();
  emit('close');
}

watch([selectedFilter, rotation, zoom, showWatermark, watermarkText, watermarkPosition, watermarkOpacity, watermarkFontSize, watermarkColor], () => {
  renderCanvas();
});

onMounted(() => {
  document.addEventListener('mouseup', handleCanvasMouseUp);
  document.addEventListener('mousemove', handleCanvasMouseMove);
});

onUnmounted(() => {
  document.removeEventListener('mouseup', handleCanvasMouseUp);
  document.removeEventListener('mousemove', handleCanvasMouseMove);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl shadow-soft max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
          <div class="flex items-center justify-between p-6 border-b border-warm-gray-100">
            <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800">
              编辑图片
            </h3>
            <button
              @click="handleClose"
              class="p-2 rounded-full hover:bg-warm-gray-100 text-warm-gray-400 hover:text-warm-gray-600 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="flex h-[600px]">
            <div class="w-64 p-6 border-r border-warm-gray-100 flex flex-col">
              <div class="space-y-2 mb-6">
                <button
                  v-for="tab in [
                    { id: 'filter', label: '滤镜', icon: Crop },
                    { id: 'crop', label: '裁剪', icon: Crop },
                    { id: 'watermark', label: '水印', icon: Type },
                  ]"
                  :key="tab.id"
                  @click="activeTab = tab.id as typeof activeTab"
                  :class="[
                    'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300',
                    activeTab === tab.id
                      ? 'bg-soft-pink-100 text-warm-gray-800 shadow-soft'
                      : 'text-warm-gray-600 hover:bg-warm-gray-50'
                  ]"
                >
                  <component :is="tab.icon" class="w-4 h-4" />
                  {{ tab.label }}
                </button>
              </div>

              <div class="flex gap-2 mb-6">
                <button
                  @click="rotateImage"
                  class="flex-1 p-3 rounded-xl bg-warm-gray-50 hover:bg-warm-gray-100 text-warm-gray-600 transition-colors"
                  title="旋转"
                >
                  <RotateCw class="w-5 h-5 mx-auto" />
                </button>
                <button
                  @click="zoomIn"
                  class="flex-1 p-3 rounded-xl bg-warm-gray-50 hover:bg-warm-gray-100 text-warm-gray-600 transition-colors"
                  title="放大"
                >
                  <ZoomIn class="w-5 h-5 mx-auto" />
                </button>
                <button
                  @click="zoomOut"
                  class="flex-1 p-3 rounded-xl bg-warm-gray-50 hover:bg-warm-gray-100 text-warm-gray-600 transition-colors"
                  title="缩小"
                >
                  <ZoomOut class="w-5 h-5 mx-auto" />
                </button>
              </div>

              <div class="flex-1 overflow-y-auto space-y-4">
                <template v-if="activeTab === 'filter'">
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      v-for="filter in IMAGE_FILTERS"
                      :key="filter.id"
                      @click="selectedFilter = filter.id"
                      :class="[
                        'relative aspect-square rounded-xl overflow-hidden transition-all duration-300',
                        selectedFilter === filter.id
                          ? 'ring-2 ring-soft-pink-400 ring-offset-2'
                          : 'hover:scale-105'
                      ]"
                    >
                      <img
                        :src="imageUrl"
                        :alt="filter.name"
                        class="w-full h-full object-cover"
                        :style="{ filter: filter.cssFilter }"
                      />
                      <span class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white bg-black/50 px-2 py-0.5 rounded-full">
                        {{ filter.name }}
                      </span>
                    </button>
                  </div>
                </template>

                <template v-else-if="activeTab === 'crop'">
                  <div class="space-y-3">
                    <p class="text-sm text-warm-gray-500">
                      在图片上拖动鼠标选择裁剪区域
                    </p>
                    <button
                      v-if="cropArea"
                      @click="cropArea = null; renderCanvas()"
                      class="w-full px-4 py-2 text-sm bg-warm-gray-100 text-warm-gray-600 rounded-xl hover:bg-warm-gray-200 transition-colors"
                    >
                      清除裁剪区域
                    </button>
                  </div>
                </template>

                <template v-else-if="activeTab === 'watermark'">
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-warm-gray-700">添加水印</span>
                      <button
                        @click="showWatermark = !showWatermark"
                        :class="[
                          'relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0',
                          showWatermark ? 'bg-soft-pink-200' : 'bg-warm-gray-200'
                        ]"
                      >
                        <span
                          :class="[
                            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300',
                            showWatermark ? 'left-6.5' : 'left-0.5'
                          ]"
                        ></span>
                      </button>
                    </div>

                    <div v-if="showWatermark" class="space-y-4">
                      <div>
                        <label class="block text-xs text-warm-gray-500 mb-1">水印文字</label>
                        <input
                          v-model="watermarkText"
                          type="text"
                          placeholder="输入水印文字"
                          class="w-full px-3 py-2 text-sm border border-warm-gray-200 rounded-xl focus:outline-none focus:border-soft-pink-300"
                        />
                      </div>

                      <div>
                        <label class="block text-xs text-warm-gray-500 mb-1">位置</label>
                        <div class="grid grid-cols-3 gap-1">
                          <button
                            v-for="pos in WATERMARK_POSITIONS"
                            :key="pos.id"
                            @click="watermarkPosition = pos.id"
                            :class="[
                              'px-2 py-1 text-xs rounded-lg transition-colors',
                              watermarkPosition === pos.id
                                ? 'bg-soft-pink-100 text-warm-gray-800'
                                : 'bg-warm-gray-50 text-warm-gray-600 hover:bg-warm-gray-100'
                            ]"
                          >
                            {{ pos.name }}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label class="block text-xs text-warm-gray-500 mb-1">
                          透明度: {{ Math.round(watermarkOpacity * 100) }}%
                        </label>
                        <input
                          v-model="watermarkOpacity"
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          class="w-full accent-soft-pink-400"
                        />
                      </div>

                      <div>
                        <label class="block text-xs text-warm-gray-500 mb-1">
                          字号: {{ watermarkFontSize }}px
                        </label>
                        <input
                          v-model="watermarkFontSize"
                          type="range"
                          min="12"
                          max="72"
                          step="2"
                          class="w-full accent-soft-pink-400"
                        />
                      </div>

                      <div>
                        <label class="block text-xs text-warm-gray-500 mb-1">颜色</label>
                        <input
                          v-model="watermarkColor"
                          type="color"
                          class="w-full h-10 rounded-xl border border-warm-gray-200 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <div class="flex-1 flex flex-col bg-warm-gray-50">
              <div class="flex-1 flex items-center justify-center p-8 overflow-auto">
                <canvas
                  ref="canvasRef"
                  @mousedown="handleCanvasMouseDown"
                  :class="[
                    'max-w-full max-h-full bg-white shadow-lg rounded-xl',
                    activeTab === 'crop' ? 'cursor-crosshair' : 'cursor-default'
                  ]"
                />
              </div>

              <div class="p-6 bg-white border-t border-warm-gray-100 flex justify-end gap-3">
                <button
                  @click="handleClose"
                  class="px-6 py-2.5 rounded-full text-sm font-medium bg-warm-gray-100 text-warm-gray-600 hover:bg-warm-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  @click="saveImage"
                  class="px-6 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-soft-pink-400 to-cream-yellow-400 text-white shadow-soft hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Check class="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
