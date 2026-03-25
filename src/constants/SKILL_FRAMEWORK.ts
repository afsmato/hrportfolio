export const SKILL_FRAMEWORK = {
  people_analytics: [
    { id: 'data_literacy', label: 'データリテラシー' },
    { id: 'hr_metrics', label: 'HRメトリクス設計・分析' },
    {
      id: 'data_visualization',
      label: 'データビジュアライゼーション・ストーリーテリング',
    },
    { id: 'survey_design', label: 'サーベイ設計・分析' },
    { id: 'hris_tech', label: 'HRIS・HRテクノロジー活用' },
    {
      id: 'workforce_planning',
      label: '予測分析・ワークフォースプランニング',
    },
    { id: 'causal_inference', label: '因果推論' },
    { id: 'factor_analysis', label: '要因分析' },
  ],
  organizational_development: [
    { id: 'org_diagnosis', label: '組織診断・アセスメント' },
    { id: 'change_management', label: 'チェンジマネジメント' },
    { id: 'facilitation', label: 'ファシリテーション・介入設計' },
    { id: 'culture_engagement', label: 'カルチャー・エンゲージメント' },
    { id: 'ld_design', label: 'L&D設計' },
    { id: 'stakeholder_mgmt', label: 'ステークホルダーマネジメント' },
  ],
  strategic_hr: [
    { id: 'evidence_based_hr', label: 'エビデンスベースドHR' },
    { id: 'org_effectiveness', label: '組織有効性の測定・改善' },
    { id: 'employee_listening', label: 'エンプロイーリスニング戦略' },
    { id: 'people_strategy', label: '人材戦略・経営への提言' },
  ],
} as const;

export type SkillId =
  (typeof SKILL_FRAMEWORK)[keyof typeof SKILL_FRAMEWORK][number]['id'];

export type SkillArea = keyof typeof SKILL_FRAMEWORK;
