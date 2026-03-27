'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Tab = 'queued' | 'completed';

type Props = {
  currentTab: Tab;
  queuedCount: number;
  completedCount: number;
};

export default function QueueTabs({ currentTab, queuedCount, completedCount }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function switchTab(tab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/queue?${params.toString()}`);
  }

  const tabStyle = (tab: Tab) => ({
    padding: '0.5rem 1.25rem',
    border: 'none',
    borderBottom: currentTab === tab ? '2px solid #1a1a1a' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontWeight: currentTab === tab ? 700 : 400,
    color: currentTab === tab ? '#111' : '#6b7280',
    fontSize: '0.9rem',
  });

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.25rem' }}>
      <button style={tabStyle('queued')} onClick={() => switchTab('queued')}>
        あとで読む（{queuedCount}）
      </button>
      <button style={tabStyle('completed')} onClick={() => switchTab('completed')}>
        読了済み（{completedCount}）
      </button>
    </div>
  );
}
