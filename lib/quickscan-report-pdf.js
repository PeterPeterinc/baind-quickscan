import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_W = 595;
const PAGE_H = 842;
const M = 40;

const COL = {
  bg:       rgb(0, 0.188, 0.180),
  card:     rgb(0, 0.239, 0.227),
  border:   rgb(0.169, 0.267, 0.263),
  white:    rgb(0.914, 0.957, 0.949),
  muted:    rgb(0.588, 0.635, 0.635),
  subtle:   rgb(0.490, 0.549, 0.549),
  accent:   rgb(1, 0.749, 0),
  teal:     rgb(0.016, 0.776, 0.753),
  red:      rgb(1, 0.420, 0.420),
  orange:   rgb(1, 0.702, 0.278),
  cream:    rgb(0.976, 0.969, 0.961),
  darkText: rgb(0, 0.188, 0.180),
};

const DIM_META = {
  merkfundament: { label: "Merkfundament", color: COL.accent },
  aiadoptie:     { label: "AI-adoptie",    color: COL.teal },
  consistentie:  { label: "Consistentie",  color: COL.accent },
};

const PRIO_COLORS = { hoog: COL.red, middel: COL.orange, laag: COL.teal };

function getAdvice(dimScores) {
  const out = [];
  const { merkfundament: mf = 0, aiadoptie: ai = 0, consistentie: co = 0 } = dimScores;
  if (mf <= 5)      out.push({ dim: "merkfundament", prio: "hoog",   text: "Begin met het vastleggen van jullie merkidentiteit. Zonder een stevig fundament kan AI nooit consistent op-merk communiceren." });
  else if (mf <= 9) out.push({ dim: "merkfundament", prio: "middel", text: "Jullie merkbasis staat, maar kan aangescherpt worden voor AI-gebruik." });
  else               out.push({ dim: "merkfundament", prio: "laag",   text: "Uitstekend merkfundament! Jullie zijn klaar om dit te vertalen naar een AI-omgeving." });
  if (ai <= 3)      out.push({ dim: "aiadoptie", prio: "hoog",   text: "Er liggen grote kansen om AI in te zetten voor communicatie. Start met concrete use cases." });
  else if (ai <= 6) out.push({ dim: "aiadoptie", prio: "middel", text: "Goede start met AI! De volgende stap is een gestructureerde aanpak, afgestemd op jullie merk." });
  else               out.push({ dim: "aiadoptie", prio: "laag",   text: "Jullie AI-adoptie is ver gevorderd. Focus op maximale afstemming met jullie merkidentiteit." });
  if (co <= 3)      out.push({ dim: "consistentie", prio: "hoog",   text: "De AI-output sluit nog niet goed aan bij jullie merk. Dit is het gebied met de meeste winst." });
  else if (co <= 6) out.push({ dim: "consistentie", prio: "middel", text: "De basis is er, maar finetuning is nodig voor perfecte merkconsistentie." });
  else               out.push({ dim: "consistentie", prio: "laag",   text: "Indrukwekkende consistentie! Jullie zijn een voorbeeld van hoe AI en merk samen gaan." });
  return out;
}

function wrapText(text, font, size, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function roundedRect(pg, x, y, w, h, r, { fill, stroke, strokeWidth = 0.75 }) {
  const cr = Math.min(r, w / 2, h / 2);
  const d = [
    `M ${x + cr} ${y}`, `L ${x + w - cr} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + cr}`, `L ${x + w} ${y + h - cr}`,
    `Q ${x + w} ${y + h} ${x + w - cr} ${y + h}`, `L ${x + cr} ${y + h}`,
    `Q ${x} ${y + h} ${x} ${y + h - cr}`, `L ${x} ${y + cr}`,
    `Q ${x} ${y} ${x + cr} ${y}`, "Z",
  ].join(" ");
  if (fill) pg.drawSvgPath(d, { color: fill, x: 0, y: 0 });
  if (stroke) pg.drawSvgPath(d, { borderColor: stroke, borderWidth: strokeWidth, x: 0, y: 0 });
}

function drawArc(pg, cx, cy, r, ratio, color) {
  const steps = 36;
  const start = -Math.PI * 0.75;
  const sweep = Math.PI * 1.5;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const a1 = start + sweep * t;
    const a2 = start + sweep * ((i + 1) / steps);
    pg.drawLine({
      start: { x: cx + Math.cos(a1) * r, y: cy + Math.sin(a1) * r },
      end:   { x: cx + Math.cos(a2) * r, y: cy + Math.sin(a2) * r },
      thickness: 3.5,
      color: t < ratio ? color : COL.border,
    });
  }
}

function centerText(pg, text, y, { font, size, color }) {
  const w = font.widthOfTextAtSize(text, size);
  pg.drawText(text, { x: (PAGE_W - w) / 2, y, size, font, color });
}

export async function buildQuickscanPdfBuffer(data) {
  const {
    submittedAtIso,
    contact: { naam, bedrijf, email, telefoon },
    pct, overallLabel, dimRows, dimScores = {},
  } = data;

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const contentW = PAGE_W - M * 2;
  const advice = getAdvice(dimScores);

  const pg = pdf.addPage([PAGE_W, PAGE_H]);
  pg.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COL.bg });

  // ── Logo text "baind" top-right ──
  const logoText = "baind";
  const logoSize = 18;
  const logoW = bold.widthOfTextAtSize(logoText, logoSize);
  pg.drawText(logoText, {
    x: PAGE_W - M - logoW,
    y: PAGE_H - M - 2,
    size: logoSize, font: bold, color: COL.white,
  });

  let y = PAGE_H - M;

  // ── Badge ──
  const badge = "QUICKSCAN";
  const badgeW = bold.widthOfTextAtSize(badge, 8) + 16;
  roundedRect(pg, M, y - 12, badgeW, 16, 8, { fill: rgb(0.04, 0.04, 0.02) });
  pg.drawText(badge, { x: M + 8, y: y - 9, size: 8, font: bold, color: COL.accent });
  y -= 32;

  // ── Title ──
  pg.drawText("Persoonlijk rapport", { x: M, y, size: 18, font: bold, color: COL.white });
  y -= 20;
  pg.drawText(`voor ${naam}  ·  ${bedrijf}`, { x: M, y, size: 11, font, color: COL.accent });
  y -= 14;
  const dateStr = new Date(submittedAtIso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  pg.drawText(dateStr, { x: M, y, size: 9, font, color: COL.subtle });
  y -= 20;

  // ── Divider ──
  pg.drawLine({ start: { x: M, y }, end: { x: PAGE_W - M, y }, thickness: 0.75, color: COL.border });
  y -= 24;

  // ── Score section (centered) ──
  centerText(pg, "AI-READINESS SCORE", y, { font: bold, size: 8, color: COL.subtle });
  y -= 36;
  centerText(pg, `${pct}%`, y, { font: bold, size: 44, color: COL.accent });
  y -= 14;
  centerText(pg, "AI-ready", y, { font, size: 13, color: COL.white });
  y -= 24;

  // Level badge
  const lvl = `Niveau: ${overallLabel}`;
  const lvlW = bold.widthOfTextAtSize(lvl, 9) + 20;
  const lvlX = (PAGE_W - lvlW) / 2;
  roundedRect(pg, lvlX, y - 9, lvlW, 18, 9, { fill: COL.card, stroke: COL.border });
  pg.drawText(lvl, { x: lvlX + 10, y: y - 4, size: 9, font: bold, color: COL.white });
  y -= 34;

  // ── Dimension rings (3 columns) ──
  const colW = contentW / 3;
  for (let i = 0; i < dimRows.length; i++) {
    const row = dimRows[i];
    const meta = DIM_META[row.key] || { label: row.label, color: COL.accent };
    const cx = M + colW * i + colW / 2;
    const cy = y - 18;
    const ratio = row.max > 0 ? row.score / row.max : 0;

    drawArc(pg, cx, cy, 22, ratio, meta.color);

    const s = String(row.score);
    pg.drawText(s, { x: cx - bold.widthOfTextAtSize(s, 14) / 2, y: cy + 1, size: 14, font: bold, color: meta.color });
    const mx = `/${row.max}`;
    pg.drawText(mx, { x: cx - font.widthOfTextAtSize(mx, 7) / 2, y: cy - 10, size: 7, font, color: COL.subtle });

    const lbl = meta.label.toUpperCase();
    pg.drawText(lbl, { x: cx - font.widthOfTextAtSize(lbl, 7) / 2, y: cy - 36, size: 7, font, color: COL.muted });
  }
  y -= 72;

  // ── Divider ──
  pg.drawLine({ start: { x: M, y }, end: { x: PAGE_W - M, y }, thickness: 0.75, color: COL.border });
  y -= 18;

  // ── Advice cards (compact) ──
  for (const a of advice) {
    const meta = DIM_META[a.dim] || { label: a.dim, color: COL.accent };
    const prioCol = PRIO_COLORS[a.prio] || COL.muted;
    const lines = wrapText(a.text, font, 8.5, contentW - 28);
    const cardH = 16 + lines.length * 11 + 6;

    const bot = y - cardH;
    roundedRect(pg, M, bot, contentW, cardH, 10, { fill: COL.card, stroke: COL.border });

    const ix = M + 14;
    let iy = y - 13;

    pg.drawText(meta.label.toUpperCase(), { x: ix, y: iy, size: 7.5, font: bold, color: meta.color });

    const prioStr = `PRIORITEIT: ${a.prio.toUpperCase()}`;
    const prioW = bold.widthOfTextAtSize(prioStr, 6.5) + 12;
    const prioX = M + contentW - 14 - prioW;
    roundedRect(pg, prioX, iy - 3, prioW, 12, 6, { fill: prioCol });
    pg.drawText(prioStr, { x: prioX + 6, y: iy, size: 6.5, font: bold, color: COL.bg });

    iy -= 14;
    for (const line of lines) {
      pg.drawText(line, { x: ix, y: iy, size: 8.5, font, color: COL.muted });
      iy -= 11;
    }

    y = bot - 8;
  }

  y -= 6;

  // ── Contact details (compact row) ──
  pg.drawLine({ start: { x: M, y }, end: { x: PAGE_W - M, y }, thickness: 0.75, color: COL.border });
  y -= 14;
  pg.drawText("JOUW GEGEVENS", { x: M, y, size: 7, font: bold, color: COL.subtle });
  y -= 12;
  const info = `${naam}  ·  ${bedrijf}  ·  ${email}  ·  ${telefoon}`;
  const infoLines = wrapText(info, font, 8, contentW);
  for (const line of infoLines) {
    pg.drawText(line, { x: M, y, size: 8, font, color: COL.muted });
    y -= 10;
  }

  y -= 8;

  // ── CTA block ──
  const ctaH = 48;
  if (y - ctaH > M - 10) {
    roundedRect(pg, M, y - ctaH, contentW, ctaH, 10, { fill: COL.cream });
    centerText(pg, "Klaar om je merk te verbinden met AI?", y - 18, { font: bold, size: 11, color: COL.darkText });
    centerText(pg, "Plan een vrijblijvend gesprek op baind.nl", y - 34, { font, size: 8.5, color: COL.subtle });
  }

  // ── Footer ──
  centerText(pg, "baind.nl  |  Verbind jouw merk met AI", M - 14, { font, size: 7, color: COL.subtle });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
