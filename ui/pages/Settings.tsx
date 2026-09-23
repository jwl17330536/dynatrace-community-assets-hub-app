import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Button, Text, Surface } from '@dynatrace/strato-components';
import { useRepoConfig, useGitHubPat } from '../hooks/useRepoConfig';
import { RepoConfig } from '../types';

function isValidRepoSlug(s: string): boolean {
  return /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(s.trim());
}

export function Settings() {
  const navigate = useNavigate();
  const { repos, addRepo, removeRepo } = useRepoConfig();
  const { pat, savePat, clearPat } = useGitHubPat();
  const [patInput, setPatInput] = useState(pat);
  const [patSaved, setPatSaved] = useState(false);
  const [repoSlug, setRepoSlug] = useState('');
  const [label, setLabel] = useState('');
  const [branch, setBranch] = useState('main');
  const [validationError, setValidationError] = useState('');

  const handleAdd = () => {
    const slug = repoSlug.trim();
    if (!isValidRepoSlug(slug)) {
      setValidationError('Enter a valid repo in owner/repo format (e.g. jwl17330536/dynatrace-standalone-dashboards)');
      return;
    }

    const [owner, repo] = slug.split('/');
    const newConfig: RepoConfig = {
      owner,
      repo,
      branch: branch.trim() || 'main',
      label: label.trim() || undefined,
    };

    const alreadyAdded = repos.some(
      r => r.owner === newConfig.owner && r.repo === newConfig.repo
    );
    if (alreadyAdded) {
      setValidationError('This repo is already in the list.');
      return;
    }

    addRepo(newConfig);
    setRepoSlug('');
    setLabel('');
    setBranch('main');
    setValidationError('');
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '640px', margin: '0 auto' }}>
      <Flex alignItems="center" gap={12} style={{ marginBottom: '24px' }}>
        <Button variant="default" onClick={() => navigate('/')}>← Back</Button>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Settings</h1>
      </Flex>

      <Surface style={{ padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, fontSize: '16px' }}>Add GitHub Repo</h2>
        <Text textStyle="small" style={{ opacity: 0.6, display: 'block', marginBottom: '16px' }}>
          Repos must be public and structured with one folder per dashboard (like{' '}
          <a
            href="https://github.com/jwl17330536/dynatrace-standalone-dashboards"
            target="_blank"
            rel="noopener noreferrer"
          >
            dynatrace-standalone-dashboards
          </a>
          ).
        </Text>

        <Flex flexDirection="column" gap={12}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              Repo (owner/repo) *
            </label>
            <input
              type="text"
              placeholder="jwl17330536/dynatrace-standalone-dashboards"
              value={repoSlug}
              onChange={e => { setRepoSlug(e.target.value); setValidationError(''); }}
              style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              Branch
            </label>
            <input
              type="text"
              placeholder="main"
              value={branch}
              onChange={e => setBranch(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              Display label (optional)
            </label>
            <input
              type="text"
              placeholder="My Dashboards"
              value={label}
              onChange={e => setLabel(e.target.value)}
              style={inputStyle}
            />
          </div>

          {validationError && (
            <Text textStyle="small" style={{ color: '#c0392b' }}>{validationError}</Text>
          )}

          <div>
            <Button variant="emphasized" onClick={handleAdd}>
              Add Repo
            </Button>
          </div>
        </Flex>
      </Surface>

      <Surface style={{ padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, fontSize: '16px' }}>GitHub Personal Access Token</h2>
        <Text textStyle="small" style={{ opacity: 0.6, display: 'block', marginBottom: '12px' }}>
          Required for the DT AppEngine proxy to reach api.github.com. Create a classic PAT with{' '}
          <code>public_repo</code> (read) scope at{' '}
          <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
            github.com/settings/tokens
          </a>
          .
        </Text>
        <Flex gap={8} alignItems="center">
          <input
            type="password"
            placeholder="ghp_…"
            value={patInput}
            onChange={e => { setPatInput(e.target.value); setPatSaved(false); }}
            style={{ ...inputStyle, width: '320px' }}
          />
          <Button
            variant="emphasized"
            onClick={() => { savePat(patInput.trim()); setPatSaved(true); }}
            disabled={patInput.trim() === pat}
          >
            Save
          </Button>
          {pat && (
            <Button
              variant="default"
              onClick={() => { clearPat(); setPatInput(''); setPatSaved(false); }}
            >
              Clear
            </Button>
          )}
          {patSaved && (
            <Text textStyle="small" style={{ color: '#27ae60' }}>Saved</Text>
          )}
        </Flex>
      </Surface>

      <Surface style={{ padding: '20px' }}>
        <h2 style={{ marginTop: 0, fontSize: '16px' }}>
          Configured Repos ({repos.length})
        </h2>

        {repos.length === 0 ? (
          <Text textStyle="small" style={{ opacity: 0.5 }}>
            No repos added yet.
          </Text>
        ) : (
          <Flex flexDirection="column" gap={8}>
            {repos.map((r, i) => (
              <Flex
                key={`${r.owner}/${r.repo}`}
                alignItems="center"
                justifyContent="space-between"
                style={{
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <Flex flexDirection="column" gap={2}>
                  <Text textStyle="base-emphasized" style={{ fontWeight: 600 }}>
                    {r.label ?? `${r.owner}/${r.repo}`}
                  </Text>
                  <Text textStyle="small" style={{ opacity: 0.5, fontFamily: 'monospace' }}>
                    {r.owner}/{r.repo} · {r.branch}
                    {r.label && ` · ${r.owner}/${r.repo}`}
                  </Text>
                </Flex>
                <Button
                  variant="default"
                  onClick={() => removeRepo(i)}
                >
                  Remove
                </Button>
              </Flex>
            ))}
          </Flex>
        )}
      </Surface>
    </div>
  );
}
