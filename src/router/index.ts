import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import WriteCapsule from '@/pages/WriteCapsule.vue';
import Categories from '@/pages/Categories.vue';
import History from '@/pages/History.vue';
import CapsuleDetail from '@/pages/CapsuleDetail.vue';
import Settings from '@/pages/Settings.vue';
import LockScreen from '@/pages/LockScreen.vue';
import ShareView from '@/pages/ShareView.vue';
import Templates from '@/pages/Templates.vue';
import Growth from '@/pages/Growth.vue';
import { useSettingsStore } from '@/stores/settings';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/write',
    name: 'write',
    component: WriteCapsule,
    meta: { requiresAuth: true },
  },
  {
    path: '/categories',
    name: 'categories',
    component: Categories,
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'history',
    component: History,
    meta: { requiresAuth: true },
  },
  {
    path: '/capsule/:id',
    name: 'capsule-detail',
    component: CapsuleDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: { requiresAuth: true },
  },
  {
    path: '/lock',
    name: 'lock',
    component: LockScreen,
  },
  {
    path: '/share/:id',
    name: 'share',
    component: ShareView,
    meta: { requiresAuth: false },
  },
  {
    path: '/templates',
    name: 'templates',
    component: Templates,
    meta: { requiresAuth: true },
  },
  {
    path: '/growth',
    name: 'growth',
    component: Growth,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const settingsStore = useSettingsStore();
  
  if (settingsStore.loading) {
    await new Promise(resolve => {
      const checkLoading = setInterval(() => {
        if (!settingsStore.loading) {
          clearInterval(checkLoading);
          resolve(true);
        }
      }, 100);
    });
  }

  if (to.meta.requiresAuth && settingsStore.hasPassword && !settingsStore.isUnlocked) {
    next({ path: '/lock' });
  } else if (to.path === '/lock' && settingsStore.isUnlocked) {
    next({ path: '/' });
  } else {
    next();
  }
});

export default router;
