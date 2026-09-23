import { useState, useEffect } from 'react';
import { RepoConfig, CatalogItem, ArtifactFile } from '../types';

const GH_API = 'https://api.github.com';

interface GHEntry {
  type: 'file' | 'dir';
  name: string;
  path: string;
  download_url: string | null;
  content?: string;
  encoding?: string;
}

async function ghFetch<T>(url: string, pat?: string): Promise<T> {
  const res = await fetch('/api/github-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, pat: pat || null }),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${url}`);
  const data = await res.json() as unknown;
  if (!Array.isArray(data) && typeof data === 'object' && data !== null && 'message' in data) {
    throw new Error(`GitHub API error: ${(data as { message: string }).message}`);
  }
  return data as T;
}

function decodeBase64(encoded: string): string {
  return atob(encoded.replace(/\n/g, ''));
}

function toDisplayName(folder: string): string {
  return folder
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function fetchRepoItems(config: RepoConfig, pat?: string): Promise<CatalogItem[]> {
  const { owner, repo, branch } = config;
  const rootEntries = await ghFetch<GHEntry[]>(
    `${GH_API}/repos/${owner}/${repo}/contents?ref=${branch}`,
    pat
  );

  const folders = rootEntries.filter(
    e => e.type === 'dir' && !e.name.startsWith('.')
  );

  const results = await Promise.allSettled(
    folders.map(async folder => {
      const entries = await ghFetch<GHEntry[]>(
        `${GH_API}/repos/${owner}/${repo}/contents/${folder.path}?ref=${branch}`,
        pat
      );

      const artifacts: ArtifactFile[] = [];
      let readmeContent: string | undefined;

      for (const entry of entries) {
        if (entry.type !== 'file') continue;
        const lname = entry.name.toLowerCase();

        if (lname === 'readme.md' && entry.content && entry.encoding === 'base64') {
          readmeContent = decodeBase64(entry.content);
        } else if (lname.endsWith('.workflow.json') && entry.download_url) {
          artifacts.push({ name: entry.name, type: 'workflow', downloadUrl: entry.download_url });
        } else if (lname.endsWith('.json') && entry.download_url) {
          artifacts.push({ name: entry.name, type: 'dashboard', downloadUrl: entry.download_url });
        }
      }

      if (artifacts.length === 0) return null;

      const item: CatalogItem = {
        folder: folder.name,
        name: toDisplayName(folder.name),
        repoConfig: config,
        artifacts,
        readmeContent,
      };
      return item;
    })
  );

  const items: CatalogItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value !== null) {
      items.push(r.value);
    }
  }
  return items;
}

export function useGitHubCatalog(repos: RepoConfig[], pat?: string) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reposKey = JSON.stringify(repos);

  useEffect(() => {
    if (repos.length === 0) {
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all(repos.map(r => fetchRepoItems(r, pat)))
      .then(results => {
        if (!cancelled) {
          setItems(results.flat());
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch catalog');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reposKey, refreshKey, pat]);

  return { items, loading, error, refresh: () => setRefreshKey(k => k + 1) };
}
