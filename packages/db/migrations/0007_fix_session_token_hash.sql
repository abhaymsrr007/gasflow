-- Rename token_hash to refresh_token_hash (agar pehle se exist karta hai)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='token_hash') THEN
        ALTER TABLE sessions RENAME COLUMN token_hash TO refresh_token_hash;
    END IF;
END $$;

-- Agar column exist hi nahi karta, toh naya banao
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS refresh_token_hash VARCHAR(255) UNIQUE;