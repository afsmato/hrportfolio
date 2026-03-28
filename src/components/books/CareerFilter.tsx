'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CAREER_PATHS } from '@/constants/CAREER_PATHS';

export default function CareerFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get('career') ?? '';

  function select(careerId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (careerId === selected) {
      params.delete('career');
    } else {
      params.set('career', careerId);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.625rem' }}>
        目標キャリアで絞り込む
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {CAREER_PATHS.map((career) => (
          <button
            key={career.id}
            onClick={() => select(career.id)}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              borderRadius: 9999,
              border: `1px solid ${selected === career.id ? '#1a1a1a' : '#d1d5db'}`,
              background: selected === career.id ? '#1a1a1a' : '#fff',
              color: selected === career.id ? '#fff' : '#374151',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {career.label}
          </button>
        ))}
      </div>
    </div>
  );
}
