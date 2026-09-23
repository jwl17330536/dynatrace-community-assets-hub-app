const ALLOWED_HOSTS = ['api.github.com', 'raw.githubusercontent.com'];

export default async function handler(request: Request): Promise<Response> {
  try {
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

    const ghRes = await fetch(targetUrl, { headers: fetchHeaders });
    const body = await ghRes.text();
    return new Response(body, {
      status: ghRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(`Proxy error: ${String(err)}`, { status: 502 });
  }
}
