import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const G = decodePNG(readFileSync('G-page1-final.png'));

// 纸面亮度剖面: 在文字行下方 y470-488 (正文与 pager 之间的纸面) 测量纸面横向范围
console.log('=== 纸面横向范围剖面 ===');
for (const y of [468, 472, 476, 480, 484, 488]) {
  const lum = [];
  for (let x = 150; x <= 440; x += 2) {
    const [r, g, b] = px(G, x, y);
    lum.push((r + g + b) / 3 > 130 ? 1 : 0);
  }
  // 找连续亮区(纸面)
  let start = -1, end = -1;
  for (let i = 0; i < lum.length; i++) {
    if (lum[i]) { if (start < 0) start = i; end = i; }
  }
  // 找最长的连续亮段
  let bestS = -1, bestE = -1, curS = -1;
  for (let i = 0; i <= lum.length; i++) {
    const v = i < lum.length ? lum[i] : 0;
    if (v && curS < 0) curS = i;
    if (!v && curS >= 0) { if (i - 1 - curS > bestE - bestS) { bestS = curS; bestE = i - 1; } curS = -1; }
  }
  console.log('y=' + y, '最长亮段 x', (150 + bestS * 2), '-', (150 + bestE * 2), '(纸面)');
}

// 每行纸面边界 (y376-463 文字区域, 找每行的纸面起止)
console.log('=== 文字行的纸面边界 vs 文字位置 ===');
for (const y of [380, 390, 400, 415, 430, 445, 460]) {
  // 从左向右找第一个亮像素(纸面开始), 从右向左找最后一个亮像素
  let left = -1, right = -1;
  for (let x = 150; x <= 440; x++) {
    const [r, g, b] = px(G, x, y);
    if ((r + g + b) / 3 > 130) { left = x; break; }
  }
  for (let x = 440; x >= 150; x--) {
    const [r, g, b] = px(G, x, y);
    if ((r + g + b) / 3 > 130) { right = x; break; }
  }
  console.log('y=' + y, '亮区(纸面) x', left, '-', right);
}

// 撕边特征: 纸边缘的锯齿状过渡。测量正文行 y376-463 的左右最外侧文字像素 vs 纸边界
console.log('=== 文字最外沿 (从 G vs I 差分已知: 正文x187-383) ===');
console.log('正文文字 x 范围: 187-383 (差分测量)');
console.log('stage CSS 范围: x186-406');
