'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { sendMessage } from '@/actions/chatbotActions';
import type { ChatSource } from '@/services/ChatbotService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources: ChatSource[];
}

interface ChatWindowProps {
  initialMessages: Message[];
}

export default function ChatWindow({ initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || isPending) return;

    const userMsg: Message = { role: 'user', content, sources: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    startTransition(async () => {
      const { answer, sources } = await sendMessage(content);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, sources }]);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
      {/* メッセージ一覧 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
            <p style={{ fontSize: '0.9rem' }}>HR・労働法に関する質問を入力してください</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>例: 「36協定の上限規制について教えてください」</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '0.75rem 1rem',
                borderRadius: 12,
                background: msg.role === 'user' ? '#1a1a1a' : '#f3f4f6',
                color: msg.role === 'user' ? '#fff' : '#111827',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content}
              {msg.role === 'assistant' && msg.sources.length > 0 && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #d1d5db' }}>
                  <p style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem' }}>参照</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    {msg.sources.map((src, j) => (
                      <li key={j} style={{ fontSize: '0.7rem', color: '#374151' }}>
                        {src.url ? (
                          <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                            {src.title}
                          </a>
                        ) : (
                          `・${src.title}`
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isPending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '0.75rem 1rem', borderRadius: 12, background: '#f3f4f6', fontSize: '0.875rem', color: '#6b7280' }}>
              回答を生成中...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 入力フォーム */}
      <form
        onSubmit={handleSubmit}
        style={{ borderTop: '1px solid #e5e7eb', padding: '1rem', display: 'flex', gap: '0.5rem', background: '#fff' }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="HR・労働法に関する質問を入力... (Shift+Enterで改行)"
          rows={2}
          disabled={isPending}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          style={{
            padding: '0.5rem 1.25rem',
            background: isPending || !input.trim() ? '#d1d5db' : '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: isPending || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            alignSelf: 'flex-end',
          }}
        >
          {isPending ? '...' : '送信'}
        </button>
      </form>
    </div>
  );
}
