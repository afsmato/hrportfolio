import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <>
      <nav style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        height: '3rem',
        background: '#fff',
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>HRPortfolio</span>
        <Link href="/dashboard" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          ダッシュボード
        </Link>
        <Link href="/feed" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          情報フィード
        </Link>
        <Link href="/queue" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          学習キュー
        </Link>
        <Link href="/books" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          書籍
        </Link>
        <Link href="/portfolio" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          ポートフォリオ
        </Link>
        <Link href="/trend" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          トレンド
        </Link>
        <Link href="/classics" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          名著
        </Link>
        <Link href="/archive" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          サマリ
        </Link>
        <Link href="/roadmap" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          ロードマップ
        </Link>
        <Link href="/certifications" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          資格
        </Link>
        <Link href="/chatbot" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          チャット
        </Link>
        <Link href="/settings" style={{ fontSize: '0.875rem', textDecoration: 'none', color: '#374151' }}>
          設定
        </Link>
      </nav>
      {children}
    </>
  );
}
