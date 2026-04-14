import { get } from "@vercel/blob";

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

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="BAIND-quickscan-rapport.pdf"');
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
