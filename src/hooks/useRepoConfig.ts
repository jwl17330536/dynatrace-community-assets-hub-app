import { useState, useEffect } from 'react';
import { RepoConfig } from '../types';

const STORAGE_KEY = 'repo-catalog.repos';

function load(): RepoConfig[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function useRepoConfig() {
  const [repos, setRepos] = useState<RepoConfig[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
  }, [repos]);

  const addRepo = (config: RepoConfig) =>
    setRepos(prev => [...prev, config]);

  const removeRepo = (index: number) =>
    setRepos(prev => prev.filter((_, i) => i !== index));

  return { repos, addRepo, removeRepo };
}
