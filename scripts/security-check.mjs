const baseUrl = process.env.PUBLIC_SITE_URL || "http://127.0.0.1:5173";

const requiredHeaders = [
  "content-security-policy",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "x-frame-options",
];

const response = await fetch(baseUrl);

if (!response.ok) {
  throw new Error(`Pagina inicial retornou HTTP ${response.status}.`);
}

const missingHeaders = requiredHeaders.filter((header) => !response.headers.has(header));

if (missingHeaders.length) {
  throw new Error(`Headers ausentes: ${missingHeaders.join(", ")}`);
}

const blockedResponse = await fetch(`${baseUrl}/.env.example`);

if (blockedResponse.status !== 403) {
  throw new Error(`Arquivo interno deveria retornar 403, mas retornou ${blockedResponse.status}.`);
}

const blockedApiResponse = await fetch(`${baseUrl}/api/leads`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ teste: true }),
});

if (![401, 503].includes(blockedApiResponse.status)) {
  throw new Error(`API sem autorizacao deveria retornar 401 ou 503, mas retornou ${blockedApiResponse.status}.`);
}

console.log("Verificacao de seguranca local concluida.");
