import 'dotenv/config'; // Ye line .env load karti hai (zaroori hai!)
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL_OWNER'), // Tumhara .env wala variable
  },
});