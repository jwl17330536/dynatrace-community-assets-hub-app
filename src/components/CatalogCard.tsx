import { Surface, Flex, Text } from '@dynatrace/strato-components';
import { CatalogItem } from '../types';
import { TypeBadge } from './TypeBadge';

interface CatalogCardProps {
  item: CatalogItem;
  onClick: () => void;
}

function readmeSummary(readme: string | undefined): string {
  if (!readme) return '';
  const firstPara = readme
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .join(' ')
    .slice(0, 160);
  return firstPara || '';
}

export function CatalogCard({ item, onClick }: CatalogCardProps) {
  const dashboardCount = item.artifacts.filter(a => a.type === 'dashboard').length;
  const workflowCount = item.artifacts.filter(a => a.type === 'workflow').length;
  const summary = readmeSummary(item.readmeContent);
  const repoLabel = item.repoConfig.label ?? `${item.repoConfig.owner}/${item.repoConfig.repo}`;

  return (
    <Surface
      onClick={onClick}
      style={{ cursor: 'pointer', padding: '16px', height: '100%', boxSizing: 'border-box' }}
    >
      <Flex flexDirection="column" gap={8} style={{ height: '100%' }}>
        <Flex gap={6} flexWrap="wrap">
          {dashboardCount > 0 && <TypeBadge type="dashboard" />}
          {workflowCount > 0 && <TypeBadge type="workflow" />}
        </Flex>

        <Text textStyle="base-emphasized" style={{ fontWeight: 600 }}>
          {item.name}
        </Text>

        {summary && (
          <Text textStyle="small" style={{ opacity: 0.75, flexGrow: 1 }}>
            {summary}
          </Text>
        )}

        <Text textStyle="small" style={{ opacity: 0.5, marginTop: 'auto' }}>
          {repoLabel}
          {workflowCount > 0 && ` · ${workflowCount} workflow${workflowCount > 1 ? 's' : ''}`}
        </Text>
      </Flex>
    </Surface>
  );
}
