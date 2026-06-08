import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../stores/settings';

export function usePassword() {
  const store = useSettingsStore();
  const router = useRouter();

  const password = ref('');
  const confirmPassword = ref('');
  const error = ref<string | null>(null);
  const loading = ref(false);
  const showPassword = ref(false);

  async function verifyAndUnlock(pwd: string) {
    loading.value = true;
    error.value = null;
    try {
      const valid = await store.verifyPassword(pwd);
      if (valid) {
        password.value = '';
        router.push('/');
        return true;
      } else {
        error.value = '密码错误，请重试';
        return false;
      }
    } catch (e) {
      error.value = '验证失败，请重试';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function setNewPassword(pwd: string, confirmPwd: string) {
    loading.value = true;
    error.value = null;
    try {
      if (pwd !== confirmPwd) {
        error.value = '两次输入的密码不一致';
        return false;
      }
      if (pwd.length < 4) {
        error.value = '密码长度至少4位';
        return false;
      }
      const success = await store.setPassword(pwd);
      if (success) {
        password.value = '';
        confirmPassword.value = '';
        return true;
      }
      return false;
    } catch (e) {
      error.value = '设置密码失败，请重试';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(oldPwd: string, newPwd: string, confirmPwd: string) {
    loading.value = true;
    error.value = null;
    try {
      const valid = await store.verifyPassword(oldPwd);
      if (!valid) {
        error.value = '原密码错误';
        return false;
      }
      if (newPwd !== confirmPwd) {
        error.value = '两次输入的新密码不一致';
        return false;
      }
      if (newPwd.length < 4) {
        error.value = '密码长度至少4位';
        return false;
      }
      const success = await store.setPassword(newPwd);
      if (success) {
        password.value = '';
        confirmPassword.value = '';
        return true;
      }
      return false;
    } catch (e) {
      error.value = '修改密码失败，请重试';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function removeCurrentPassword(pwd: string) {
    loading.value = true;
    error.value = null;
    try {
      const valid = await store.verifyPassword(pwd);
      if (!valid) {
        error.value = '密码错误';
        return false;
      }
      const success = await store.removePassword();
      if (success) {
        password.value = '';
        return true;
      }
      return false;
    } catch (e) {
      error.value = '移除密码失败，请重试';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function lockApp() {
    store.lock();
    router.push('/lock');
  }

  watch(showPassword, (val) => {
    if (!val) {
      password.value = '';
      confirmPassword.value = '';
    }
  });

  return {
    password,
    confirmPassword,
    error,
    loading,
    showPassword,
    verifyAndUnlock,
    setNewPassword,
    changePassword,
    removeCurrentPassword,
    lockApp,
  };
}
