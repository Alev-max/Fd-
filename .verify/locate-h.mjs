import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const H = decodePNG(readFileSync('H-page2.png'));
const W = H.width, Hh = H.height;
function isDarkBg(r, g, b) {
  return Math.abs(r - 23) <= 10 && Math.abs(g - 19) <= 10 && Math.abs(b - 15) <= 10;
}
// 全图找组件
let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
for (let y = 0; y < Hh; y += 1)
  for (let x = 100; x <= 500; x++) {
    const [r, g, b] = px(H, x, y);
    if (isDarkBg(r, g, b)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
console.log('H 中组件深色 bbox:', { minX, minY, maxX, maxY });
// 检查组件中心颜色 (判断背景图是否加载)
if (minX < 1e9) {
  const cx = Math.round((minX + maxX) / 2), cy = Math.round((minY + maxY) / 2);
  console.log('组件中心颜色:', px(H, cx, cy).join(','));
  // stage 中心 (相对位置 21.2+33% x, 35.2+17% y)
  const cw = maxX - minX, ch = maxY - minY;
  const sx = Math.round(minX + cw * 0.543), sy = Math.round(minY + ch * 0.522);
  console.log('stage 中心(相对):', px(H, sx, sy).join(','));
  // 时间盒中心
  const tx = Math.round(minX + cw * 0.445), ty = Math.round(minY + ch * 0.194);
  console.log('时间盒中心(相对):', px(H, tx, ty).join(','));
}
