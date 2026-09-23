export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  label?: string;
}

export type ItemType = 'dashboard' | 'workflow';

export interface ArtifactFile {
  name: string;
  type: ItemType;
  downloadUrl: string;
}

export interface CatalogItem {
  folder: string;
  name: string;
  repoConfig: RepoConfig;
  artifacts: ArtifactFile[];
  readmeContent?: string;
}
