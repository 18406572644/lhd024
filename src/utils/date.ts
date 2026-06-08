import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export { dayjs };

export function formatDate(date: string | Date, format: string = 'YYYY年MM月DD日'): string {
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY年MM月DD日 HH:mm');
}

export function fromNow(date: string | Date): string {
  return dayjs(date).fromNow();
}

export function toNow(date: string | Date): string {
  return dayjs(date).toNow();
}

export function isPast(date: string | Date): boolean {
  return dayjs().isAfter(date);
}

export function isFuture(date: string | Date): boolean {
  return dayjs().isBefore(date);
}

export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

export function isComingSoon(date: string | Date, days: number = 7): boolean {
  const target = dayjs(date);
  const now = dayjs();
  const diff = target.diff(now, 'day');
  return diff >= 0 && diff <= days;
}

export function addMonths(date: string | Date, months: number): string {
  return dayjs(date).add(months, 'month').toISOString();
}

export function getGreetingTime(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = dayjs().hour();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 23) return 'evening';
  return 'night';
}

export function getCountdown(date: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const target = dayjs(date);
  const now = dayjs();
  const diff = target.diff(now);
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, isExpired: false };
}

export function formatCountdown(countdown: ReturnType<typeof getCountdown>): string {
  if (countdown.isExpired) return '已到期';
  
  const parts: string[] = [];
  if (countdown.days > 0) parts.push(`${countdown.days}天`);
  if (countdown.hours > 0) parts.push(`${countdown.hours}小时`);
  if (countdown.minutes > 0) parts.push(`${countdown.minutes}分钟`);
  
  if (parts.length === 0) {
    return `${countdown.seconds}秒`;
  }
  
  return parts.join(' ');
}
