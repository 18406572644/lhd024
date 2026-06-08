<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from '@/components/NavBar.vue';
import { useSettingsStore } from '@/stores/settings';

const route = useRoute();
const settingsStore = useSettingsStore();

const showNavBar = computed(() => 
  route.path !== '/lock' && settingsStore.isUnlocked
);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <div class="flex-1 flex flex-col">
          <NavBar v-if="showNavBar" />
          <main class="flex-1">
            <component :is="Component" />
          </main>
        </div>
      </Transition>
    </router-view>
  </div>
</template>
