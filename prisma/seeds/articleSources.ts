import { PrismaClient } from '@prisma/client';
import { ARTICLE_SOURCES } from '../../src/constants/ARTICLE_SOURCES';

export async function seedArticleSources(prisma: PrismaClient) {
  for (const source of ARTICLE_SOURCES) {
    await prisma.articleSource.upsert({
      where: { url: source.url },
      update: { name: source.name, category: source.category },
      create: {
        id: source.id,
        name: source.name,
        url: source.url,
        category: source.category,
        active: true,
      },
    });
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded ${ARTICLE_SOURCES.length} article sources`);
}
