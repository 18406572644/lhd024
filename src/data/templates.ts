import type { Template, TemplateCategoryType } from '../types';

function generateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const PRESET_TEMPLATES: Template[] = [
  {
    id: 'preset_annual_001',
    name: '年度回顾与展望',
    description: '回顾过去一年的点点滴滴，为新的一年设定目标与方向',
    category: 'annual_summary',
    icon: 'calendar',
    emoji: '📅',
    color: 'text-lavender-300',
    suitableMoods: ['peaceful', 'grateful', 'excited'],
    suitableCategories: ['growth', 'other'],
    questions: [
      { id: 'q1', question: '这一年最让你骄傲的成就是什么？', placeholder: '比如：完成了一个重要项目、学会了新技能...', required: true },
      { id: 'q2', question: '这一年你最大的改变是什么？', placeholder: '比如：变得更自信、学会了时间管理...', required: true },
      { id: 'q3', question: '有什么遗憾或想改进的地方？', placeholder: '比如：陪伴家人的时间太少、没有坚持运动...', required: false },
      { id: 'q4', question: '最想感谢的人是谁？为什么？', placeholder: '比如：感谢父母的支持、感谢同事的帮助...', required: true },
      { id: 'q5', question: '新的一年有什么目标和期待？', placeholder: '比如：读20本书、去3个地方旅行...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '年份', placeholder: '2024', defaultValue: new Date().getFullYear().toString() },
      { id: 'f2', label: '年度关键词', placeholder: '成长、突破、平衡...' },
      { id: 'f3', label: '一句总结', placeholder: '这一年，我学会了...' },
    ],
    contentTemplate: `亲爱的未来的自己：

今天是{{日期}}，我坐在窗前，回望刚刚过去的{{年份}}年，心中百感交集。

【年度关键词】：{{年度关键词}}

【这一年，我做到了】
{{问题1_这一年最让你骄傲的成就是什么？}}

【成长与改变】
{{问题2_这一年你最大的改变是什么？}}

【感恩的心】
{{问题4_最想感谢的人是谁？为什么？}}

【反思与改进】
{{问题3_有什么遗憾或想改进的地方？}}

【新的一年，我期待】
{{问题5_新的一年有什么目标和期待？}}

【年度总结】
{{一句总结}}

愿新的一年，依然有热爱，有期待，有奔赴山海的勇气。

爱自己，
{{日期}}`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['年度总结', '成长', '目标'],
  },
  {
    id: 'preset_annual_002',
    name: '年度时光胶囊',
    description: '用10个问题记录这一年的珍贵瞬间',
    category: 'annual_summary',
    icon: 'clock',
    emoji: '⏳',
    color: 'text-lavender-400',
    suitableMoods: ['peaceful', 'grateful', 'happy'],
    suitableCategories: ['growth', 'other'],
    questions: [
      { id: 'q1', question: '今年最开心的一天是哪天？发生了什么？', placeholder: '描述那一天的场景和心情...', required: true },
      { id: 'q2', question: '今年学到的最重要的一课是什么？', placeholder: '从经历中获得的感悟...', required: true },
      { id: 'q3', question: '今年读了哪些印象深刻的书/电影？', placeholder: '列出3-5个，并说说为什么印象深刻...', required: false },
      { id: 'q4', question: '今年去了哪些地方？最喜欢哪里？', placeholder: '分享旅途中的故事...', required: false },
      { id: 'q5', question: '今年的小确幸有哪些？', placeholder: '记录那些温暖的小瞬间...', required: true },
      { id: 'q6', question: '如果用一首歌代表今年，会是哪首？', placeholder: '歌名 + 为什么是这首歌...', required: false },
      { id: 'q7', question: '今年最勇敢的决定是什么？', placeholder: '描述那个让你鼓起勇气的时刻...', required: true },
      { id: 'q8', question: '今年失去了什么？又获得了什么？', placeholder: '说说得与失之间的感悟...', required: false },
      { id: 'q9', question: '想对明年的自己说什么？', placeholder: '给未来的自己一些建议和鼓励...', required: true },
      { id: 'q10', question: '今年的三个愿望实现了吗？', placeholder: '年初的愿望，现在怎么样了...', required: false },
    ],
    fillables: [
      { id: 'f1', label: '年份', placeholder: '2024', defaultValue: new Date().getFullYear().toString() },
      { id: 'f2', label: '年度歌曲', placeholder: '选择一首代表今年的歌' },
      { id: 'f3', label: '年度颜色', placeholder: '用一种颜色形容今年' },
    ],
    contentTemplate: `# {{年份}}年度时光胶囊

【年度颜色】：{{年度颜色}}
【年度歌曲】：{{年度歌曲}}

---

## 一、最开心的一天
{{问题1_今年最开心的一天是哪天？发生了什么？}}

## 二、最重要的一课
{{问题2_今年学到的最重要的一课是什么？}}

## 三、精神食粮
{{问题3_今年读了哪些印象深刻的书/电影？}}

## 四、旅途印记
{{问题4_今年去了哪些地方？最喜欢哪里？}}

## 五、小确幸清单
{{问题5_今年的小确幸有哪些？}}

## 六、年度之歌
{{问题6_如果用一首歌代表今年，会是哪首？}}

## 七、勇敢时刻
{{问题7_今年最勇敢的决定是什么？}}

## 八、得与失
{{问题8_今年失去了什么？又获得了什么？}}

## 九、致明年的自己
{{问题9_想对明年的自己说什么？}}

## 十、愿望清单
{{问题10_今年的三个愿望实现了吗？}}

---

愿每一年都奔走在自己的热爱里。
写于{{日期}}`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['年度总结', '回忆', '成长'],
  },
  {
    id: 'preset_birthday_001',
    name: '生日愿望清单',
    description: '在生日这一天，许下新一岁的心愿',
    category: 'birthday_wish',
    icon: 'cake',
    emoji: '🎂',
    color: 'text-soft-pink-300',
    suitableMoods: ['happy', 'excited', 'grateful'],
    suitableCategories: ['dream', 'growth'],
    questions: [
      { id: 'q1', question: '过去这一岁，最难忘的是什么？', placeholder: '记录那些特别的时刻...', required: true },
      { id: 'q2', question: '新的一岁，想成为什么样的自己？', placeholder: '描述理想中的自己...', required: true },
      { id: 'q3', question: '有什么具体的目标想要实现？', placeholder: '工作、生活、学习各方面...', required: true },
      { id: 'q4', question: '最想感谢谁陪你走过这一岁？', placeholder: '说说那些温暖的陪伴...', required: true },
      { id: 'q5', question: '想对去年的自己说什么？', placeholder: '回望过去，给自己一些肯定...', required: false },
    ],
    fillables: [
      { id: 'f1', label: '年龄', placeholder: '25' },
      { id: 'f2', label: '生日愿望', placeholder: '今年最想实现的一个愿望' },
      { id: 'f3', label: '生日礼物', placeholder: '最想收到的礼物' },
    ],
    contentTemplate: `🎂 祝我{{年龄}}岁生日快乐！

又长大了一岁，吹灭蜡烛的那一刻，我想对自己说：

【回望过去这一岁】
{{问题1_过去这一岁，最难忘的是什么？}}

{{问题5_想对去年的自己说什么？}}

【感谢一路有你】
{{问题4_最想感谢谁陪你走过这一岁？}}

【新一岁的自己，你好】
{{问题2_新的一岁，想成为什么样的自己？}}

【生日愿望】
✨ {{生日愿望}}

【新一岁的目标】
{{问题3_有什么具体的目标想要实现？}}

愿新的一岁，
眼里有光，心中有爱，
兜里有钱，身边有人。
要健康，要快乐，要勇敢，要自由。

🎁 最想要的生日礼物：{{生日礼物}}

亲爱的自己，生日快乐！
写于{{日期}}`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['生日', '愿望', '成长'],
  },
  {
    id: 'preset_birthday_002',
    name: '给自己的生日信',
    description: '在生日这天，写一封温柔的信给自己',
    category: 'birthday_wish',
    icon: 'mail',
    emoji: '💌',
    color: 'text-soft-pink-400',
    suitableMoods: ['peaceful', 'happy', 'grateful'],
    suitableCategories: ['growth', 'other'],
    questions: [
      { id: 'q1', question: '亲爱的自己，你辛苦了。今年最累的是什么时候？', placeholder: '承认自己的辛苦也是一种勇敢...', required: true },
      { id: 'q2', question: '今年做得最好的一件事是什么？', placeholder: '要学会肯定自己...', required: true },
      { id: 'q3', question: '有什么想对自己道歉的？', placeholder: '原谅自己的不完美...', required: false },
      { id: 'q4', question: '新的一岁，想怎样好好爱自己？', placeholder: '具体的计划，比如早睡、旅行...', required: true },
      { id: 'q5', question: '现在的自己，值得被爱吗？为什么？', placeholder: '学会接纳和爱自己...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '年龄', placeholder: '25' },
      { id: 'f2', label: '爱自己的承诺', placeholder: '对自己的一个承诺' },
    ],
    contentTemplate: `亲爱的{{年龄}}岁的自己：

展信佳。

首先想对你说：{{问题1_亲爱的自己，你辛苦了。今年最累的是什么时候？}}

但是你知道吗？你做得很好。
{{问题2_今年做得最好的一件事是什么？}}

{{问题3_有什么想对自己道歉的？}}

没关系的，真的没关系。你不需要完美，你只需要是你自己就好。

{{问题5_现在的自己，值得被爱吗？为什么？}}

是的，你值得。值得被爱，值得被温柔以待，值得世间所有的美好。

【对自己的承诺】
我承诺：{{爱自己的承诺}}

【新的一岁，我要好好爱自己】
{{问题4_新的一岁，想怎样好好爱自己？}}

亲爱的自己，不管发生什么，都请记得：
你很重要，你很好，你值得。

生日快乐，永远快乐。

永远爱你的，
自己
写于{{日期}}`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['生日', '自我接纳', '自爱'],
  },
  {
    id: 'preset_love_001',
    name: '给恋人的一封信',
    description: '把心里那些没说出口的话，都写进这封信里',
    category: 'love_letter',
    icon: 'heart',
    emoji: '💕',
    color: 'text-rose-400',
    suitableMoods: ['happy', 'grateful', 'peaceful'],
    suitableCategories: ['love'],
    questions: [
      { id: 'q1', question: '还记得我们第一次见面的场景吗？', placeholder: '描述初次见面的细节和心动瞬间...', required: true },
      { id: 'q2', question: '最喜欢对方身上的哪一点？', placeholder: '性格、习惯、某个小动作...', required: true },
      { id: 'q3', question: '在一起最难忘的瞬间是什么？', placeholder: '那些让你心动/温暖/感动的时刻...', required: true },
      { id: 'q4', question: '想对ta说但一直没说出口的话？', placeholder: '那些藏在心底的话...', required: true },
      { id: 'q5', question: '对我们的未来有什么期待？', placeholder: '想象一下以后的日子...', required: true },
    ],
    fillables: [
      { id: 'f1', label: 'ta的名字', placeholder: '亲爱的____' },
      { id: 'f2', label: '在一起的天数', placeholder: '100天' },
      { id: 'f3', label: '爱的暗号', placeholder: '只有你们懂的词或句子' },
    ],
    contentTemplate: `亲爱的{{ta的名字}}：

见字如面。

今天是我们在一起的第{{在一起的天数}}天，有些话，我想写下来给你看。

还记得吗？{{问题1_还记得我们第一次见面的场景吗？}}

那一刻我就知道，这个人不一样了。

我最喜欢你的地方是：{{问题2_最喜欢对方身上的哪一点？}}

和你在一起最难忘的是：{{问题3_在一起最难忘的瞬间是什么？}}

其实有些话，我一直想对你说：
{{问题4_想对ta说但一直没说出口的话？}}

谢谢你，出现在我的生命里。

关于我们的未来，我期待：
{{问题5_对我们的未来有什么期待？}}

还记得我们的暗号吗？「{{爱的暗号}}」

不管未来有多少风雨，我都想和你一起走。

我爱你，今天，明天，每一天。

永远爱你的，
{{你的名字}}
写于{{日期}}`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['爱情', '告白', '浪漫'],
  },
  {
    id: 'preset_love_002',
    name: '恋爱周年纪念',
    description: '记录恋爱中的美好瞬间，写给你们的纪念日',
    category: 'love_letter',
    icon: 'calendar-heart',
    emoji: '💝',
    color: 'text-rose-500',
    suitableMoods: ['happy', 'grateful', 'peaceful'],
    suitableCategories: ['love'],
    questions: [
      { id: 'q1', question: '这一年，ta为你做过最感动的事是什么？', placeholder: '那些让你泪目的瞬间...', required: true },
      { id: 'q2', question: '你们一起克服了什么困难？', placeholder: '说说那些一起走过的低谷...', required: false },
      { id: 'q3', question: '这一年发现了ta的什么新优点？', placeholder: '时间让你更了解ta...', required: true },
      { id: 'q4', question: '想对ta说的三句话', placeholder: '每一句都发自肺腑...', required: true },
      { id: 'q5', question: '下一个周年，想一起做什么？', placeholder: '约定下一个纪念日...', required: true },
    ],
    fillables: [
      { id: 'f1', label: 'ta的名字', placeholder: '____' },
      { id: 'f2', label: '周年数', placeholder: '一周年' },
      { id: 'f3', label: '定情信物', placeholder: '对你们有意义的物品' },
    ],
    contentTemplate: `# 我们的{{周年数}}

致我最爱的{{ta的名字}}：

今天是我们的{{周年数}}纪念日，手里拿着我们的{{定情信物}}，想起这一年的点点滴滴，心里满是温暖。

【最感动的瞬间】
{{问题1_这一年，ta为你做过最感动的事是什么？}}

【一起走过的路】
{{问题2_你们一起克服了什么困难？}}

【更爱你的理由】
{{问题3_这一年发现了ta的什么新优点？}}

【想对你说的三句话】
{{问题4_想对ta说的三句话}}

【下一个周年的约定】
{{问题5_下一个周年，想一起做什么？}}

一年又一年，
愿我们始终如初遇时心动，
如热恋时深情，
如老夫老妻般默契。

我爱你，
不止今天，
而是有你的每一天。

你的，
{{名字}}
{{日期}}`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['爱情', '纪念', '周年'],
  },
  {
    id: 'preset_career_001',
    name: '职场成长记录',
    description: '记录在职场上的成长与收获',
    category: 'career_growth',
    icon: 'briefcase',
    emoji: '💼',
    color: 'text-sky-blue-300',
    suitableMoods: ['peaceful', 'excited', 'grateful'],
    suitableCategories: ['growth', 'other'],
    questions: [
      { id: 'q1', question: '最近在工作上取得了什么成就？', placeholder: '项目成功、技能提升、获得认可...', required: true },
      { id: 'q2', question: '工作中遇到了什么挑战？如何克服的？', placeholder: '困难是什么，你做了什么...', required: true },
      { id: 'q3', question: '从中学到了什么？', placeholder: '新技能、工作方法、人际智慧...', required: true },
      { id: 'q4', question: '想感谢哪些同事/领导？为什么？', placeholder: '那些帮助过你的人...', required: false },
      { id: 'q5', question: '下一个职业目标是什么？', placeholder: '短期和长期的规划...', required: true },
      { id: 'q6', question: '需要提升哪些能力？', placeholder: '专业技能、沟通、领导力...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '职位', placeholder: '产品经理' },
      { id: 'f2', label: '公司', placeholder: '____公司' },
      { id: 'f3', label: '入职时间', placeholder: '2023年3月' },
    ],
    contentTemplate: `# 职场成长记录

**公司**：{{公司}}
**职位**：{{职位}}
**入职时间**：{{入职时间}}
**记录时间**：{{日期}}

---

## 一、近期成就
{{问题1_最近在工作上取得了什么成就？}}

## 二、面对的挑战
{{问题2_工作中遇到了什么挑战？如何克服的？}}

## 三、收获与成长
{{问题3_从中学到了什么？}}

## 四、感恩的心
{{问题4_想感谢哪些同事/领导？为什么？}}

## 五、下一个目标
{{问题5_下一个职业目标是什么？}}

## 六、能力提升计划
{{问题6_需要提升哪些能力？}}

---

**今日感悟**：
每一份努力都不会白费，每一次挑战都是成长的机会。
继续加油，未来可期！

💪`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['职场', '成长', '工作'],
  },
  {
    id: 'preset_career_002',
    name: '写给3年后的自己（职场篇）',
    description: '给未来的自己写一封职业规划信',
    category: 'career_growth',
    icon: 'trending-up',
    emoji: '📈',
    color: 'text-sky-blue-400',
    suitableMoods: ['excited', 'peaceful', 'grateful'],
    suitableCategories: ['dream', 'growth'],
    questions: [
      { id: 'q1', question: '3年后的你，理想的工作状态是怎样的？', placeholder: '描述理想中的工作场景...', required: true },
      { id: 'q2', question: '想达到什么职位/收入水平？', placeholder: '具体的目标...', required: true },
      { id: 'q3', question: '需要积累哪些核心竞争力？', placeholder: '技能、经验、人脉...', required: true },
      { id: 'q4', question: '如果遇到职业瓶颈，会怎么做？', placeholder: '预设一些应对方案...', required: false },
      { id: 'q5', question: '工作之外，想过什么样的生活？', placeholder: '工作与生活的平衡...', required: true },
      { id: 'q6', question: '现在的自己，需要为3年后做什么准备？', placeholder: '当下的行动计划...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '现在的职位', placeholder: '初级工程师' },
      { id: 'f2', label: '3年后的目标职位', placeholder: '高级工程师/技术总监' },
      { id: 'f3', label: '职业座右铭', placeholder: '激励自己的一句话' },
    ],
    contentTemplate: `# 写给3年后的自己

**写于**：{{日期}}
**现在的我**：{{现在的职位}}
**期待3年后的我**：{{3年后的目标职位}}

---

亲爱的3年后的自己：

你好吗？现在的我，坐在电脑前，想象着3年后的你的样子。

我期待那时的你：
{{问题1_3年后的你，理想的工作状态是怎样的？}}

我希望那时的你，已经实现了这些目标：
{{问题2_想达到什么职位/收入水平？}}

为了实现这些，我知道需要积累：
{{问题3_需要积累哪些核心竞争力？}}

如果走得没那么顺利，如果遇到了瓶颈：
{{问题4_如果遇到职业瓶颈，会怎么做？}}

但是，请记得，工作不是生活的全部。我希望那时的你：
{{问题5_工作之外，想过什么样的生活？}}

【我的职业座右铭】
> {{职业座右铭}}

所以，现在的我，要开始做这些准备：
{{问题6_现在的自己，需要为3年后做什么准备？}}

3年后的你，看到这封信的时候，
请给现在的我打个分吧。
不管结果如何，都请感谢现在正在努力的自己。

加油！我们3年后见。

现在的你
{{日期}}`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['职场', '规划', '未来'],
  },
  {
    id: 'preset_encourage_001',
    name: '困难时给自己的一封信',
    description: '在低谷时，给自己一些力量和勇气',
    category: 'self_encouragement',
    icon: 'sun',
    emoji: '☀️',
    color: 'text-cream-yellow-300',
    suitableMoods: ['sad', 'confused', 'peaceful'],
    suitableCategories: ['growth', 'other'],
    questions: [
      { id: 'q1', question: '现在的你，正在经历什么困难？', placeholder: '把烦恼都写出来，没关系...', required: true },
      { id: 'q2', question: '还记得过去是怎么挺过难关的吗？', placeholder: '你比自己想象的更坚强...', required: true },
      { id: 'q3', question: '你身上有哪些优点？', placeholder: '即使现在很难，你依然闪闪发光...', required: true },
      { id: 'q4', question: '如果是好朋友遇到这种情况，你会怎么安慰ta？', placeholder: '像对待朋友一样温柔地对待自己...', required: true },
      { id: 'q5', question: '困难过后，想做什么犒劳自己？', placeholder: '给现在的自己一些期待...', required: true },
      { id: 'q6', question: '现在可以做的最小的一步是什么？', placeholder: '不用想太多，先迈出第一步...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '给自己的昵称', placeholder: '亲爱的____' },
      { id: 'f2', label: '鼓励自己的一句话', placeholder: '一切都会好起来的' },
      { id: 'f3', label: '奖励清单', placeholder: '度过难关后奖励自己什么' },
    ],
    contentTemplate: `亲爱的{{给自己的昵称}}：

我知道你现在很难。
{{问题1_现在的你，正在经历什么困难？}}

没关系的，真的没关系。每个人都会有这样的时刻。

你还记得吗？过去的你，也曾经遇到过很难很难的事，但你都走过来了。
{{问题2_还记得过去是怎么挺过难关的吗？}}

你看，你比自己想象的要坚强得多。

我想告诉你，你真的很好很好：
{{问题3_你身上有哪些优点？}}

如果你的好朋友现在遇到了同样的事，你会对ta说：
{{问题4_如果是好朋友遇到这种情况，你会怎么安慰ta？}}

所以，也请这样温柔地对待自己，好吗？

> {{鼓励自己的一句话}}

等这一切过去，你要好好犒劳自己：
{{奖励清单}}
{{问题5_困难过后，想做什么犒劳自己？}}

现在，不用想太多，先做最小的一步就好：
{{问题6_现在可以做的最小的一步是什么？}}

黑夜再长，天总会亮的。
你不是一个人在战斗。
我陪着你，我们一起走。

爱你的，
自己
{{日期}}

PS: 难过的时候，就抱抱自己吧。🤗`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['鼓励', '低谷', '自我关怀'],
  },
  {
    id: 'preset_encourage_002',
    name: '焦虑缓解日记',
    description: '当感到焦虑时，用书写来平复心情',
    category: 'self_encouragement',
    icon: 'cloud-rain',
    emoji: '🌧️',
    color: 'text-sky-blue-400',
    suitableMoods: ['sad', 'confused', 'peaceful'],
    suitableCategories: ['growth', 'other'],
    questions: [
      { id: 'q1', question: '现在焦虑的是什么？把它写下来', placeholder: '让焦虑从心里流到纸上...', required: true },
      { id: 'q2', question: '这些担忧真的会发生吗？发生的概率有多大？', placeholder: '理性分析一下...', required: true },
      { id: 'q3', question: '如果最坏的情况发生了，你能应对吗？', placeholder: '你有什么资源和能力...', required: true },
      { id: 'q4', question: '现在能做些什么来改善这种情况？', placeholder: '具体的行动，越细越好...', required: true },
      { id: 'q5', question: '此刻，有什么是你可以感恩的？', placeholder: '即使在焦虑中，也有美好...', required: false },
      { id: 'q6', question: '做什么能让你现在感觉好一点？', placeholder: '喝杯茶？听首歌？出去走走？...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '焦虑程度（1-10）', placeholder: '7' },
      { id: 'f2', label: '现在的身体感受', placeholder: '心跳加速、手心出汗...' },
      { id: 'f3', label: '让自己平静下来的方式', placeholder: '深呼吸、冥想...' },
    ],
    contentTemplate: `# 焦虑缓解日记

**日期**：{{日期}}
**焦虑程度**：{{焦虑程度（1-10）}}/10
**身体感受**：{{现在的身体感受}}

---

## 我在焦虑什么？
{{问题1_现在焦虑的是什么？把它写下来}}

## 这些担忧会发生吗？
{{问题2_这些担忧真的会发生吗？发生的概率有多大？}}

## 如果最坏的情况发生...
{{问题3_如果最坏的情况发生了，你能应对吗？}}

## 我能做什么？
{{问题4_现在能做些什么来改善这种情况？}}

## 即使这样，我依然感恩
{{问题5_此刻，有什么是你可以感恩的？}}

## 让自己感觉好一点
{{让自己平静下来的方式}}
{{问题6_做什么能让你现在感觉好一点？}}

---

**写在最后**：
焦虑是因为你在乎，是因为你想做得更好。
但请记得，你不需要一下子解决所有问题。
慢慢来，一步一步来。
你已经做得很好了。

深呼吸... 吸气... 呼气...
你很安全，一切都会好起来的。

💙`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['焦虑', '心理健康', '自我关怀'],
  },
  {
    id: 'preset_gratitude_001',
    name: '感恩日记',
    description: '记录生活中值得感恩的小事',
    category: 'gratitude',
    icon: 'pray',
    emoji: '🙏',
    color: 'text-mint-green-300',
    suitableMoods: ['grateful', 'peaceful', 'happy'],
    suitableCategories: ['growth', 'family', 'friendship', 'love'],
    questions: [
      { id: 'q1', question: '今天最想感谢的人是谁？为什么？', placeholder: '家人、朋友、同事、陌生人...', required: true },
      { id: 'q2', question: '今天发生了什么开心的小事？', placeholder: '阳光很好、咖啡很香、路人的微笑...', required: true },
      { id: 'q3', question: '感谢自己今天做了什么？', placeholder: '认真工作、好好吃饭、坚持运动...', required: true },
      { id: 'q4', question: '有什么想感谢但一直没说出口的？', placeholder: '对父母、对朋友、对自己...', required: false },
      { id: 'q5', question: '从困难/挫折中，你学到了什么可以感恩的？', placeholder: '困难也是礼物...', required: false },
    ],
    fillables: [
      { id: 'f1', label: '今日心情', placeholder: '😊 平静' },
      { id: 'f2', label: '今日天气', placeholder: '☀️ 晴朗' },
      { id: 'f3', label: '感恩的一句话', placeholder: '谢谢，谢谢，谢谢' },
    ],
    contentTemplate: `# 感恩日记

**日期**：{{日期}}
**心情**：{{今日心情}}
**天气**：{{今日天气}}

---

> {{感恩的一句话}}

## 一、谢谢你
{{问题1_今天最想感谢的人是谁？为什么？}}

## 二、小确幸
{{问题2_今天发生了什么开心的小事？}}

## 三、谢谢自己
{{问题3_感谢自己今天做了什么？}}

## 四、藏在心底的感谢
{{问题4_有什么想感谢但一直没说出口的？}}

## 五、困难中的礼物
{{问题5_从困难/挫折中，你学到了什么可以感恩的？}}

---

**今日感悟**：
生活中的美好，往往藏在这些不起眼的小事里。
用心感受，常怀感恩，日子会越来越甜。

晚安，世界。
谢谢你，今天也辛苦了。

🌙✨`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['感恩', '日记', '小确幸'],
  },
  {
    id: 'preset_gratitude_002',
    name: '给父母的感谢信',
    description: '写下对父母的感恩之情',
    category: 'gratitude',
    icon: 'home',
    emoji: '🏠',
    color: 'text-soft-pink-400',
    suitableMoods: ['grateful', 'peaceful', 'sad'],
    suitableCategories: ['family'],
    questions: [
      { id: 'q1', question: '记忆中，父母为你做过最感动的事是什么？', placeholder: '那些温暖的瞬间...', required: true },
      { id: 'q2', question: '长大后，才理解父母的哪些苦心？', placeholder: '当年不懂，如今懂了...', required: true },
      { id: 'q3', question: '你身上有哪些优点是从父母那里继承的？', placeholder: '善良、坚韧、乐观...', required: true },
      { id: 'q4', question: '有什么话一直想对父母说但没说出口？', placeholder: '爱、感谢、歉意...', required: true },
      { id: 'q5', question: '以后想怎样报答父母？', placeholder: '具体的计划和行动...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '爸爸的名字', placeholder: '____' },
      { id: 'f2', label: '妈妈的名字', placeholder: '____' },
      { id: 'f3', label: '想一起做的事', placeholder: '一起去旅行...' },
    ],
    contentTemplate: `亲爱的爸爸{{爸爸的名字}}、妈妈{{妈妈的名字}}：

展信佳。

写这封信的时候，脑海里浮现的是：
{{问题1_记忆中，父母为你做过最感动的事是什么？}}

现在的我，终于长大了，也终于懂了：
{{问题2_长大后，才理解父母的哪些苦心？}}

谢谢你们，把最好的都给了我。
我身上的这些优点，都是你们给的：
{{问题3_你身上有哪些优点是从父母那里继承的？}}

有些话，藏在心里很久了，今天想告诉你们：
{{问题4_有什么话一直想对父母说但没说出口？}}

爸爸妈妈，谢谢你们。
不是谢谢你们给了我多少物质，
而是谢谢你们，让我成为了今天的我。

以后，换我来照顾你们了。
我想：
{{问题5_以后想怎样报答父母？}}

还有，我最想和你们一起：
{{想一起做的事}}

你们陪我长大，我陪你们变老。

永远爱你们的，
{{你的名字}}
{{日期}}

P.S. 有空常回家看看。❤️`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['感恩', '亲情', '父母'],
  },
  {
    id: 'preset_apology_001',
    name: '真诚道歉信',
    description: '诚恳地表达歉意，修复关系',
    category: 'apology',
    icon: 'message-circle',
    emoji: '💬',
    color: 'text-warm-gray-400',
    suitableMoods: ['sad', 'peaceful', 'grateful'],
    suitableCategories: ['love', 'friendship', 'family', 'other'],
    questions: [
      { id: 'q1', question: '具体发生了什么事？', placeholder: '客观描述，不找借口...', required: true },
      { id: 'q2', question: '你意识到自己哪里做错了？', placeholder: '承认错误，不辩解...', required: true },
      { id: 'q3', question: '你的行为给对方造成了什么伤害/影响？', placeholder: '换位思考，理解对方的感受...', required: true },
      { id: 'q4', question: '你想对对方说什么？', placeholder: '真诚的道歉...', required: true },
      { id: 'q5', question: '以后会怎么做来避免同样的错误？', placeholder: '具体的改变和承诺...', required: true },
      { id: 'q6', question: '想为对方做些什么来弥补？', placeholder: '行动比语言更重要...', required: false },
    ],
    fillables: [
      { id: 'f1', label: '对方的名字', placeholder: '____' },
      { id: 'f2', label: '你们的关系', placeholder: '朋友/恋人/家人/同事' },
      { id: 'f3', label: '道歉的一句话', placeholder: '对不起，我错了' },
    ],
    contentTemplate: `亲爱的{{对方的名字}}：

我知道你现在可能还在生气/难过，我也知道，一句话「对不起」可能不足以弥补什么。但我还是想真诚地和你说：

> {{道歉的一句话}}

关于那天发生的事：
{{问题1_具体发生了什么事？}}

现在冷静下来，我意识到自己错在：
{{问题2_你意识到自己哪里做错了？}}

我知道，我的行为让你：
{{问题3_你的行为给对方造成了什么伤害/影响？}}

换位思考，如果我是你，我也会感到受伤和失望。真的很抱歉，让你有这样的感受。

{{问题4_你想对对方说什么？}}

我知道说再多都不如实际行动。以后我会：
{{问题5_以后会怎么做来避免同样的错误？}}

为了弥补，我想：
{{问题6_想为对方做些什么来弥补？}}

不管你原不原谅我，我都尊重你的决定。
但我真的很珍惜我们之间的{{你们的关系}}，希望能有机会弥补。

再次说声对不起。

真诚的，
{{你的名字}}
{{日期}}`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['道歉', '关系修复', '真诚'],
  },
  {
    id: 'preset_farewell_001',
    name: '好好说再见',
    description: '告别一段关系、一个地方、一份工作',
    category: 'farewell',
    icon: 'send',
    emoji: '👋',
    color: 'text-sky-blue-400',
    suitableMoods: ['sad', 'peaceful', 'grateful'],
    suitableCategories: ['other', 'growth'],
    questions: [
      { id: 'q1', question: '我们一起经历过什么美好的回忆？', placeholder: '那些闪亮的日子...', required: true },
      { id: 'q2', question: '从这段经历中，你学到了什么？', placeholder: '收获、成长、感悟...', required: true },
      { id: 'q3', question: '有什么遗憾吗？', placeholder: '没说出口的话、没做的事...', required: false },
      { id: 'q4', question: '想对这段经历/这个人说什么？', placeholder: '感谢、祝福、告别...', required: true },
      { id: 'q5', question: '未来的路，你想怎么走？', placeholder: '带着这份经历继续前行...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '告别对象', placeholder: '____公司/____城市/____人' },
      { id: 'f2', label: '相伴时长', placeholder: '3年/5个月' },
      { id: 'f3', label: '一句告别', placeholder: '再见了，谢谢你' },
    ],
    contentTemplate: `# 好好说再见

**告别**：{{告别对象}}
**相伴时长**：{{相伴时长}}
**日期**：{{日期}}

---

> {{一句告别}}

## 谢谢你陪我走过的路
{{问题1_我们一起经历过什么美好的回忆？}}

## 你教会我的事
{{问题2_从这段经历中，你学到了什么？}}

## 没说出口的话
{{问题3_有什么遗憾吗？}}

## 最后想对你说
{{问题4_想对这段经历/这个人说什么？}}

## 以后的路
{{问题5_未来的路，你想怎么走？}}

---

有人说，告别是为了更好的相遇。
虽然不知道以后还会不会再见，
但我会把这段经历好好收藏在心里。
谢谢你，出现在我的生命里。
祝你，也祝我，都有光明的未来。

再见啦。👋`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['告别', '离别', '成长'],
  },
  {
    id: 'preset_future_001',
    name: '给10年后的自己',
    description: '写一封给未来的信，让时间来见证',
    category: 'future_dream',
    icon: 'sparkles',
    emoji: '✨',
    color: 'text-lavender-400',
    suitableMoods: ['excited', 'peaceful', 'grateful'],
    suitableCategories: ['dream', 'growth'],
    questions: [
      { id: 'q1', question: '10年后的你，现在在做什么？', placeholder: '想象一下10年后的生活场景...', required: true },
      { id: 'q2', question: '身边有什么人？过着怎样的生活？', placeholder: '家庭、朋友、生活状态...', required: true },
      { id: 'q3', question: '现在的梦想，实现了多少？', placeholder: '那些曾经的愿望...', required: true },
      { id: 'q4', question: '想对现在的自己说什么建议？', placeholder: '从未来的视角给现在一些建议...', required: true },
      { id: 'q5', question: '有什么话想对10年后的自己说？', placeholder: '鼓励、期待、提醒...', required: true },
      { id: 'q6', question: '如果10年后的生活不如预期，会对自己说什么？', placeholder: '给自己留一些后路和温柔...', required: false },
    ],
    fillables: [
      { id: 'f1', label: '现在的年龄', placeholder: '25' },
      { id: 'f2', label: '10年后的年龄', placeholder: '35' },
      { id: 'f3', label: '现在的梦想', placeholder: '成为一名作家' },
    ],
    contentTemplate: `# 给10年后的自己

**写于**：{{日期}}
**现在的我**：{{现在的年龄}}岁
**给未来的我**：{{10年后的年龄}}岁

---

亲爱的10年后的自己：

你好吗？

当你打开这封信的时候，已经是{{年份+10}}年了。
不知道现在的你，过着怎样的生活？

我想象中的你：
{{问题1_10年后的你，现在在做什么？}}

身边有这些人陪着你：
{{问题2_身边有什么人？过着怎样的生活？}}

现在的我，有一个梦想：{{现在的梦想}}
不知道10年后的你，实现了吗？
{{问题3_现在的梦想，实现了多少？}}

站在未来往回看，你想对现在的我说：
{{问题4_想对现在的自己说什么建议？}}

而现在的我，想对未来的你说：
{{问题5_有什么话想对10年后的自己说？}}

{{问题6_如果10年后的生活不如预期，会对自己说什么？}}

不管10年后的你是什么样子，
请记得现在这个怀揣梦想、认真生活的自己。
也请记得，不管发生什么，
你都值得被爱，值得拥有美好的一切。

我们10年后见。

10年前的你
{{日期}}

💌 此信封存于时光胶囊，10年后开启。`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['未来', '梦想', '时光胶囊'],
  },
  {
    id: 'preset_daily_001',
    name: '每日三省吾身',
    description: '每天花10分钟，复盘当天的生活',
    category: 'daily_reflection',
    icon: 'book-open',
    emoji: '📖',
    color: 'text-warm-gray-500',
    suitableMoods: ['peaceful', 'happy', 'grateful'],
    suitableCategories: ['growth', 'other'],
    questions: [
      { id: 'q1', question: '今天做得好的三件事', placeholder: '不管多小的事都可以...', required: true },
      { id: 'q2', question: '今天可以改进的地方', placeholder: '做得不够好的，下次可以怎么做...', required: true },
      { id: 'q3', question: '今天学到了什么新东西？', placeholder: '一个观点、一个技能、一个冷知识...', required: true },
      { id: 'q4', question: '今天帮助了谁？或者被谁帮助了？', placeholder: '记录善意的流动...', required: false },
      { id: 'q5', question: '明天最重要的三件事', placeholder: '优先级排序...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '今日心情指数', placeholder: '8/10' },
      { id: 'f2', label: '今日健康指数', placeholder: '运动了吗？吃得好吗？' },
      { id: 'f3', label: '明天的期待', placeholder: '一件让你期待的小事' },
    ],
    contentTemplate: `# 每日复盘

**日期**：{{日期}}
**心情指数**：{{今日心情指数}}
**健康指数**：{{今日健康指数}}

---

## ✅ 今天做得好的三件事
{{问题1_今天做得好的三件事}}

## 💡 可以改进的地方
{{问题2_今天可以改进的地方}}

## 📚 今日新知
{{问题3_今天学到了什么新东西？}}

## 💕 善意流动
{{问题4_今天帮助了谁？或者被谁帮助了？}}

## 🎯 明日最重要的三件事
{{问题5_明天最重要的三件事}}

---

**明天的期待**：{{明天的期待}}

今日总结：
_每天进步一点点，积累下来就是一大步。_

晚安，明天继续加油。
🌙`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['复盘', '成长', '日记'],
  },
  {
    id: 'preset_daily_002',
    name: '小确幸收集器',
    description: '收集生活中那些微小但确定的幸福',
    category: 'daily_reflection',
    icon: 'smile',
    emoji: '😊',
    color: 'text-cream-yellow-400',
    suitableMoods: ['happy', 'peaceful', 'grateful'],
    suitableCategories: ['growth', 'other'],
    questions: [
      { id: 'q1', question: '今天吃到什么好吃的了？', placeholder: '早餐的豆浆、中午的红烧肉、下午的奶茶...', required: true },
      { id: 'q2', question: '今天看到什么好看的风景了？', placeholder: '天空、晚霞、路边的花...', required: true },
      { id: 'q3', question: '今天听到什么好听的歌/有趣的事？', placeholder: '单曲循环的歌、朋友讲的笑话...', required: false },
      { id: 'q4', question: '今天感受到什么善意？', placeholder: '陌生人的微笑、同事的帮忙、家人的关心...', required: true },
      { id: 'q5', question: '今天有什么小成就？', placeholder: '完成了工作、早起了、坚持运动了...', required: true },
      { id: 'q6', question: '用一句话总结今天', placeholder: '今天也是美好的一天...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '今日幸运色', placeholder: '今天看到最多的颜色' },
      { id: 'f2', label: '今日小确幸数量', placeholder: '5' },
      { id: 'f3', label: '幸福指数', placeholder: '9/10' },
    ],
    contentTemplate: `# 小确幸收集器

**日期**：{{日期}}
**幸运色**：{{今日幸运色}}
**小确幸数量**：{{今日小确幸数量}}个
**幸福指数**：{{幸福指数}}/10

---

## 🍜 味蕾的满足
{{问题1_今天吃到什么好吃的了？}}

## 🌈 眼睛的旅行
{{问题2_今天看到什么好看的风景了？}}

## 🎵 耳朵的盛宴
{{问题3_今天听到什么好听的歌/有趣的事？}}

## 💗 心的温暖
{{问题4_今天感受到什么善意？}}

## ✨ 小小的骄傲
{{问题5_今天有什么小成就？}}

---

**今日一句话**：
> {{问题6_用一句话总结今天}}

生活的美好，往往藏在这些不起眼的小事里。
愿你每天都能发现小确幸，
把平凡的日子过成诗。

✨ 今天也是美好的一天！`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['小确幸', '感恩', '生活'],
  },
  {
    id: 'preset_friendship_001',
    name: '给最好的朋友',
    description: '告诉ta，ta对你来说有多重要',
    category: 'friendship',
    icon: 'users',
    emoji: '🤝',
    color: 'text-mint-green-400',
    suitableMoods: ['happy', 'grateful', 'peaceful'],
    suitableCategories: ['friendship'],
    questions: [
      { id: 'q1', question: '你们是怎么认识的？还记得第一次见面吗？', placeholder: '缘分开始的地方...', required: true },
      { id: 'q2', question: '为什么ta对你来说这么重要？', placeholder: 'ta的特别之处...', required: true },
      { id: 'q3', question: '一起做过最疯狂/最难忘的事是什么？', placeholder: '那些青春的回忆...', required: true },
      { id: 'q4', question: '想对ta说但一直没说的话？', placeholder: '谢谢、抱歉、我爱你...', required: true },
      { id: 'q5', question: '老了之后，想一起做什么？', placeholder: '想象一下你们老了的样子...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '朋友的昵称', placeholder: '亲爱的____' },
      { id: 'f2', label: '认识多少年', placeholder: '10年' },
      { id: 'f3', label: '你们的暗号', placeholder: '只有你们懂的梗' },
    ],
    contentTemplate: `亲爱的{{朋友的昵称}}：

展信佳。

还记得我们第一次见面吗？
{{问题1_你们是怎么认识的？还记得第一次见面吗？}}

一晃眼，我们已经认识{{认识多少年}}了。

你知道吗？你对我来说真的很重要，因为：
{{问题2_为什么ta对你来说这么重要？}}

还记得我们一起：
{{问题3_一起做过最疯狂/最难忘的事是什么？}}

哈哈，现在想起来还会笑出声。

有些话，平时不好意思说，今天想告诉你：
{{问题4_想对ta说但一直没说的话？}}

还记得我们的暗号吗？「{{你们的暗号}}」

等我们老了，还要一起：
{{问题5_老了之后，想一起做什么？}}

时光不老，我们不散。
谢谢你，出现在我的生命里。

永远的好朋友，
{{你的名字}}
{{日期}}

PS: 有空约饭啊！🍻`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['友情', '朋友', '回忆'],
  },
  {
    id: 'preset_travel_001',
    name: '旅行日记',
    description: '记录旅途中的美好瞬间',
    category: 'travel_memory',
    icon: 'map',
    emoji: '✈️',
    color: 'text-sky-blue-500',
    suitableMoods: ['excited', 'happy', 'peaceful'],
    suitableCategories: ['dream', 'other'],
    questions: [
      { id: 'q1', question: '今天去了哪里？看到了什么？', placeholder: '描述你看到的风景...', required: true },
      { id: 'q2', question: '吃到了什么特色美食？', placeholder: '当地的风味...', required: true },
      { id: 'q3', question: '遇到了什么有趣的人/事？', placeholder: '旅途中的奇遇...', required: false },
      { id: 'q4', question: '最大的收获/感悟是什么？', placeholder: '旅行给你的启发...', required: true },
      { id: 'q5', question: '用一个词形容今天的心情', placeholder: '震撼、感动、放松...', required: true },
      { id: 'q6', question: '下次还想再来吗？为什么？', placeholder: '或者推荐给朋友的理由...', required: false },
    ],
    fillables: [
      { id: 'f1', label: '旅行目的地', placeholder: '云南大理' },
      { id: 'f2', label: '旅行天数', placeholder: '第3天/共7天' },
      { id: 'f3', label: '今日花费', placeholder: '¥300' },
    ],
    contentTemplate: `# 旅行日记 · {{旅行目的地}}

**日期**：{{日期}}
**行程**：{{旅行天数}}
**今日花费**：{{今日花费}}

---

## 👀 今日足迹
{{问题1_今天去了哪里？看到了什么？}}

## 🍜 舌尖上的旅行
{{问题2_吃到了什么特色美食？}}

## 🎭 旅途奇遇
{{问题3_遇到了什么有趣的人/事？}}

## 💡 旅行感悟
{{问题4_最大的收获/感悟是什么？}}

---

**今日心情**：{{问题5_用一个词形容今天的心情}}

**关于这里**：
{{问题6_下次还想再来吗？为什么？}}

旅行的意义，
不在于看了多少风景，
而在于遇到了多少感动，
以及重新认识了自己。

继续上路吧，
还有更多美好在等着你。

🚀`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['旅行', '日记', '风景'],
  },
  {
    id: 'preset_milestone_001',
    name: '人生里程碑',
    description: '纪念人生中的重要时刻',
    category: 'milestone',
    icon: 'flag',
    emoji: '🎯',
    color: 'text-cream-yellow-500',
    suitableMoods: ['excited', 'happy', 'grateful'],
    suitableCategories: ['growth', 'dream'],
    questions: [
      { id: 'q1', question: '这是什么里程碑？对我来说意味着什么？', placeholder: '毕业、结婚、生子、升职、买房...', required: true },
      { id: 'q2', question: '为了这一刻，我付出了多少努力？', placeholder: '那些奋斗的日子...', required: true },
      { id: 'q3', question: '想感谢哪些人帮助我走到今天？', placeholder: '家人、朋友、贵人、自己...', required: true },
      { id: 'q4', question: '这一刻的心情是怎样的？', placeholder: '激动、平静、释然、想哭...', required: true },
      { id: 'q5', question: '下一个里程碑是什么？', placeholder: '继续向前...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '里程碑事件', placeholder: '大学毕业' },
      { id: 'f2', label: '达成日期', placeholder: '2024年6月' },
      { id: 'f3', label: '里程碑等级', placeholder: '⭐⭐⭐⭐⭐' },
    ],
    contentTemplate: `# 🎉 人生里程碑达成！

**事件**：{{里程碑事件}}
**达成日期**：{{达成日期}}
**重要程度**：{{里程碑等级}}

---

## 这一刻，终于来了
{{问题1_这是什么里程碑？对我来说意味着什么？}}

## 那些奋斗的日子
{{问题2_为了这一刻，我付出了多少努力？}}

## 感谢一路有你
{{问题3_想感谢哪些人帮助我走到今天？}}

## 此刻的心情
{{问题4_这一刻的心情是怎样的？}}

## 下一站，继续出发
{{问题5_下一个里程碑是什么？}}

---

**给自己的颁奖词**：
_恭喜你，你做到了！_
_所有的努力都没有白费，所有的坚持都有了意义。_
_但这不是终点，而是新的起点。_
_继续加油，你还可以去到更高更远的地方！_

🏆 为自己骄傲！`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['里程碑', '成就', '纪念'],
  },
  {
    id: 'preset_mental_001',
    name: '情绪日记',
    description: '记录和理解自己的情绪变化',
    category: 'mental_health',
    icon: 'brain',
    emoji: '🧠',
    color: 'text-lavender-300',
    suitableMoods: ['peaceful', 'sad', 'confused', 'happy'],
    suitableCategories: ['growth', 'other'],
    questions: [
      { id: 'q1', question: '今天的主导情绪是什么？', placeholder: '开心、焦虑、平静、愤怒...', required: true },
      { id: 'q2', question: '是什么触发了这种情绪？', placeholder: '具体的事件、想法、回忆...', required: true },
      { id: 'q3', question: '这种情绪在身体上有什么反应？', placeholder: '心跳加速、胸闷、放松、温暖...', required: true },
      { id: 'q4', question: '我想对这种情绪说什么？', placeholder: '接纳、感谢、探索...', required: true },
      { id: 'q5', question: '我需要什么来照顾好自己？', placeholder: '休息、倾诉、独处、运动...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '情绪强度（1-10）', placeholder: '6' },
      { id: 'f2', label: '情绪颜色', placeholder: '今天的情绪是什么颜色' },
      { id: 'f3', label: '自我关怀承诺', placeholder: '今天要怎样照顾自己' },
    ],
    contentTemplate: `# 情绪日记

**日期**：{{日期}}
**主导情绪**：{{问题1_今天的主导情绪是什么？}}
**情绪强度**：{{情绪强度（1-10）}}/10
**情绪颜色**：{{情绪颜色}}

---

## 触发因素
{{问题2_是什么触发了这种情绪？}}

## 身体反应
{{问题3_这种情绪在身体上有什么反应？}}

## 与情绪对话
{{问题4_我想对这种情绪说什么？}}

## 自我关怀计划
{{自我关怀承诺}}
{{问题5_我需要什么来照顾好自己？}}

---

**情绪没有好坏，它们只是信使。**
每一种情绪都在告诉我一些关于自己的事情。
我愿意聆听它们，理解它们，接纳它们。
因为它们都是我的一部分。

今天，我选择温柔地对待自己。

💜`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['情绪', '心理健康', '自我觉察'],
  },
  {
    id: 'preset_creativity_001',
    name: '灵感收集本',
    description: '捕捉每一个转瞬即逝的灵感',
    category: 'creativity',
    icon: 'palette',
    emoji: '🎨',
    color: 'text-soft-pink-300',
    suitableMoods: ['excited', 'peaceful', 'happy'],
    suitableCategories: ['dream', 'growth', 'other'],
    questions: [
      { id: 'q1', question: '这个灵感是怎么来的？', placeholder: '什么触发了这个想法...', required: true },
      { id: 'q2', question: '详细描述一下这个灵感', placeholder: '尽可能具体地写下来...', required: true },
      { id: 'q3', question: '这个灵感可以用来做什么？', placeholder: '实际应用场景...', required: true },
      { id: 'q4', question: '要实现这个灵感，需要什么条件？', placeholder: '时间、资源、技能...', required: true },
      { id: 'q5', question: '第一步可以做什么？什么时候开始？', placeholder: '把灵感变成行动...', required: true },
    ],
    fillables: [
      { id: 'f1', label: '灵感类型', placeholder: '写作/绘画/产品创意/商业模式...' },
      { id: 'f2', label: '灵感星级', placeholder: '⭐⭐⭐⭐⭐' },
      { id: 'f3', label: '预计完成时间', placeholder: '1个月/长期' },
    ],
    contentTemplate: `# 💡 灵感收集

**日期**：{{日期}}
**灵感类型**：{{灵感类型}}
**创意指数**：{{灵感星级}}
**预计完成**：{{预计完成时间}}

---

## 灵感来源
{{问题1_这个灵感是怎么来的？}}

## 灵感详情
{{问题2_详细描述一下这个灵感}}

## 应用场景
{{问题3_这个灵感可以用来做什么？}}

## 实现条件
{{问题4_要实现这个灵感，需要什么条件？}}

## 行动计划
{{问题5_第一步可以做什么？什么时候开始？}}

---

**灵感稍纵即逝，唯有记录能让它永恒。**
不要让好想法只停留在脑子里，
把它写下来，然后去实现它。
下一个伟大的创意，可能就从这里开始。

✨ 保持好奇，保持创造！`,
    isCustom: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: ['灵感', '创意', '行动'],
  },
];

export function createEmptyTemplate(): Template {
  return {
    id: generateId(),
    name: '',
    description: '',
    category: 'custom',
    icon: 'edit-3',
    emoji: '✏️',
    color: 'text-warm-gray-500',
    suitableMoods: [],
    suitableCategories: [],
    questions: [],
    fillables: [],
    contentTemplate: '',
    isCustom: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    tags: [],
  };
}

export function generateTemplateContent(
  template: Template,
  answers: Record<string, string>,
  fillables: Record<string, string>
): string {
  let content = template.contentTemplate;

  content = content.replace(/{{日期}}/g, new Date().toLocaleDateString('zh-CN'));
  content = content.replace(/{{年份}}/g, new Date().getFullYear().toString());
  content = content.replace(/{{年份\+10}}/g, (new Date().getFullYear() + 10).toString());

  for (const [key, value] of Object.entries(fillables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, value || `【${key}】`);
  }

  for (const question of template.questions) {
    const key = `问题${question.id.replace('q', '')}_${question.question}`;
    const regex = new RegExp(`{{${key}}}`, 'g');
    const answer = answers[question.id] || '';
    content = content.replace(regex, answer || `【${question.question}】`);
  }

  return content;
}
