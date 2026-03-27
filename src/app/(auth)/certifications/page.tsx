import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK } from '@/constants/SKILL_FRAMEWORK';
import CertificationCard from '@/components/certifications/CertificationCard';

const SKILL_LABEL_MAP: Record<string, string> = Object.values(SKILL_FRAMEWORK)
  .flat()
  .reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});

export default async function CertificationsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [certifications, userCerts] = await Promise.all([
    prisma.certification.findMany({ orderBy: [{ provider: 'asc' }, { name: 'asc' }] }),
    prisma.userCertification.findMany({ where: { userId } }),
  ]);

  const userCertMap = new Map(userCerts.map((uc) => [uc.certificationId, uc]));

  const completed = certifications.filter((c) => userCertMap.get(c.id)?.status === 'completed');
  const inProgress = certifications.filter((c) => userCertMap.get(c.id)?.status === 'in_progress');
  const others = certifications.filter((c) => {
    const s = userCertMap.get(c.id)?.status;
    return s !== 'completed' && s !== 'in_progress';
  });

  function toCertProps(cert: (typeof certifications)[0]) {
    const uc = userCertMap.get(cert.id);
    return {
      cert: {
        id: cert.id,
        name: cert.name,
        provider: cert.provider,
        skillLabels: (cert.skillIds as string[]).map((s) => SKILL_LABEL_MAP[s] ?? s),
        level: cert.level,
        url: cert.url,
      },
      userStatus: (uc?.status as 'completed' | 'in_progress' | 'planned' | null) ?? null,
      userCompletedAt: uc?.completedAt ?? null,
    };
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>資格・コース</h1>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
          取得した資格・受講中のコースを記録してスキルの根拠にする
        </p>
      </div>

      {certifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f9fafb', borderRadius: 12 }}>
          <p style={{ color: '#6b7280' }}>資格データがまだ登録されていません。</p>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            管理者がシードデータを登録してください。
          </p>
        </div>
      ) : (
        <>
          {completed.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#15803d', marginBottom: '0.75rem' }}>
                取得済み ({completed.length}件)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {completed.map((cert) => <CertificationCard key={cert.id} {...toCertProps(cert)} />)}
              </div>
            </section>
          )}

          {inProgress.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1d4ed8', marginBottom: '0.75rem' }}>
                学習中 ({inProgress.length}件)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {inProgress.map((cert) => <CertificationCard key={cert.id} {...toCertProps(cert)} />)}
              </div>
            </section>
          )}

          <section>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '0.75rem' }}>
              全資格一覧 ({others.length}件)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {others.map((cert) => <CertificationCard key={cert.id} {...toCertProps(cert)} />)}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
