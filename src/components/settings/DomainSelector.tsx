'use client';

import { useState } from 'react';
import { DOMAIN_OPTIONS } from '@/constants/DOMAIN_OPTIONS';
import { updateDomain } from '@/actions/profileActions';

interface Props {
  currentDomain: string;
}

export default function DomainSelector({ currentDomain }: Props) {
  const [selected, setSelected] = useState(currentDomain);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateDomain(selected);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1rem' }}>
        {DOMAIN_OPTIONS.map((domain) => (
          <label
            key={domain.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              border: `2px solid ${selected === domain.id ? '#1a1a1a' : '#e5e7eb'}`,
              borderRadius: 8,
              cursor: 'pointer',
              background: selected === domain.id ? '#f9fafb' : '#fff',
            }}
          >
            <input
              type="radio"
              name="domain"
              value={domain.id}
              checked={selected === domain.id}
              onChange={() => setSelected(domain.id)}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <p style={{ fontWeight: selected === domain.id ? 'bold' : 'normal', fontSize: '0.9rem', marginBottom: '0.125rem' }}>
                {domain.label}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{domain.description}</p>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || selected === currentDomain}
        style={{
          padding: '0.625rem 1.5rem',
          background: saving || selected === currentDomain ? '#9ca3af' : '#1a1a1a',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: '0.875rem',
          cursor: saving || selected === currentDomain ? 'not-allowed' : 'pointer',
        }}
      >
        {saved ? '保存しました' : saving ? '保存中...' : '変更を保存'}
      </button>
    </div>
  );
}
