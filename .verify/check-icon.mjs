import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const G = decodePNG(readFileSync('G-page1-final.png'));

// 图标区检测 (G, 背景图已加载): meter 左侧 0-18.6% = x172-209
console.log('=== 口渴胶囊图标区 (x172-209, y523-577) ===');
let iconPx = 0, bgPx = 0;
for (let y = 525; y <= 575; y++)
  for (let x = 173; x <= 208; x++) {
    const [r, g, b] = px(G, x, y);
    if (Math.abs(r - 23) <= 12 && Math.abs(g - 19) <= 12 && Math.abs(b - 15) <= 12) bgPx++;
    else iconPx++;
  }
console.log('纯背景像素:', bgPx, '图案像素:', iconPx, '(总', (iconPx + bgPx) + ')');
// 图标图案采样
const samples = [];
for (let x = 180; x <= 202; x += 4) {
  const [r, g, b] = px(G, x, 550);
  samples.push(x + ':' + r + ',' + g + ',' + b);
}
console.log('中心线采样:', samples.join(' | '));

console.log('=== 饥饿胶囊图标区 (x172-209, y585-627) ===');
let iconPx2 = 0, bgPx2 = 0;
for (let y = 587; y <= 625; y++)
  for (let x = 173; x <= 208; x++) {
    const [r, g, b] = px(G, x, y);
    if (Math.abs(r - 23) <= 12 && Math.abs(g - 19) <= 12 && Math.abs(b - 15) <= 12) bgPx2++;
    else iconPx2++;
  }
console.log('纯背景像素:', bgPx2, '图案像素:', iconPx2);
const samples2 = [];
for (let x = 180; x <= 202; x += 4) {
  const [r, g, b] = px(G, x, 606);
  samples2.push(x + ':' + r + ',' + g + ',' + b);
}
console.log('中心线采样:', samples2.join(' | '));

// 图标与填充的分界: fill 从 x209.5 开始, 检测 x205-212 的过渡
console.log('=== 图标/填充分界 (y550, x200-220) ===');
for (let x = 200; x <= 220; x++) {
  const [r, g, b] = px(G, x, 550);
  console.log('x=' + x, r + ',' + g + ',' + b);
}

// 时间/地点文字最终确认 (G): 衬线墨字位置
console.log('=== G 时间文字行 (y270-282, 时间盒 x217-312) ===');
for (let y = 268; y <= 284; y++) {
  let cnt = 0, minX = 1e9, maxX = -1;
  for (let x = 215; x <= 314; x++) {
    const [r, g, b] = px(G, x, y);
    if (r < 110 && g < 100 && b < 90 && r >= g - 3 && g >= b - 6) { cnt++; if (x < minX) minX = x; if (x > maxX) maxX = x; }
  }
  if (cnt >= 3) console.log('y=' + y, '墨px=' + cnt, 'x ' + minX + '-' + maxX);
}
console.log('=== G 地点文字行 (y270-282, 地点盒 x324-419) ===');
for (let y = 268; y <= 284; y++) {
  let cnt = 0, minX = 1e9, maxX = -1;
  for (let x = 322; x <= 421; x++) {
    const [r, g, b] = px(G, x, y);
    if (r < 110 && g < 100 && b < 90 && r >= g - 3 && g >= b - 6) { cnt++; if (x < minX) minX = x; if (x > maxX) maxX = x; }
  }
  if (cnt >= 3) console.log('y=' + y, '墨px=' + cnt, 'x ' + minX + '-' + maxX);
}
