export const DOMAIN_OPTIONS = [
  {
    id: 'people_analytics_od',
    label: 'People Analytics × 組織開発',
    description: 'データ分析・HR指標設計・組織診断・チェンジマネジメントを専門とする',
  },
  {
    id: 'compensation_benefits',
    label: '報酬・ベネフィット',
    description: '給与制度設計・インセンティブプログラム・福利厚生戦略を専門とする',
  },
  {
    id: 'labor_relations',
    label: '労務・労働法',
    description: '労働法令・就業規則・労使関係・コンプライアンスを専門とする',
  },
  {
    id: 'talent_acquisition',
    label: 'タレントアクイジション（採用）',
    description: '採用戦略・候補者体験・ブランディング・採用技術を専門とする',
  },
  {
    id: 'ld_specialist',
    label: 'L&D専門',
    description: '学習設計・研修開発・タレントマネジメント・スキル開発を専門とする',
  },
  {
    id: 'hr_tech_hris',
    label: 'HR Tech / HRIS専門',
    description: 'HRシステム・HR Technology導入・デジタルHR変革を専門とする',
  },
  {
    id: 'hrbp',
    label: 'HRビジネスパートナー（HRBP）',
    description: '事業部門との戦略的パートナーシップ・組織課題解決を専門とする',
  },
] as const;

export type DomainId = (typeof DOMAIN_OPTIONS)[number]['id'];

export function getDomainLabel(domainId: string): string {
  return DOMAIN_OPTIONS.find((d) => d.id === domainId)?.label ?? domainId;
}
