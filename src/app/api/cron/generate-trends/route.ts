import { NextRequest, NextResponse } from 'next/server';
import { TrendService } from '@/services/TrendService';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const trendService = new TrendService();
    const result = await trendService.generateMonthlyTrend();
    return NextResponse.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[cron/generate-trends] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
