'use client';

import { useState } from 'react';
import { updateSummary, confirmArchive } from '@/actions/archiveActions';

interface Props {
  archive: {
    id: string;
    period: string;
    periodStart: Date;
    periodEnd: Date;
    summary: string;
    isConfirmed: boolean;
    createdAt: Date;
  };
}

export default function ArchiveCard({ archive }: Props) {
  const [summary, setSummary] = useState(archive.summary);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const periodLabel = (() => {
    const [year, month] = archive.period.split('-');
    return `${year}年${parseInt(month)}月`;
  })();

  async function handleSave() {
    setSaving(true);
    await updateSummary(archive.id, summary);
    setEditing(false);
    setSaving(false);
  }

  async function handleConfirm() {
    setSaving(true);
    await confirmArchive(archive.id);
    setSaving(false);
  }

  return (
    <div
      style={{
        padding: '1.25rem',
        border: `1px solid ${archive.isConfirmed ? '#86efac' : '#e5e7eb'}`,
        borderRadius: 10,
        background: archive.isConfirmed ? '#f0fdf4' : '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{periodLabel}</h3>
          {archive.isConfirmed && (
            <span style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', background: '#dcfce7', color: '#15803d', borderRadius: 4 }}>
              確定済み
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          {archive.createdAt.toLocaleDateString('ja-JP')}
        </span>
      </div>

      {editing ? (
        <div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={6}
            style={{
              width: '100%',
              padding: '0.625rem',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: '0.875rem',
              lineHeight: 1.6,
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.5rem 1rem',
                background: '#1a1a1a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              保存
            </button>
            <button
              onClick={() => { setSummary(archive.summary); setEditing(false); }}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                color: '#6b7280',
                border: 'none',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#374151', whiteSpace: 'pre-wrap' }}>
            {summary}
          </p>

          {!archive.isConfirmed && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                編集
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                確定してアーカイブ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
