import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const C = decodePNG(readFileSync('diff-restore.png'));
const D = decodePNG(readFileSync('diff-body.png'));

// y440-470 每行差异像素的 x 分布
console.log('--- y435-470 C vs D 逐行差异 ---');
for (let y = 435; y <= 470; y++) {
  const xs = [];
  for (let x = 150; x <= 440; x++) {
    const [r1, g1, b1] = px(C, x, y);
    const [r2, g2, b2] = px(D, x, y);
    if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 40) xs.push(x);
  }
  if (xs.length) {
    // 压缩显示 x 区段
    const segs = [];
    let s = xs[0], p = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i === xs.length || xs[i] > p + 4) { segs.push(s === p ? '' + s : s + '-' + p); if (i < xs.length) s = xs[i]; }
      p = xs[i] || p;
    }
    console.log('y=' + y, 'n=' + xs.length, '段:', segs.join(', '));
  }
}

// C 中 y340-470 的墨色文字行分布（棕墨色检测, 但只统计 stage x186-406 内）
console.log('--- C 中 stage 区域(186-406) 逐行墨色像素数 ---');
for (let y = 340; y <= 500; y++) {
  let cnt = 0;
  for (let x = 186; x <= 406; x++) {
    const [r, g, b] = px(C, x, y);
    if (r >= g && g >= b && r - b >= 8 && r < 130 && g < 115 && b < 100) cnt++;
  }
  if (cnt >= 3) console.log('y=' + y, 'ink=' + cnt);
}
