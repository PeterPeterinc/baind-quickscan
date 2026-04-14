import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PAGE_W = 595;
const PAGE_H = 842;
const M = 48;

const COL = {
  bg:        rgb(0, 0.188, 0.180),      // #00302E
  card:      rgb(0, 0.239, 0.227),      // #003D3A
  border:    rgb(0.169, 0.267, 0.263),   // #2B4443
  white:     rgb(0.914, 0.957, 0.949),   // #E9F4F2
  muted:     rgb(0.588, 0.635, 0.635),   // #96A2A2
  subtle:    rgb(0.490, 0.549, 0.549),   // #7D8C8C
  accent:    rgb(1, 0.749, 0),           // #FFBF00
  teal:      rgb(0.016, 0.776, 0.753),   // #04C6C0
  red:       rgb(1, 0.420, 0.420),       // #FF6B6B
  orange:    rgb(1, 0.702, 0.278),       // #FFB347
  cream:     rgb(0.976, 0.969, 0.961),   // #F9F7F5
  darkText:  rgb(0, 0.188, 0.180),       // #00302E
};

function getAdvice(dimScores) {
  const out = [];
  const { merkfundament: mf = 0, aiadoptie: ai = 0, consistentie: co = 0 } = dimScores;

  if (mf <= 5) {
    out.push({ dim: "merkfundament", prio: "hoog", text: "Begin met het vastleggen van jullie merkidentiteit. Zonder een stevig fundament kan AI nooit consistent op-merk communiceren.", cta: "Baind helpt jullie merkfundament te vertalen naar een AI-klare basis." });
  } else if (mf <= 9) {
    out.push({ dim: "merkfundament", prio: "middel", text: "Jullie merkbasis staat, maar kan aangescherpt worden voor AI-gebruik. Specifieke voorbeelden maken het verschil.", cta: "Baind's merkexperts helpen jullie guidelines AI-proof te maken." });
  } else {
    out.push({ dim: "merkfundament", prio: "laag", text: "Uitstekend merkfundament! Jullie zijn klaar om dit te vertalen naar een AI-omgeving die jullie merk versterkt.", cta: "Met Baind zetten jullie dit fundament om in een krachtige AI-omgeving." });
  }

  if (ai <= 3) {
    out.push({ dim: "aiadoptie", prio: "hoog", text: "Er liggen grote kansen om AI in te zetten voor communicatie. Start met concrete use cases en bouw van daaruit op.", cta: "Baind levert concrete toepassingen in de vorm van merk-specifieke prompts." });
  } else if (ai <= 6) {
    out.push({ dim: "aiadoptie", prio: "middel", text: "Goede start met AI! De volgende stap is om naar een gestructureerde aanpak te gaan, afgestemd op jullie merk.", cta: "Baind helpt jullie AI-gebruik te structureren en op te schalen." });
  } else {
    out.push({ dim: "aiadoptie", prio: "laag", text: "Jullie AI-adoptie is ver gevorderd. Focus nu op het maximaal afstemmen van alle AI-output op jullie merkidentiteit.", cta: "Baind optimaliseert jullie bestaande AI-setup voor maximale merkconsistentie." });
  }

  if (co <= 3) {
    out.push({ dim: "consistentie", prio: "hoog", text: "De AI-output sluit nog niet goed aan bij jullie merk. Dit is het gebied met de meeste winst.", cta: "Baind traint AI specifiek op jullie merk, zodat output direct herkenbaar is." });
  } else if (co <= 6) {
    out.push({ dim: "consistentie", prio: "middel", text: "De basis is er, maar finetuning is nodig. Met de juiste prompts wordt jullie AI-content niet te onderscheiden van handgeschreven tekst.", cta: "Baind's merkexperts finetunen jullie AI voor perfecte merkconsistentie." });
  } else {
    out.push({ dim: "consistentie", prio: "laag", text: "Indrukwekkende consistentie! Jullie zijn een voorbeeld van hoe AI en merk samen kunnen gaan.", cta: "Met Baind schalen jullie dit op naar alle afdelingen en touchpoints." });
  }
  return out;
}

const DIM_META = {
  merkfundament: { label: "Merkfundament", icon: "\u25C6", color: COL.accent },
  aiadoptie:     { label: "AI-adoptie",    icon: "\u26A1", color: COL.teal },
  consistentie:  { label: "Consistentie",  icon: "\u2736", color: COL.accent },
};

const PRIO_COLORS = {
  hoog:   COL.red,
  middel: COL.orange,
  laag:   COL.teal,
};

function wrapText(text, font, size, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRoundedRect(page, x, y, w, h, r, { fill, stroke, strokeWidth = 1 }) {
  const clampR = Math.min(r, w / 2, h / 2);
  const path = [
    `M ${x + clampR} ${y}`,
    `L ${x + w - clampR} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + clampR}`,
    `L ${x + w} ${y + h - clampR}`,
    `Q ${x + w} ${y + h} ${x + w - clampR} ${y + h}`,
    `L ${x + clampR} ${y + h}`,
    `Q ${x} ${y + h} ${x} ${y + h - clampR}`,
    `L ${x} ${y + clampR}`,
    `Q ${x} ${y} ${x + clampR} ${y}`,
    "Z",
  ].join(" ");

  if (fill) {
    page.drawSvgPath(path, { color: fill, x: 0, y: 0 });
  }
  if (stroke) {
    page.drawSvgPath(path, { borderColor: stroke, borderWidth: strokeWidth, x: 0, y: 0 });
  }
}

function drawScoreArc(page, cx, cy, radius, ratio, color, font, fontBold, score, max) {
  const steps = 40;
  const startAngle = -Math.PI * 0.75;
  const totalSweep = Math.PI * 1.5;

  for (let i = 0; i < steps; i++) {
    const t1 = i / steps;
    const t2 = (i + 1) / steps;
    const a1 = startAngle + totalSweep * t1;
    const a2 = startAngle + totalSweep * t2;
    const isActive = t1 < ratio;
    const c = isActive ? color : COL.border;
    const x1 = cx + Math.cos(a1) * radius;
    const y1 = cy + Math.sin(a1) * radius;
    const x2 = cx + Math.cos(a2) * radius;
    const y2 = cy + Math.sin(a2) * radius;
    page.drawLine({
      start: { x: x1, y: y1 },
      end:   { x: x2, y: y2 },
      thickness: 4,
      color: c,
    });
  }

  const scoreStr = String(score);
  const scoreW = fontBold.widthOfTextAtSize(scoreStr, 18);
  page.drawText(scoreStr, {
    x: cx - scoreW / 2,
    y: cy + 2,
    size: 18,
    font: fontBold,
    color,
  });

  const maxStr = `/${max}`;
  const maxW = font.widthOfTextAtSize(maxStr, 9);
  page.drawText(maxStr, {
    x: cx - maxW / 2,
    y: cy - 12,
    size: 9,
    font,
    color: COL.subtle,
  });
}

/**
 * @param {{
 *   submittedAtIso: string,
 *   contact: { naam: string, bedrijf: string, email: string, telefoon: string },
 *   pct: number,
 *   overallLabel: string,
 *   dimRows: { label: string, score: number, max: number, key: string }[],
 *   dimScores: Record<string, number>,
 *   logoPngBytes?: Buffer | Uint8Array,
 * }} data
 */
export async function buildQuickscanPdfBuffer(data) {
  const {
    submittedAtIso,
    contact: { naam, bedrijf, email, telefoon },
    pct,
    overallLabel,
    dimRows,
    dimScores = {},
    logoPngBytes,
  } = data;

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let logoImage;
  if (logoPngBytes) {
    try { logoImage = await pdf.embedPng(logoPngBytes); } catch {
      try { logoImage = await pdf.embedJpg(logoPngBytes); } catch { /* skip */ }
    }
  }

  const contentW = PAGE_W - M * 2;
  const advice = getAdvice(dimScores);

  // --- PAGE 1 ---
  const p1 = pdf.addPage([PAGE_W, PAGE_H]);

  // Background
  p1.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COL.bg });

  // Logo top-right
  if (logoImage) {
    const logoH = 36;
    const logoW = logoH * (logoImage.width / logoImage.height);
    p1.drawImage(logoImage, {
      x: PAGE_W - M - logoW,
      y: PAGE_H - M - logoH + 8,
      width: logoW,
      height: logoH,
    });
  }

  let y = PAGE_H - M;

  // Badge "QUICKSCAN"
  const badgeText = "QUICKSCAN";
  const badgeW = font.widthOfTextAtSize(badgeText, 9) + 20;
  drawRoundedRect(p1, M, y - 14, badgeW, 18, 9, { fill: rgb(0.04, 0.04, 0.02) });
  p1.drawText(badgeText, {
    x: M + 10,
    y: y - 10,
    size: 9,
    font: fontBold,
    color: COL.accent,
  });
  y -= 40;

  // Title
  p1.drawText("Persoonlijk rapport", {
    x: M, y, size: 22, font: fontBold, color: COL.white,
  });
  y -= 28;
  p1.drawText(`voor ${naam}`, {
    x: M, y, size: 16, font, color: COL.accent,
  });
  y -= 24;
  p1.drawText(bedrijf, {
    x: M, y, size: 13, font, color: COL.muted,
  });
  y -= 16;
  const dateStr = new Date(submittedAtIso).toLocaleDateString("nl-NL", {
    day: "numeric", month: "long", year: "numeric",
  });
  p1.drawText(dateStr, {
    x: M, y, size: 10, font, color: COL.subtle,
  });
  y -= 40;

  // Divider
  p1.drawLine({
    start: { x: M, y }, end: { x: PAGE_W - M, y },
    thickness: 1, color: COL.border,
  });
  y -= 36;

  // Overall score section
  const scoreCenterX = PAGE_W / 2;
  p1.drawText("AI-READINESS SCORE", {
    x: scoreCenterX - fontBold.widthOfTextAtSize("AI-READINESS SCORE", 10) / 2,
    y: y,
    size: 10, font: fontBold, color: COL.subtle,
  });
  y -= 50;

  // Big percentage
  const pctStr = `${pct}%`;
  const pctW = fontBold.widthOfTextAtSize(pctStr, 52);
  p1.drawText(pctStr, {
    x: scoreCenterX - pctW / 2,
    y, size: 52, font: fontBold, color: COL.accent,
  });
  y -= 18;

  const readyStr = "AI-ready";
  const readyW = font.widthOfTextAtSize(readyStr, 16);
  p1.drawText(readyStr, {
    x: scoreCenterX - readyW / 2,
    y, size: 16, font, color: COL.white,
  });
  y -= 32;

  // Level badge
  const levelStr = `Niveau: ${overallLabel}`;
  const levelW = fontBold.widthOfTextAtSize(levelStr, 11) + 28;
  const levelX = scoreCenterX - levelW / 2;
  drawRoundedRect(p1, levelX, y - 12, levelW, 26, 13, {
    fill: COL.card, stroke: COL.border,
  });
  p1.drawText(levelStr, {
    x: levelX + 14,
    y: y - 4,
    size: 11, font: fontBold, color: COL.white,
  });
  y -= 54;

  // Dimension score rings
  const dimSpacing = contentW / 3;
  for (let i = 0; i < dimRows.length; i++) {
    const row = dimRows[i];
    const meta = DIM_META[row.key] || { label: row.label, icon: "", color: COL.accent };
    const cx = M + dimSpacing * i + dimSpacing / 2;
    const cy = y - 24;
    const ratio = row.max > 0 ? row.score / row.max : 0;

    drawScoreArc(p1, cx, cy, 28, ratio, meta.color, font, fontBold, row.score, row.max);

    const labelStr = meta.label.toUpperCase();
    const labelW = font.widthOfTextAtSize(labelStr, 8);
    p1.drawText(labelStr, {
      x: cx - labelW / 2,
      y: cy - 48,
      size: 8, font, color: COL.muted,
    });
  }
  y -= 100;

  // Divider
  p1.drawLine({
    start: { x: M, y }, end: { x: PAGE_W - M, y },
    thickness: 1, color: COL.border,
  });
  y -= 30;

  // Contact details
  p1.drawText("JOUW GEGEVENS", {
    x: M, y, size: 9, font: fontBold, color: COL.subtle,
  });
  y -= 20;

  const contactLines = [
    ["Naam", naam],
    ["Bedrijf", bedrijf],
    ["E-mail", email],
    ["Telefoon", telefoon],
  ];
  for (const [label, val] of contactLines) {
    p1.drawText(`${label}:`, {
      x: M, y, size: 10, font: fontBold, color: COL.muted,
    });
    p1.drawText(val, {
      x: M + 80, y, size: 10, font, color: COL.white,
    });
    y -= 16;
  }

  // Footer page 1
  const footerStr = "baind.nl  |  Verbind jouw merk met AI";
  const footerW = font.widthOfTextAtSize(footerStr, 8);
  p1.drawText(footerStr, {
    x: PAGE_W / 2 - footerW / 2,
    y: M - 16,
    size: 8, font, color: COL.subtle,
  });

  // --- PAGE 2+: Advice cards ---
  function newAdvicePage() {
    const pg = pdf.addPage([PAGE_W, PAGE_H]);
    pg.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COL.bg });
    if (logoImage) {
      const logoH = 28;
      const logoW = logoH * (logoImage.width / logoImage.height);
      pg.drawImage(logoImage, {
        x: PAGE_W - M - logoW,
        y: PAGE_H - M - logoH + 8,
        width: logoW,
        height: logoH,
      });
    }
    pg.drawText(footerStr, {
      x: PAGE_W / 2 - footerW / 2,
      y: M - 16,
      size: 8, font, color: COL.subtle,
    });
    return pg;
  }

  let pg = newAdvicePage();
  y = PAGE_H - M;
  pg.drawText("ANALYSE PER DIMENSIE", {
    x: M, y, size: 12, font: fontBold, color: COL.accent,
  });
  y -= 32;

  for (const a of advice) {
    const meta = DIM_META[a.dim] || { label: a.dim, color: COL.accent };
    const prioColor = PRIO_COLORS[a.prio] || COL.muted;

    const textLines = wrapText(a.text, font, 10, contentW - 32);
    const ctaLines = wrapText(a.cta, fontBold, 9, contentW - 32);
    const cardH = 48 + textLines.length * 14 + ctaLines.length * 13 + 8;

    if (y - cardH < M + 20) {
      pg = newAdvicePage();
      y = PAGE_H - M;
    }

    const cardTop = y;
    const cardBot = y - cardH;

    drawRoundedRect(pg, M, cardBot, contentW, cardH, 14, {
      fill: COL.card, stroke: COL.border,
    });

    const innerX = M + 16;
    let iy = cardTop - 18;

    pg.drawText(meta.label.toUpperCase(), {
      x: innerX, y: iy, size: 9, font: fontBold, color: meta.color,
    });

    const prioStr = `PRIORITEIT: ${a.prio.toUpperCase()}`;
    const prioW = fontBold.widthOfTextAtSize(prioStr, 8) + 16;
    const prioX = M + contentW - 16 - prioW;
    drawRoundedRect(pg, prioX, iy - 4, prioW, 16, 8, { fill: prioColor });
    pg.drawText(prioStr, {
      x: prioX + 8,
      y: iy,
      size: 8, font: fontBold, color: COL.bg,
    });

    iy -= 22;

    for (const line of textLines) {
      pg.drawText(line, {
        x: innerX, y: iy, size: 10, font, color: COL.muted,
      });
      iy -= 14;
    }

    iy -= 4;
    for (const line of ctaLines) {
      pg.drawText(line, {
        x: innerX, y: iy, size: 9, font: fontBold, color: COL.accent,
      });
      iy -= 13;
    }

    y = cardBot - 14;
  }

  // CTA block at bottom
  y -= 16;
  const ctaBoxH = 80;
  if (y - ctaBoxH > M) {
    drawRoundedRect(pg, M, y - ctaBoxH, contentW, ctaBoxH, 14, { fill: COL.cream });

    const ctaTitleStr = "Klaar om je merk te verbinden met AI?";
    const ctaTitleW = fontBold.widthOfTextAtSize(ctaTitleStr, 14);
    pg.drawText(ctaTitleStr, {
      x: PAGE_W / 2 - ctaTitleW / 2,
      y: y - 28,
      size: 14, font: fontBold, color: COL.darkText,
    });

    const ctaSubStr = "Plan een vrijblijvend gesprek op baind.nl";
    const ctaSubW = font.widthOfTextAtSize(ctaSubStr, 10);
    pg.drawText(ctaSubStr, {
      x: PAGE_W / 2 - ctaSubW / 2,
      y: y - 50,
      size: 10, font, color: COL.subtle,
    });
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export function loadLogoPng() {
  try {
    return readFileSync(join(__dirname, "baind-logo.png"));
  } catch {
    return null;
  }
}
