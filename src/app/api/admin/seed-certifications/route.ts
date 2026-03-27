import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CERTIFICATIONS = [
  { name: 'People Analytics Certificate', provider: 'AIHR', skillIds: ['data_literacy', 'hr_metrics', 'data_visualization', 'causal_inference'], level: 3 },
  { name: 'Organizational Development Certificate', provider: 'AIHR', skillIds: ['org_diagnosis', 'change_management', 'culture_engagement', 'ld_design'], level: 3 },
  { name: 'HR Business Partner Certificate', provider: 'AIHR', skillIds: ['stakeholder_mgmt', 'people_strategy', 'change_management', 'org_effectiveness'], level: 3 },
  { name: 'Learning & Development Certificate', provider: 'AIHR', skillIds: ['ld_design', 'facilitation', 'survey_design'], level: 3 },
  { name: 'Strategic HR Leadership Certificate', provider: 'AIHR', skillIds: ['people_strategy', 'evidence_based_hr', 'org_effectiveness', 'employee_listening'], level: 4 },
  { name: 'HR Data Analyst Certificate', provider: 'AIHR', skillIds: ['data_literacy', 'hr_metrics', 'data_visualization', 'factor_analysis'], level: 3 },
  { name: 'Digital HR Certificate', provider: 'AIHR', skillIds: ['hris_tech', 'data_literacy', 'workforce_planning'], level: 3 },
  { name: 'SHRM-CP (Certified Professional)', provider: 'SHRM', skillIds: ['people_strategy', 'stakeholder_mgmt', 'change_management', 'evidence_based_hr'], level: 3 },
  { name: 'SHRM-SCP (Senior Certified Professional)', provider: 'SHRM', skillIds: ['people_strategy', 'org_effectiveness', 'change_management', 'evidence_based_hr'], level: 4 },
  { name: 'PHR (Professional in Human Resources)', provider: 'HRCI', skillIds: ['people_strategy', 'stakeholder_mgmt', 'evidence_based_hr'], level: 3 },
  { name: 'SPHR (Senior Professional in Human Resources)', provider: 'HRCI', skillIds: ['people_strategy', 'org_effectiveness', 'employee_listening'], level: 4 },
  { name: 'Google Data Analytics Certificate', provider: 'Coursera / Google', skillIds: ['data_literacy', 'data_visualization', 'factor_analysis'], level: 2 },
  { name: '社会保険労務士（社労士）', provider: '国家資格', skillIds: ['people_strategy', 'evidence_based_hr'], level: 3 },
  { name: 'Workforce Analytics Certificate', provider: 'AIHR', skillIds: ['workforce_planning', 'data_literacy', 'hr_metrics', 'causal_inference'], level: 4 },
  { name: 'Employee Experience Certificate', provider: 'AIHR', skillIds: ['employee_listening', 'culture_engagement', 'survey_design'], level: 3 },
];

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let seeded = 0;
    for (const cert of CERTIFICATIONS) {
      const existing = await prisma.certification.findFirst({
        where: { name: cert.name, provider: cert.provider },
      });
      if (!existing) {
        await prisma.certification.create({ data: cert });
        seeded++;
      }
    }
    return NextResponse.json({ seeded });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[admin/seed-certifications] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
