CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    departure_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    price INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    travel_dates TEXT,
    affiliate_url TEXT,
    content TEXT,
    image_url TEXT,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add image_url column if it doesn't exist (for existing tables)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS image_url TEXT;
