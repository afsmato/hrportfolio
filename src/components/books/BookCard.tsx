'use client';

import { useState, useTransition } from 'react';
import { SKILL_FRAMEWORK } from '@/constants/SKILL_FRAMEWORK';
import type { SkillId } from '@/constants/SKILL_FRAMEWORK';
import { addBookToQueue } from '@/actions/learningActions';
import type { RakutenBookItem } from '@/lib/rakuten';

const SKILL_LABEL_MAP: Record<string, string> = Object.values(SKILL_FRAMEWORK)
  .flat()
  .reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});

type Props = {
  book: {
    id: string;
    title: string;
    author: string;
    publisher: string;
    isbn: string | null;
    imageUrl: string | null;
    rakutenItemCode: string | null;
    claudeSkillTags: SkillId[];
  };
  isGapRelated: boolean;
  isQueued: boolean;
};

export default function BookCard({ book, isGapRelated, isQueued: initialQueued }: Props) {
  const [queued, setQueued] = useState(initialQueued);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (queued) return;
    setQueued(true);
    const rakutenItem: RakutenBookItem = {
      title: book.title,
      author: book.author,
      publisherName: book.publisher,
      salesDate: '',
      isbn: book.id,
      itemCode: book.rakutenItemCode ?? '',
      largeImageUrl: book.imageUrl ?? undefined,
      itemUrl: '',
    };
    startTransition(async () => {
      await addBookToQueue(rakutenItem);
    });
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', position: 'relative' }}>
      {isGapRelated && (
        <span style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.7rem', padding: '0.125rem 0.5rem', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 9999, color: '#92400e' }}>
          おすすめ
        </span>
      )}

      {book.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={book.imageUrl} alt={book.title} style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', lineHeight: 1.4 }}>{book.title}</p>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>{book.author} / {book.publisher}</p>

        {book.claudeSkillTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.625rem' }}>
            {book.claudeSkillTags.map((sid) => (
              <span key={sid} style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', borderRadius: 9999, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                {SKILL_LABEL_MAP[sid] ?? sid}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleAdd}
            disabled={queued || isPending}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', background: queued ? '#f3f4f6' : '#fff', color: queued ? '#9ca3af' : '#374151', cursor: queued ? 'default' : 'pointer' }}
          >
            {queued ? '✓ リストに追加済み' : '読書リストに追加'}
          </button>
          <a
            href={book.isbn ? `https://books.rakuten.co.jp/rb/${book.isbn}/` : `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(book.title)}/`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: 6, background: '#bf0000', color: '#fff', textDecoration: 'none' }}
          >
            楽天で見る
          </a>
          <a
            href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(book.isbn ?? book.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: 6, background: '#ff9900', color: '#000', textDecoration: 'none' }}
          >
            Amazonで見る
          </a>
        </div>
      </div>
    </div>
  );
}
