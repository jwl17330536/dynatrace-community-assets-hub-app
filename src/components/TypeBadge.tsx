import React from 'react';
import { ItemType } from '../types';

const styles: Record<ItemType, React.CSSProperties> = {
  dashboard: {
    background: '#1a6de6',
    color: '#fff',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    display: 'inline-block',
  },
  workflow: {
    background: '#6b21a8',
    color: '#fff',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    display: 'inline-block',
  },
};

interface TypeBadgeProps {
  type: ItemType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span style={styles[type]}>
      {type === 'dashboard' ? 'Dashboard' : 'Workflow'}
    </span>
  );
}
