import { get } from "@vercel/blob";

function buildContentDisposition(displayName) {
  const ascii = displayName
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_")
    .slice(0, 200);
  const star = encodeURIComponent(displayName);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${star}`;
}

/** Query `filename` veilig maken (alleen bestandsnaam, eindigt op .pdf). */
function safeDownloadFilename(raw) {
  if (typeof raw !== "string" || !raw.trim()) return "BAIND-quickscan-rapport.pdf";
  let name = raw.trim();
  try {
    name = decodeURIComponent(name);
  } catch {
    return "BAIND-quickscan-rapport.pdf";
  }
  name = name.replace(/^.*[/\\]/, "").replace(/["\r\n\x00-\x1f]/g, "");
  if (!name) return "BAIND-quickscan-rapport.pdf";
  if (!name.toLowerCase().endsWith(".pdf")) {
    name = `${name.replace(/\.+$/u, "")}.pdf`;
  }
  return name.slice(0, 200) || "BAIND-quickscan-rapport.pdf";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method not allowed");
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return res.status(500).end("Server configuration error");
  }

  const blobUrl = req.query.url;
  if (!blobUrl || typeof blobUrl !== "string") {
    return res.status(400).end("Missing url parameter");
  }

  if (!blobUrl.includes(".blob.vercel-storage.com/")) {
    return res.status(400).end("Invalid blob URL");
  }

  let result;
  try {
    result = await get(blobUrl, { access: "private", token });
  } catch (e) {
    console.error("Blob get failed:", e);
    return res.status(500).end("Download failed");
  }

  if (!result || result.statusCode === 304) {
    return res.status(404).end("Not found");
  }

  const dispName = safeDownloadFilename(req.query.filename);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", buildContentDisposition(dispName));
  if (result.blob?.size) {
    res.setHeader("Content-Length", result.blob.size);
  }
  res.setHeader("Cache-Control", "private, no-store");

  const reader = result.stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (e) {
    console.error("Stream error:", e);
    res.destroy();
  }
}
