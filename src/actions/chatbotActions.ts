'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ChatbotService, type ChatSource, type ChatHistory } from '@/services/ChatbotService';

export async function sendMessage(
  content: string
): Promise<{ answer: string; sources: ChatSource[] }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  // 会話履歴を取得（最新20件）
  const recentMessages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  const history: ChatHistory[] = recentMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const service = new ChatbotService();
  const { answer, sources } = await service.chat(content, history);

  // user/assistantメッセージをDBに保存
  await prisma.chatMessage.createMany({
    data: [
      { userId, role: 'user', content, sources: [] },
      { userId, role: 'assistant', content: answer, sources: sources as object[] },
    ],
  });

  revalidatePath('/chatbot');
  return { answer, sources };
}
