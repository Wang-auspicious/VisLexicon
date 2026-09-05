const fs = require('fs');
let file = fs.readFileSync('demo/src/stages/agent-composer/Stage.jsx', 'utf-8');

file = file.replace(
  /<div {\.\.\.node\('composer\.input', 'ac-prompt-textarea'\)}>([^<]*)<\/div>/g,
  '<textarea {...node(\'composer.input\', \'ac-prompt-textarea\')} placeholder="输入指令、粘贴设计图，或键入 / 唤起智能体指令库…" defaultValue={preset === \'editing\' ? \'请帮我把 Composer 输入区的内阴影调柔和，并为思维链添加微光呼吸动效\' : \'\'} />'
);

fs.writeFileSync('demo/src/stages/agent-composer/Stage.jsx', file, 'utf-8');
console.log("Replaced div with textarea");
