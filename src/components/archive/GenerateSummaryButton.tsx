'use client';

import { useState } from 'react';
import { generateCurrentMonthSummary } from '@/actions/archiveActions';

export default function GenerateSummaryButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setMessage('');
    const result = await generateCurrentMonthSummary();
    setMessage(result.message);
    setLoading(false);
  }

  return (
    <div style={{ textAlign: 'right' }}>
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          background: loading ? '#9ca3af' : '#1a1a1a',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: '0.8rem',
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? '生成中...' : '今月のサマリを生成'}
      </button>
      {message && (
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.375rem' }}>{message}</p>
      )}
    </div>
  );
}
