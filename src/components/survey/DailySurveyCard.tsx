'use client';

import { useState } from 'react';
import { respondToSurvey, addClassicToQueue } from '@/actions/bookSurveyActions';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';

const ALL_SKILLS = Object.values(SKILL_FRAMEWORK).flat();

interface Props {
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string | null;
    effectiveSkillIds: SkillId[];
    surveyCount: number;
  };
}

export default function DailySurveyCard({ book }: Props) {
  const [step, setStep] = useState<'initial' | 'read-detail' | 'done'>('initial');
  const [selectedSkills, setSelectedSkills] = useState<SkillId[]>([]);
  const [skillLevel, setSkillLevel] = useState<number>(3);
  const [loading, setLoading] = useState(false);

  async function handleSkip() {
    setLoading(true);
    await respondToSurvey(book.id, 'skipped', [], null);
    setStep('done');
    setLoading(false);
  }

  async function handleQueue() {
    setLoading(true);
    await addClassicToQueue(book.id);
    setStep('done');
    setLoading(false);
  }

  async function handleReadSubmit() {
    setLoading(true);
    await respondToSurvey(book.id, 'read', selectedSkills, skillLevel);
    setStep('done');
    setLoading(false);
  }

  function toggleSkill(skillId: SkillId) {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  }

  if (step === 'done') return null;

  const skillLabelMap = ALL_SKILLS.reduce<Record<string, string>>(
    (acc, s) => ({ ...acc, [s.id]: s.label }),
    {}
  );

  return (
    <section
      style={{
        padding: '1.25rem',
        background: '#fffbeb',
        border: '1px solid #fcd34d',
        borderRadius: 10,
        marginBottom: '2rem',
      }}
    >
      <p style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '600', marginBottom: '0.5rem' }}>
        📚 今日の名著アンケート
      </p>

      <p style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.125rem' }}>
        {book.title}
      </p>
      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>{book.author}</p>

      {book.effectiveSkillIds.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
          {book.effectiveSkillIds.map((sid) => (
            <span
              key={sid}
              style={{
                fontSize: '0.7rem',
                padding: '0.125rem 0.5rem',
                background: '#fff',
                border: '1px solid #fcd34d',
                borderRadius: 4,
                color: '#92400e',
              }}
            >
              {skillLabelMap[sid] ?? sid}
            </span>
          ))}
        </div>
      )}

      {book.isbn && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
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
            }}
          >
            Amazonで見る
          </a>
        </div>
      )}

      {step === 'initial' && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStep('read-detail')}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            読んだ
          </button>
          <button
            onClick={handleQueue}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: '#fff',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            積読に追加
          </button>
          <button
            onClick={handleSkip}
            disabled={loading}
            style={{
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              color: '#9ca3af',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            スキップ
          </button>
        </div>
      )}

      {step === 'read-detail' && (
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            どのスキルが伸びましたか？（複数選択可）
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.25rem',
              marginBottom: '0.75rem',
            }}
          >
            {ALL_SKILLS.map((skill) => (
              <label
                key={skill.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill.id as SkillId)}
                  onChange={() => toggleSkill(skill.id as SkillId)}
                  style={{ flexShrink: 0 }}
                />
                {skill.label}
              </label>
            ))}
          </div>

          <p style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.375rem', color: '#374151' }}>
            読んだ時点のスキルレベル
          </p>
          <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setSkillLevel(n)}
                style={{
                  width: 36,
                  height: 36,
                  border: `2px solid ${skillLevel === n ? '#1a1a1a' : '#d1d5db'}`,
                  borderRadius: 6,
                  background: skillLevel === n ? '#1a1a1a' : '#fff',
                  color: skillLevel === n ? '#fff' : '#374151',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleReadSubmit}
              disabled={loading || selectedSkills.length === 0}
              style={{
                padding: '0.5rem 1rem',
                background: selectedSkills.length === 0 ? '#9ca3af' : '#1a1a1a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: '0.8rem',
                cursor: selectedSkills.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              送信する
            </button>
            <button
              onClick={() => setStep('initial')}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                color: '#6b7280',
                border: 'none',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              戻る
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
