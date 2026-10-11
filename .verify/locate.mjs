import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const img = decodePNG(readFileSync(process.argv[2]));
const W = img.width, H = img.height;

// 在 iframe 区域内扫描深色组件背景 #17130f (23,19,15)，容差 10
function isDarkBg(r, g, b) {
  return Math.abs(r - 23) <= 10 && Math.abs(g - 19) <= 10 && Math.abs(b - 15) <= 10;
}
// iframe 区域约 x116-448, y183-628
const X0 = 110, X1 = 460, Y0 = 175, Y1 = 640;
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = Y0; y < Y1; y++) {
  for (let x = X0; x < X1; x++) {
    const [r, g, b] = px(img, x, y);
    if (isDarkBg(r, g, b)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log('sb-root bbox in screenshot:', { minX, minY, maxX, maxY });
console.log('sb-root size:', (maxX - minX + 1), 'x', (maxY - minY + 1));
const cw = maxX - minX + 1, ch = maxY - minY + 1;
console.log('aspect ratio:', (cw / ch).toFixed(4), '(expect 1086/1448 =', (1086 / 1448).toFixed(4) + ')');

// 背景图 URL 验证：看 sb-root 中心是否有米白纸面（stage 区域）
// stage CSS: left 21.2% top 35.2% w 66.3% h 34% —— 中心点
const cx = Math.round(minX + cw * (0.212 + 0.663 / 2));
const cy = Math.round(minY + ch * (0.352 + 0.34 / 2));
const [r1, g1, b1] = px(img, cx, cy);
console.log('stage center pixel:', r1, g1, b1);

// 输出组件区域缩放的映射：1086 坐标 -> 截图坐标
const scale = cw / 1086;
console.log('scale (screenshot px per bg-px):', scale.toFixed(4));

// 验证坐标换算函数
function mapToShot(bx, by) {
  return [Math.round(minX + bx * scale), Math.round(minY + by * (ch / 1448))];
}
console.log('bg(330,235) ->', mapToShot(330, 235), ' bg(640,325) ->', mapToShot(640, 325));
console.log('bg(680,235) ->', mapToShot(680, 235), ' bg(990,325) ->', mapToShot(990, 325));
console.log('bg(230,510) ->', mapToShot(230, 510), ' bg(950,1020) ->', mapToShot(950, 1020));
console.log('bg(183,1100) ->', mapToShot(183, 1100), ' bg(840,1255) ->', mapToShot(840, 1255));
console.log('bg(183,1305) ->', mapToShot(183, 1305), ' bg(840,1448) ->', mapToShot(840, 1448));
export const M = { minX, minY, cw, ch, scale };
