import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const G = decodePNG(readFileSync('G-page1-final.png'));
const I = decodePNG(readFileSync('I-after-clicks.png'));

// G 和 I 都在 scroll=0, 组件位置相同 (116,189)-(447,627)
// 差分 stage 文字区域
console.log('=== G(页1) vs I(两次点击后) stage 差分 ===');
let totalDiff = 0;
for (let y = 340; y <= 520; y++) {
  const xs = [];
  for (let x = 150; x <= 440; x++) {
    const [r1, g1, b1] = px(G, x, y);
    const [r2, g2, b2] = px(I, x, y);
    if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 40) { xs.push(x); totalDiff++; }
  }
  if (xs.length >= 3) console.log('y=' + y, 'n=' + xs.length, 'x ' + xs[0] + '-' + xs[xs.length - 1]);
}
console.log('stage 差异总数:', totalDiff);

// pager 区域差分
console.log('=== pager 区域差分 ===');
for (let y = 488; y <= 516; y++) {
  const xs = [];
  for (let x = 230; x <= 400; x++) {
    const [r1, g1, b1] = px(G, x, y);
    const [r2, g2, b2] = px(I, x, y);
    if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 30) xs.push(x);
  }
  if (xs.length >= 2) console.log('y=' + y, 'n=' + xs.length, 'x ' + xs[0] + '-' + xs[xs.length - 1]);
}
