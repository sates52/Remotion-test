/**
 * serve.mjs — Visionless-10x scratch: tiny static server for this audit dir.
 * Usage: node audit/visionless-10x/serve.mjs [port]   (default 8931)
 */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2] || 8931);
const types = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".md": "text/plain; charset=utf-8", ".json": "application/json" };

http.createServer((req, res) => {
  const rel = decodeURIComponent((req.url || "/").split("?")[0]).replace(/^\/+/, "");
  const file = path.normalize(path.join(root, rel || "contact-sheet.html"));
  const rootNorm = path.normalize(root).toLowerCase() + path.sep;
  if (!path.normalize(file).toLowerCase().startsWith(rootNorm)) { res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`serving ${root} at http://127.0.0.1:${port}/contact-sheet.html`);
  process.exitCode = 0;
});
