import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const C = decodePNG(readFileSync('diff-restore.png'));   // 原始(第一次恢复)
const D = decodePNG(readFileSync('diff-body.png'));     // 测试正文
const E = decodePNG(readFileSync('diff-restore2.png'));  // 原始(第二次恢复)
console.log('C:', C.width + 'x' + C.height, 'D:', D.width + 'x' + D.height, 'E:', E.width + 'x' + E.height);

// C vs E: 两次相同原始内容的截图差异（噪声基线）
let ceDiff = 0, ceBox = { minX: 1e9, minY: 1e9, maxX: -1, maxY: -1 };
for (let y = 100; y < 633; y++)
  for (let x = 100; x <= 460; x++) {
    const [r1, g1, b1] = px(C, x, y);
    const [r2, g2, b2] = px(E, x, y);
    if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 40) {
      ceDiff++;
      if (x < ceBox.minX) ceBox.minX = x;
      if (x > ceBox.maxX) ceBox.maxX = x;
      if (y < ceBox.minY) ceBox.minY = y;
      if (y > ceBox.maxY) ceBox.maxY = y;
    }
  }
console.log('C vs E (相同内容两次截图) 差异:', ceDiff, 'px', JSON.stringify(ceBox));

// C vs D: 正文文字差异
function diffRegions(a, b, x0, y0, x1, y1, label, thr = 40) {
  const pts = [];
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const [r1, g1, b1] = px(a, x, y);
      const [r2, g2, b2] = px(b, x, y);
      if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > thr) pts.push({ x, y });
    }
  if (!pts.length) { console.log(label + ': none'); return null; }
  // 行聚类
  const byRow = new Map();
  for (const p of pts) byRow.set(p.y, (byRow.get(p.y) || 0) + 1);
  const rows = Array.from(byRow.entries()).sort((a, b) => a[0] - b[0]);
  const groups = [];
  let cur = [rows[0]];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] - cur[cur.length - 1][0] <= 2) cur.push(rows[i]);
    else { groups.push(cur); cur = [rows[i]]; }
  }
  groups.push(cur);
  console.log('=== ' + label + ' (总差异 ' + pts.length + 'px) ===');
  for (const g of groups) {
    const y0g = g[0][0], y1g = g[g.length - 1][0];
    if (y1g - y0g < 2 && g.reduce((s, r) => s + r[1], 0) < 6) continue;
    let minX = 1e9, maxX = -1, total = 0;
    for (const [y, c] of g) {
      total += c;
      for (const p of pts) if (p.y === y) { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; }
    }
    console.log('行组 y ' + y0g + '-' + y1g + ' (高' + (y1g - y0g + 1) + ') x ' + minX + '-' + maxX + ' 像素' + total);
  }
  return pts;
}

// 正文区: 截图坐标 (186,344)-(406,498), 向外扩一圈看溢出
diffRegions(C, D, 150, 320, 440, 530, 'C vs D 正文区差分(含缓冲)');
