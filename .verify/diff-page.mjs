import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const G = decodePNG(readFileSync('G-page1-final.png'));
const H = decodePNG(readFileSync('H-page2.png'));

// stage 区域差分: 页1(y376-463 文字) vs 页2
console.log('=== G(页1) vs H(点击后) stage 区域差分 ===');
for (let y = 340; y <= 520; y++) {
  const xs = [];
  for (let x = 150; x <= 440; x++) {
    const [r1, g1, b1] = px(G, x, y);
    const [r2, g2, b2] = px(H, x, y);
    if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 40) xs.push(x);
  }
  if (xs.length >= 3) console.log('y=' + y, 'n=' + xs.length, 'x ' + xs[0] + '-' + xs[xs.length - 1]);
}

// pager 区域差分 (页码 1->2, 按钮状态)
console.log('=== pager 区域差分 (y485-520) ===');
for (let y = 485; y <= 520; y++) {
  const xs = [];
  for (let x = 180; x <= 412; x++) {
    const [r1, g1, b1] = px(G, x, y);
    const [r2, g2, b2] = px(H, x, y);
    if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 30) xs.push(x);
  }
  if (xs.length >= 2) console.log('y=' + y, 'n=' + xs.length, 'x ' + xs[0] + '-' + xs[xs.length - 1]);
}
