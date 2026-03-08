import path from 'path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
