export type ArticleCategory =
  | 'people_analytics'
  | 'organizational_development'
  | 'hr_tech'
  | 'domestic_hr'
  | 'management_science'
  | 'labor_economics'
  | 'academic_global'
  | 'academic_domestic'
  | 'hr_consulting_global'
  | 'hr_consulting_domestic';

export interface ArticleSourceDef {
  id: string;
  name: string;
  url: string;
  category: ArticleCategory;
}

// 10カテゴリ・34ソース
// NOTE: RSS URLは実際の取得前に要確認・更新
export const ARTICLE_SOURCES: ArticleSourceDef[] = [
  // People Analytics (4ソース)
  {
    id: 'josh_bersin',
    name: 'Josh Bersin',
    url: 'https://joshbersin.com/feed/',
    category: 'people_analytics',
  },
  {
    id: 'aihr',
    name: 'AIHR',
    url: 'https://www.aihr.com/blog/feed/',
    category: 'people_analytics',
  },
  {
    id: 'myhrfuture',
    name: 'myHRfuture',
    url: 'https://www.myhrfuture.com/blog/rss.xml',
    category: 'people_analytics',
  },
  {
    id: 'visier_blog',
    name: 'Visier Blog',
    url: 'https://www.visier.com/blog/feed/',
    category: 'people_analytics',
  },

  // 組織開発 (3ソース)
  {
    id: 'od_practitioner',
    name: 'OD Practitioner',
    url: 'https://www.odnetwork.org/feed/',
    category: 'organizational_development',
  },
  {
    id: 'hbr_org',
    name: 'HBR（組織・人材系）',
    url: 'https://hbr.org/topic/subject/organizational-culture/rss',
    category: 'organizational_development',
  },
  {
    id: 'mckinsey_org',
    name: 'McKinsey Org',
    url: 'https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/rss',
    category: 'organizational_development',
  },

  // HR Tech (2ソース)
  {
    id: 'hr_technologist',
    name: 'HR Technologist',
    url: 'https://www.hrtechnologist.com/rss/',
    category: 'hr_tech',
  },
  {
    id: 'worktech_academy',
    name: 'Worktech Academy',
    url: 'https://www.worktechacademy.com/feed/',
    category: 'hr_tech',
  },

  // 国内HR (3ソース)
  {
    id: 'roji_jiho',
    name: '労政時報',
    url: 'https://www.rosei.jp/rss/',
    category: 'domestic_hr',
  },
  {
    id: 'works_report',
    name: 'Works Report（リクルートワークス研究所）',
    url: 'https://www.works-i.com/research/works-report/rss/',
    category: 'domestic_hr',
  },
  {
    id: 'hr_note',
    name: 'HR NOTE',
    url: 'https://hrnote.jp/feed/',
    category: 'domestic_hr',
  },

  // 経営学 (2ソース)
  {
    id: 'hbr_mgmt',
    name: 'Harvard Business Review',
    url: 'https://hbr.org/rss/topic/management',
    category: 'management_science',
  },
  {
    id: 'mit_sloan',
    name: 'MIT Sloan Management Review',
    url: 'https://sloanreview.mit.edu/feed/',
    category: 'management_science',
  },

  // 労働経済学 (2ソース)
  {
    id: 'nber',
    name: 'NBER Working Papers',
    url: 'https://www.nber.org/rss/new_working_papers.rss',
    category: 'labor_economics',
  },
  {
    id: 'jilpt',
    name: '日本労働研究雑誌',
    url: 'https://www.jil.go.jp/institute/zassi/rss.xml',
    category: 'labor_economics',
  },

  // 学術・論文（グローバル）(10ソース)
  {
    id: 'journal_applied_psych',
    name: 'Journal of Applied Psychology',
    url: 'https://psycnet.apa.org/rss/jour/apl',
    category: 'academic_global',
  },
  {
    id: 'academy_management',
    name: 'Academy of Management',
    url: 'https://journals.aom.org/action/showFeed?type=etoc&feed=rss&jc=amj',
    category: 'academic_global',
  },
  {
    id: 'personnel_psychology',
    name: 'Personnel Psychology',
    url: 'https://onlinelibrary.wiley.com/feed/17446570/most-recent',
    category: 'academic_global',
  },
  {
    id: 'hrm_journal',
    name: 'Human Resource Management Journal',
    url: 'https://onlinelibrary.wiley.com/feed/17488583/most-recent',
    category: 'academic_global',
  },
  {
    id: 'job_journal',
    name: 'Journal of Organizational Behavior',
    url: 'https://onlinelibrary.wiley.com/feed/10991379/most-recent',
    category: 'academic_global',
  },
  {
    id: 'jabs',
    name: 'Journal of Applied Behavioral Science',
    url: 'https://journals.sagepub.com/action/showFeed?ui=0&mi=ehikzz&ai=2dd&jc=jabsa&type=etoc&feed=rss',
    category: 'academic_global',
  },
  {
    id: 'ijhrm',
    name: 'International Journal of Human Resource Management',
    url: 'https://www.tandfonline.com/feed/rss/rijh20',
    category: 'academic_global',
  },
  {
    id: 'jle',
    name: 'Journal of Labor Economics',
    url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=jole',
    category: 'academic_global',
  },
  {
    id: 'admin_science_q',
    name: 'Administrative Science Quarterly',
    url: 'https://journals.sagepub.com/action/showFeed?ui=0&mi=ehikzz&ai=2dd&jc=asqa&type=etoc&feed=rss',
    category: 'academic_global',
  },
  {
    id: 'org_science',
    name: 'Organization Science',
    url: 'https://pubsonline.informs.org/action/showFeed?type=etoc&feed=rss&jc=orsc',
    category: 'academic_global',
  },

  // 学術・論文（国内）(3ソース)
  {
    id: 'jhrm_japan',
    name: '日本労務学会誌',
    url: 'https://www.jhrm.jp/rss/',
    category: 'academic_domestic',
  },
  {
    id: 'industrial_org_psych',
    name: '産業・組織心理学研究',
    url: 'https://www.jsiopm.org/rss/',
    category: 'academic_domestic',
  },
  {
    id: 'mgmt_behavior_sci',
    name: '経営行動科学',
    url: 'https://www.jaas.ac.jp/rss/',
    category: 'academic_domestic',
  },

  // HRコンサル（グローバル）(4ソース)
  {
    id: 'deloitte_hc',
    name: 'Deloitte Insights（Human Capital Trends）',
    url: 'https://www2.deloitte.com/us/en/insights/rss.html',
    category: 'hr_consulting_global',
  },
  {
    id: 'bcg_henderson',
    name: 'BCG Henderson Institute',
    url: 'https://www.bcg.com/rss/insights/people-organization',
    category: 'hr_consulting_global',
  },
  {
    id: 'gartner_hr',
    name: 'Gartner HR Research',
    url: 'https://www.gartner.com/en/human-resources/rss',
    category: 'hr_consulting_global',
  },
  {
    id: 'korn_ferry',
    name: 'Korn Ferry Institute',
    url: 'https://www.kornferry.com/institute/rss',
    category: 'hr_consulting_global',
  },

  // HRコンサル（国内）(1ソース)
  {
    id: 'persol_research',
    name: 'パーソル総合研究所',
    url: 'https://rc.persol-group.co.jp/thinktank/rss/',
    category: 'hr_consulting_domestic',
  },
] as const;
