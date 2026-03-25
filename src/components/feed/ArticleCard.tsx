import type { Article, ArticleDifficulty } from '@/types/article';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/constants/FEED_LABELS';

const DIFFICULTY_COLORS: Record<ArticleDifficulty, string> = {
  beginner: '#22c55e',
  practical: '#3b82f6',
  advanced: '#f59e0b',
  expert: '#ef4444',
};

interface ArticleCardProps {
  article: Article;
  sourceName: string;
}

export function ArticleCard({ article, sourceName }: ArticleCardProps) {
  const badgeColor = DIFFICULTY_COLORS[article.difficulty];

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
        transition: 'box-shadow 0.15s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: badgeColor,
            color: '#fff',
            whiteSpace: 'nowrap',
          }}
        >
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

      <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{article.summary}</p>
    </a>
  );
}
