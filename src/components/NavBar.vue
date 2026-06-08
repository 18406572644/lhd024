<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Home, PenSquare, Grid3X3, Clock, Settings, Menu, X, FileText } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const mobileMenuOpen = ref(false);

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/write', label: '写胶囊', icon: PenSquare },
  { path: '/templates', label: '模板', icon: FileText },
  { path: '/categories', label: '分类', icon: Grid3X3 },
  { path: '/history', label: '历史', icon: Clock },
  { path: '/settings', label: '设置', icon: Settings },
];

const isActive = (path: string) => route.path === path;

function navigateTo(path: string) {
  router.push(path);
  mobileMenuOpen.value = false;
}

const currentLabel = computed(() => {
  const item = navItems.find(item => item.path === route.path);
  return item?.label || '';
});
</script>

<template>
  <nav class="sticky top-0 z-50 glass-soft border-b border-white/20 backdrop-blur-md">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-2">
          <span class="text-2xl">💌</span>
          <h1 class="font-serif-sc text-lg font-semibold text-warm-gray-800 hidden sm:block">
            时间胶囊
          </h1>
          <span class="text-sm text-warm-gray-500 sm:hidden">{{ currentLabel }}</span>
        </div>

        <div class="hidden md:flex items-center gap-1">
          <button
            v-for="item in navItems"
            :key="item.path"
            @click="navigateTo(item.path)"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
              isActive(item.path)
                ? 'bg-soft-pink-100 text-warm-gray-800 shadow-soft'
                : 'text-warm-gray-600 hover:bg-warm-gray-100 hover:text-warm-gray-800'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>
          </button>
        </div>

        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-full hover:bg-warm-gray-100 transition-colors"
        >
          <Menu v-if="!mobileMenuOpen" class="w-5 h-5 text-warm-gray-700" />
          <X v-else class="w-5 h-5 text-warm-gray-700" />
        </button>
      </div>
    </div>

    <Transition name="slide-up">
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-warm-gray-200 bg-white/90 backdrop-blur-md">
        <div class="container mx-auto px-4 py-3 space-y-1">
          <button
            v-for="item in navItems"
            :key="item.path"
            @click="navigateTo(item.path)"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300',
              isActive(item.path)
                ? 'bg-soft-pink-100 text-warm-gray-800'
                : 'text-warm-gray-600 hover:bg-warm-gray-50'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span class="font-medium">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </nav>
</template>
