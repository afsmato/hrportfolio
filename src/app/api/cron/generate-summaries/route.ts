import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SummaryService } from '@/services/SummaryService';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 前月のサマリを全アクティブユーザーに生成
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;

    // 前月に読了アイテムがあるユーザーを取得
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);

    const activeUserIds = await prisma.learningItem
      .findMany({
        where: {
          status: 'completed',
          completedAt: { gte: periodStart, lte: periodEnd },
        },
        select: { userId: true },
        distinct: ['userId'],
      })
      .then((items) => items.map((i) => i.userId));

    const service = new SummaryService();
    let generated = 0;
    let errors = 0;

    for (const userId of activeUserIds) {
      try {
        const result = await service.generateMonthlySummary(userId, year, month);
        if (result) generated++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({ generated, errors, period: `${year}-${String(month).padStart(2, '0')}` });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[cron/generate-summaries] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
