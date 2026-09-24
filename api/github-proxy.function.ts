const ALLOWED_HOSTS = ['api.github.com', 'raw.githubusercontent.com'];

export default async function handler(payload: unknown): Promise<unknown> {
  console.log('github-proxy invoked');
  try {
    if (!payload || typeof payload !== 'object') {
      return { __proxy_error: 'Invalid payload' };
    }
    const { url: targetUrl, pat: token } = payload as { url: string; pat?: string | null };

    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return { __proxy_error: 'Bad Request: invalid url' };
    }

    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return { __proxy_error: 'Forbidden: host not allowed' };
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'dt-community-assets',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log('Fetching', targetUrl);
    const ghRes = await fetch(targetUrl, { headers });
    const text = await ghRes.text();
    console.log('GitHub status', ghRes.status, 'body length', text.length);

    try {
      return JSON.parse(text);
    } catch {
      return { __proxy_error: `Non-JSON (${ghRes.status}): ${text.slice(0, 200)}` };
    }
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('github-proxy failed', msg);
    return { __proxy_error: msg };
  }
}
