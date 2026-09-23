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

  const token = request.headers.get('X-GitHub-Token');
  const fetchHeaders: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'DT-Community-Assets/1.0',
  };
  if (token) fetchHeaders['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  let ghRes: Response;
  try {
    ghRes = await fetch(targetUrl, { headers: fetchHeaders, signal: controller.signal });
  } catch (err) {
    return new Response(`Upstream fetch failed: ${String(err)}`, { status: 502 });
  } finally {
    clearTimeout(timer);
  }

  const body = await ghRes.text();
  return new Response(body, {
    status: ghRes.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
