<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Eye, EyeOff, Lock } from 'lucide-vue-next';
import { usePassword } from '../composables/usePassword';

const props = defineProps<{
  show: boolean;
  title?: string;
  description?: string;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  success: [];
  cancel: [];
}>();

const { password, error, loading, showPassword, verifyAndUnlock } = usePassword();

const localPassword = ref('');
const localError = ref<string | null>(null);
const localLoading = ref(false);

watch(() => props.show, (val) => {
  if (!val) {
    localPassword.value = '';
    localError.value = null;
  }
});

async function handleSubmit() {
  if (!localPassword.value) {
    localError.value = '请输入密码';
    return;
  }
  
  localLoading.value = true;
  localError.value = null;
  
  try {
    const valid = await verifyAndUnlock(localPassword.value);
    if (valid) {
      emit('success');
      emit('update:show', false);
    } else {
      localError.value = error.value || '密码错误';
    }
  } finally {
    localLoading.value = false;
  }
}

function handleCancel() {
  emit('cancel');
  emit('update:show', false);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="show" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div 
          class="absolute inset-0 bg-warm-gray-900/50 backdrop-blur-sm"
          @click="handleCancel"
        ></div>
        
        <Transition name="slide-up">
          <div 
            v-if="show"
            class="relative bg-white rounded-3xl shadow-soft p-8 w-full max-w-md animate-scale-in"
          >
            <button
              @click="handleCancel"
              class="absolute top-4 right-4 p-2 rounded-full hover:bg-warm-gray-100 transition-colors"
            >
              <X class="w-5 h-5 text-warm-gray-500" />
            </button>

            <div class="text-center mb-6">
              <div class="w-16 h-16 rounded-full bg-soft-pink-100 flex items-center justify-center mx-auto mb-4">
                <Lock class="w-8 h-8 text-soft-pink-400" />
              </div>
              <h3 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-2">
                {{ title || '请输入密码' }}
              </h3>
              <p class="text-sm text-warm-gray-500">
                {{ description || '为了保护您的隐私，请输入密码验证' }}
              </p>
            </div>

            <div class="space-y-4">
              <div class="relative">
                <input
                  v-model="localPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="input-soft pr-12"
                  @keyup.enter="handleSubmit"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray-400 hover:text-warm-gray-600"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>

              <p 
                v-if="localError" 
                class="text-sm text-red-500 text-center animate-shake"
              >
                {{ localError }}
              </p>

              <div class="flex gap-3 pt-2">
                <button
                  @click="handleCancel"
                  class="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  @click="handleSubmit"
                  :disabled="localLoading"
                  class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="localLoading" class="flex items-center justify-center gap-2">
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    验证中...
                  </span>
                  <span v-else>确认</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
