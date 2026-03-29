'use client';

import { useState, useTransition, useEffect } from 'react';
import type { Article, ArticleDifficulty } from '@/types/article';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/constants/FEED_LABELS';
import { addToQueue } from '@/actions/learningActions';

const DISMISSED_KEY = 'dismissed_articles';

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
  isRecommended?: boolean;
}

export function ArticleCard({ article, sourceName, isQueued = false, isRecommended = false }: ArticleCardProps) {
  const [queued, setQueued] = useState(isQueued);
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const badgeColor = DIFFICULTY_COLORS[article.difficulty];

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? '[]') as string[];
      if (stored.includes(article.id)) setDismissed(true);
    } catch {}
  }, [article.id]);

  function handleQueue(e: React.MouseEvent) {
    e.preventDefault();
    if (queued) return;
    setQueued(true);
    startTransition(async () => {
      await addToQueue(article.id);
    });
  }

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? '[]') as string[];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...new Set([...stored, article.id])]));
    } catch {}
    setDismissed(true);
  }

  if (dismissed) return null;

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
        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {CATEGORY_LABELS[article.category]}
          </span>
          {isRecommended && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fcd34d',
              whiteSpace: 'nowrap',
            }}>
              ⭐ おすすめ
            </span>
          )}
        </div>
        <button
          onClick={handleDismiss}
          style={{
            fontSize: '0.7rem',
            padding: '0.125rem 0.5rem',
            borderRadius: 4,
            border: '1px solid #e5e7eb',
            background: '#fff',
            color: '#9ca3af',
            cursor: 'pointer',
            flexShrink: 0,
            marginLeft: '0.5rem',
          }}
        >
          外す
        </button>
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
