import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const C = decodePNG(readFileSync('diff-restore.png'));

// 按行找彩色名字像素
function scanColorRows(img, target, tol, label, y0, y1, x0, x1) {
  console.log('--- ' + label + ' rgb(' + target + ') tol ' + tol + ' ---');
  const rows = [];
  for (let y = y0; y <= y1; y++) {
    const xs = [];
    for (let x = x0; x <= x1; x++) {
      const [r, g, b] = px(img, x, y);
      if (Math.abs(r - target[0]) <= tol && Math.abs(g - target[1]) <= tol && Math.abs(b - target[2]) <= tol) xs.push(x);
    }
    if (xs.length >= 2) rows.push({ y, n: xs.length, minX: xs[0], maxX: xs[xs.length - 1] });
  }
  // 聚类显示
  let lastY = -10;
  for (const r of rows) {
    if (r.y - lastY > 3) console.log('>> 行带 y=' + r.y);
    console.log('  y=' + r.y, 'n=' + r.n, 'x ' + r.minX + '-' + r.maxX);
    lastY = r.y;
  }
  return rows;
}

// 莉娜 #8b3a30 (139,58,48) 在 stage 区
scanColorRows(C, [139, 58, 48], 25, '莉娜色 #8b3a30', 340, 500, 180, 410);
// 阿明 #2f4a6b (47,74,107)
scanColorRows(C, [47, 74, 107], 25, '阿明色 #2f4a6b', 340, 500, 180, 410);
