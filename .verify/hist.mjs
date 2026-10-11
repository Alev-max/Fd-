import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const img = decodePNG(readFileSync(process.argv[2]));

// 颜色量化直方图
function hist(x0, y0, x1, y1, label) {
  const m = new Map();
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const [r, g, b] = px(img, x, y);
      const key = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4);
      m.set(key, (m.get(key) || 0) + 1);
    }
  const total = (x1 - x0 + 1) * (y1 - y0 + 1);
  const sorted = Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log(label, '(' + total + 'px):');
  for (const [k, c] of sorted) {
    const [r, g, b] = k.split(',').map(v => parseInt(v) * 16 + 8);
    console.log('  rgb(' + r + ',' + g + ',' + b + ') ~', (c / total * 100).toFixed(1) + '%');
  }
}

// 时间盒区域
hist(217, 260, 312, 288, '时间盒');
// 地点盒区域
hist(324, 260, 419, 288, '地点盒');
// 时间盒上方一点(y250-258,应该无文字)
hist(217, 250, 312, 258, '时间盒上方(无字区)');
// 逐行墨色密度: 时间盒
console.log('--- 时间盒逐行深色密度(亮度<100) ---');
for (let y = 258; y <= 292; y++) {
  let dark = 0;
  for (let x = 217; x <= 312; x++) {
    const [r, g, b] = px(img, x, y);
    if (r + g + b < 300) dark++;
  }
  if (dark > 2) console.log('y=' + y, 'dark=' + dark);
}
