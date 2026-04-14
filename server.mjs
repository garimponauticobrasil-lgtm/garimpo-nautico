import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { extname, join, normalize } from "node:path";

const host = "127.0.0.1";
const port = process.env.PORT || 5173;
const root = process.cwd();
const apiAuthToken = process.env.API_AUTH_TOKEN || "";
const maxApiBodyBytes = 16 * 1024;
const allowedHosts = new Set([
  `${host}:${port}`,
  `localhost:${port}`,
]);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const securityHeaders = {
  "content-security-policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
  ].join("; "),
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}`).pathname);
  const requested = ["/", "/produtos", "/captacao", "/loja"].includes(pathname) ? "/index.html" : pathname;
  const filePath = normalize(join(root, requested));

  return filePath.startsWith(root) ? filePath : null;
}

function isAllowedHost(request) {
  return allowedHosts.has(request.headers.host || "");
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || "";

  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return request.headers["x-api-key"] || "";
}

function isAuthorizedApiRequest(request) {
  const token = getBearerToken(request);

  if (!apiAuthToken || !token) {
    return false;
  }

  const expected = Buffer.from(apiAuthToken);
  const received = Buffer.from(token);

  return expected.length === received.length && timingSafeEqual(expected, received);
}

async function readJsonBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;

    if (Buffer.byteLength(body) > maxApiBodyBytes) {
      throw new Error("Payload muito grande.");
    }
  }

  return body ? JSON.parse(body) : {};
}

async function handleApi(request, response, pathname) {
  response.setHeader("cache-control", "no-store");

  if (!apiAuthToken) {
    response.writeHead(503, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "API n\u00e3o configurada." }));
    return;
  }

  if (!isAuthorizedApiRequest(request)) {
    response.writeHead(401, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "API n\u00e3o autorizada." }));
    return;
  }

  if (pathname === "/api/leads" && request.method === "POST") {
    try {
      await readJsonBody(request);
    } catch {
      response.writeHead(400, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "JSON invalido ou payload muito grande." }));
      return;
    }

    response.writeHead(202, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ status: "recebido" }));
    return;
  }

  response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ error: "Rota de API n\u00e3o encontrada." }));
}

function isPublicPath(filePath) {
  const relativePath = filePath.slice(root.length).replaceAll("\\", "/");

  return ["/index.html", "/manifest.webmanifest", "/service-worker.js"].includes(relativePath)
    || relativePath.startsWith("/src/");
}

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
  const filePath = resolvePath(request.url);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.setHeader(key, value);
  });

  if (!isAllowedHost(request)) {
    response.writeHead(421, { "content-type": "text/plain; charset=utf-8" });
    response.end("Host n\u00e3o autorizado.");
    return;
  }

  if (pathname.startsWith("/api/")) {
    await handleApi(request, response, pathname);
    return;
  }

  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
    response.end("Metodo não permitido.");
    return;
  }

  if (filePath && !isPublicPath(filePath)) {
    response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    response.end("Acesso negado.");
    return;
  }

  if (!filePath || !existsSync(filePath) || !(await stat(filePath)).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Arquivo não encontrado.");
    return;
  }

  response.writeHead(200, {
    "content-type": types[extname(filePath)] || "application/octet-stream",
  });

  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Site em http://${host}:${port}`);
});
