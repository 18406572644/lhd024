import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getGreetingTime, formatDate } from '../utils/date';
import { GREETINGS, ENCOURAGEMENTS } from '../types';

export function useGreeting() {
  const currentTime = ref(new Date());
  let timer: number | null = null;

  const greetingTime = computed(() => getGreetingTime());
  
  const greeting = computed(() => {
    const greetings = GREETINGS[greetingTime.value];
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  });

  const encouragement = computed(() => {
    const randomIndex = Math.floor(Math.random() * ENCOURAGEMENTS.length);
    return ENCOURAGEMENTS[randomIndex];
  });

  const formattedDate = computed(() => {
    return formatDate(currentTime.value, 'YYYY年MM月DD日 dddd');
  });

  const currentHour = computed(() => currentTime.value.getHours());

  function updateTime() {
    currentTime.value = new Date();
  }

  onMounted(() => {
    updateTime();
    timer = window.setInterval(updateTime, 60000);
  });

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  return {
    greeting,
    encouragement,
    formattedDate,
    currentHour,
    greetingTime,
  };
}
