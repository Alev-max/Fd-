import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const C = decodePNG(readFileSync('diff-restore.png'));   // thirst 65
const F = decodePNG(readFileSync('diff-thirst30.png')); // thirst 30

// 口渴胶囊区域差分: fill 宽度变化 65% -> 30%
console.log('=== 口渴胶囊差分 (65 vs 30) ===');
for (let y = 520; y <= 580; y++) {
  const xs = [];
  for (let x = 160; x <= 390; x++) {
    const [r1, g1, b1] = px(C, x, y);
    const [r2, g2, b2] = px(F, x, y);
    if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 30) xs.push(x);
  }
  if (xs.length >= 3) console.log('y=' + y, 'n=' + xs.length, 'x ' + xs[0] + '-' + xs[xs.length - 1]);
}

// F 中口渴 fill 的颜色采样 (确认 30% 时墨黑无脉冲)
console.log('--- F (thirst=30) 口渴中心线采样 ---');
const cyT = 550;
const samples = [];
for (let x = 210; x <= 280; x += 6) {
  const [r, g, b] = px(F, x, cyT);
  samples.push(x + ':' + r + ',' + g + ',' + b);
}
console.log(samples.join(' | '));

// 几何计算
const RX = 116, RY = 189, RW = 332, RH = 439;
const meterX0 = RX + RW * 0.169;   // 16.9%
const meterW = RW * 0.605;          // 60.5%
const fillStart = meterX0 + meterW * 0.186;
const trackLen = meterW * 0.798;    // 79.8% 可用条长
console.log('--- 几何 ---');
console.log('meter: x', meterX0.toFixed(1), '-', (meterX0 + meterW).toFixed(1), '(宽', meterW.toFixed(1) + ')');
console.log('fill 起点 x =', fillStart.toFixed(1));
console.log('65% fill 终点 x =', (fillStart + trackLen * 0.65).toFixed(1));
console.log('30% fill 终点 x =', (fillStart + trackLen * 0.30).toFixed(1));
console.log('85% fill 终点 x =', (fillStart + trackLen * 0.85).toFixed(1));
console.log('图标右侧条长(18.6%->100%):', (meterW * 0.814).toFixed(1), 'px; 65% =', (meterW * 0.814 * 0.65).toFixed(1), 'px; 85% =', (meterW * 0.814 * 0.85).toFixed(1));
