import { auth } from '@/auth';
import { BookSurveyService } from '@/services/BookSurveyService';
import { SKILL_FRAMEWORK } from '@/constants/SKILL_FRAMEWORK';
import ClassicBookCard from '@/components/survey/ClassicBookCard';

const SKILL_LABEL_MAP: Record<string, string> = Object.values(SKILL_FRAMEWORK)
  .flat()
  .reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});

export default async function ClassicsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const service = new BookSurveyService();
  const [recommended, all] = await Promise.all([
    service.getRecommendedClassics(userId),
    service.getAllClassics(userId),
  ]);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>HR名著データベース</h1>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
          スキルギャップに効く名著を発見しよう
        </p>
      </div>

      {/* ギャップスキル推薦 */}
      {recommended.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            あなたに効く名著
            <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '0.5rem' }}>
              （ギャップスキルと照合）
            </span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recommended.map((book) => (
              <ClassicBookCard key={book.id} book={book} skillLabelMap={SKILL_LABEL_MAP} highlight />
            ))}
          </div>
        </section>
      )}

      {/* 全名著一覧 */}
      <section>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          全名著一覧
          <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '0.5rem' }}>
            （{all.length}冊）
          </span>
        </h2>

        {all.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f9fafb', borderRadius: 12 }}>
            <p style={{ color: '#6b7280' }}>名著データがまだ登録されていません。</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {all.map((book) => (
              <ClassicBookCard key={book.id} book={book} skillLabelMap={SKILL_LABEL_MAP} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
