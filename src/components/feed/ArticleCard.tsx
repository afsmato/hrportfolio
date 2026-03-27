'use client';

import { useState, useTransition } from 'react';
import type { Article, ArticleDifficulty } from '@/types/article';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/constants/FEED_LABELS';
import { addToQueue } from '@/actions/learningActions';

const DIFFICULTY_COLORS: Record<ArticleDifficulty, string> = {
  beginner: '#22c55e',
  practical: '#3b82f6',
  advanced: '#f59e0b',
  expert: '#ef4444',
};

interface ArticleCardProps {
  article: Article;
  sourceName: string;
  isQueued?: boolean;
}

export function ArticleCard({ article, sourceName, isQueued = false }: ArticleCardProps) {
  const [queued, setQueued] = useState(isQueued);
  const [isPending, startTransition] = useTransition();
  const badgeColor = DIFFICULTY_COLORS[article.difficulty];

  function handleQueue(e: React.MouseEvent) {
    e.preventDefault();
    if (queued) return;
    setQueued(true);
    startTransition(async () => {
      await addToQueue(article.id);
    });
  }

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        padding: '1rem 1.25rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '0.125rem 0.5rem',
          borderRadius: '9999px',
          backgroundColor: badgeColor,
          color: '#fff',
          whiteSpace: 'nowrap',
        }}>
          {DIFFICULTY_LABELS[article.difficulty]}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.5rem' }}>
          {CATEGORY_LABELS[article.category]}
        </span>
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem', lineHeight: 1.4 }}>
        {article.title}
      </h3>

      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>{sourceName}</p>

      <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6, marginBottom: '0.75rem' }}>
        {article.summary}
      </p>

      <button
        onClick={handleQueue}
        disabled={queued || isPending}
        style={{
          fontSize: '0.75rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '0.375rem',
          border: '1px solid #d1d5db',
          background: queued ? '#f3f4f6' : '#fff',
          color: queued ? '#9ca3af' : '#374151',
          cursor: queued ? 'default' : 'pointer',
        }}
      >
        {queued ? '✓ 追加済み' : 'あとで読む'}
      </button>
    </a>
  );
}
