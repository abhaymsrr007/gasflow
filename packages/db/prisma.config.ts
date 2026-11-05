// import { config } from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { defineConfig, env } from 'prisma/config';

// // ESM mein __dirname nikalne ka tarika
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Root folder se .env load karo (packages/db se 2 step peeche)
// config({ path: path.resolve(__dirname, '../../.env') });

// export default defineConfig({
//   schema: 'prisma/schema.prisma', 
//   migrations: { path: 'prisma/migrations' },
//   datasource: { url: env('DATABASE_URL_OWNER') },
// });




import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, env } from 'prisma/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({
  path: path.resolve(__dirname, '../../.env'),
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL_OWNER'),
  },
});