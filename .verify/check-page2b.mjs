import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const G = decodePNG(readFileSync('G-page1-final.png'));
const I = decodePNG(readFileSync('I-after-clicks.png'));

// 旁白行检测: 第2页第1条应在 y~370-400, 斜体灰褐 #6b6156
console.log('=== 旁白行扫描 (I, y365-405) ===');
for (let y = 365; y <= 405; y++) {
  let narr = 0, minX = 1e9, maxX = -1;
  for (let x = 180; x <= 410; x++) {
    const [r, g, b] = px(I, x, y);
    // 灰褐: 中等亮度, r>=g>=b, 色差小
    if (r >= 85 && r <= 135 && g >= 75 && g <= 125 && b >= 65 && b <= 115 && r >= g && g >= b && r - b < 30) {
      narr++; if (x < minX) minX = x; if (x > maxX) maxX = x;
    }
  }
  if (narr >= 4) console.log('y=' + y, '灰褐px=' + narr, 'x ' + minX + '-' + maxX);
}

// 第2页 stage 是否只有3条: 检查 y370-470 的所有文字行(任何深色文字)
console.log('=== 第2页所有文字行 (I, 墨色+彩色名字) ===');
for (let y = 360; y <= 480; y++) {
  let dark = 0;
  for (let x = 180; x <= 410; x++) {
    const [r, g, b] = px(I, x, y);
    if (r + g + b < 300 && !(Math.abs(r-23)<12 && Math.abs(g-19)<12 && Math.abs(b-15)<12)) dark++; // 深色但非纯背景
  }
  if (dark >= 6) console.log('y=' + y, '深色文字px=' + dark);
}

// 页码精确验证: G(1/2) vs I(2/2) 在页码字符位置的差分
console.log('=== 页码区域精细差分 (y496-512, x276-320) ===');
for (let y = 496; y <= 512; y++) {
  const xs = [];
  for (let x = 276; x <= 320; x++) {
    const [r1, g1, b1] = px(G, x, y);
    const [r2, g2, b2] = px(I, x, y);
    if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 30) xs.push(x);
  }
  if (xs.length >= 1) console.log('y=' + y, 'n=' + xs.length, 'x ' + xs[0] + '-' + xs[xs.length - 1]);
}
