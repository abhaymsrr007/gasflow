import app from './app';
import { env } from "./env";
import dotenv from 'dotenv';
import path from 'path';
// import { fileURLToPath } from 'url'; // 👈 Ye add karo

// // ESM mein __dirname nikalne ka tarika
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Root .env load karo
// dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// 2. API ki .env (API secrets ke liye) - override karegi
// dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

const PORT = env.API_PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger Docs available at http://localhost:${PORT}/api-docs`);
}); 