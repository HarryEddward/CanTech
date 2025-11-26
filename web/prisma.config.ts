import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import './envConfig.ts'; // ts-node resolves .ts automatically, but .js works for ESM

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: `tsx prisma/seed.ts`,
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
