import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const C = decodePNG(readFileSync('diff-restore.png'));

// 饥饿填充边界: 扫描脉冲砖红色 (86,40,33)±30 的水平范围
console.log('=== 饥饿胶囊 (85%) 填充边界扫描 ===');
for (const y of [596, 600, 606, 612, 616]) {
  let firstX = -1, lastX = -1, cnt = 0;
  for (let x = 170; x <= 380; x++) {
    const [r, g, b] = px(C, x, y);
    // 砖红特征: r 明显大于 g,b; r 60-120; g 25-60; b 20-55
    if (r > 60 && r < 130 && g > 20 && g < 62 && b < 58 && r - g > 30 && r - b > 30) {
      if (firstX < 0) firstX = x;
      lastX = x; cnt++;
    }
  }
  console.log('y=' + y, '砖红像素 x ' + firstX + '-' + lastX + ' (n=' + cnt + ')');
}

// 口渴填充边界同样验证 (墨黑 43,38,32)
console.log('=== 口渴胶囊 (65%) 填充边界扫描 ===');
for (const y of [540, 545, 550, 555, 560]) {
  let firstX = -1, lastX = -1, cnt = 0;
  for (let x = 170; x <= 380; x++) {
    const [r, g, b] = px(C, x, y);
    if (r > 30 && r < 70 && g > 26 && g < 60 && b < 55 && Math.abs(r - g) < 12 && r >= g) {
      if (firstX < 0) firstX = x;
      lastX = x; cnt++;
    }
  }
  console.log('y=' + y, '墨黑像素 x ' + firstX + '-' + lastX + ' (n=' + cnt + ')');
}

// 图标区检测: x172-209 是否有图标(不同于纯背景 #17130f 的图案)
console.log('=== 图标区检测 (meter 左侧 0-18.6%: x172-209) ===');
for (const [yTop, yBot, label] of [[523, 577, '口渴胶囊'], [585, 627, '饥饿胶囊']]) {
  const cy = Math.round((yTop + yBot) / 2);
  const colors = new Map();
  for (let y = yTop + 4; y <= yBot - 4; y++)
    for (let x = 174; x <= 207; x++) {
      const [r, g, b] = px(C, x, y);
      const key = (r >> 5) + ',' + (g >> 5) + ',' + (b >> 5);
      colors.set(key, (colors.get(key) || 0) + 1);
    }
  const sorted = Array.from(colors.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  console.log(label + ' 图标区色彩构成:');
  for (const [k, c] of sorted) console.log('  ', k, c);
}

// 中轴线颜色剖面: 确认纸区(pager 所在)的背景明暗
console.log('=== 组件中轴线 (x282) 颜色剖面 y300-530 ===');
for (let y = 300; y <= 530; y += 4) {
  const [r, g, b] = px(C, 282, y);
  const lum = (r + g + b) / 3;
  console.log('y=' + y, 'rgb(' + r + ',' + g + ',' + b + ')', lum > 128 ? '亮' : lum > 60 ? '中' : '暗');
}
