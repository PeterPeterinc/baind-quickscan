import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logoPngBytes = readFileSync(join(__dirname, "../baind-logo-wit.png"));

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
  kennismaking: { label: "Kennismaking", color: COL.accent },
  houding:      { label: "Houding",      color: COL.teal },
  organisatie:  { label: "Organisatie",  color: COL.accent },
};

const PRIO_COLORS = { hoog: COL.red, middel: COL.orange, laag: COL.teal };

function getAdvice(dimPct = {}) {
  const out = [];
  const k = (dimPct.kennismaking || 0) / 100;
  if (k <= 0.4)      out.push({ dim: "kennismaking", prio: "hoog",   text: "AI voelt nog nieuw. Met een paar concrete, veilige use cases wordt de drempel snel lager." });
  else if (k <= 0.7) out.push({ dim: "kennismaking", prio: "middel", text: "Je hebt al ervaring met AI. De volgende stap is die ervaring bewuster in te zetten op het werk." });
  else               out.push({ dim: "kennismaking", prio: "laag",   text: "Sterke kennismaking met AI. Je bent klaar om dieper te gaan: veilig gebruik, prompts en processen." });

  const h = (dimPct.houding || 0) / 100;
  if (h <= 0.4)      out.push({ dim: "houding", prio: "hoog",   text: "Er is terughoudendheid of onzekerheid over AI. Ruimte voor vragen en duidelijke kaders helpt vertrouwen op te bouwen." });
  else if (h <= 0.7) out.push({ dim: "houding", prio: "middel", text: "Je houding is open genoeg om verder te groeien. Gerichte leerervaringen maken het verschil." });
  else               out.push({ dim: "houding", prio: "laag",   text: "Positieve houding en leergierigheid — een sterke basis voor AI-adoptie in jouw team." });

  const o = (dimPct.organisatie || 0) / 100;
  if (o <= 0.4)      out.push({ dim: "organisatie", prio: "hoog",   text: "AI leeft waarschijnlijk vooral bij individuen. Zonder afspraken blijft adoptie versnipperd." });
  else if (o <= 0.7) out.push({ dim: "organisatie", prio: "middel", text: "Er is al iets van structuur, maar nog geen volledige duidelijkheid. Meer stimulans versnelt het tempo." });
  else               out.push({ dim: "organisatie", prio: "laag",   text: "Jullie organisatie lijkt AI serieus te nemen. Tijd om kennis, tools en processen te professionaliseren." });

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
    pct, overallLabel, dimRows, dimPct = {},
  } = data;

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const contentW = PAGE_W - M * 2;
  const advice = getAdvice(dimPct);

  const pg = pdf.addPage([PAGE_W, PAGE_H]);
  pg.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COL.bg });

  // ── Logo image top-right ──
  const logoImage = await pdf.embedPng(logoPngBytes);
  const logoH = 22;
  const logoW = (logoImage.width / logoImage.height) * logoH;
  pg.drawImage(logoImage, {
    x: PAGE_W - M - logoW,
    y: PAGE_H - M - logoH + 4,
    width: logoW,
    height: logoH,
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
  centerText(pg, "AI-BEELDSCORE", y, { font: bold, size: 8, color: COL.subtle });
  y -= 36;
  centerText(pg, `${pct}%`, y, { font: bold, size: 44, color: COL.accent });
  y -= 14;
  centerText(pg, "Gemiddelde van kennismaking, houding en organisatie", y, { font, size: 9, color: COL.muted });
  y -= 24;

  // Level badge
  const lvl = `Profiel: ${overallLabel}`;
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
    const pctVal = typeof row.pct === "number" ? row.pct : (row.max > 0 ? Math.round((row.score / row.max) * 100) : 0);
    const ratio = pctVal / 100;

    drawArc(pg, cx, cy, 22, ratio, meta.color);

    const s = `${pctVal}%`;
    pg.drawText(s, { x: cx - bold.widthOfTextAtSize(s, 12) / 2, y: cy - 2, size: 12, font: bold, color: meta.color });

    const lbl = meta.label.toUpperCase();
    pg.drawText(lbl, { x: cx - font.widthOfTextAtSize(lbl, 7) / 2, y: cy - 36, size: 7, font, color: COL.muted });

    if (row.level) {
      const lv = String(row.level);
      pg.drawText(lv, { x: cx - font.widthOfTextAtSize(lv, 7) / 2, y: cy - 48, size: 7, font: bold, color: meta.color });
    }
  }
  y -= 78;

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
