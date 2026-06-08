<script setup lang="ts">
import { ref, computed } from 'vue';
import { Lock, Eye, EyeOff, Sparkles } from 'lucide-vue-next';
import { usePassword } from '@/composables/usePassword';
import { useSettingsStore } from '@/stores/settings';
import { useGreeting } from '@/composables/useGreeting';

const { password, error, loading, showPassword, verifyAndUnlock } = usePassword();
const settingsStore = useSettingsStore();
const { greeting, encouragement } = useGreeting();

const localPassword = ref('');
const inputError = ref<string | null>(null);
const shakeInput = ref(false);

async function handleUnlock() {
  if (!localPassword.value) {
    inputError.value = '请输入密码';
    shakeInput.value = true;
    setTimeout(() => { shakeInput.value = false; }, 500);
    return;
  }
  
  const valid = await verifyAndUnlock(localPassword.value);
  if (!valid) {
    inputError.value = error.value || '密码错误，请重试';
    shakeInput.value = true;
    setTimeout(() => { shakeInput.value = false; }, 500);
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleUnlock();
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-soft-pink-100 via-cream-yellow-50 to-mint-green-100"></div>
    
    <div class="absolute top-10 left-10 text-5xl star animate-float opacity-40">✨</div>
    <div class="absolute top-1/4 right-16 text-4xl star animate-float-slow opacity-30">⭐</div>
    <div class="absolute bottom-20 left-1/4 text-3xl star opacity-25">🌟</div>
    <div class="absolute bottom-1/4 right-10 text-4xl star animate-float opacity-35">💫</div>
    <div class="absolute top-1/2 left-20 text-2xl star animate-float-slow opacity-20">✨</div>
    
    <div class="relative z-10 w-full max-w-md">
      <div class="text-center mb-10 animate-fade-in">
        <div class="w-24 h-24 rounded-full bg-white/80 backdrop-blur-sm shadow-soft flex items-center justify-center mx-auto mb-6 animate-float">
          <span class="text-5xl">💌</span>
        </div>
        <h1 class="font-serif-sc text-3xl font-bold text-warm-gray-800 mb-2">
          时间胶囊
        </h1>
        <p class="text-warm-gray-600 italic">{{ greeting }}</p>
      </div>

      <div class="bg-white/80 backdrop-blur-md rounded-3xl shadow-soft p-8 animate-scale-in">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-full bg-soft-pink-100 flex items-center justify-center mx-auto mb-4 animate-breath">
            <Lock class="w-8 h-8 text-soft-pink-400" />
          </div>
          <h2 class="font-serif-sc text-xl font-semibold text-warm-gray-800 mb-2">
            请输入密码解锁
          </h2>
          <p class="text-sm text-warm-gray-500">
            {{ encouragement }}
          </p>
        </div>

        <div class="space-y-6">
          <div class="relative">
            <input
              v-model="localPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              :class="[
                'input-soft text-center text-lg tracking-widest pr-12',
                shakeInput ? 'animate-shake' : ''
              ]"
              @keydown="handleKeydown"
              @input="inputError = null"
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
            v-if="inputError" 
            class="text-sm text-red-500 text-center animate-shake"
          >
            {{ inputError }}
          </p>

          <button
            @click="handleUnlock"
            :disabled="loading || !localPassword"
            class="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <Sparkles v-else class="w-5 h-5" />
            {{ loading ? '解锁中...' : '解锁应用' }}
          </button>
        </div>

        <div class="mt-8 text-center">
          <p class="text-xs text-warm-gray-400">
            💡 忘记密码？很抱歉，为了保护你的隐私，我们无法帮你找回密码。
            <br/>你可以在设置中清除所有数据重新开始。
          </p>
        </div>
      </div>

      <div class="mt-8 text-center">
        <p class="text-sm text-warm-gray-500 font-serif-sc">
          ✨ 每一次等待，都是为了更好的相遇
        </p>
      </div>
    </div>
  </div>
</template>
