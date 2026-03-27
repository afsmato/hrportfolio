import { auth } from '@/auth';
import { SummaryService } from '@/services/SummaryService';
import ArchiveCard from '@/components/archive/ArchiveCard';
import GenerateSummaryButton from '@/components/archive/GenerateSummaryButton';

export default async function ArchivePage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const service = new SummaryService();
  const archives = await service.getUserArchives(userId);

  const confirmed = archives.filter((a) => a.isConfirmed);
  const drafts = archives.filter((a) => !a.isConfirmed);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>学習サマリアーカイブ</h1>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
            月次の学習を言語化し、成長を記録する
          </p>
        </div>
        <GenerateSummaryButton />
      </div>

      {/* ドラフト */}
      {drafts.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '0.75rem' }}>
            未確定のサマリ
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {drafts.map((archive) => (
              <ArchiveCard key={archive.id} archive={archive} />
            ))}
          </div>
        </section>
      )}

      {/* 確定済みアーカイブ */}
      {confirmed.length > 0 ? (
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '0.75rem' }}>
            確定済みアーカイブ
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {confirmed.map((archive) => (
              <ArchiveCard key={archive.id} archive={archive} />
            ))}
          </div>
        </section>
      ) : drafts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f9fafb', borderRadius: 12 }}>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>サマリがまだありません。</p>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            毎月1日に自動生成されます。今月のサマリを今すぐ生成することもできます。
          </p>
        </div>
      ) : null}
    </main>
  );
}
