-- New columns on deals for enhanced features
ALTER TABLE deals ADD COLUMN IF NOT EXISTS original_price INTEGER;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Price alerts
CREATE TABLE IF NOT EXISTS price_alerts (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    departure_city TEXT,
    destination_city TEXT NOT NULL,
    target_price INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMP DEFAULT NOW()
);
