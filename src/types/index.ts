export type CapsuleCategory = 'dream' | 'family' | 'friendship' | 'love' | 'growth' | 'other';

export type MoodType = 'happy' | 'sad' | 'peaceful' | 'excited' | 'grateful' | 'confused';

export type AttachmentType = 'image' | 'audio' | 'video';

export interface ImageFilter {
  id: string;
  name: string;
  cssFilter: string;
}

export interface WatermarkConfig {
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  fontSize: number;
  color: string;
}

export interface ImageEditConfig {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filter?: string;
  watermark?: WatermarkConfig;
  rotation: number;
}

export interface Attachment {
  id: string;
  capsuleId: string;
  type: AttachmentType;
  name: string;
  size: number;
  mimeType: string;
  duration?: number;
  createdAt: string;
  editConfig?: ImageEditConfig;
}

export interface StorageStats {
  totalSize: number;
  usedSize: number;
  availableSize: number;
  attachmentCount: number;
  imageCount: number;
  audioCount: number;
  videoCount: number;
  usagePercentage: number;
}

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
  attachments: Attachment[];
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

export interface MoodDistribution {
  mood: MoodType;
  count: number;
  percentage: number;
}

export interface MoodTrendPoint {
  month: string;
  moodIndex: number;
  moodCounts: Record<MoodType, number>;
}

export interface CategoryStats {
  category: CapsuleCategory;
  count: number;
  percentage: number;
}

export interface WritingDayData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export type TimePeriod = 'dawn' | 'morning' | 'afternoon' | 'evening';

export interface TimeDistribution {
  period: TimePeriod;
  label: string;
  count: number;
  percentage: number;
}

export interface WritingHabitData {
  heatmap: WritingDayData[];
  timeDistribution: TimeDistribution[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  isUnlocked: boolean;
}

export interface GrowthOverview {
  totalWords: number;
  totalCapsules: number;
  streakDays: number;
  firstCapsuleAgo: string;
  firstCapsuleDate: string;
}

export interface GrowthStats {
  overview: GrowthOverview;
  moodDistribution: MoodDistribution[];
  moodTrend: MoodTrendPoint[];
  categoryStats: CategoryStats[];
  writingHabits: WritingHabitData;
  achievements: Achievement[];
}

export const MOOD_VALUES: Record<MoodType, number> = {
  happy: 5,
  excited: 5,
  grateful: 4,
  peaceful: 4,
  confused: 2,
  sad: 1,
};

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'isUnlocked'>[] = [
  { id: 'first_capsule', name: '初次相遇', description: '写下第一颗胶囊', icon: '🌱' },
  { id: 'streak_7', name: '七日坚持', description: '连续记录7天', icon: '🔥' },
  { id: 'streak_30', name: '月度达人', description: '连续记录30天', icon: '⭐' },
  { id: 'capsules_10', name: '十全十美', description: '记录10颗胶囊', icon: '💯' },
  { id: 'capsules_50', name: '记录者', description: '记录50颗胶囊', icon: '📚' },
  { id: 'capsules_100', name: '百胶囊大师', description: '记录100颗胶囊', icon: '🏆' },
  { id: 'words_1000', name: '千字作家', description: '累计写作1000字', icon: '✍️' },
  { id: 'words_10000', name: '万字长文', description: '累计写作10000字', icon: '📝' },
  { id: 'all_moods', name: '情绪收藏家', description: '体验过所有心情类型', icon: '🎨' },
  { id: 'all_categories', name: '生活记录家', description: '使用过所有分类', icon: '🌈' },
];

export const TIME_PERIODS: { period: TimePeriod; label: string; range: [number, number] }[] = [
  { period: 'dawn', label: '凌晨', range: [0, 6] },
  { period: 'morning', label: '上午', range: [6, 12] },
  { period: 'afternoon', label: '下午', range: [12, 18] },
  { period: 'evening', label: '晚上', range: [18, 24] },
];

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

export interface FilterOptions {
  moods: MoodType[];
  categories: CapsuleCategory[];
  status: ('pending' | 'opened' | 'comingSoon' | 'private')[];
  createdAtStart: string | null;
  createdAtEnd: string | null;
  openAtStart: string | null;
  openAtEnd: string | null;
}

export interface SearchResult {
  capsule: Capsule;
  matchScore: number;
  matchType: 'title' | 'content' | 'tag';
  matchedKeywords: string[];
}

export interface SearchHistoryItem {
  id: string;
  keyword: string;
  timestamp: number;
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

export const IMAGE_FILTERS: ImageFilter[] = [
  { id: 'none', name: '原图', cssFilter: 'none' },
  { id: 'grayscale', name: '黑白', cssFilter: 'grayscale(100%)' },
  { id: 'sepia', name: '复古', cssFilter: 'sepia(80%)' },
  { id: 'brightness', name: '明亮', cssFilter: 'brightness(120%)' },
  { id: 'contrast', name: '对比', cssFilter: 'contrast(120%)' },
  { id: 'saturate', name: '饱和', cssFilter: 'saturate(140%)' },
  { id: 'warm', name: '暖色', cssFilter: 'sepia(30%) saturate(120%)' },
  { id: 'cool', name: '冷色', cssFilter: 'hue-rotate(200deg) saturate(80%)' },
  { id: 'vintage', name: '怀旧', cssFilter: 'sepia(50%) contrast(90%) brightness(90%)' },
];

export const WATERMARK_POSITIONS = [
  { id: 'top-left', name: '左上' },
  { id: 'top-right', name: '右上' },
  { id: 'bottom-left', name: '左下' },
  { id: 'bottom-right', name: '右下' },
  { id: 'center', name: '居中' },
] as const;

export const ATTACHMENT_LIMITS = {
  MAX_IMAGES: 9,
  MAX_AUDIO_DURATION: 300,
  MAX_VIDEO_DURATION: 15,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
  MAX_AUDIO_SIZE: 50 * 1024 * 1024,
  MAX_VIDEO_SIZE: 100 * 1024 * 1024,
  MAX_TOTAL_STORAGE: 500 * 1024 * 1024,
} as const;

export type TemplateCategoryType =
  | 'annual_summary'
  | 'birthday_wish'
  | 'love_letter'
  | 'career_growth'
  | 'self_encouragement'
  | 'gratitude'
  | 'apology'
  | 'farewell'
  | 'future_dream'
  | 'daily_reflection'
  | 'friendship'
  | 'family'
  | 'travel_memory'
  | 'milestone'
  | 'mental_health'
  | 'creativity'
  | 'financial_goal'
  | 'health_fitness'
  | 'relationship'
  | 'custom';

export interface TemplateQuestion {
  id: string;
  question: string;
  placeholder: string;
  required: boolean;
}

export interface TemplateFillable {
  id: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategoryType;
  icon: string;
  emoji: string;
  color: string;
  suitableMoods: MoodType[];
  suitableCategories: CapsuleCategory[];
  questions: TemplateQuestion[];
  fillables: TemplateFillable[];
  contentTemplate: string;
  isCustom: boolean;
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
  author?: string;
  tags: string[];
}

export interface TemplateCategoryInfo {
  id: TemplateCategoryType;
  name: string;
  icon: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
}

export interface AIParagraphSuggestion {
  id: string;
  content: string;
  keywords: string[];
  tone: 'warm' | 'formal' | 'casual' | 'emotional' | 'inspirational';
}

export interface ExportedTemplate {
  version: string;
  exportedAt: string;
  template: Template;
}

export const TEMPLATE_CATEGORIES: TemplateCategoryInfo[] = [
  { id: 'annual_summary', name: '年度总结', icon: 'calendar', emoji: '📅', color: 'text-lavender-300', bgColor: 'bg-lavender-100', description: '回顾过去一年的成长与收获' },
  { id: 'birthday_wish', name: '生日愿望', icon: 'cake', emoji: '🎂', color: 'text-soft-pink-300', bgColor: 'bg-soft-pink-100', description: '在特别的日子许下心愿' },
  { id: 'love_letter', name: '给恋人的话', icon: 'heart', emoji: '💕', color: 'text-rose-400', bgColor: 'bg-rose-100', description: '表达心中最深的爱意' },
  { id: 'career_growth', name: '职场成长', icon: 'briefcase', emoji: '💼', color: 'text-sky-blue-300', bgColor: 'bg-sky-blue-100', description: '记录职场路上的每一步' },
  { id: 'self_encouragement', name: '自我鼓励', icon: 'sun', emoji: '☀️', color: 'text-cream-yellow-300', bgColor: 'bg-cream-yellow-100', description: '困难时给自己力量' },
  { id: 'gratitude', name: '感恩信', icon: 'pray', emoji: '🙏', color: 'text-mint-green-300', bgColor: 'bg-mint-green-100', description: '感谢生命中的每一份温暖' },
  { id: 'apology', name: '道歉信', icon: 'message-circle', emoji: '💬', color: 'text-warm-gray-400', bgColor: 'bg-warm-gray-100', description: '真诚地表达歉意' },
  { id: 'farewell', name: '告别信', icon: 'send', emoji: '👋', color: 'text-sky-blue-400', bgColor: 'bg-sky-blue-50', description: '好好说再见' },
  { id: 'future_dream', name: '未来梦想', icon: 'sparkles', emoji: '✨', color: 'text-lavender-400', bgColor: 'bg-lavender-50', description: '写给未来的自己' },
  { id: 'daily_reflection', name: '日常感悟', icon: 'book-open', emoji: '📖', color: 'text-warm-gray-500', bgColor: 'bg-warm-gray-50', description: '记录平凡日子的小确幸' },
  { id: 'friendship', name: '友情', icon: 'users', emoji: '🤝', color: 'text-mint-green-400', bgColor: 'bg-mint-green-50', description: '珍惜身边的朋友' },
  { id: 'family', name: '亲情', icon: 'home', emoji: '🏠', color: 'text-soft-pink-400', bgColor: 'bg-soft-pink-50', description: '写给最爱的家人' },
  { id: 'travel_memory', name: '旅行回忆', icon: 'map', emoji: '✈️', color: 'text-sky-blue-500', bgColor: 'bg-sky-blue-50', description: '记录旅途中的美好' },
  { id: 'milestone', name: '里程碑', icon: 'flag', emoji: '🎯', color: 'text-cream-yellow-500', bgColor: 'bg-cream-yellow-50', description: '纪念人生重要时刻' },
  { id: 'mental_health', name: '心理健康', icon: 'brain', emoji: '🧠', color: 'text-lavender-300', bgColor: 'bg-lavender-50', description: '关注内心的声音' },
  { id: 'creativity', name: '创作灵感', icon: 'palette', emoji: '🎨', color: 'text-soft-pink-300', bgColor: 'bg-soft-pink-50', description: '捕捉每一个灵感瞬间' },
  { id: 'financial_goal', name: '财务目标', icon: 'wallet', emoji: '💰', color: 'text-mint-green-500', bgColor: 'bg-mint-green-50', description: '规划财富人生' },
  { id: 'health_fitness', name: '健康健身', icon: 'heart-pulse', emoji: '💪', color: 'text-green-400', bgColor: 'bg-green-50', description: '记录健康生活' },
  { id: 'relationship', name: '人际关系', icon: 'users-round', emoji: '👥', color: 'text-warm-gray-400', bgColor: 'bg-warm-gray-50', description: '经营生命中的缘分' },
  { id: 'custom', name: '自定义', icon: 'edit-3', emoji: '✏️', color: 'text-warm-gray-500', bgColor: 'bg-warm-gray-100', description: '创建属于你的模板' },
];

export const TONE_OPTIONS = [
  { id: 'warm', name: '温暖', emoji: '🌷', description: '温柔治愈的语气' },
  { id: 'formal', name: '正式', emoji: '📋', description: '专业严谨的语气' },
  { id: 'casual', name: '轻松', emoji: '😊', description: '随意自在的语气' },
  { id: 'emotional', name: '感性', emoji: '💫', description: '富有情感的语气' },
  { id: 'inspirational', name: '励志', emoji: '🚀', description: '充满力量的语气' },
] as const;
