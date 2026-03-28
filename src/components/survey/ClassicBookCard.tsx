'use client';

import { useState } from 'react';
import { addClassicToQueue } from '@/actions/bookSurveyActions';
import type { ClassicBook } from '@/services/BookSurveyService';

interface Props {
  book: ClassicBook;
  skillLabelMap: Record<string, string>;
  highlight?: boolean;
}

export default function ClassicBookCard({ book, skillLabelMap, highlight }: Props) {
  const [queued, setQueued] = useState(book.alreadyResponded);
  const [loading, setLoading] = useState(false);

  async function handleQueue() {
    setLoading(true);
    await addClassicToQueue(book.id);
    setQueued(true);
    setLoading(false);
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '1rem',
        background: highlight ? '#fffbeb' : '#fff',
        border: `1px solid ${highlight ? '#fcd34d' : '#e5e7eb'}`,
        borderRadius: 10,
        gap: '1rem',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.125rem' }}>{book.title}</p>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>{book.author}</p>

        {book.effectiveSkillIds.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {book.effectiveSkillIds.map((sid) => (
              <span
                key={sid}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.125rem 0.5rem',
                  background: '#f3f4f6',
                  borderRadius: 4,
                  color: '#374151',
                }}
              >
                {skillLabelMap[sid] ?? sid}
              </span>
            ))}
          </div>
        )}

        {book.surveyCount >= 10 && (
          <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.375rem' }}>
            {book.surveyCount}人が回答
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flexShrink: 0 }}>
        {!queued ? (
          <button
            onClick={handleQueue}
            disabled={loading}
            style={{
              padding: '0.375rem 0.75rem',
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.75rem',
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            積読に追加
          </button>
        ) : (
          <span
            style={{
              padding: '0.375rem 0.75rem',
              background: '#f3f4f6',
              color: '#6b7280',
              borderRadius: 6,
              fontSize: '0.75rem',
              textAlign: 'center',
            }}
          >
            追加済み
          </span>
        )}
        {book.isbn && (
          <>
            <a
              href={`https://books.rakuten.co.jp/rb/${book.isbn}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.375rem 0.75rem',
                background: '#bf0000',
                color: '#fff',
                borderRadius: 6,
                fontSize: '0.75rem',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              楽天で見る
            </a>
            <a
              href={`https://www.amazon.co.jp/s?k=${book.isbn}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.375rem 0.75rem',
                background: '#ff9900',
                color: '#000',
                borderRadius: 6,
                fontSize: '0.75rem',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Amazonで見る
            </a>
          </>
        )}
      </div>
    </div>
  );
}
