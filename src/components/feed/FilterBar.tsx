'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { ArticleCategory } from '@/constants/ARTICLE_SOURCES';
import type { ArticleDifficulty } from '@/types/article';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/constants/FEED_LABELS';

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') ?? '';
  const currentDifficulty = searchParams.get('difficulty') ?? '';

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/feed?${params.toString()}`);
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      <select
        value={currentCategory}
        onChange={(e) => applyFilter('category', e.target.value)}
        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
      >
        <option value="">すべてのカテゴリ</option>
        {(Object.entries(CATEGORY_LABELS) as [ArticleCategory, string][]).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={currentDifficulty}
        onChange={(e) => applyFilter('difficulty', e.target.value)}
        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
      >
        <option value="">すべての難易度</option>
        {(Object.entries(DIFFICULTY_LABELS) as [ArticleDifficulty, string][]).map(
          ([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          )
        )}
      </select>
    </div>
  );
}
