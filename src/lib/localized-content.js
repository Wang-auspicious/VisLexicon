// Localized fields must never fall back to Chinese in English mode.
export const hasHan = value => /\p{Script=Han}/u.test(String(value ?? ''))
export function englishText(value, fallback = '') {
  return typeof value === 'string' && value.trim() && !hasHan(value) ? value : fallback
}
export function displayName(item, locale) {
  if (locale !== 'en') return item?.nameZh || item?.titleZh || item?.name || item?.entryId || ''
  return englishText(item?.nameEn || item?.titleEn, englishText(item?.name, item?.domain || item?.entryId || 'Untitled'))
}
export const TOPIC_EN = {
  '全部': 'All', '设计规范': 'Design rules', '布局规则': 'Layout rules', '交互规则': 'Interaction rules',
  '统计图': 'Statistical charts', '方法示意': 'Method diagrams', '网络结构': 'Network structures',
  '构图': 'Composition', '光线': 'Lighting', '材质': 'Materials',
  '人像风格': 'Portraits', '商业设计': 'Commercial design', '图像修复': 'Image restoration',
  '插画与绘画': 'Illustration & painting', '海报与排版': 'Posters & typography', '建筑与空间': 'Architecture & spaces',
  '像素与游戏': 'Pixel art & games', '宠物与动物': 'Pets & animals', '分镜与叙事': 'Storyboards & narrative',
  '玩具与手办': 'Toys & figurines', '风景与旅行': 'Landscape & travel', '场景改造': 'Scene editing', '材质变换': 'Material transformation',
}
export const topicEnglish = value => TOPIC_EN[value] || englishText(value, 'Other')
