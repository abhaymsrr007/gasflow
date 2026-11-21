// import { config } from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { defineConfig, env } from 'prisma/config';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// config({
//   path: path.resolve(__dirname, '../../.env'),
// });

// export default defineConfig({
//   schema: 'prisma/schema.prisma',
//   migrations: {
//     path: 'prisma/migrations',
//   },
//   datasource: {
//     url: env('DATABASE_URL_OWNER'),
//   },
// });




import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, env } from "prisma/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({
  path: path.resolve(__dirname, "../../.env"),
});

export default defineConfig({
  // Multi-file schema: point to directory
  schema: "prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("DATABASE_URL_OWNER"),
  },
});
