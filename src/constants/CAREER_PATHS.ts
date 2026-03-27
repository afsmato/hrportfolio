import type { SkillId } from './SKILL_FRAMEWORK';

export interface CareerPath {
  id: string;
  label: string;
  description: string;
  requiredSkills: Partial<Record<SkillId, number>>; // 必要スキルレベル（記載がないものは対象外）
  keySkills: SkillId[]; // 特に重要なスキル（Top3）
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'people_analytics_manager',
    label: 'People Analytics Manager',
    description: 'データドリブンなHR意思決定を組織全体で推進するリーダー',
    requiredSkills: {
      data_literacy: 4,
      hr_metrics: 4,
      data_visualization: 4,
      survey_design: 3,
      hris_tech: 3,
      workforce_planning: 3,
      causal_inference: 3,
      factor_analysis: 3,
      evidence_based_hr: 4,
      org_effectiveness: 3,
      people_strategy: 3,
    },
    keySkills: ['data_literacy', 'hr_metrics', 'causal_inference'],
  },
  {
    id: 'hrbp',
    label: 'HR Business Partner (HRBP)',
    description: '事業部門と戦略的パートナーシップを築き、組織課題を解決するHRプロ',
    requiredSkills: {
      org_diagnosis: 3,
      change_management: 4,
      stakeholder_mgmt: 4,
      evidence_based_hr: 3,
      org_effectiveness: 3,
      employee_listening: 3,
      people_strategy: 4,
      hr_metrics: 3,
      data_literacy: 3,
    },
    keySkills: ['stakeholder_mgmt', 'change_management', 'people_strategy'],
  },
  {
    id: 'chro',
    label: 'Chief Human Resources Officer (CHRO)',
    description: '人材戦略を経営の核として推進する最高人事責任者',
    requiredSkills: {
      data_literacy: 4,
      hr_metrics: 4,
      workforce_planning: 4,
      org_diagnosis: 4,
      change_management: 5,
      culture_engagement: 4,
      stakeholder_mgmt: 5,
      evidence_based_hr: 4,
      org_effectiveness: 4,
      employee_listening: 4,
      people_strategy: 5,
    },
    keySkills: ['people_strategy', 'change_management', 'stakeholder_mgmt'],
  },
  {
    id: 'od_consultant',
    label: 'Organizational Development Consultant',
    description: '組織の健全性と変革能力を高める専門コンサルタント',
    requiredSkills: {
      org_diagnosis: 4,
      change_management: 4,
      facilitation: 4,
      culture_engagement: 4,
      ld_design: 3,
      stakeholder_mgmt: 4,
      evidence_based_hr: 3,
      org_effectiveness: 4,
      employee_listening: 3,
      survey_design: 3,
    },
    keySkills: ['org_diagnosis', 'facilitation', 'change_management'],
  },
  {
    id: 'ld_manager',
    label: 'L&D Manager',
    description: '組織の学習能力を高め、人材育成戦略を推進するマネージャー',
    requiredSkills: {
      ld_design: 5,
      facilitation: 4,
      survey_design: 3,
      data_literacy: 3,
      hr_metrics: 3,
      culture_engagement: 3,
      stakeholder_mgmt: 3,
      evidence_based_hr: 3,
      org_effectiveness: 3,
    },
    keySkills: ['ld_design', 'facilitation', 'evidence_based_hr'],
  },
  {
    id: 'talent_acquisition_manager',
    label: 'Talent Acquisition Manager',
    description: '採用戦略を設計・実行し、優秀な人材を組織に惹きつけるマネージャー',
    requiredSkills: {
      data_literacy: 3,
      hr_metrics: 3,
      hris_tech: 3,
      workforce_planning: 4,
      stakeholder_mgmt: 3,
      people_strategy: 3,
      employee_listening: 3,
    },
    keySkills: ['workforce_planning', 'hris_tech', 'hr_metrics'],
  },
  {
    id: 'hr_tech_specialist',
    label: 'HR Tech Specialist',
    description: 'HRテクノロジーの導入・活用で人事業務のデジタル変革を推進するスペシャリスト',
    requiredSkills: {
      data_literacy: 4,
      hr_metrics: 3,
      data_visualization: 3,
      hris_tech: 5,
      workforce_planning: 3,
      evidence_based_hr: 3,
      people_strategy: 3,
    },
    keySkills: ['hris_tech', 'data_literacy', 'data_visualization'],
  },
];
