import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { searchRakutenBooks } from '@/lib/rakuten';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ items: [] });

  try {
    const items = await searchRakutenBooks({ keyword: q, hits: 10 });
    return NextResponse.json({ items });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[books/search] error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
