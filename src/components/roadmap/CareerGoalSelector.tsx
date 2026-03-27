'use client';

import { useState } from 'react';
import { CAREER_PATHS } from '@/constants/CAREER_PATHS';
import { updateCareerGoal } from '@/actions/profileActions';

interface Props {
  currentGoal: string | null;
}

export default function CareerGoalSelector({ currentGoal }: Props) {
  const [selected, setSelected] = useState(currentGoal ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    await updateCareerGoal(selected);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.75rem' }}>
        目標キャリアを選択してください
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {CAREER_PATHS.map((path) => (
          <button
            key={path.id}
            onClick={() => setSelected(path.id)}
            style={{
              padding: '0.625rem 0.75rem',
              border: `2px solid ${selected === path.id ? '#1a1a1a' : '#e5e7eb'}`,
              borderRadius: 8,
              background: selected === path.id ? '#1a1a1a' : '#fff',
              color: selected === path.id ? '#fff' : '#374151',
              fontSize: '0.8rem',
              fontWeight: selected === path.id ? 'bold' : 'normal',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {path.label}
          </button>
        ))}
      </div>

      {selected && selected !== currentGoal && (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.5rem 1.25rem',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          {saved ? '保存しました' : saving ? '保存中...' : '目標を設定する'}
        </button>
      )}
    </div>
  );
}
