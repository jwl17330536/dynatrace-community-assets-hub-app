import { useState } from 'react';
import { Button } from '@dynatrace/strato-components';
import { documentsClient } from '@dynatrace-sdk/client-document';
import { ArtifactFile } from '../types';

interface ImportButtonProps {
  artifact: ArtifactFile;
  itemName: string;
  pat?: string;
}

type State = 'idle' | 'loading' | 'success' | 'error';

async function importDashboard(downloadUrl: string, name: string, pat?: string): Promise<void> {
  const ghRes = await fetch('/api/github-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: downloadUrl, pat: pat || null }),
  });
  if (!ghRes.ok) throw new Error(`Failed to fetch from GitHub: ${ghRes.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await ghRes.json();
  if (json && typeof json === 'object' && '__proxy_error' in json) {
    throw new Error(`Proxy: ${json.__proxy_error}`);
  }

  const { owner: _o, isPrivate: _p, modificationInfo: _m, ...payload } = json;

  await documentsClient.createDocument({
    body: {
      name: (payload.name as string) || name,
      type: 'dashboard',
      content: new Blob([JSON.stringify(payload)], { type: 'application/json' }),
    },
  });
}


export function ImportButton({ artifact, itemName, pat }: ImportButtonProps) {
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
      await importDashboard(artifact.downloadUrl, itemName, pat);
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
