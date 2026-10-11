import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const G = decodePNG(readFileSync('G-page1-final.png'));
console.log('G size:', G.width + 'x' + G.height);

const RX = 116, RY = 189, RW = 332, RH = 439;
function mx(bx) { return RX + Math.round(bx * RW / 1086); }
function my(by) { return RY + Math.round(by * RH / 1448); }

// 背景图加载验证
console.log('--- 背景验证 ---');
console.log('stage中心(282,403):', px(G, 282, 403).join(','));
console.log('时间盒背景(264,265):', px(G, 264, 265).join(','));
console.log('饥饿胶囊(282,606):', px(G, 282, 606).join(','));

// === 纸区实际边界测量 (中轴线亮度剖面) ===
console.log('--- 中轴线 x282 亮度剖面 (找纸区边界) ---');
let paperTop = -1, paperBot = -1;
const profile = [];
for (let y = 300; y <= 540; y += 2) {
  const [r, g, b] = px(G, 282, y);
  const lum = (r + g + b) / 3;
  profile.push(y + ':' + Math.round(lum));
}
console.log(profile.join(' '));

// === (c) pager 区域分析 (背景图版本) ===
console.log('--- pager 区域 y490-515 墨色检测 ---');
for (let y = 490; y <= 515; y++) {
  let cnt = 0, minX = 1e9, maxX = -1;
  const segs = [];
  let run = 0, sx = -1;
  for (let x = 180; x <= 412; x++) {
    const [r, g, b] = px(G, x, y);
    // 墨色文字/按钮: 在米白背景上的深色
    if (r < 120 && g < 105 && b < 95 && r >= g - 5 && g >= b - 8) {
      cnt++; if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (sx < 0) sx = x; run++;
    } else { if (run >= 2) segs.push(sx + '-' + (sx + run - 1)); run = 0; sx = -1; }
  }
  if (run >= 2) segs.push(sx + '-' + (sx + run - 1));
  if (cnt >= 3) console.log('y=' + y, 'n=' + cnt, 'x ' + minX + '-' + maxX, '段:', segs.join(' '));
}
