-- Enable RLS on all tables to secure them
-- Since we're using Prisma server-side, we don't need public access

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Create a policy that blocks all public access
-- This ensures tables are only accessible via server-side connections

-- For businesses table
CREATE POLICY "Block all public access" ON businesses
    FOR ALL USING (false);

-- For waitlist table
CREATE POLICY "Block all public access" ON waitlist
    FOR ALL USING (false);

-- For utm_tokens table
CREATE POLICY "Block all public access" ON utm_tokens
    FOR ALL USING (false);

-- For purchases table
CREATE POLICY "Block all public access" ON purchases
    FOR ALL USING (false);

-- For analytics_events table
CREATE POLICY "Block all public access" ON analytics_events
    FOR ALL USING (false);

-- For abandoned_carts table
CREATE POLICY "Block all public access" ON abandoned_carts
    FOR ALL USING (false);