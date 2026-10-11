import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const file = process.argv[2];
const img = decodePNG(readFileSync(file));
console.log('size:', img.width, 'x', img.height, 'channels:', img.channels);

// iframe 在页面中的位置（scrollTo(0,0) 后视口坐标=页面绝对坐标）
// 需要先验证：扫描整幅图找深色背景 #17130f (23,19,15) 的边界
const W = img.width, H = img.height;
function isDarkBg(r, g, b) {
  return Math.abs(r - 23) <= 14 && Math.abs(g - 19) <= 14 && Math.abs(b - 15) <= 14;
}
let minX = W, minY = H, maxX = 0, maxY = 0, count = 0;
for (let y = 0; y < H; y += 2) {
  for (let x = 0; x < W; x += 2) {
    const [r, g, b] = px(img, x, y);
    if (isDarkBg(r, g, b)) {
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log('dark-bg pixels(sampled):', count, 'bbox:', { minX, minY, maxX, maxY });

// 在预期 iframe 位置 (116,183)-(448,628) 采样几个点的颜色
const probes = [
  [116 + 166, 183 + 5, 'iframe top (expect bubble bg)'],
  [116 + 166, 183 + 220, 'iframe middle (expect component bg/paper)'],
  [116 + 166, 183 + 430, 'iframe bottom (expect capsule bg)']
];
for (const [x, y, label] of probes) {
  if (x < W && y < H) {
    const [r, g, b] = px(img, x, y);
    console.log('probe', label, 'at', x, y, '->', r, g, b);
  }
}
