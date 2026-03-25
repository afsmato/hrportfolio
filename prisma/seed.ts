import { PrismaClient } from '@prisma/client';
import { seedArticleSources } from './seeds/articleSources';

const prisma = new PrismaClient();

async function main() {
  await seedArticleSources(prisma);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
