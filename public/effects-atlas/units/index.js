// 可调单元注册表。新增单元：写一个模块，在这里登记一行。
import switchUnit from './switch.js';
import buttonUnit from './button.js';
import slideConfirm from './slide-confirm.js';
import segmented from './segmented.js';
import { withDefaults, defaults } from './kit.js';

export const UNITS = [buttonUnit, switchUnit, segmented, slideConfirm];
export const UNIT_BY_ID = Object.fromEntries(UNITS.map(u => [u.id, u]));

export { withDefaults, defaults };

/** 机器可读的单元描述（Playground / MCP / Design Spec 共用）。 */
export function describeUnit(unit, params) {
  const p = withDefaults(unit, params);
  return {
    id: unit.id,
    name: { zh: unit.zh, en: unit.en },
    feel: { zh: unit.dz, en: unit.de },
    componentTypes: unit.componentTypes,
    params: unit.params,
    values: p,
    tokens: unit.spec(p),
    prompt: { zh: unit.prompt(p, 'zh'), en: unit.prompt(p, 'en') },
  };
}
