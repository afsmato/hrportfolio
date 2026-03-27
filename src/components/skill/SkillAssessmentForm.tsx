'use client';

import { useState, useTransition } from 'react';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import { SKILL_GUIDE } from '@/constants/SKILL_GUIDE';
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
  previousValues?: Partial<Record<SkillId, number>>;
};

function SkillGuidePanel({ skillId, selectedLevel }: { skillId: string; selectedLevel: number | null }) {
  const guide = SKILL_GUIDE[skillId];
  if (!guide) return null;

  return (
    <div
      style={{
        marginTop: '0.5rem',
        padding: '0.75rem',
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: 6,
        fontSize: '0.8rem',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {([1, 2, 3, 4, 5] as const).map((level) => (
          <div
            key={level}
            style={{
              padding: '0.375rem 0.5rem',
              background: selectedLevel === level ? '#e0f2fe' : 'transparent',
              borderRadius: 4,
              borderLeft: selectedLevel === level ? '3px solid #0284c7' : '3px solid transparent',
            }}
          >
            <span style={{ fontWeight: 'bold', color: '#0369a1', marginRight: '0.375rem' }}>
              Lv{level}
            </span>
            <span style={{ color: '#374151' }}>{guide[level].experience}</span>
            <span style={{ color: '#6b7280', marginLeft: '0.25rem' }}>/ {guide[level].canDo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkillAssessmentForm({ defaultValues, previousValues }: Props) {
  const [isPending, startTransition] = useTransition();
  const [openGuide, setOpenGuide] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<Partial<Record<SkillId, number>>>(defaultValues);

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

  function toggleGuide(skillId: string) {
    setOpenGuide((prev) => (prev === skillId ? null : skillId));
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
        <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.8rem' }}>
          💡 各スキルの「?」ボタンで詳細な評価ガイドを確認できます
        </p>
      </div>

      {(Object.keys(SKILL_FRAMEWORK) as (keyof typeof SKILL_FRAMEWORK)[]).map((area) => (
        <section key={area} style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            {AREA_LABELS[area]}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {SKILL_FRAMEWORK[area].map((skill) => {
              const prevScore = previousValues?.[skill.id as SkillId];
              const currentScore = selectedValues[skill.id as SkillId] ?? null;
              const isGuideOpen = openGuide === skill.id;

              return (
                <div key={skill.id} style={{ flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 220 }}>
                      <span style={{ fontSize: '0.9rem' }}>{skill.label}</span>
                      <button
                        type="button"
                        onClick={() => toggleGuide(skill.id)}
                        title="評価ガイドを見る"
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: '1px solid #9ca3af',
                          background: isGuideOpen ? '#1a1a1a' : '#fff',
                          color: isGuideOpen ? '#fff' : '#6b7280',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          lineHeight: 1,
                          padding: 0,
                        }}
                      >
                        ?
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <label key={level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={skill.id}
                            value={level}
                            defaultChecked={defaultValues[skill.id as SkillId] === level}
                            required
                            onChange={() => setSelectedValues((prev) => ({ ...prev, [skill.id]: level }))}
                          />
                          <span style={{ fontSize: '0.75rem' }}>{level}</span>
                        </label>
                      ))}
                    </div>

                    {prevScore !== undefined && (
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0 }}>
                        前回: {prevScore}
                      </span>
                    )}
                  </div>

                  {isGuideOpen && (
                    <SkillGuidePanel skillId={skill.id} selectedLevel={currentScore} />
                  )}
                </div>
              );
            })}
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
