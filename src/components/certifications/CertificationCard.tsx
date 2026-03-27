'use client';

import { useState } from 'react';
import { upsertUserCertification } from '@/actions/certificationActions';

const STATUS_LABELS = {
  completed: '取得済み',
  in_progress: '学習中',
  planned: '予定',
} as const;

const STATUS_COLORS = {
  completed: { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
  in_progress: { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' },
  planned: { bg: '#fafafa', border: '#e5e7eb', text: '#6b7280' },
} as const;

interface Props {
  cert: {
    id: string;
    name: string;
    provider: string;
    skillLabels: string[];
    level: number;
    url: string | null;
  };
  userStatus: 'completed' | 'in_progress' | 'planned' | null;
  userCompletedAt: Date | null;
}

export default function CertificationCard({ cert, userStatus, userCompletedAt }: Props) {
  const [status, setStatus] = useState(userStatus);
  const [saving, setSaving] = useState(false);

  async function handleStatusChange(newStatus: 'completed' | 'in_progress' | 'planned' | null) {
    if (saving) return;
    setSaving(true);
    const s = newStatus ?? 'planned';
    await upsertUserCertification(cert.id, s, newStatus === 'completed' ? new Date() : null);
    setStatus(newStatus);
    setSaving(false);
  }

  const colors = status ? STATUS_COLORS[status] : { bg: '#fff', border: '#e5e7eb', text: '#6b7280' };

  return (
    <div
      style={{
        padding: '1rem',
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        background: colors.bg,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', background: '#f3f4f6', borderRadius: 4, color: '#374151', flexShrink: 0 }}>
              {cert.provider}
            </span>
            {status && (
              <span style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.text, flexShrink: 0 }}>
                {STATUS_LABELS[status]}
              </span>
            )}
          </div>
          <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{cert.name}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.375rem' }}>
            {cert.skillLabels.map((label) => (
              <span key={label} style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, color: '#374151' }}>
                {label}
              </span>
            ))}
          </div>
          {status === 'completed' && userCompletedAt && (
            <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
              取得: {userCompletedAt.toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>

        <select
          value={status ?? ''}
          onChange={(e) => {
            const v = e.target.value as 'completed' | 'in_progress' | 'planned' | '';
            handleStatusChange(v || null);
          }}
          disabled={saving}
          style={{
            padding: '0.375rem 0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: '0.75rem',
            background: '#fff',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <option value=''>未設定</option>
          <option value='planned'>予定</option>
          <option value='in_progress'>学習中</option>
          <option value='completed'>取得済み</option>
        </select>
      </div>
    </div>
  );
}
