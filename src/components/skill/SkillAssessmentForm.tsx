'use client';

import { useTransition } from 'react';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import { saveSkillAssessments } from '@/actions/skillActions';

const AREA_LABELS: Record<keyof typeof SKILL_FRAMEWORK, string> = {
  people_analytics: 'People Analytics',
  organizational_development: '組織開発',
  strategic_hr: '戦略人事（People Analytics × OD）',
};

const LEVEL_LABELS: Record<number, string> = {
  1: '知らない / 未経験',
  2: '知っている（概念理解）',
  3: '補助的にできる（経験あり・一人では不完全）',
  4: '独力でできる（実務経験あり）',
  5: '教えられる / 応用できる（専門性あり）',
};

type Props = {
  defaultValues: Partial<Record<SkillId, number>>;
};

export default function SkillAssessmentForm({ defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const scores: Record<string, number> = {};
    for (const [key, value] of formData.entries()) {
      scores[key] = Number(value);
    }
    startTransition(async () => {
      await saveSkillAssessments(scores as Record<SkillId, number>);
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        スキル自己評価
      </h1>

      {/* 凡例 */}
      <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem', marginBottom: '2rem', fontSize: '0.875rem' }}>
        <strong>評価レベルの目安:</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          {Object.entries(LEVEL_LABELS).map(([level, label]) => (
            <li key={level}><strong>{level}</strong>: {label}</li>
          ))}
        </ul>
      </div>

      {(Object.keys(SKILL_FRAMEWORK) as (keyof typeof SKILL_FRAMEWORK)[]).map((area) => (
        <section key={area} style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            {AREA_LABELS[area]}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {SKILL_FRAMEWORK[area].map((skill) => (
              <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ minWidth: 220, fontSize: '0.9rem' }}>{skill.label}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <label key={level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={skill.id}
                        value={level}
                        defaultChecked={defaultValues[skill.id as SkillId] === level}
                        required
                      />
                      <span style={{ fontSize: '0.75rem' }}>{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: '0.75rem 2rem',
          background: '#1a1a1a',
          color: '#fff',
          borderRadius: 8,
          border: 'none',
          cursor: isPending ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? '保存中...' : '評価を保存する'}
      </button>
    </form>
  );
}
