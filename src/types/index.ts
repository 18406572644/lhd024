export type CapsuleCategory = 'dream' | 'family' | 'friendship' | 'love' | 'growth' | 'other';

export type MoodType = 'happy' | 'sad' | 'peaceful' | 'excited' | 'grateful' | 'confused';

export interface Capsule {
  id: string;
  title: string;
  content: string;
  category: CapsuleCategory;
  mood: MoodType;
  tags: string[];
  createdAt: string;
  openAt: string;
  isOpened: boolean;
  email?: string;
  isPrivate: boolean;
  isPublic: boolean;
}

export type PostcardTemplate = 'letter' | 'polaroid' | 'vintage' | 'minimal';
export type ContentDisplayMode = 'full' | 'summary' | 'title';

export interface PostcardConfig {
  template: PostcardTemplate;
  displayMode: ContentDisplayMode;
  showQRCode: boolean;
  customBackground?: string;
  decorElements: string[];
}

export interface PostcardTemplateInfo {
  id: PostcardTemplate;
  name: string;
  icon: string;
  description: string;
}

export interface DecorElement {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

export const POSTCARD_TEMPLATES: PostcardTemplateInfo[] = [
  { id: 'letter', name: '信纸风格', icon: 'file-text', description: '复古信纸，温暖手写' },
  { id: 'polaroid', name: '拍立得风格', icon: 'camera', description: '拍立得相框，文艺气息' },
  { id: 'vintage', name: '复古邮票', icon: 'stamp', description: '旧时光邮票，经典怀旧' },
  { id: 'minimal', name: '简约卡片', icon: 'credit-card', description: '极简设计，干净大方' },
];

export const DECOR_ELEMENTS: DecorElement[] = [
  { id: 'heart', name: '爱心', emoji: '💕', category: 'emotion' },
  { id: 'star', name: '星星', emoji: '✨', category: 'emotion' },
  { id: 'flower', name: '花朵', emoji: '🌸', category: 'nature' },
  { id: 'leaf', name: '叶子', emoji: '🍃', category: 'nature' },
  { id: 'coffee', name: '咖啡', emoji: '☕', category: 'life' },
  { id: 'book', name: '书本', emoji: '📚', category: 'life' },
  { id: 'moon', name: '月亮', emoji: '🌙', category: 'nature' },
  { id: 'sun', name: '太阳', emoji: '☀️', category: 'nature' },
  { id: 'rainbow', name: '彩虹', emoji: '🌈', category: 'nature' },
  { id: 'music', name: '音乐', emoji: '🎵', category: 'life' },
  { id: 'gift', name: '礼物', emoji: '🎁', category: 'life' },
  { id: 'butterfly', name: '蝴蝶', emoji: '🦋', category: 'nature' },
];

export const CONTENT_DISPLAY_MODES = [
  { id: 'full', name: '全文展示', description: '展示完整内容' },
  { id: 'summary', name: '内容摘要', description: '展示内容摘要' },
  { id: 'title', name: '仅标题', description: '只展示标题' },
];

export interface Settings {
  id: string;
  hasPassword: boolean;
  passwordHash: string;
  theme: 'soft' | 'warm' | 'cool';
  autoLock: boolean;
  autoLockTime: number;
}

export interface CapsuleStats {
  total: number;
  pending: number;
  opened: number;
  comingSoon: number;
}

export interface CategoryInfo {
  id: CapsuleCategory;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  emoji: string;
}

export interface MoodInfo {
  id: MoodType;
  name: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'dream', name: '梦想', icon: 'sparkles', color: 'text-lavender-300', bgColor: 'bg-lavender-100', emoji: '✨' },
  { id: 'family', name: '亲情', icon: 'heart', color: 'text-soft-pink-300', bgColor: 'bg-soft-pink-100', emoji: '💕' },
  { id: 'friendship', name: '友情', icon: 'users', color: 'text-mint-green-300', bgColor: 'bg-mint-green-100', emoji: '🤝' },
  { id: 'love', name: '爱情', icon: 'heart-handshake', color: 'text-rose-400', bgColor: 'bg-rose-100', emoji: '💖' },
  { id: 'growth', name: '成长', icon: 'sprout', color: 'text-green-400', bgColor: 'bg-green-100', emoji: '🌱' },
  { id: 'other', name: '其他', icon: 'package', color: 'text-cream-yellow-300', bgColor: 'bg-cream-yellow-100', emoji: '📦' },
];

export const MOODS: MoodInfo[] = [
  { id: 'happy', name: '开心', emoji: '😊', color: 'bg-cream-yellow-100' },
  { id: 'sad', name: '难过', emoji: '😢', color: 'bg-sky-blue-100' },
  { id: 'peaceful', name: '平静', emoji: '😌', color: 'bg-mint-green-100' },
  { id: 'excited', name: '激动', emoji: '🎉', color: 'bg-soft-pink-100' },
  { id: 'grateful', name: '感恩', emoji: '🙏', color: 'bg-lavender-100' },
  { id: 'confused', name: '迷茫', emoji: '😵‍💫', color: 'bg-warm-gray-200' },
];

export const PRESET_TIMES = [
  { label: '1个月', months: 1 },
  { label: '3个月', months: 3 },
  { label: '半年', months: 6 },
  { label: '1年', months: 12 },
  { label: '3年', months: 36 },
  { label: '5年', months: 60 },
  { label: '10年', months: 120 },
];

export const GREETINGS = {
  morning: [
    '早上好，新的一天开始了 🌅',
    '清晨的阳光正温柔地等着你 ☀️',
    '愿你今天拥有美好的心情 🌸',
  ],
  afternoon: [
    '下午好，别忘了休息一下 ☕',
    '午后时光，适合记录心情 📝',
    '愿你的下午温暖而充实 🌤️',
  ],
  evening: [
    '晚上好，今天过得怎么样？🌙',
    '夜幕降临，卸下一天的疲惫 ✨',
    '愿你有个美好的夜晚 🌟',
  ],
  night: [
    '夜深了，记得早点休息 🌌',
    '晚安，愿你有个好梦 💤',
    '星空之下，愿你心安 🌠',
  ],
};

export const ENCOURAGEMENTS = [
  '每一个当下，都是未来的礼物 🎁',
  '今天的你，也在闪闪发光 ✨',
  '慢慢来，一切都刚刚好 🌸',
  '你的存在，本身就是美好 💕',
  '愿你被世界温柔以待 🌷',
  '记录此刻，寄语未来 📮',
];
