import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const I = decodePNG(readFileSync('I-after-clicks.png'));

// 第 2 页应有: 旁白(斜体灰褐 #6b6156), 莉娜(#8b3a30), 阿明(#2f4a6b)
// stage 垂直居中 3 条
function scanColorRows(img, target, tol, label, y0, y1, x0, x1) {
  console.log('--- ' + label + ' ---');
  const bands = [];
  for (let y = y0; y <= y1; y++) {
    let cnt = 0, minX = 1e9, maxX = -1;
    for (let x = x0; x <= x1; x++) {
      const [r, g, b] = px(img, x, y);
      if (Math.abs(r - target[0]) <= tol && Math.abs(g - target[1]) <= tol && Math.abs(b - target[2]) <= tol) {
        cnt++; if (x < minX) minX = x; if (x > maxX) maxX = x;
      }
    }
    if (cnt >= 2) bands.push({ y, cnt, minX, maxX });
  }
  let lastY = -5, bandStart = -1, bandCnt = 0, bandMin = 1e9, bandMax = -1;
  const groups = [];
  for (const b of bands) {
    if (b.y - lastY > 3) { if (bandStart >= 0) groups.push({ y0: bandStart, y1: lastY, minX: bandMin, maxX: bandMax, rows: bandCnt }); bandStart = b.y; bandMin = 1e9; bandMax = -1; bandCnt = 0; }
    bandCnt += b.cnt;
    bandMin = Math.min(bandMin, b.minX); bandMax = Math.max(bandMax, b.maxX);
    lastY = b.y;
  }
  if (bandStart >= 0) groups.push({ y0: bandStart, y1: lastY, minX: bandMin, maxX: bandMax, rows: bandCnt });
  for (const g of groups) console.log('色带 y ' + g.y0 + '-' + g.y1 + ' x ' + g.minX + '-' + g.maxX + ' (px ' + g.rows + ')');
  return groups;
}

// 莉娜色
const linaBands = scanColorRows(I, [139, 58, 48], 25, '莉娜 #8b3a30 (第2页)', 340, 500, 180, 410);
// 阿明色
const mingBands = scanColorRows(I, [47, 74, 107], 25, '阿明 #2f4a6b (第2页)', 340, 500, 180, 410);
// 旁白灰褐 #6b6156 (107,97,86)
const narrBands = scanColorRows(I, [107, 97, 86], 18, '旁白 #6b6156 (第2页)', 340, 500, 180, 410);

// 页码检测: pager 中心 x296 附近, 检测数字墨色像素
console.log('--- 页码区域 (y495-514, x280-315) 墨色像素 ---');
for (let y = 494; y <= 514; y++) {
  let cnt = 0, minX = 1e9, maxX = -1;
  for (let x = 278; x <= 318; x++) {
    const [r, g, b] = px(I, x, y);
    if (r < 120 && g < 105 && b < 95) { cnt++; if (x < minX) minX = x; if (x > maxX) maxX = x; }
  }
  if (cnt >= 2) console.log('y=' + y, 'n=' + cnt, 'x ' + minX + '-' + maxX);
}

// ▶ 按钮禁用状态: 第2页 ▶ disabled opacity 0.25 -> 按钮区域像素变浅
// ▶ 位置 x319-342, ◀ 位置 x249-272, y494-511
console.log('--- 按钮亮度对比 (描边像素平均亮度) ---');
function btnLum(x0, x1, label) {
  let sum = 0, n = 0;
  for (let y = 496; y <= 510; y++)
    for (let x = x0; x <= x1; x++) {
      const [r, g, b] = px(I, x, y);
      const lum = (r + g + b) / 3;
      if (lum < 180) { sum += lum; n++; }  // 非背景像素
    }
  console.log(label + ': 平均亮度 ' + (n ? (sum / n).toFixed(1) : 'n/a') + ' (' + n + 'px)');
}
btnLum(249, 272, '◀ 按钮(应启用,描边深)');
btnLum(319, 342, '▶ 按钮(应禁用,opacity 0.25)');
