import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const G = decodePNG(readFileSync('G-page1-final.png'));

// 垂直列亮度中值扫描: x370-440, y360-500 (正文+下方区域)
// 纸面列: 大部分行亮; 撕边外: 大部分行暗
console.log('=== 列亮度分析 (x370-440, y360-500) ===');
for (let x = 366; x <= 440; x += 2) {
  let light = 0, total = 0;
  for (let y = 360; y <= 500; y += 2) {
    const [r, g, b] = px(G, x, y);
    if ((r + g + b) / 3 > 135) light++;
    total++;
  }
  const pct = (light / total * 100).toFixed(0);
  console.log('x=' + x, '亮占比 ' + pct + '%', pct >= 60 ? '<-- 纸面' : pct >= 30 ? '<-- 过渡' : '');
}

// 左侧同样
console.log('=== 列亮度分析 (x150-200) ===');
for (let x = 150; x <= 200; x += 2) {
  let light = 0, total = 0;
  for (let y = 360; y <= 500; y += 2) {
    const [r, g, b] = px(G, x, y);
    if ((r + g + b) / 3 > 135) light++;
    total++;
  }
  const pct = (light / total * 100).toFixed(0);
  console.log('x=' + x, '亮占比 ' + pct + '%', pct >= 60 ? '<-- 纸面' : pct >= 30 ? '<-- 过渡' : '');
}

// 换算 1086 坐标
const RX = 116, RW = 332;
function toBg(x) { return Math.round((x - RX) / RW * 1086); }
console.log('--- 换算 (截图x -> 背景图1086坐标) ---');
console.log('stage CSS: 左 186 -> bg', toBg(186), ' 右 406 -> bg', toBg(406));
console.log('文字实测: 左 187 -> bg', toBg(187), ' 右 383 -> bg', toBg(383));
