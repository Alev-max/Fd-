import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const J = decodePNG(readFileSync('J-thirst30.png'));
console.log('J size:', J.width + 'x' + J.height);

// 组件定位
function isDarkBg(r, g, b) { return Math.abs(r - 23) <= 10 && Math.abs(g - 19) <= 10 && Math.abs(b - 15) <= 10; }
let minY = 1e9, maxY = -1;
for (let y = 100; y < 633; y++) { if (isDarkBg(...px(J, 116, y))) { if (y < minY) minY = y; if (y > maxY) maxY = y; } }
console.log('组件 x116 深色范围: y', minY, '-', maxY);
// 背景图验证
console.log('stage中心(282,403):', px(J, 282, 403).join(','));
console.log('时间盒(264,265):', px(J, 264, 265).join(','));

// 口渴填充: 30% => fill x209.5-257.6
console.log('=== 口渴填充扫描 (thirst=30) ===');
for (const y of [545, 550, 555]) {
  let firstX = -1, lastX = -1, cnt = 0;
  for (let x = 170; x <= 380; x++) {
    const [r, g, b] = px(J, x, y);
    if (r > 30 && r < 70 && g > 26 && g < 60 && b < 55 && Math.abs(r - g) < 12 && r >= g) {
      if (firstX < 0) firstX = x;
      lastX = x; cnt++;
    }
  }
  console.log('y=' + y, '墨黑填充 x ' + firstX + '-' + lastX + ' (n=' + cnt + ')');
}
// 颜色确认: 30% 时无脉冲 => 纯 #2b2620 (43,38,32)
console.log('填充中心色(232,550):', px(J, 232, 550).join(','), '(期望 43,38,32 墨黑)');
console.log('填充外(280,550):', px(J, 280, 550).join(','), '(期望背景)');

// 饥饿 85% 确认还在
console.log('饥饿中心(282,606):', px(J, 282, 606).join(','), '(期望脉冲砖红~87,40,33)');
let hFirst = -1, hLast = -1;
for (let x = 170; x <= 380; x++) {
  const [r, g, b] = px(J, 606, x);
  if (r > 60 && r < 130 && g > 20 && g < 62 && b < 58 && r - g > 30 && r - b > 30) {
    if (hFirst < 0) hFirst = x;
    hLast = x;
  }
}
console.log('饥饿填充边界: x', hFirst, '-', hLast, '(期望 209.5-345.7)');
