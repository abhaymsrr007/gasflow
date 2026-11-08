
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// apps/api/.env
const envPath = path.resolve(__dirname, "../.env");

const result = dotenv.config({
  path: envPath,
  override: false,
});

if (result.error) {
  throw new Error(
    `Failed to load environment file: ${envPath}`
  );
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  API_PORT: z.coerce.number().default(4000),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z.string().default("7d"),

  SESSION_COOKIE_NAME: z.string().default("gasflow_sid"),

  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten()
  );

  process.exit(1);
}

export const env = parsed.data;
