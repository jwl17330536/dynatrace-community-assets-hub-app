// Proxy is disabled — the browser calls GitHub directly.
// Keeping this file so the function endpoint exists for potential future use.
export default async function handler(_request: Request): Promise<Response> {
  return new Response(
    JSON.stringify({ error: 'Proxy disabled — browser fetches GitHub directly' }),
    { status: 410, headers: { 'Content-Type': 'application/json' } }
  );
}
