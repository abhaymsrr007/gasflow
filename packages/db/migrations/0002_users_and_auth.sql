CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  // ↑ Primary key, auto UUID generate hota hai.

  email VARCHAR(255) UNIQUE NOT NULL,
  // ↑ Email unique hai (do users same email nahi).

  password_hash VARCHAR(255) NOT NULL,
  // ↑ Argon2id hash store hoga, plain password nahi.

  full_name VARCHAR(255) NOT NULL,
  is_platform_admin BOOLEAN DEFAULT FALSE,
  // ↑ Kya ye user SaaS platform admin hai?

  email_verified_at TIMESTAMP WITH TIME ZONE,
  // ↑ NULL = email verify nahi hua.

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
// ↑ Email par index - fast lookup ke liye.