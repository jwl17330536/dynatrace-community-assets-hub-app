import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Button, Text } from '@dynatrace/strato-components';
import { useRepoConfig } from '../hooks/useRepoConfig';
import { useGitHubCatalog } from '../hooks/useGitHubCatalog';
import { CatalogCard } from '../components/CatalogCard';

type TypeFilter = 'all' | 'dashboard' | 'workflow';

export function Catalog() {
  const navigate = useNavigate();
  const { repos } = useRepoConfig();
  const { items, loading, error, refresh } = useGitHubCatalog(repos);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.folder.includes(q);
    if (!matchesSearch) return false;
    if (typeFilter === 'dashboard') return item.artifacts.some(a => a.type === 'dashboard');
    if (typeFilter === 'workflow') return item.artifacts.some(a => a.type === 'workflow');
    return true;
  });

  const filterBtn = (f: TypeFilter, label: string) => (
    <Button
      variant={typeFilter === f ? 'emphasized' : 'default'}
      onClick={() => setTypeFilter(f)}
    >
      {label}
    </Button>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Flex justifyContent="space-between" alignItems="center" style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>DT Community Assets</h1>
        <Flex gap={8}>
          <Button variant="default" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
          <Button variant="emphasized" onClick={() => navigate('/settings')}>
            Settings
          </Button>
        </Flex>
      </Flex>

      {repos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Text textStyle="base-emphasized">No repos configured</Text>
          <br />
          <Text textStyle="small" style={{ opacity: 0.6 }}>
            Add a GitHub repo in Settings to see dashboards and workflows.
          </Text>
          <br />
          <div style={{ marginTop: '16px' }}>
            <Button variant="emphasized" onClick={() => navigate('/settings')}>
              Go to Settings
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Flex gap={8} alignItems="center" style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
                width: '240px',
              }}
            />
            {filterBtn('all', 'All')}
            {filterBtn('dashboard', 'Dashboards')}
            {filterBtn('workflow', 'Workflows')}
            <Text textStyle="small" style={{ opacity: 0.5, marginLeft: 'auto' }}>
              {loading ? 'Loading…' : `${filtered.length} of ${items.length} items`}
            </Text>
          </Flex>

          {error && (
            <div style={{ color: '#c0392b', marginBottom: '16px', fontSize: '13px' }}>
              Error: {error}
            </div>
          )}

          {loading && items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
              Loading catalog…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
              No items match your search.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {filtered.map(item => (
                <CatalogCard
                  key={`${item.repoConfig.owner}/${item.repoConfig.repo}/${item.folder}`}
                  item={item}
                  onClick={() =>
                    navigate(`/item/${item.repoConfig.owner}/${item.repoConfig.repo}/${item.folder}`)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
