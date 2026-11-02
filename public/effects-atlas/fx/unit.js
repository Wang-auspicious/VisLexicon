// 「组件单元」分类：每条是一类组件，不是某个库的某个组件。
// 舞台、参数、提示词都来自 ../units/ 里的同一份单元定义，打开详情即可实时调节。
import { UNITS } from '../units/index.js';

export default {
  id: 'unit', zh: '组件单元', en: 'Component units',
  dz: '一类组件一张台子：调参数、看手感、拿提示词', de: 'One bench per component class: tune it, feel it, take the prompt',
  items: UNITS.map(u => ({
    id: u.id,
    zh: u.zh, en: u.en,
    dz: u.dz, de: u.de,
    pz: u.prompt(Object.fromEntries(u.params.map(p => [p.k, p.def])), 'zh').split('\n')[1] || '',
    pe: u.prompt(Object.fromEntries(u.params.map(p => [p.k, p.def])), 'en').split('\n')[1] || '',
    demo: 'live',
    css: '',
    live: u.id,
    componentTypes: u.componentTypes,
    params: u.params,
  })),
};
