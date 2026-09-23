import { useState } from 'react';
import { Button } from '@dynatrace/strato-components';
import { ArtifactFile } from '../types';

interface ImportButtonProps {
  artifact: ArtifactFile;
  itemName: string;
}

type State = 'idle' | 'loading' | 'success' | 'error';

async function importDashboard(downloadUrl: string, name: string): Promise<void> {
  const ghRes = await fetch(`/api/github-proxy?url=${encodeURIComponent(downloadUrl)}`);
  if (!ghRes.ok) throw new Error(`Failed to fetch from GitHub: ${ghRes.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await ghRes.json();

  const { owner: _o, isPrivate: _p, modificationInfo: _m, ...payload } = json;

  const body = JSON.stringify({
    type: 'dashboard',
    name: (payload.name as string) || name,
    content: JSON.stringify(payload),
  });

  const res = await fetch('/platform/document/v0/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Import failed (${res.status}): ${text}`);
  }
}


export function ImportButton({ artifact, itemName }: ImportButtonProps) {
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Workflow import requires automation:workflows:write which is restricted to
  // Dynatrace-provided apps. Show a download link instead.
  if (artifact.type === 'workflow') {
    return (
      <a
        href={artifact.downloadUrl}
        download={artifact.name}
        style={{
          padding: '6px 12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '13px',
          textDecoration: 'none',
          color: 'inherit',
          display: 'inline-block',
        }}
      >
        Download JSON
      </a>
    );
  }

  const handleImport = async () => {
    setState('loading');
    setErrorMsg('');
    try {
      await importDashboard(artifact.downloadUrl, itemName);
      setState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <Button
        variant={state === 'success' ? 'default' : 'emphasized'}
        onClick={handleImport}
        disabled={state === 'loading' || state === 'success'}
      >
        {state === 'loading' ? 'Importing…' : state === 'success' ? 'Imported' : 'Import Dashboard'}
      </Button>
      {state === 'error' && (
        <span style={{ fontSize: '12px', color: '#c0392b' }}>{errorMsg}</span>
      )}
    </div>
  );
}
