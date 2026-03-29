'use client';

import { useState } from 'react';
import { SKILL_FRAMEWORK } from '@/constants/SKILL_FRAMEWORK';
import type { SkillId } from '@/constants/SKILL_FRAMEWORK';
import CompleteModal from './CompleteModal';

const SKILL_LABEL_MAP: Record<string, string> = Object.values(SKILL_FRAMEWORK)
  .flat()
  .reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});

type Props = {
  item: {
    id: string;
    type: string;
    status: string;
    skillIds: SkillId[];
    memo: string | null;
    completedAt: Date | null;
    createdAt: Date;
    article: { id: string; title: string; url: string; category: string; summary: string } | null;
    book: { id: string; title: string; author: string; isbn: string | null; claudeSkillTags: unknown } | null;
  };
};

export default function LearningItemCard({ item }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [completed, setCompleted] = useState(item.status === 'completed');

  const isBook = item.type === 'book';
  const title = item.article?.title ?? item.book?.title ?? '（タイトル不明）';
  const url = item.article?.url;
  const date = completed && item.completedAt ? item.completedAt : item.createdAt;
  const dateLabel = completed ? '読了日' : '追加日';
  const bookSkillTags = isBook ? (item.book?.claudeSkillTags as string[] ?? []) : [];

  return (
    <>
      <div style={{ padding: '1rem 1.25rem', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer"
                style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111', textDecoration: 'none', display: 'block', marginBottom: '0.25rem' }}>
                {title}
              </a>
            ) : (
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{title}</p>
            )}

            {isBook && item.book?.author && (
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.375rem' }}>{item.book.author}</p>
            )}

            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
              {dateLabel}: {date.toLocaleDateString('ja-JP')}
            </p>

            {/* 書籍のスキルタグ */}
            {isBook && bookSkillTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {bookSkillTags.map((sid) => (
                  <span key={sid} style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', borderRadius: 9999, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                    {SKILL_LABEL_MAP[sid] ?? sid}
                  </span>
                ))}
              </div>
            )}

            {/* 記事のスキルタグ */}
            {!isBook && item.skillIds.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {item.skillIds.map((sid) => (
                  <span key={sid} style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', borderRadius: 9999, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                    {SKILL_LABEL_MAP[sid] ?? sid}
                  </span>
                ))}
              </div>
            )}

            {/* 書籍の購入リンク */}
            {isBook && item.book && (
              <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem' }}>
                <a
                  href={item.book.isbn ? `https://books.rakuten.co.jp/rb/${item.book.isbn}/` : `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(item.book.title)}/`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 4, background: '#bf0000', color: '#fff', textDecoration: 'none' }}
                >
                  楽天で見る
                </a>
                <a
                  href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(item.book.isbn ?? item.book.title)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 4, background: '#ff9900', color: '#000', textDecoration: 'none' }}
                >
                  Amazonで見る
                </a>
              </div>
            )}

            {/* 記事サマリー */}
            {item.article?.summary && (
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                {item.article.summary}
              </p>
            )}

            {item.memo && (
              <p style={{ fontSize: '0.8rem', color: '#4b5563', background: '#f9fafb', padding: '0.5rem 0.75rem', borderRadius: 6, borderLeft: '3px solid #d1d5db' }}>
                {item.memo}
              </p>
            )}
          </div>

          {!completed && (
            <button
              onClick={() => setShowModal(true)}
              style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid #1a1a1a', background: '#fff', cursor: 'pointer' }}
            >
              読了にする
            </button>
          )}

          {completed && (
            <span style={{ fontSize: '0.75rem', color: '#22c55e', whiteSpace: 'nowrap', fontWeight: 600 }}>✓ 読了</span>
          )}
        </div>
      </div>

      {showModal && (
        <CompleteModal
          itemId={item.id}
          defaultSkillIds={item.skillIds}
          onClose={() => setShowModal(false)}
          onCompleted={() => { setShowModal(false); setCompleted(true); }}
        />
      )}
    </>
  );
}
