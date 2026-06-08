<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { X, Download, Image as ImageIcon, Palette, Type, QrCode, Sparkles, Check, Copy, Share2, Globe, Lock } from 'lucide-vue-next';
import html2canvas from 'html2canvas';
import type { Capsule, PostcardConfig, PostcardTemplate, ContentDisplayMode } from '@/types';
import { POSTCARD_TEMPLATES, DECOR_ELEMENTS, CONTENT_DISPLAY_MODES } from '@/types';
import { generateQRCodeDataUrl } from '@/utils/qrcode';
import { generateShareLink, updateCapsule } from '@/utils/api';
import LetterPostcardTemplate from './postcard/LetterPostcardTemplate.vue';
import PolaroidPostcardTemplate from './postcard/PolaroidPostcardTemplate.vue';
import VintagePostcardTemplate from './postcard/VintagePostcardTemplate.vue';
import MinimalPostcardTemplate from './postcard/MinimalPostcardTemplate.vue';

const props = defineProps<{
  show: boolean;
  capsule: Capsule | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const config = ref<PostcardConfig>({
  template: 'letter',
  displayMode: 'full',
  showQRCode: false,
  decorElements: [],
  customBackground: undefined,
});

const qrCodeDataUrl = ref<string | undefined>(undefined);
const isGenerating = ref(false);
const isUpdatingPublic = ref(false);
const activeTab = ref<'template' | 'content' | 'decor'>('template');
const previewRef = ref<HTMLElement | null>(null);
const showCopySuccess = ref(false);
const localCapsule = ref<Capsule | null>(null);

onMounted(() => {
  if (props.capsule) {
    localCapsule.value = { ...props.capsule };
  }
});

watch(() => props.show, (newVal) => {
  if (newVal && props.capsule) {
    localCapsule.value = { ...props.capsule };
    config.value = {
      template: 'letter',
      displayMode: 'full',
      showQRCode: props.capsule.isPublic,
      decorElements: [],
      customBackground: undefined,
    };
    if (props.capsule.isPublic) {
      generateQRCode();
    }
  }
});

watch(() => config.value.showQRCode, async (newVal) => {
  if (newVal && localCapsule.value?.isPublic) {
    await generateQRCode();
  } else {
    qrCodeDataUrl.value = undefined;
  }
});

watch(() => localCapsule.value?.isPublic, async (newVal) => {
  if (newVal && config.value.showQRCode) {
    await generateQRCode();
  }
});

async function generateQRCode() {
  if (!localCapsule.value) return;
  try {
    const shareLink = generateShareLink(localCapsule.value.id);
    qrCodeDataUrl.value = await generateQRCodeDataUrl(shareLink, 128);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
  }
}

function selectTemplate(template: PostcardTemplate) {
  config.value.template = template;
}

function selectDisplayMode(mode: ContentDisplayMode) {
  config.value.displayMode = mode;
}

function toggleDecorElement(elementId: string) {
  const index = config.value.decorElements.indexOf(elementId);
  if (index === -1) {
    if (config.value.decorElements.length < 6) {
      config.value.decorElements.push(elementId);
    }
  } else {
    config.value.decorElements.splice(index, 1);
  }
}

function handleBackgroundUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      config.value.customBackground = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function clearBackground() {
  config.value.customBackground = undefined;
}

async function togglePublic() {
  if (!localCapsule.value) return;
  
  isUpdatingPublic.value = true;
  try {
    const newIsPublic = !localCapsule.value.isPublic;
    const updated = await updateCapsule(localCapsule.value.id, { isPublic: newIsPublic });
    if (updated) {
      localCapsule.value.isPublic = newIsPublic;
      if (!newIsPublic) {
        config.value.showQRCode = false;
        qrCodeDataUrl.value = undefined;
      }
    }
  } catch (error) {
    console.error('Failed to update public status:', error);
  } finally {
    isUpdatingPublic.value = false;
  }
}

async function generateImage() {
  if (!previewRef.value || !localCapsule.value) return;
  
  isGenerating.value = true;
  try {
    const canvas = await html2canvas(previewRef.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });
    
    const link = document.createElement('a');
    link.download = `时间胶囊_${localCapsule.value.title}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Failed to generate image:', error);
    alert('生成图片失败，请重试');
  } finally {
    isGenerating.value = false;
  }
}

async function copyShareLink() {
  if (!localCapsule.value) return;
  
  const shareLink = generateShareLink(localCapsule.value.id);
  try {
    await navigator.clipboard.writeText(shareLink);
    showCopySuccess.value = true;
    setTimeout(() => {
      showCopySuccess.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy link:', error);
  }
}

const templateComponent = computed(() => {
  switch (config.value.template) {
    case 'letter': return LetterPostcardTemplate;
    case 'polaroid': return PolaroidPostcardTemplate;
    case 'vintage': return VintagePostcardTemplate;
    case 'minimal': return MinimalPostcardTemplate;
    default: return LetterPostcardTemplate;
  }
});

const canShowQR = computed(() => {
  return localCapsule.value?.isPublic ?? false;
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-gray-900/60 backdrop-blur-sm">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scale-in">
          <div class="flex items-center justify-between p-6 border-b border-warm-gray-100">
            <div>
              <h2 class="font-serif-sc text-2xl font-bold text-warm-gray-800">生成分享明信片</h2>
              <p class="text-sm text-warm-gray-500 mt-1">选择模板和样式，生成精美的分享卡片</p>
            </div>
            <button 
              @click="emit('close')"
              class="p-2 rounded-full hover:bg-warm-gray-100 text-warm-gray-500 hover:text-warm-gray-700 transition-colors"
            >
              <X class="w-6 h-6" />
            </button>
          </div>

          <div v-if="localCapsule" class="flex h-[calc(90vh-120px)]">
            <div class="w-80 border-r border-warm-gray-100 flex flex-col overflow-hidden">
              <div class="flex border-b border-warm-gray-100">
                <button 
                  v-for="tab in [{ id: 'template', label: '模板', icon: Palette }, { id: 'content', label: '内容', icon: Type }, { id: 'decor', label: '装饰', icon: Sparkles }]"
                  :key="tab.id"
                  @click="activeTab = tab.id as any"
                  :class="[
                    'flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1',
                    activeTab === tab.id 
                      ? 'text-soft-pink-500 border-b-2 border-soft-pink-400' 
                      : 'text-warm-gray-500 hover:text-warm-gray-700'
                  ]"
                >
                  <component :is="tab.icon" class="w-4 h-4" />
                  {{ tab.label }}
                </button>
              </div>

              <div class="flex-1 overflow-y-auto p-4 scrollbar-soft">
                <div v-if="activeTab === 'template'" class="space-y-4">
                  <div class="mb-4 p-4 bg-warm-gray-50 rounded-2xl">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-warm-gray-700 flex items-center gap-2">
                        <Globe class="w-4 h-4" />
                        公开分享
                      </span>
                      <button
                        @click="togglePublic"
                        :disabled="isUpdatingPublic"
                        :class="[
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          localCapsule.isPublic ? 'bg-mint-green-400' : 'bg-warm-gray-300'
                        ]"
                      >
                        <span
                          :class="[
                            'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                            localCapsule.isPublic ? 'translate-x-5' : 'translate-x-0.5'
                          ]"
                        />
                      </button>
                    </div>
                    <p class="text-xs text-warm-gray-500">
                      {{ localCapsule.isPublic ? '已公开，他人可通过链接查看' : '仅自己可见，开启后可生成分享链接' }}
                    </p>
                  </div>

                  <h3 class="text-sm font-medium text-warm-gray-700 mb-3">选择模板</h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div
                      v-for="template in POSTCARD_TEMPLATES"
                      :key="template.id"
                      @click="selectTemplate(template.id)"
                      :class="[
                        'relative p-4 rounded-2xl border-2 cursor-pointer transition-all',
                        config.template === template.id
                          ? 'border-soft-pink-400 bg-soft-pink-50'
                          : 'border-warm-gray-200 hover:border-warm-gray-300 bg-white'
                      ]"
                    >
                      <div v-if="config.template === template.id" class="absolute top-2 right-2">
                        <Check class="w-4 h-4 text-soft-pink-500" />
                      </div>
                      <div class="text-2xl mb-2">
                        <span v-if="template.id === 'letter'">📜</span>
                        <span v-else-if="template.id === 'polaroid'">📷</span>
                        <span v-else-if="template.id === 'vintage'">📮</span>
                        <span v-else>💳</span>
                      </div>
                      <div class="text-sm font-medium text-warm-gray-800">{{ template.name }}</div>
                      <div class="text-xs text-warm-gray-500 mt-1">{{ template.description }}</div>
                    </div>
                  </div>

                  <div class="mt-6">
                    <h3 class="text-sm font-medium text-warm-gray-700 mb-3">自定义背景</h3>
                    <div v-if="config.customBackground" class="relative">
                      <img :src="config.customBackground" class="w-full h-32 object-cover rounded-xl" />
                      <button 
                        @click="clearBackground"
                        class="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-warm-gray-600 hover:text-red-500 transition-colors"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                    <label v-else class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-warm-gray-300 rounded-xl cursor-pointer hover:border-soft-pink-300 hover:bg-soft-pink-50 transition-colors">
                      <ImageIcon class="w-8 h-8 text-warm-gray-400 mb-2" />
                      <span class="text-sm text-warm-gray-500">点击上传背景图</span>
                      <span class="text-xs text-warm-gray-400 mt-1">支持 JPG、PNG 格式</span>
                      <input type="file" accept="image/*" class="hidden" @change="handleBackgroundUpload" />
                    </label>
                  </div>

                  <div class="mt-6">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="text-sm font-medium text-warm-gray-700 flex items-center gap-2">
                        <QrCode class="w-4 h-4" />
                        显示二维码
                      </h3>
                      <button
                        @click="config.showQRCode = !config.showQRCode"
                        :disabled="!canShowQR"
                        :class="[
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          config.showQRCode && canShowQR ? 'bg-mint-green-400' : 'bg-warm-gray-300',
                          !canShowQR && 'opacity-50 cursor-not-allowed'
                        ]"
                      >
                        <span
                          :class="[
                            'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                            config.showQRCode && canShowQR ? 'translate-x-5' : 'translate-x-0.5'
                          ]"
                        />
                      </button>
                    </div>
                    <p v-if="!canShowQR" class="text-xs text-amber-600 flex items-center gap-1">
                      <Lock class="w-3 h-3" />
                      请先开启公开分享
                    </p>
                    <p v-else class="text-xs text-warm-gray-500">
                      扫码可查看完整胶囊内容
                    </p>
                    
                    <div v-if="canShowQR && config.showQRCode" class="mt-3">
                      <button
                        @click="copyShareLink"
                        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-warm-gray-100 hover:bg-warm-gray-200 rounded-xl text-sm text-warm-gray-700 transition-colors"
                      >
                        <component :is="showCopySuccess ? Check : Copy" class="w-4 h-4" />
                        {{ showCopySuccess ? '已复制' : '复制分享链接' }}
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="activeTab === 'content'" class="space-y-4">
                  <h3 class="text-sm font-medium text-warm-gray-700 mb-3">内容展示方式</h3>
                  <div class="space-y-2">
                    <div
                      v-for="mode in CONTENT_DISPLAY_MODES"
                      :key="mode.id"
                      @click="selectDisplayMode(mode.id as any)"
                      :class="[
                        'p-4 rounded-2xl border-2 cursor-pointer transition-all',
                        config.displayMode === mode.id
                          ? 'border-soft-pink-400 bg-soft-pink-50'
                          : 'border-warm-gray-200 hover:border-warm-gray-300 bg-white'
                      ]"
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="text-sm font-medium text-warm-gray-800">{{ mode.name }}</div>
                          <div class="text-xs text-warm-gray-500 mt-1">{{ mode.description }}</div>
                        </div>
                        <div v-if="config.displayMode === mode.id">
                          <Check class="w-5 h-5 text-soft-pink-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-6 p-4 bg-warm-gray-50 rounded-2xl">
                    <h4 class="text-sm font-medium text-warm-gray-700 mb-2">当前胶囊</h4>
                    <p class="text-sm text-warm-gray-600 font-medium">{{ localCapsule.title }}</p>
                    <p class="text-xs text-warm-gray-500 mt-1">
                      创建于 {{ new Date(localCapsule.createdAt).toLocaleDateString('zh-CN') }}
                    </p>
                    <div class="mt-2 text-xs text-warm-gray-400">
                      内容长度：{{ localCapsule.content.length }} 字
                    </div>
                  </div>
                </div>

                <div v-if="activeTab === 'decor'" class="space-y-4">
                  <h3 class="text-sm font-medium text-warm-gray-700 mb-3">
                    装饰元素 
                    <span class="text-xs text-warm-gray-400">(最多选择6个)</span>
                  </h3>
                  <div class="grid grid-cols-4 gap-2">
                    <div
                      v-for="element in DECOR_ELEMENTS"
                      :key="element.id"
                      @click="toggleDecorElement(element.id)"
                      :class="[
                        'aspect-square flex flex-col items-center justify-center rounded-xl border-2 cursor-pointer transition-all',
                        config.decorElements.includes(element.id)
                          ? 'border-soft-pink-400 bg-soft-pink-50'
                          : 'border-warm-gray-200 hover:border-warm-gray-300 bg-white',
                        !config.decorElements.includes(element.id) && config.decorElements.length >= 6 && 'opacity-50 cursor-not-allowed'
                      ]"
                    >
                      <span class="text-2xl">{{ element.emoji }}</span>
                      <span class="text-xs text-warm-gray-500 mt-1">{{ element.name }}</span>
                    </div>
                  </div>

                  <div v-if="config.decorElements.length > 0" class="mt-4">
                    <h4 class="text-xs font-medium text-warm-gray-600 mb-2">已选择</h4>
                    <div class="flex flex-wrap gap-2">
                      <span 
                        v-for="id in config.decorElements" 
                        :key="id"
                        class="px-3 py-1.5 bg-soft-pink-100 text-soft-pink-700 rounded-full text-sm flex items-center gap-1"
                      >
                        {{ DECOR_ELEMENTS.find(d => d.id === id)?.emoji }}
                        {{ DECOR_ELEMENTS.find(d => d.id === id)?.name }}
                        <button @click="toggleDecorElement(id)" class="hover:text-red-500">
                          <X class="w-3 h-3" />
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-4 border-t border-warm-gray-100">
                <button
                  @click="generateImage"
                  :disabled="isGenerating"
                  class="w-full btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-50"
                >
                  <span v-if="isGenerating" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <Download v-else class="w-5 h-5" />
                  {{ isGenerating ? '生成中...' : '下载明信片' }}
                </button>
              </div>
            </div>

            <div class="flex-1 bg-warm-gray-100 p-8 flex items-center justify-center overflow-auto">
              <div class="transform scale-[0.85] origin-center">
                <div ref="previewRef" class="shadow-2xl">
                  <component
                    :is="templateComponent"
                    :capsule="localCapsule"
                    :display-mode="config.displayMode"
                    :qr-code-data-url="config.showQRCode && canShowQR ? qrCodeDataUrl : undefined"
                    :decor-elements="config.decorElements"
                    :custom-background="config.customBackground"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
