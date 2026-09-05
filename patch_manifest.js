const fs = require('fs')

const manifestPath = 'demo/src/stages/text-reveal/manifest.js'
let content = fs.readFileSync(manifestPath, 'utf-8')

// Add Holo Foil
content = content.replace(
  "render: { preset: 'chrome' },",
  "render: { preset: 'chrome' },\n    },\n    {\n      termId: 'atlas-component-component-holo-text',\n      termZhFix: '全息镭射字 (Holo Foil)',\n      slot: 'variant',\n      render: { preset: 'holo' },\n      noteZh: '模拟全息箔材质，基于 OKLCH 的高保真流光随时间呼吸。',"
)

// Add Scrub Reveal, Glitch, 3D Tumble
content = content.replace(
  "render: { preset: 'mask' },",
  "render: { preset: 'mask' },\n    },\n    {\n      termId: 'atlas-motion-design-phenomenon-scroll-reveal',\n      termZhFix: '洗色揭示 (Scrub Wipe)',\n      slot: 'variant',\n      render: { preset: 'scrub' },\n      noteZh: '苹果官网常用的滑动洗色：文字本是暗色，遮罩按进度渐进划过点亮。',\n    },\n    {\n      termId: 'atlas-motion-design-phenomenon-3d-tilt-flip',\n      termZhFix: '3D 翻转浮现',\n      slot: 'variant',\n      render: { preset: 'tumble' },\n      noteZh: '沿 X 轴 3D 翻转入场，增加空间景深感。',\n    },\n    {\n      termId: 'atlas-aesthetic-design-phenomenon-glitch',\n      termZhFix: '色彩偏移故障 (Glitch)',\n      slot: 'variant',\n      render: { preset: 'glitch' },\n      noteZh: '赛博朋克风格的 Chromatic Aberration 瞬间错位干扰。',"
)

fs.writeFileSync(manifestPath, content, 'utf-8')
