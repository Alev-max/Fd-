import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const img = decodePNG(readFileSync(process.argv[2]));
const RX = 116, RY = 189, RW = 332, RH = 439;
function mx(bx) { return RX + Math.round(bx * RW / 1086); }
function my(by) { return RY + Math.round(by * RH / 1448); }

// 墨色文字 #33291e (51,41,30): 棕色调 r>g>b, 中等深度
function isInkText(r, g, b) {
  return r >= g && g >= b && r - b >= 8 && r < 130 && g < 115 && b < 100;
}

// 行密度分析: 在区域内找文字行(深色像素 5-70/行, 排除边缘线>80%宽)
function analyzeTextRows(x0, y0, x1, y1, fn, label) {
  console.log('=== ' + label + ' ===');
  const rows = [];
  for (let y = y0; y <= y1; y++) {
    let dark = 0, minX = 1e9, maxX = -1;
    for (let x = x0; x <= x1; x++) {
      const [r, g, b] = px(img, x, y);
      if (fn(r, g, b)) { dark++; if (x < minX) minX = x; if (x > maxX) maxX = x; }
    }
    if (dark >= 3) rows.push({ y, dark, minX, maxX });
  }
  if (!rows.length) { console.log('no text rows'); return null; }
  // 聚类成行组
  const groups = [];
  let cur = [rows[0]];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].y - cur[cur.length - 1].y <= 1) cur.push(rows[i]);
    else { groups.push(cur); cur = [rows[i]]; }
  }
  groups.push(cur);
  for (const g of groups) {
    if (g.length < 2) continue; // 单行噪声跳过
    const y0g = g[0].y, y1g = g[g.length - 1].y;
    let minX = 1e9, maxX = -1, total = 0;
    for (const row of g) { minX = Math.min(minX, row.minX); maxX = Math.max(maxX, row.maxX); total += row.dark; }
    console.log('文字块: y ' + y0g + '-' + y1g + ' (高 ' + (y1g - y0g + 1) + '), x ' + minX + '-' + maxX + ' (宽 ' + (maxX - minX + 1) + '), 墨像素 ' + total);
  }
  return groups;
}

// (a) 时间盒
analyzeTextRows(mx(330), my(235) - 4, mx(640), my(325) + 4, isInkText, '(a) 时间盒 bg(330,235)-(640,325) => 截图 ' + mx(330) + ',' + (my(235) - 4) + '-' + mx(640) + ',' + (my(325) + 4));
// (a) 地点盒
analyzeTextRows(mx(680), my(235) - 4, mx(990), my(325) + 4, isInkText, '(a) 地点盒 bg(680,235)-(990,325) => 截图 ' + mx(680) + ',' + (my(235) - 4) + '-' + mx(990) + ',' + (my(325) + 4));
// (b) 正文区(稍宽范围, 检查是否溢出纸区)
analyzeTextRows(mx(150), my(480), mx(1010), my(1060), isInkText, '(b) 正文+缓冲区 bg(150,480)-(1010,1060)');
