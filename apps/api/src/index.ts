import app from './app.js'; // ESM mein .js extension lagana padta hai
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; // 👈 Ye add karo

// ESM mein __dirname nikalne ka tarika
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root .env load karo
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const PORT = process.env['API_PORT'] || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});