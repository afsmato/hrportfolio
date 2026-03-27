'use client';

import { useState, useTransition } from 'react';
import { addBookToQueue } from '@/actions/learningActions';
import type { RakutenBookItem } from '@/lib/rakuten';

export default function BookSearchForm() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RakutenBookItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [queuedIsbns, setQueuedIsbns] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      const data = await res.json() as { items: RakutenBookItem[] };
      setResults(data.items ?? []);
    } finally {
      setSearching(false);
    }
  }

  function handleAdd(book: RakutenBookItem) {
    const key = book.isbn || book.itemCode;
    if (queuedIsbns.has(key)) return;
    setQueuedIsbns((prev) => new Set([...prev, key]));
    startTransition(async () => {
      await addBookToQueue(book);
    });
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>書籍を検索して追加</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="タイトル・著者で検索..."
          style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem' }}
        />
        <button
          type="submit"
          disabled={searching || isPending}
          style={{ padding: '0.5rem 1rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem' }}
        >
          {searching ? '検索中...' : '検索'}
        </button>
      </form>

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {results.map((book) => {
            const key = book.isbn || book.itemCode;
            const isQueued = queuedIsbns.has(key);
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
                {book.largeImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.largeImageUrl} alt={book.title} style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.125rem' }}>{book.title}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{book.author}</p>
                </div>
                <button
                  onClick={() => handleAdd(book)}
                  disabled={isQueued}
                  style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: 6, border: '1px solid #d1d5db', background: isQueued ? '#f3f4f6' : '#fff', color: isQueued ? '#9ca3af' : '#374151', cursor: isQueued ? 'default' : 'pointer' }}
                >
                  {isQueued ? '✓ 追加済み' : '追加'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
