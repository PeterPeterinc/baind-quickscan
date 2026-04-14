import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { buffer } from "node:stream/consumers";
import { buildQuickscanPdfBuffer } from "../lib/quickscan-report-pdf.js";

const MAX_LEN = 500;

const DIM_LABELS = {
  merkfundament: "Merkfundament",
  aiadoptie: "AI-adoptie",
  consistentie: "Consistentie",
};

function clean(s, max = MAX_LEN) {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, max);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getJsonBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === "string") {
      try {
        return req.body ? JSON.parse(req.body) : {};
      } catch {
        return {};
      }
    }
  }
  try {
    const buf = await buffer(req);
    const s = buf.toString("utf8");
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("BLOB_READ_WRITE_TOKEN is not set");
    return res.status(500).json({ ok: false, error: "Server configuration error" });
  }

  let payload;
  try {
    payload = await getJsonBody(req);
  } catch {
    return res.status(400).json({ ok: false, error: "Ongeldige JSON" });
  }

  const contact = payload.contact || {};
  const naam = clean(contact.naam);
  const email = clean(contact.email, 320);
  const bedrijf = clean(contact.bedrijf);
  const telefoon = clean(contact.telefoon, 80);

  if (!naam || !bedrijf || !email) {
    return res.status(400).json({ ok: false, error: "Naam, bedrijfsnaam en e-mailadres zijn verplicht" });
  }
  if (!validEmail(email)) {
    return res.status(400).json({ ok: false, error: "Ongeldig e-mailadres" });
  }

  const wantPdfDownload = payload.wantPdfDownload === true;
  const telOk = telefoon.length > 0;
  if (wantPdfDownload && !telOk) {
    return res.status(400).json({
      ok: false,
      error: "Vul alle velden in, inclusief telefoon, om je PDF te downloaden.",
    });
  }

  const pct = typeof payload.pct === "number" ? Math.max(0, Math.min(100, Math.round(payload.pct))) : null;
  const overallLabel =
    typeof payload.overallLabel === "string" ? clean(payload.overallLabel, 120) : "";

  const dimScores = payload.dimScores && typeof payload.dimScores === "object" ? payload.dimScores : {};
  const dimMax = payload.dimMax && typeof payload.dimMax === "object" ? payload.dimMax : {};

  const dimRows = ["merkfundament", "aiadoptie", "consistentie"].map((key) => ({
    key,
    label: DIM_LABELS[key] || key,
    score: Number(dimScores[key]) || 0,
    max: Number(dimMax[key]) || 0,
  }));

  const id = randomUUID();
  const submittedAt = new Date().toISOString();

  let pdfBuf;
  try {
    pdfBuf = await buildQuickscanPdfBuffer({
      submittedAtIso: submittedAt,
      contact: {
        naam,
        bedrijf,
        email,
        telefoon: telOk ? telefoon : "—",
      },
      pct: pct ?? 0,
      overallLabel: overallLabel || "—",
      dimRows,
      dimScores,
    });
  } catch (e) {
    console.error("PDF generation failed:", e);
    return res.status(500).json({ ok: false, error: "Kon PDF niet genereren" });
  }

  const datePrefix = submittedAt.slice(0, 10);
  const pathname = `quickscan-rapporten/${datePrefix}/${id}.pdf`;

  let blob;
  try {
    blob = await put(pathname, pdfBuf, {
      access: "private",
      token,
      contentType: "application/pdf",
    });
  } catch (e) {
    console.error("Blob put failed:", e);
    return res.status(500).json({ ok: false, error: "Opslaan mislukt" });
  }

  // Private store: use access "private". downloadUrl is bedoeld voor downloads in de browser.
  const reportUrl = wantPdfDownload ? blob.downloadUrl : null;

  return res.status(200).json({ ok: true, id, reportUrl });
}
