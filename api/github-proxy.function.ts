const ALLOWED_HOSTS = ['api.github.com', 'raw.githubusercontent.com'];

export default async function handler(request: Request): Promise<Response> {
  // request.url may be relative in the DT function runtime — parse query string directly
  const qIdx = request.url.indexOf('?');
  const searchParams = new URLSearchParams(qIdx >= 0 ? request.url.slice(qIdx + 1) : '');
  const targetUrl = searchParams.get('url') ?? '';

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return new Response('Bad Request: invalid url parameter', { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return new Response('Forbidden: host not allowed', { status: 403 });
  }

  let ghRes: Response;
  try {
    ghRes = await fetch(targetUrl, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
  } catch (err) {
    return new Response(`Upstream fetch failed: ${String(err)}`, { status: 502 });
  }

  const body = await ghRes.text();
  return new Response(body, {
    status: ghRes.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
