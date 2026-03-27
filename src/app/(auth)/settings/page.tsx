import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import DomainSelector from '@/components/settings/DomainSelector';

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, domain: true },
  });

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>設定</h1>

      {/* プロフィール情報 */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '0.75rem' }}>
          アカウント情報
        </h2>
        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: 8 }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            <span style={{ color: '#6b7280', marginRight: '0.5rem' }}>名前:</span>
            {user?.name}
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            <span style={{ color: '#6b7280', marginRight: '0.5rem' }}>メール:</span>
            {user?.email}
          </p>
        </div>
      </section>

      {/* 専門領域選択 */}
      <section>
        <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '0.5rem' }}>
          専門領域
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1rem' }}>
          あなたのHRキャリアの専門領域を選択してください。フィードやレコメンドの最適化に活用されます。
        </p>
        <DomainSelector currentDomain={user?.domain ?? 'people_analytics_od'} />
      </section>
    </main>
  );
}
