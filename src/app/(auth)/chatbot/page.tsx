import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import ChatWindow from '@/components/chatbot/ChatWindow';
import type { ChatSource } from '@/services/ChatbotService';

export default async function ChatbotPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const rawMessages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  const messages = rawMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
    sources: (m.sources as unknown as ChatSource[]) ?? [],
  }));

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>HR専門チャットボット</h1>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
          労働法・HR実務に関する質問に、法令・専門知識ベースを参照して回答します
        </p>
      </div>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
        <ChatWindow initialMessages={messages} />
      </div>
    </main>
  );
}
