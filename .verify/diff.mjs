import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const A = decodePNG(readFileSync('step2-fullpage.png')); // 原始 fullPage
const B = decodePNG(readFileSync('diff-timeloc.png'));   // time/loc 测试
const C = decodePNG(readFileSync('diff-restore.png'));   // 恢复后
console.log('A:', A.width + 'x' + A.height, ' B:', B.width + 'x' + B.height, ' C:', C.width + 'x' + C.height);

// B 与 C 应同尺寸, 差分 time/location 文字
if (B.width === C.width && B.height === C.height) {
  console.log('--- B(测试) vs C(恢复) 差异像素 (阈值 40) ---');
  const regions = {};
  let totalDiff = 0;
  for (let y = 0; y < B.height; y++) {
    for (let x = 0; x < B.width; x++) {
      const [r1, g1, b1] = px(B, x, y);
      const [r2, g2, b2] = px(C, x, y);
      const d = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      if (d > 40) {
        totalDiff++;
        const key = (y < 300 ? 'top' : y < 500 ? 'mid' : 'bottom');
        if (!regions[key]) regions[key] = { minX: 1e9, minY: 1e9, maxX: -1, maxY: -1, count: 0 };
        const rg = regions[key];
        rg.count++;
        if (x < rg.minX) rg.minX = x;
        if (x > rg.maxX) rg.maxX = x;
        if (y < rg.minY) rg.minY = y;
        if (y > rg.maxY) rg.maxY = y;
      }
    }
  }
  console.log('total diff px:', totalDiff);
  for (const [k, v] of Object.entries(regions)) console.log(k, JSON.stringify(v));
}

// 组件区域: x116-448 y189-628
// 精确差分: 输出逐行差异在 y255-300 (盒区)
if (B.width === C.width) {
  console.log('--- 盒区逐行差异 (y250-300, diff>40 计数) ---');
  for (let y = 250; y <= 300; y++) {
    let cnt = 0, minX = 1e9, maxX = -1;
    for (let x = 100; x <= 460; x++) {
      const [r1, g1, b1] = px(B, x, y);
      const [r2, g2, b2] = px(C, x, y);
      if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 40) {
        cnt++; if (x < minX) minX = x; if (x > maxX) maxX = x;
      }
    }
    if (cnt > 0) console.log('y=' + y, 'cnt=' + cnt, 'x ' + minX + '-' + maxX);
  }
}
