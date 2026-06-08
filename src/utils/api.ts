import type { Capsule, Settings, CapsuleStats, CapsuleCategory, Attachment } from '../types';
import { getStorage, setStorage } from './storage';
import { encrypt, decrypt, generateId } from './encrypt';
import { isPast, isComingSoon } from './date';
import { saveAttachment, deleteAttachmentsByCapsuleId } from './attachmentStorage';

const STORAGE_KEYS = {
  CAPSULES: 'time_capsule_capsules',
  SETTINGS: 'time_capsule_settings',
};

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

function encryptCapsuleContent(capsule: Capsule): Capsule {
  return {
    ...capsule,
    content: encrypt(capsule.content),
    title: encrypt(capsule.title),
  };
}

function decryptCapsuleContent(capsule: Capsule): Capsule {
  return {
    ...capsule,
    content: decrypt(capsule.content),
    title: decrypt(capsule.title),
  };
}

function getDefaultSettings(): Settings {
  return {
    id: generateId(),
    hasPassword: false,
    passwordHash: '',
    theme: 'soft',
    autoLock: false,
    autoLockTime: 5,
  };
}

function getMockCapsules(): Capsule[] {
  const now = new Date();
  const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const soonDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const futureDate1 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const capsules: Capsule[] = [
    {
      id: generateId(),
      title: encrypt('给一年后的自己'),
      content: encrypt('亲爱的未来的我，\n\n今天是一个阳光明媚的日子，我坐在窗前写下这封信。希望一年后的你，依然保持着对生活的热爱，依然在追逐梦想的路上不断前行。\n\n记得要好好照顾自己，不要太累了。还记得我们约定要去看海吗？希望那时的你已经实现了这个小小的愿望。\n\n无论遇到什么困难，都要记得此刻的心情——充满希望，相信美好。\n\n爱你的，\n现在的自己'),
      category: 'growth',
      mood: 'peaceful',
      tags: ['期许', '未来', '成长'],
      createdAt: pastDate.toISOString(),
      openAt: futureDate2.toISOString(),
      isOpened: false,
      isPrivate: true,
      isPublic: false,
      attachments: [],
    },
    {
      id: generateId(),
      title: encrypt('关于我们的梦想'),
      content: encrypt('今天和最好的朋友一起聊了很久，关于我们的梦想，关于未来的计划。我们约定要一起开一家小小的咖啡店，有温暖的阳光，有好闻的咖啡香，有我们喜欢的音乐。\n\n希望那时候的我们，都已经成为了更好的自己，并且还能像现在这样，无话不谈，互相支持。\n\n友情是生命中最珍贵的礼物之一，我会好好珍惜。'),
      category: 'friendship',
      mood: 'excited',
      tags: ['友情', '梦想', '约定'],
      createdAt: pastDate.toISOString(),
      openAt: futureDate1.toISOString(),
      isOpened: false,
      isPrivate: false,
      isPublic: true,
      attachments: [],
    },
    {
      id: generateId(),
      title: encrypt('给爸爸妈妈的悄悄话'),
      content: encrypt('亲爱的爸爸妈妈，\n\n今天是母亲节/父亲节，我想对你们说：谢谢你们一直以来的爱和付出。虽然我不常表达，但我知道，你们是我最坚强的后盾。\n\n希望你们身体健康，天天开心。等我有能力了，一定要带你们去看更多的风景，让你们过上更好的生活。\n\n我爱你们，永远永远。'),
      category: 'family',
      mood: 'grateful',
      tags: ['亲情', '感恩', '父母'],
      createdAt: pastDate.toISOString(),
      openAt: soonDate.toISOString(),
      isOpened: false,
      isPrivate: true,
      isPublic: false,
      attachments: [],
    },
    {
      id: generateId(),
      title: encrypt('那些美好的时光'),
      content: encrypt('今天整理旧照片，看到了去年生日的照片。那天和朋友们一起庆祝，吃了好吃的蛋糕，收到了很多祝福。\n\n时间过得真快，但那些美好的记忆会永远留在心里。希望未来的我，看到这封信时，能够想起这些温暖的时刻，想起那些爱我的人和我爱的人。\n\n生活也许有很多不如意，但美好永远值得被铭记。'),
      category: 'growth',
      mood: 'happy',
      tags: ['回忆', '美好', '感恩'],
      createdAt: pastDate.toISOString(),
      openAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      isOpened: true,
      isPrivate: false,
      isPublic: true,
      attachments: [],
    },
    {
      id: generateId(),
      title: encrypt('我的星愿'),
      content: encrypt('今晚的星空很美，我对着流星许了一个愿望。\n\n希望我能够一直保持初心，做自己喜欢的事情，成为一个温暖的人。希望我的家人和朋友都能健康快乐。希望这个世界能够多一点爱，少一点伤害。\n\n也许愿望不会全部实现，但许愿的那一刻，我是真诚的，是充满希望的。这就够了。'),
      category: 'dream',
      mood: 'peaceful',
      tags: ['愿望', '星空', '希望'],
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      openAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      isOpened: true,
      isPrivate: true,
      isPublic: false,
      attachments: [],
    },
  ];

  return capsules;
}

export async function getPublicCapsuleById(id: string): Promise<Capsule | null> {
  await delay();
  const capsules = getStorage<Capsule[]>(STORAGE_KEYS.CAPSULES, []);
  const capsule = capsules.find(c => c.id === id);
  
  if (!capsule || !capsule.isPublic) return null;
  
  if (!capsule.isOpened && isPast(capsule.openAt)) {
    capsule.isOpened = true;
    setStorage(STORAGE_KEYS.CAPSULES, capsules);
  }
  
  return decryptCapsuleContent(capsule);
}

export function generateShareLink(capsuleId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}${window.location.pathname}#/share/${capsuleId}`;
}

export async function getCapsules(): Promise<Capsule[]> {
  await delay();
  let capsules = getStorage<Capsule[]>(STORAGE_KEYS.CAPSULES, []);
  
  if (capsules.length === 0) {
    capsules = getMockCapsules();
    setStorage(STORAGE_KEYS.CAPSULES, capsules);
  }
  
  capsules = capsules.map(capsule => {
    if (!capsule.isOpened && isPast(capsule.openAt)) {
      return { ...capsule, isOpened: true };
    }
    return capsule;
  });
  
  setStorage(STORAGE_KEYS.CAPSULES, capsules);
  
  return capsules.map(decryptCapsuleContent);
}

export async function getCapsuleById(id: string): Promise<Capsule | null> {
  await delay();
  const capsules = getStorage<Capsule[]>(STORAGE_KEYS.CAPSULES, []);
  const capsule = capsules.find(c => c.id === id);
  
  if (!capsule) return null;
  
  if (!capsule.isOpened && isPast(capsule.openAt)) {
    capsule.isOpened = true;
    setStorage(STORAGE_KEYS.CAPSULES, capsules);
  }
  
  return decryptCapsuleContent(capsule);
}

export async function createCapsule(
  data: Omit<Capsule, 'id' | 'createdAt' | 'isOpened' | 'isPublic' | 'attachments'> & { 
    isPublic?: boolean;
    attachments?: { file: File; type: 'image' | 'audio' | 'video'; duration?: number }[];
  }
): Promise<Capsule> {
  await delay();
  const capsules = getStorage<Capsule[]>(STORAGE_KEYS.CAPSULES, []);
  
  const newCapsule: Capsule = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    isOpened: false,
    isPublic: data.isPublic ?? false,
    attachments: [],
  };
  
  if (data.attachments && data.attachments.length > 0) {
    for (const att of data.attachments) {
      const attachment = await saveAttachment(newCapsule.id, att.file, att.type, att.duration);
      newCapsule.attachments.push(attachment);
    }
  }
  
  const encrypted = encryptCapsuleContent(newCapsule);
  capsules.unshift(encrypted);
  setStorage(STORAGE_KEYS.CAPSULES, capsules);
  
  return newCapsule;
}

export async function updateCapsule(id: string, data: Partial<Capsule>): Promise<Capsule | null> {
  await delay();
  const capsules = getStorage<Capsule[]>(STORAGE_KEYS.CAPSULES, []);
  const index = capsules.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  const updated = { ...capsules[index], ...data };
  
  if (data.title || data.content) {
    updated.title = data.title ? encrypt(data.title) : updated.title;
    updated.content = data.content ? encrypt(data.content) : updated.content;
  }
  
  capsules[index] = updated;
  setStorage(STORAGE_KEYS.CAPSULES, capsules);
  
  return decryptCapsuleContent(updated);
}

export async function deleteCapsule(id: string): Promise<boolean> {
  await delay();
  const capsules = getStorage<Capsule[]>(STORAGE_KEYS.CAPSULES, []);
  const filtered = capsules.filter(c => c.id !== id);
  
  if (filtered.length === capsules.length) return false;
  
  await deleteAttachmentsByCapsuleId(id);
  
  setStorage(STORAGE_KEYS.CAPSULES, filtered);
  return true;
}

export async function getCapsuleStats(): Promise<CapsuleStats> {
  await delay();
  const capsules = getStorage<Capsule[]>(STORAGE_KEYS.CAPSULES, []);
  
  const stats: CapsuleStats = {
    total: capsules.length,
    pending: capsules.filter(c => !c.isOpened && !isPast(c.openAt)).length,
    opened: capsules.filter(c => c.isOpened || isPast(c.openAt)).length,
    comingSoon: capsules.filter(c => !c.isOpened && !isPast(c.openAt) && isComingSoon(c.openAt)).length,
  };
  
  return stats;
}

export async function getCapsulesByCategory(category: CapsuleCategory): Promise<Capsule[]> {
  await delay();
  const capsules = await getCapsules();
  return capsules.filter(c => c.category === category);
}

export async function getHistoryCapsules(): Promise<Capsule[]> {
  await delay();
  const capsules = await getCapsules();
  return capsules.filter(c => c.isOpened || isPast(c.openAt));
}

export async function checkScheduledCapsules(): Promise<Capsule[]> {
  await delay();
  const capsules = getStorage<Capsule[]>(STORAGE_KEYS.CAPSULES, []);
  const newlyOpened: Capsule[] = [];
  
  capsules.forEach(capsule => {
    if (!capsule.isOpened && isPast(capsule.openAt)) {
      capsule.isOpened = true;
      newlyOpened.push(decryptCapsuleContent(capsule));
    }
  });
  
  if (newlyOpened.length > 0) {
    setStorage(STORAGE_KEYS.CAPSULES, capsules);
  }
  
  return newlyOpened;
}

export async function getSettings(): Promise<Settings> {
  await delay();
  return getStorage<Settings>(STORAGE_KEYS.SETTINGS, getDefaultSettings());
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
  await delay();
  const settings = getStorage<Settings>(STORAGE_KEYS.SETTINGS, getDefaultSettings());
  const updated = { ...settings, ...data };
  setStorage(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

export async function verifyPassword(password: string): Promise<boolean> {
  await delay();
  const settings = getStorage<Settings>(STORAGE_KEYS.SETTINGS, getDefaultSettings());
  if (!settings.hasPassword || !settings.passwordHash) return true;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'time_capsule_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hash === settings.passwordHash;
}

export async function setPassword(password: string): Promise<boolean> {
  await delay();
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'time_capsule_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  const settings = getStorage<Settings>(STORAGE_KEYS.SETTINGS, getDefaultSettings());
  settings.hasPassword = true;
  settings.passwordHash = hash;
  setStorage(STORAGE_KEYS.SETTINGS, settings);
  
  return true;
}

export async function removePassword(): Promise<boolean> {
  await delay();
  const settings = getStorage<Settings>(STORAGE_KEYS.SETTINGS, getDefaultSettings());
  settings.hasPassword = false;
  settings.passwordHash = '';
  setStorage(STORAGE_KEYS.SETTINGS, settings);
  
  return true;
}
