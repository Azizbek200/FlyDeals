-- Seed sample deals for initial deployment
INSERT INTO deals (title, slug, departure_city, destination_city, price, currency, travel_dates, affiliate_url, content, published)
VALUES
  ('London to New York', 'london-to-new-york', 'London', 'New York', 299, 'EUR', 'March - June 2026', '', 'Amazing deal on flights from London to New York! Book now before prices go up.', true),
  ('Berlin to Tokyo', 'berlin-to-tokyo', 'Berlin', 'Tokyo', 449, 'EUR', 'April - September 2026', '', 'Incredible fares from Berlin to Tokyo. Perfect for cherry blossom season!', true),
  ('Paris to Dubai', 'paris-to-dubai', 'Paris', 'Dubai', 199, 'EUR', 'February - May 2026', '', 'Fly from Paris to Dubai at unbeatable prices. Luxury destination, budget price.', true)
ON CONFLICT (slug) DO NOTHING;
