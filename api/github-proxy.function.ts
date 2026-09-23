const ALLOWED_HOSTS = ['api.github.com', 'raw.githubusercontent.com'];

export default async function handler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
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

  const ghRes = await fetch(targetUrl, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });

  const body = await ghRes.text();
  return new Response(body, {
    status: ghRes.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
