-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Note: Indexes tables banne ke baad hi lag sakte hain, 
-- isliye hum indexes ko respective tables wali migrations mein daalenge.