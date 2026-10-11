import { readFileSync } from 'node:fs';
import { decodePNG, px } from './png-decode.mjs';

const img = decodePNG(readFileSync(process.argv[2]));

// 组件区域: (116,189)-(447,627), 332x439
const RX = 116, RY = 189, RW = 332, RH = 439;
// bg 坐标 (1086x1448) -> 截图坐标
function mx(bx) { return RX + Math.round(bx * RW / 1086); }
function my(by) { return RY + Math.round(by * RH / 1448); }

// 墨色文字检测: #33291e (51,41,30) 附近, 亮度低
function isInk(r, g, b) {
  return r < 110 && g < 100 && b < 90 && (r + g + b) < 260 && r >= g && g >= b - 5;
}

function scanRegion(x0, y0, x1, y1, fn) {
  const pts = [];
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const [r, g, b] = px(img, x, y);
      if (fn(r, g, b)) pts.push({ x, y, r, g, b });
    }
  return pts;
}

function bboxOf(pts) {
  if (!pts.length) return null;
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, count: pts.length };
}

// ===== (a) 时间盒: bg(330,235)-(640,325) =====
const tb = scanRegion(mx(330), my(235), mx(640), my(325), isInk);
const tbBox = bboxOf(tb);
console.log('=== (a) 时间盒 ===');
console.log('盒区域(截图):', mx(330), my(235), '-', mx(640), my(325));
console.log('墨色文字像素:', tbBox ? JSON.stringify(tbBox) : 'none');
if (tbBox) {
  console.log('文字相对盒: x', ((tbBox.minX - mx(330)) / (mx(640) - mx(330)) * 100).toFixed(1) + '%-', ((tbBox.maxX - mx(330)) / (mx(640) - mx(330)) * 100).toFixed(1) + '%',
    ' y', ((tbBox.minY - my(235)) / (my(325) - my(235)) * 100).toFixed(1) + '%-', ((tbBox.maxY - my(235)) / (my(325) - my(235)) * 100).toFixed(1) + '%');
  // 文字水平中心 vs 盒中心
  const boxCX = (mx(330) + mx(640)) / 2, txtCX = (tbBox.minX + tbBox.maxX) / 2;
  console.log('文字中心偏移:', (txtCX - boxCX).toFixed(1), 'px (盒宽', mx(640) - mx(330), 'px)');
}

// ===== (a) 地点盒: bg(680,235)-(990,325) =====
const lb = scanRegion(mx(680), my(235), mx(990), my(325), isInk);
const lbBox = bboxOf(lb);
console.log('=== (a) 地点盒 ===');
console.log('盒区域(截图):', mx(680), my(235), '-', mx(990), my(325));
console.log('墨色文字像素:', lbBox ? JSON.stringify(lbBox) : 'none');
if (lbBox) {
  console.log('文字相对盒: x', ((lbBox.minX - mx(680)) / (mx(990) - mx(680)) * 100).toFixed(1) + '%-', ((lbBox.maxX - mx(680)) / (mx(990) - mx(680)) * 100).toFixed(1) + '%',
    ' y', ((lbBox.minY - my(235)) / (my(325) - my(235)) * 100).toFixed(1) + '%-', ((lbBox.maxY - my(235)) / (my(325) - my(235)) * 100).toFixed(1) + '%');
  const boxCX = (mx(680) + mx(990)) / 2, txtCX = (lbBox.minX + lbBox.maxX) / 2;
  console.log('文字中心偏移:', (txtCX - boxCX).toFixed(1), 'px (盒宽', mx(990) - mx(680), 'px)');
}

// ===== (b) 正文区: bg(230,510)-(950,1020) =====
const st = scanRegion(mx(230), my(510), mx(950), my(1020), isInk);
const stBox = bboxOf(st);
console.log('=== (b) 正文区 ===');
console.log('区域(截图):', mx(230), my(510), '-', mx(950), my(1020));
console.log('墨色文字像素:', stBox ? JSON.stringify(stBox) : 'none');
if (stBox) {
  console.log('文字相对区域: 左', ((stBox.minX - mx(230)) / (mx(950) - mx(230)) * 100).toFixed(1) + '%',
    ' 右', ((mx(950) - stBox.maxX) / (mx(950) - mx(230)) * 100).toFixed(1) + '%',
    ' 上', ((stBox.minY - my(510)) / (my(1020) - my(510)) * 100).toFixed(1) + '%',
    ' 下', ((my(1020) - stBox.maxY) / (my(1020) - my(510)) * 100).toFixed(1) + '%');
}

// 正文区外的溢出检测：纸区 y510-1020 之外 (y325-510 之间 和 y1020-1100 之间) 是否有墨色文字
const aboveStage = scanRegion(mx(230), my(330), mx(950), my(505), isInk);
console.log('正文区上方(y330-505)墨色像素:', aboveStage.length, aboveStage.length ? JSON.stringify(bboxOf(aboveStage)) : '');
const belowStage = scanRegion(mx(230), my(1025), mx(950), my(1095), isInk);
console.log('正文区下方(y1025-1095)墨色像素:', belowStage.length, belowStage.length ? JSON.stringify(bboxOf(belowStage)) : '');

// ===== (e) 人名颜色检测 =====
console.log('=== (e) 人名颜色 ===');
function findColor(x0, y0, x1, y1, target, tol, label) {
  const pts = [];
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const [r, g, b] = px(img, x, y);
      if (Math.abs(r - target[0]) <= tol && Math.abs(g - target[1]) <= tol && Math.abs(b - target[2]) <= tol) pts.push({ x, y });
    }
  const box = bboxOf(pts);
  console.log(label, ':', box ? box.count + ' px, bbox ' + JSON.stringify({ minX: box.minX, minY: box.minY, maxX: box.maxX, maxY: box.maxY }) : 'none');
  return box;
}
// 莉娜 #8b3a30 (139,58,48), 阿明 #2f4a6b (47,74,107) —— 但注意饥饿fill是#8b3a30，只在正文区找
findColor(mx(230), my(510), mx(950), my(1020), [139, 58, 48], 28, '莉娜色 #8b3a30 (正文区)');
findColor(mx(230), my(510), mx(950), my(1020), [47, 74, 107], 28, '阿明色 #2f4a6b (正文区)');
// 旁白斜体灰褐 #6b6156 (107,97,86)
findColor(mx(230), my(510), mx(950), my(1020), [107, 97, 86], 20, '旁白色 #6b6156 (正文区)');
