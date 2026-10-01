// Serves the static export in out/ the way GitHub Pages does, including the
// base path and byte-range requests (needed for video seeking). No dependencies.
//   node scripts/serve-out.mjs [port]
// A build made for a sub-path is previewed at the same sub-path, e.g.
// http://localhost:3200/learning-workspace-website/. The sub-path is read from
// NEXT_PUBLIC_BASE_PATH, or detected from the built index.html.
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("out");
const port = Number(process.argv[2] || process.env.PORT || 3200);

function detectBase() {
  if (process.env.NEXT_PUBLIC_BASE_PATH !== undefined) return process.env.NEXT_PUBLIC_BASE_PATH;
  try {
    const html = readFileSync(join(root, "index.html"), "utf8");
    return /(?:src|href)="(\/[^"]*?)\/_next\/static\//.exec(html)?.[1] ?? "";
  } catch {
    return "";
  }
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".vtt": "text/vtt; charset=utf-8",
};

if (!existsSync(root)) {
  console.error("out/ not found. Run `npm run build` first.");
  process.exit(1);
}

const base = detectBase().replace(/\/$/, "");

function resolveFile(urlPath) {
  const target = normalize(join(root, decodeURIComponent(urlPath)));
  if (!target.startsWith(root)) return null;
  if (existsSync(target) && statSync(target).isFile()) return target;
  const index = join(target, "index.html");
  if (existsSync(index)) return index;
  if (existsSync(`${target}.html`)) return `${target}.html`;
  return null;
}

createServer((req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (base && (url.pathname === "/" || url.pathname === base)) {
    res.writeHead(302, { Location: `${base}/` });
    return res.end();
  }
  if (base && !url.pathname.startsWith(`${base}/`)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end(`Not found. The site is served under ${base}/`);
  }
  const file = resolveFile(url.pathname.slice(base.length) || "/");
  if (!file) {
    const notFound = join(root, "404.html");
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    return existsSync(notFound) ? createReadStream(notFound).pipe(res) : res.end("Not found");
  }

  const size = statSync(file).size;
  const headers = {
    "Content-Type": TYPES[extname(file)] || "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-cache",
  };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) {
      res.writeHead(416, { "Content-Range": `bytes */${size}` });
      return res.end();
    }
    res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
    return req.method === "HEAD" ? res.end() : createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, "Content-Length": size });
  return req.method === "HEAD" ? res.end() : createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`Serving out/ at http://localhost:${port}${base}/`);
});
