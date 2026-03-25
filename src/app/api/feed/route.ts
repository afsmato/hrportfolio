import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { ArticleRepository } from '@/repositories/ArticleRepository';

const querySchema = z.object({
  category: z
    .enum([
      'people_analytics',
      'organizational_development',
      'hr_tech',
      'domestic_hr',
      'management_science',
      'labor_economics',
      'academic_global',
      'academic_domestic',
      'hr_consulting_global',
      'hr_consulting_domestic',
    ])
    .optional(),
  difficulty: z.enum(['beginner', 'practical', 'advanced', 'expert']).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { category, difficulty, page } = parsed.data;
  const repository = new ArticleRepository();
  const { articles, total } = await repository.findMany({ category, difficulty, page });

  return NextResponse.json({ articles, total, page });
}
