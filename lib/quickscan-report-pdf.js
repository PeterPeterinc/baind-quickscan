import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 50;
const LINE = 16;

/**
 * @param {{
 *   submittedAtIso: string,
 *   contact: { naam: string, bedrijf: string, email: string, telefoon: string },
 *   pct: number,
 *   overallLabel: string,
 *   dimRows: { label: string, score: number, max: number }[],
 * }} data
 */
export async function buildQuickscanPdfBuffer(data) {
  const {
    submittedAtIso,
    contact: { naam, bedrijf, email, telefoon },
    pct,
    overallLabel,
    dimRows,
  } = data;

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_H - MARGIN;
  const draw = (text, { bold = false, size = 11, color = rgb(0.12, 0.14, 0.14) } = {}) => {
    const f = bold ? fontBold : font;
    page.drawText(String(text), {
      x: MARGIN,
      y,
      size,
      font: f,
      color,
    });
    y -= Math.max(LINE, size * 1.25);
  };

  draw("BAIND Quickscan", { bold: true, size: 20 });
  draw("Persoonlijk rapport", { bold: true, size: 13 });
  y -= 4;
  draw(
    `Datum: ${new Date(submittedAtIso).toLocaleString("nl-NL", { dateStyle: "long", timeStyle: "short" })}`,
    { size: 9, color: rgb(0.35, 0.38, 0.38) }
  );
  y -= 12;

  draw("Jouw gegevens", { bold: true, size: 13 });
  draw(`Naam: ${naam}`);
  draw(`Bedrijfsnaam: ${bedrijf}`);
  draw(`E-mail: ${email}`);
  draw(`Telefoon: ${telefoon}`);
  y -= 8;

  draw("Je score", { bold: true, size: 13 });
  draw(`AI-readiness: ${pct}%`);
  draw(`Niveau: ${overallLabel}`);
  y -= 8;

  draw("Per dimensie (score / max)", { bold: true, size: 12 });
  for (const row of dimRows) {
    draw(`${row.label}: ${row.score} / ${row.max}`);
  }
  y -= 12;

  draw(
    "Dit rapport is automatisch gegenereerd na invulling van de BAIND Quickscan.",
    { size: 8, color: rgb(0.42, 0.44, 0.44) }
  );

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
