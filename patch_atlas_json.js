const fs = require('fs')

const atlasPath = 'demo/src/data/visual-atlas.json'
let data = JSON.parse(fs.readFileSync(atlasPath, 'utf-8'))

data.entries.push({
  id: "atlas-component-component-holo-text",
  termEn: "Holographic Foil Text",
  termZh: "全息箔文本",
  axis: "component",
  recordType: "component",
  definitionZh: "呈现全息反光、镭射光泽的展示文本材质。",
  aliases: ["Holo", "镭射字", "全息光泽"]
})

data.entries.push({
  id: "atlas-aesthetic-design-phenomenon-glitch",
  termEn: "Glitch Effect",
  termZh: "故障干扰",
  axis: "aesthetic",
  recordType: "design-phenomenon",
  definitionZh: "通过瞬间的错位、色彩偏移 (Chromatic Aberration) 等手法模拟数字信号故障的赛博风格。",
  aliases: ["RGB Split", "Chromatic Aberration", "色差偏移"]
})

fs.writeFileSync(atlasPath, JSON.stringify(data, null, 2), 'utf-8')
