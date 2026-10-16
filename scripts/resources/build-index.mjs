// 资源框架：扫描 public/resources/<id>/resource.json，补上文件哈希与图片尺寸，校验后写 public/resources/index.json。
// 任何一条缺真实预览、缺文件、缺可执行命令、缺出处，整个构建失败——不允许空壳上架。
//   node scripts/resources/build-index.mjs
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = path.join(ROOT, 'public/resources');
const SHELVES = ['ppt', 'image', 'science', 'skill'];

function imageSize(buf) {
  if (buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    for (let i = 2; i < buf.length;) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1], len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      i += 2 + len;
    }
  }
  throw new Error('不认识的图片格式');
}

const errors = [];
const items = [];
for (const id of readdirSync(DIR).sort()) {
  const manifest = path.join(DIR, id, 'resource.json');
  if (!statSync(path.join(DIR, id)).isDirectory() || !existsSync(manifest)) continue;
  const m = JSON.parse(readFileSync(manifest, 'utf8'));
  const fail = (msg) => errors.push(`${id}: ${msg}`);
  if (m.id !== id) fail(`id 与目录名不一致（${m.id}）`);
  if (!SHELVES.includes(m.shelf)) fail(`shelf 必须是 ${SHELVES.join(' / ')}`);
  if (!m.name?.zh || !m.summary?.zh) fail('缺中文名称或简介');
  if (!m.run?.command || !m.run?.runtime) fail('缺可执行命令');
  if (!m.run?.limits?.zh) fail('缺“做不到什么”的说明');
  if (!m.provenance?.origin) fail('缺出处');
  if (m.provenance?.origin === 'original-third-party' && (!m.provenance.sourceUrl || !m.provenance.license)) fail('第三方原件必须写原始链接与许可');
  const files = (m.files || []).map(([rel, role]) => {
    const abs = path.join(DIR, id, rel);
    if (!existsSync(abs)) { fail(`文件不存在：${rel}`); return null; }
    const buf = readFileSync(abs);
    return { path: `/resources/${id}/${rel}`, role, bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex') };
  }).filter(Boolean);
  if (!files.some(f => ['code', 'original', 'template'].includes(f.role))) fail('至少要有一个完整的代码 / 原文件 / 模板');
  const previews = (m.previews || []).map((rel) => {
    const abs = path.join(DIR, id, rel);
    if (!existsSync(abs)) { fail(`预览图不存在：${rel}`); return null; }
    const buf = readFileSync(abs);
    const size = imageSize(buf);
    if (size.width < 400 || size.height < 200) fail(`预览图太小：${rel} ${size.width}×${size.height}`);
    // 近乎纯色的图 = 空白占位，直接拒收
    const sample = buf.subarray(Math.floor(buf.length / 3), Math.floor(buf.length / 3) + 4096);
    if (new Set(sample).size < 24) fail(`预览图疑似空白：${rel}`);
    return { url: `/resources/${id}/${rel}`, ...size };
  }).filter(Boolean);
  if (!previews.length) fail('没有真实预览图');
  items.push({ ...m, files, previews });
}

if (errors.length) {
  console.error(`资源索引构建失败：\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
const counts = Object.fromEntries(SHELVES.map(s => [s, items.filter(i => i.shelf === s).length]));
const previous = existsSync(path.join(DIR, 'index.json')) ? JSON.parse(readFileSync(path.join(DIR, 'index.json'), 'utf8')) : null;
const generatedAt = JSON.stringify(previous?.items) === JSON.stringify(items) ? previous.generatedAt : new Date().toISOString();
const serialized = `${JSON.stringify({ specVersion: '1', generatedAt, counts, items }, null, 1)}\n`;
writeFileSync(path.join(DIR, 'index.json'), serialized);
writeFileSync(path.join(ROOT, 'src/data/resource-kits.json'), serialized);
console.log(`resources/index.json: ${items.length} 条`, counts);
