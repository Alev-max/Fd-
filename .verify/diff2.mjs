import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const A = decodePNG(readFileSync('step2-fullpage.png'));
const B = decodePNG(readFileSync('diff-timeloc.png'));
const C = decodePNG(readFileSync('diff-restore.png'));

// A vs C: 都是原始内容，同视口区域对比（A 是 fullPage 但顶部 633 与 C 同）
// 若有大差异 => 背景图时序噪声
let acDiff = 0;
for (let y = 189; y <= 300; y++)
  for (let x = 116; x <= 448; x++) {
    const [r1, g1, b1] = px(A, x, y);
    const [r2, g2, b2] = px(C, x, y);
    if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 40) acDiff++;
  }
console.log('A vs C 组件上部(y189-300)差异:', acDiff, 'px');

// B vs C: 分盒统计差异像素
function diffBox(x0, y0, x1, y1, label) {
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, count = 0;
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const [r1, g1, b1] = px(B, x, y);
      const [r2, g2, b2] = px(C, x, y);
      if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 40) {
        count++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  console.log(label + ': count=' + count, count ? 'bbox(' + minX + ',' + minY + ')-(' + maxX + ',' + maxY + ')' : '');
  return { minX, minY, maxX, maxY, count };
}

// 盒坐标: 时间盒 (217,260)-(312,288), 地点盒 (324,260)-(419,288)
const tDiff = diffBox(217, 256, 312, 292, '时间盒差异');
const lDiff = diffBox(324, 256, 419, 292, '地点盒差异');

// 在 C 中检测这些差异区域的实际文字(墨色)范围
function inkInC(x0, y0, x1, y1, label) {
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, count = 0;
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const [r, g, b] = px(C, x, y);
      if (r >= g && g >= b && r - b >= 8 && r < 130 && g < 115 && b < 100) {
        count++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  console.log(label + '(C墨色): count=' + count, count ? 'bbox(' + minX + ',' + minY + ')-(' + maxX + ',' + maxY + ')' : '');
  return { minX, minY, maxX, maxY, count };
}
inkInC(217, 262, 312, 286, '时间盒文字');
inkInC(324, 262, 419, 286, '地点盒文字');

// 盒几何验证
console.log('--- 几何验证 ---');
// 时间盒: 217-312 中心 264.5; 文字 bbox 中心
const tBox = { x0: 217, x1: 312, y0: 260, y1: 288 };
const lBox = { x0: 324, x1: 419, y0: 260, y1: 288 };
console.log('时间盒中心: (' + (tBox.x0 + tBox.x1) / 2 + ',' + (tBox.y0 + tBox.y1) / 2 + ')  地点盒中心: (' + (lBox.x0 + lBox.x1) / 2 + ',' + (lBox.y0 + lBox.y1) / 2 + ')');
