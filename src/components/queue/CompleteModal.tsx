'use client';

import { useState, useTransition } from 'react';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import { completeItem } from '@/actions/learningActions';

const AREA_LABELS: Record<keyof typeof SKILL_FRAMEWORK, string> = {
  people_analytics: 'People Analytics',
  organizational_development: '組織開発',
  strategic_hr: '戦略人事',
};

type Props = {
  itemId: string;
  defaultSkillIds: SkillId[];
  onClose: () => void;
  onCompleted: () => void;
};

export default function CompleteModal({ itemId, defaultSkillIds, onClose, onCompleted }: Props) {
  const [memo, setMemo] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Set<SkillId>>(new Set(defaultSkillIds));
  const [isPending, startTransition] = useTransition();

  function toggleSkill(skillId: SkillId) {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await completeItem(itemId, memo, [...selectedSkills]);
      onCompleted();
    });
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.25rem' }}>読了として記録する</h2>

        {/* メモ */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            振り返りメモ <span style={{ fontWeight: 400, color: '#6b7280' }}>（任意・500字以内）</span>
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="学んだこと、気づきなどを自由に記録してください"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'right' }}>{memo.length} / 500</p>
        </div>

        {/* スキル選択 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            関連スキル <span style={{ fontWeight: 400, color: '#6b7280' }}>（学びに関連するスキルを選択）</span>
          </p>
          {(Object.keys(SKILL_FRAMEWORK) as (keyof typeof SKILL_FRAMEWORK)[]).map((area) => (
            <div key={area} style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.375rem' }}>
                {AREA_LABELS[area]}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {SKILL_FRAMEWORK[area].map((skill) => {
                  const checked = selectedSkills.has(skill.id as SkillId);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id as SkillId)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.625rem',
                        borderRadius: 9999,
                        border: '1px solid',
                        borderColor: checked ? '#1a1a1a' : '#d1d5db',
                        background: checked ? '#1a1a1a' : '#fff',
                        color: checked ? '#fff' : '#374151',
                        cursor: 'pointer',
                      }}
                    >
                      {skill.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ボタン */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isPending}
            style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: 6, background: '#1a1a1a', color: '#fff', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1 }}
          >
            {isPending ? '保存中...' : '読了として保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
