// // ↑ "pg" library se Pool import karo.

// import dotenv from 'dotenv';
// import path from 'path';
// import { Pool } from 'pg';
// // ↑ .env load karne ke liye.

// dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
// // ↑ Root folder se .env file padho.
// // __dirname = current folder (packages/db/src)
// // ../ = packages/db
// // ../../ = packages
// // ../../../ = root (jahan .env hai)

// if (!process.env['DATABASE_URL_APP']) {
//   throw new Error('DATABASE_URL_APP is missing in .env');
// }
// // ↑ Agar .env mein DATABASE_URL_APP nahi mila, toh error throw karo.
// // Ye "fail early" pattern hai - agar setup galat hai, toh turant pata chale.

// export const appPool = new Pool({
//   connectionString: process.env['DATABASE_URL_APP'],
//   // ↑ Runtime role (gasflow_app) se connect karo.
//   // Ye RLS restricted hai - sirf apna data dekh sakta hai.

//   max: 20,
//   // ↑ Ek time par maximum 20 connections rakh sakta hai.

//   idleTimeoutMillis: 30000,
//   // ↑ Agar koi connection 30 seconds se idle hai, toh band kar do.

//   connectionTimeoutMillis: 2000
//   // ↑ Agar 2 seconds mein connect nahi hua, toh timeout.
// });

// export const ownerPool = new Pool({
//   connectionString: process.env['DATABASE_URL_OWNER'],
//   max: 5
//   // ↑ Owner (gasflow_owner) ka pool - sirf migrations ke liye.
//   // Chhota pool kyunki iska use kam hota hai.
// });

// appPool.on('error', (err) => {
//   console.error('Unexpected error on idle app client', err);
//   process.exit(-1);
// });
// // ↑ Agar koi idle connection error de, toh log karo aur app band kar do.
// // Kyunki database connection tootne se app kaam nahi kar sakta.











import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; // 👈 Ye add karo

// // ESM mein __dirname nikalne ka tarika
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

if (!process.env['DATABASE_URL_APP']) {
  throw new Error('DATABASE_URL_APP is missing in .env');
}

if (!process.env['DATABASE_URL_OWNER']) {
  throw new Error('DATABASE_URL_OWNER is missing in .env');
}

export const appPool = new Pool({
  connectionString: process.env['DATABASE_URL_APP'],
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const ownerPool = new Pool({
  connectionString: process.env['DATABASE_URL_OWNER'],
  max: 5,
});

appPool.on('error', (err) => {
  console.error('Unexpected error on idle app client', err);
  process.exit(-1);
});