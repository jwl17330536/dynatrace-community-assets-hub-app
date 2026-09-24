import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Flex, Button, Text, Surface } from '@dynatrace/strato-components';
import { useRepoConfig, useGitHubPat } from '../hooks/useRepoConfig';
import { useGitHubCatalog } from '../hooks/useGitHubCatalog';
import { TypeBadge } from '../components/TypeBadge';
import { ImportButton } from '../components/ImportButton';

export function ItemDetail() {
  const navigate = useNavigate();
  const { owner, repo, folder } = useParams<{ owner: string; repo: string; folder: string }>();
  const { repos } = useRepoConfig();
  const { pat } = useGitHubPat();
  const { items, loading } = useGitHubCatalog(repos, pat);

  const item = items.find(
    i =>
      i.repoConfig.owner === owner &&
      i.repoConfig.repo === repo &&
      i.folder === folder
  );

  if (loading && !item) {
    return (
      <div style={{ padding: '24px', opacity: 0.5 }}>Loading…</div>
    );
  }

  if (!item) {
    return (
      <div style={{ padding: '24px' }}>
        <Button variant="default" onClick={() => navigate('/')}>← Back</Button>
        <div style={{ marginTop: '24px', opacity: 0.5 }}>Item not found.</div>
      </div>
    );
  }

  const dashboards = item.artifacts.filter(a => a.type === 'dashboard');
  const workflows = item.artifacts.filter(a => a.type === 'workflow');

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Flex alignItems="center" gap={12} style={{ marginBottom: '20px' }}>
        <Button variant="default" onClick={() => navigate('/')}>← Back</Button>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>{item.name}</h1>
      </Flex>

      <Flex gap={6} style={{ marginBottom: '20px' }}>
        {dashboards.length > 0 && <TypeBadge type="dashboard" />}
        {workflows.length > 0 && <TypeBadge type="workflow" />}
        <Text textStyle="small" style={{ opacity: 0.5, marginLeft: '8px' }}>
          {item.repoConfig.label ?? `${item.repoConfig.owner}/${item.repoConfig.repo}`}
          {' · '}
          <a
            href={`https://github.com/${item.repoConfig.owner}/${item.repoConfig.repo}/tree/${item.repoConfig.branch}/${item.folder}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit' }}
          >
            View on GitHub ↗
          </a>
        </Text>
      </Flex>

      {item.readmeContent && (
        <Surface style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ lineHeight: 1.65, fontSize: '14px' }}>
            <ReactMarkdown>{item.readmeContent}</ReactMarkdown>
          </div>
        </Surface>
      )}

      <Surface style={{ padding: '20px' }}>
        <h2 style={{ marginTop: 0, fontSize: '16px' }}>Import Artifacts</h2>
        <Flex flexDirection="column" gap={12}>
          {dashboards.map(a => (
            <Flex key={a.name} alignItems="center" gap={12}>
              <TypeBadge type="dashboard" />
              <Text textStyle="small" style={{ flexGrow: 1, fontFamily: 'monospace', opacity: 0.7 }}>
                {a.name}
              </Text>
              <ImportButton artifact={a} itemName={item.name} pat={pat} />
            </Flex>
          ))}
          {workflows.map(a => (
            <Flex key={a.name} alignItems="center" gap={12}>
              <TypeBadge type="workflow" />
              <Text textStyle="small" style={{ flexGrow: 1, fontFamily: 'monospace', opacity: 0.7 }}>
                {a.name}
              </Text>
              <ImportButton artifact={a} itemName={item.name} pat={pat} />
            </Flex>
          ))}
        </Flex>
      </Surface>
    </div>
  );
}
