<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Lock, Unlock, Shield, Clock, Trash2, Eye, EyeOff, Check, AlertTriangle, HardDrive } from 'lucide-vue-next';
import { useSettingsStore } from '@/stores/settings';
import { usePassword } from '@/composables/usePassword';
import { useCapsulesStore } from '@/stores/capsules';
import { clearStorage } from '@/utils/storage';
import StorageManager from '@/components/attachment/StorageManager.vue';

const settingsStore = useSettingsStore();
const { password, confirmPassword, error, loading, showPassword, setNewPassword, changePassword, removeCurrentPassword, lockApp } = usePassword();
const capsulesStore = useCapsulesStore();

const activeTab = ref<'password' | 'privacy' | 'storage' | 'danger'>('password');
const showChangePassword = ref(false);
const oldPassword = ref('');
const showOldPassword = ref(false);
const showSuccessMessage = ref(false);
const successMessage = ref('');
const showClearConfirm = ref(false);

const hasPassword = computed(() => settingsStore.hasPassword);

function showSuccess(msg: string) {
  successMessage.value = msg;
  showSuccessMessage.value = true;
  setTimeout(() => {
    showSuccessMessage.value = false;
  }, 3000);
}

async function handleSetPassword() {
  const success = await setNewPassword(password.value, confirmPassword.value);
  if (success) {
    showSuccess('密码设置成功！');
    password.value = '';
    confirmPassword.value = '';
  }
}

async function handleChangePassword() {
  const success = await changePassword(oldPassword.value, password.value, confirmPassword.value);
  if (success) {
    showSuccess('密码修改成功！');
    oldPassword.value = '';
    password.value = '';
    confirmPassword.value = '';
    showChangePassword.value = false;
  }
}

async function handleRemovePassword() {
  const success = await removeCurrentPassword(oldPassword.value);
  if (success) {
    showSuccess('密码已移除');
    oldPassword.value = '';
    showChangePassword.value = false;
  }
}

async function handleAutoLockChange() {
  await settingsStore.updateSettings({
    autoLock: settingsStore.settings.autoLock,
  });
  showSuccess(settingsStore.settings.autoLock ? '自动锁屏已开启' : '自动锁屏已关闭');
}

async function handleAutoLockTimeChange() {
  await settingsStore.updateSettings({
    autoLockTime: settingsStore.settings.autoLockTime,
  });
}

async function handleClearAllData() {
  if (!confirm('确定要清除所有数据吗？这个操作无法撤销，所有胶囊和设置都将被删除！')) {
    return;
  }
  
  clearStorage();
  window.location.reload();
}

watch(showChangePassword, (val) => {
  if (!val) {
    oldPassword.value = '';
    password.value = '';
    confirmPassword.value = '';
    error.value = null;
  }
});
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-2xl">
      <div class="mb-8 animate-fade-in">
        <h1 class="font-serif-sc text-3xl font-bold text-warm-gray-800 mb-2">
          设置 ⚙️
        </h1>
        <p class="text-warm-gray-600">
          管理你的隐私和应用设置
        </p>
      </div>

      <Transition name="fade">
        <div 
          v-if="showSuccessMessage" 
          class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-mint-green-100 text-mint-green-700 px-6 py-3 rounded-full shadow-soft flex items-center gap-2 animate-slide-up"
        >
          <Check class="w-5 h-5" />
          {{ successMessage }}
        </div>
      </Transition>

      <div class="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-soft">
        <button
          v-for="tab in [
            { key: 'password', label: '密码设置', icon: Lock },
            { key: 'privacy', label: '隐私保护', icon: Shield },
            { key: 'storage', label: '存储管理', icon: HardDrive },
            { key: 'danger', label: '危险操作', icon: AlertTriangle },
          ]"
          :key="tab.key"
          @click="activeTab = tab.key as 'password' | 'privacy' | 'storage' | 'danger'"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap',
            activeTab === tab.key
              ? 'bg-soft-pink-200 text-warm-gray-800 shadow-soft'
              : 'bg-white text-warm-gray-600 hover:bg-warm-gray-50 border border-warm-gray-200'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <div class="card-soft space-y-6 animate-slide-up">
        <template v-if="activeTab === 'password'">
          <div v-if="!hasPassword && !showChangePassword">
            <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800 mb-4 flex items-center gap-2">
              <Lock class="w-5 h-5 text-soft-pink-400" />
              设置应用密码
            </h3>
            <p class="text-warm-gray-500 mb-6">
              设置密码可以保护你的隐私，每次打开应用时需要输入密码才能访问。
            </p>
            
            <div class="space-y-4">
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码（至少4位）"
                  class="input-soft pr-12"
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
              
              <div class="relative">
                <input
                  v-model="confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请再次输入密码"
                  class="input-soft pr-12"
                />
              </div>
              
              <p v-if="error" class="text-sm text-red-500 animate-shake">{{ error }}</p>
              
              <button
                @click="handleSetPassword"
                :disabled="loading || !password || !confirmPassword"
                class="btn-primary w-full disabled:opacity-50"
              >
                {{ loading ? '设置中...' : '设置密码' }}
              </button>
            </div>
          </div>

          <div v-else-if="hasPassword && !showChangePassword">
            <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800 mb-4 flex items-center gap-2">
              <Unlock class="w-5 h-5 text-mint-green-400" />
              密码已设置
            </h3>
            <p class="text-warm-gray-500 mb-6">
              你的应用已受到密码保护。你可以修改密码或移除密码保护。
            </p>
            
            <div class="space-y-3">
              <button
                @click="showChangePassword = true; oldPassword = ''"
                class="btn-secondary w-full"
              >
                修改密码
              </button>
              <button
                @click="lockApp"
                class="btn-primary w-full"
              >
                立即锁定应用
              </button>
            </div>
          </div>

          <div v-else-if="showChangePassword">
            <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800 mb-4">
              {{ hasPassword ? '修改密码' : '设置密码' }}
            </h3>
            
            <div class="space-y-4">
              <div v-if="hasPassword" class="relative">
                <input
                  v-model="oldPassword"
                  :type="showOldPassword ? 'text' : 'password'"
                  placeholder="请输入当前密码"
                  class="input-soft pr-12"
                />
                <button
                  type="button"
                  @click="showOldPassword = !showOldPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray-400 hover:text-warm-gray-600"
                >
                  <Eye v-if="!showOldPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入新密码（至少4位）"
                  class="input-soft pr-12"
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
              
              <div class="relative">
                <input
                  v-model="confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请再次输入新密码"
                  class="input-soft pr-12"
                />
              </div>
              
              <p v-if="error" class="text-sm text-red-500 animate-shake">{{ error }}</p>
              
              <div class="flex gap-3">
                <button
                  @click="showChangePassword = false"
                  class="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  @click="handleChangePassword"
                  :disabled="loading"
                  class="btn-primary flex-1 disabled:opacity-50"
                >
                  {{ loading ? '处理中...' : '确认修改' }}
                </button>
              </div>
              
              <button
                v-if="hasPassword"
                @click="handleRemovePassword"
                :disabled="loading"
                class="w-full py-3 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
              >
                移除密码保护
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'privacy'">
          <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800 mb-4 flex items-center gap-2">
            <Shield class="w-5 h-5 text-lavender-300" />
            隐私保护设置
          </h3>
          
          <div class="space-y-6">
            <div class="flex items-start justify-between p-4 bg-warm-gray-50 rounded-2xl">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <Clock class="w-4 h-4 text-cream-yellow-400" />
                  <span class="font-medium text-warm-gray-700">自动锁屏</span>
                </div>
                <p class="text-sm text-warm-gray-500">
                  应用闲置一段时间后自动锁定
                </p>
              </div>
              <button
                @click="handleAutoLockChange"
                :class="[
                  'relative w-14 h-8 rounded-full transition-colors duration-300 flex-shrink-0',
                  settingsStore.settings.autoLock ? 'bg-cream-yellow-200' : 'bg-warm-gray-200'
                ]"
              >
                <span
                  :class="[
                    'absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300',
                    settingsStore.settings.autoLock ? 'left-7' : 'left-1'
                  ]"
                ></span>
              </button>
            </div>
            
            <div v-if="settingsStore.settings.autoLock" class="p-4 bg-warm-gray-50 rounded-2xl">
              <label class="block text-sm font-medium text-warm-gray-700 mb-3">
                自动锁屏时间
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="time in [5, 10, 30, 60]"
                  :key="time"
                  @click="settingsStore.settings.autoLockTime = time; handleAutoLockTimeChange()"
                  :class="[
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                    settingsStore.settings.autoLockTime === time
                      ? 'bg-cream-yellow-200 text-warm-gray-800 shadow-soft'
                      : 'bg-white text-warm-gray-600 hover:bg-warm-gray-100 border border-warm-gray-200'
                  ]"
                >
                  {{ time }}分钟
                </button>
              </div>
            </div>

            <div class="p-4 bg-soft-pink-50 rounded-2xl border border-soft-pink-100">
              <h4 class="font-medium text-warm-gray-800 mb-2 flex items-center gap-2">
                <Lock class="w-4 h-4 text-soft-pink-400" />
                关于私密胶囊
              </h4>
              <p class="text-sm text-warm-gray-600">
                在创建胶囊时可以标记为"私密胶囊"，查看私密胶囊时需要额外输入密码验证，
                即使应用已解锁也需要验证。这为你的重要信件提供了双重保护。
              </p>
            </div>

            <div class="p-4 bg-mint-green-50 rounded-2xl border border-mint-green-100">
              <h4 class="font-medium text-warm-gray-800 mb-2 flex items-center gap-2">
                <Shield class="w-4 h-4 text-mint-green-400" />
                数据加密说明
              </h4>
              <p class="text-sm text-warm-gray-600">
                所有胶囊内容在本地存储前都会进行加密处理，保护你的隐私安全。
                数据仅保存在你的设备本地，不会上传到任何服务器。
              </p>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'storage'">
          <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800 mb-4 flex items-center gap-2">
            <HardDrive class="w-5 h-5 text-sky-blue-400" />
            存储管理
          </h3>
          <StorageManager />
        </template>

        <template v-else-if="activeTab === 'danger'">
          <h3 class="font-serif-sc text-lg font-semibold text-warm-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-red-400" />
            危险操作
          </h3>
          
          <div class="space-y-4">
            <div class="p-4 bg-red-50 rounded-2xl border border-red-100">
              <h4 class="font-medium text-red-700 mb-2 flex items-center gap-2">
                <Trash2 class="w-4 h-4" />
                清除所有数据
              </h4>
              <p class="text-sm text-red-600 mb-4">
                此操作将删除所有胶囊和设置数据，且无法恢复。请谨慎操作。
              </p>
              
              <button
                v-if="!showClearConfirm"
                @click="showClearConfirm = true"
                class="px-4 py-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors text-sm"
              >
                清除所有数据
              </button>
              
              <div v-else class="space-y-3">
                <p class="text-sm text-red-600 font-medium">
                  ⚠️ 确定要清除所有数据吗？
                </p>
                <div class="flex gap-2">
                  <button
                    @click="showClearConfirm = false"
                    class="px-4 py-2 rounded-full text-sm bg-white border border-warm-gray-200 text-warm-gray-600 hover:bg-warm-gray-50"
                  >
                    取消
                  </button>
                  <button
                    @click="handleClearAllData"
                    class="px-4 py-2 rounded-full text-sm bg-red-500 text-white hover:bg-red-600"
                  >
                    确认清除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="mt-8 text-center text-warm-gray-400 text-sm">
        <p>💌 时间胶囊 · 写给未来的信</p>
        <p class="mt-1">愿每一份思念，都能穿越时光，温暖未来的你</p>
      </div>
    </div>
  </div>
</template>
