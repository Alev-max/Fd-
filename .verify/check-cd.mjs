import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const C = decodePNG(readFileSync('diff-restore.png'));
const RX = 116, RY = 189, RW = 332, RH = 439;

console.log('=== (c) 翻页控件区域 (pager top 69.6% => y~494-511) ===');
// 逐行找 pager 区域的墨色像素 (排除背景: pager 按钮有清晰墨色描边+符号)
for (let y = 488; y <= 516; y++) {
  const segs = [];
  let run = 0, startX = -1;
  for (let x = 180; x <= 412; x++) {
    const [r, g, b] = px(C, x, y);
    const ink = r < 120 && g < 110 && b < 100 && r >= g - 3 && g >= b - 6;
    if (ink) { if (startX < 0) startX = x; run++; }
    else { if (run >= 2) segs.push(startX + '-' + (startX + run - 1) + '(n' + run + ')'); run = 0; startX = -1; }
  }
  if (run >= 2) segs.push(startX + '-' + (startX + run - 1) + '(n' + run + ')');
  if (segs.length) console.log('y=' + y, segs.join(' '));
}

console.log('');
console.log('=== (d) 进度条分析 ===');
// meter 几何: left 16.9% => x172, 宽 60.5% => 201px => x172-373
// 口渴: top 76% y522, 高 10.7% 55.8px => y522-578 (截图像素: RY+439*0.76=522.6)
// 饥饿: top 90.1% y584.5, 高 9.9% => y584.5-628
function scanCapsule(yTop, yBot, label) {
  console.log('--- ' + label + ' (y ' + yTop + '-' + yBot + ') ---');
  const cy = Math.round((yTop + yBot) / 2);
  // 垂直中心水平扫描: 找深色填充段
  for (const y of [cy - 6, cy, cy + 6]) {
    const segs = [];
    let run = 0, startX = -1;
    for (let x = 160; x <= 390; x++) {
      const [r, g, b] = px(C, x, y);
      const dark = r + g + b < 330;
      if (dark) { if (startX < 0) startX = x; run++; }
      else { if (run >= 3) segs.push(startX + '-' + (startX + run - 1)); run = 0; startX = -1; }
    }
    if (run >= 3) segs.push(startX + '-' + (startX + run - 1));
    console.log('y=' + y, segs.length ? segs.join(' ') : '(无深色段)');
  }
  // 填充颜色采样 (x 230-250 处应为填充内部)
  const samples = [];
  for (let x = 225; x <= 255; x += 5) {
    const [r, g, b] = px(C, x, cy);
    samples.push('(' + x + ':' + r + ',' + g + ',' + b + ')');
  }
  console.log('中心线颜色采样:', samples.join(' '));
  // 图标区域采样 (x 180-205)
  const iconSamples = [];
  for (let x = 182; x <= 204; x += 4) {
    const [r, g, b] = px(C, x, cy);
    iconSamples.push('(' + x + ':' + r + ',' + g + ',' + b + ')');
  }
  console.log('图标区颜色采样:', iconSamples.join(' '));
}
scanCapsule(523, 577, '口渴胶囊 (thirst 65)');
scanCapsule(585, 627, '饥饿胶囊 (hunger 85)');

// 条内是否有数字/文字: 扫描胶囊内非填充非背景的像素模式
console.log('');
console.log('=== 条内文字检测 ===');
function checkTextInCapsule(yTop, yBot, label) {
  // 填充区域上采样: 填充是深色, 若有文字则会有浅色像素嵌在深色填充内
  const cy = Math.round((yTop + yBot) / 2);
  let lightInFill = 0;
  for (let y = cy - 8; y <= cy + 8; y++)
    for (let x = 215; x <= 360; x++) {
      const [r, g, b] = px(C, x, y);
      if (r > 150 && g > 140 && b > 130) lightInFill++;
    }
  console.log(label + '填充区浅色像素(可能是文字):', lightInFill);
}
checkTextInCapsule(523, 577, '口渴');
checkTextInCapsule(585, 627, '饥饿');
