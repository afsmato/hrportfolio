import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HRPortfolio',
  description: 'HR専門家向けスキル管理・学習ポートフォリオアプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
