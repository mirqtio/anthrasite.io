-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  ip_location JSONB,
  variant_data JSONB,
  position SERIAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_domain ON waitlist(domain);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);

-- Create utm_tokens table
CREATE TABLE IF NOT EXISTS utm_tokens (
  nonce VARCHAR(255) PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  business_id UUID NOT NULL REFERENCES businesses(id),
  used BOOLEAN DEFAULT FALSE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for utm_tokens
CREATE INDEX IF NOT EXISTS idx_utm_tokens_token ON utm_tokens(token);
CREATE INDEX IF NOT EXISTS idx_utm_tokens_expires_at ON utm_tokens(expires_at);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  utm_token VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd' NOT NULL,
  customer_email VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for purchases
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session_id ON purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_payment_intent_id ON purchases(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  properties JSONB NOT NULL,
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_session ON analytics_events(event_name, session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Create abandoned_carts table
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  business_id UUID NOT NULL REFERENCES businesses(id),
  utm_token VARCHAR(255),
  customer_email VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd' NOT NULL,
  recovery_token VARCHAR(255) UNIQUE,
  recovery_email_sent BOOLEAN DEFAULT FALSE NOT NULL,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  recovered BOOLEAN DEFAULT FALSE NOT NULL,
  recovered_at TIMESTAMP WITH TIME ZONE,
  session_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for abandoned_carts
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_stripe_session_id ON abandoned_carts(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovery_token ON abandoned_carts(recovery_token);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email_sent_at ON abandoned_carts(email_sent_at);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_session_expires_at ON abandoned_carts(session_expires_at);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_created_at ON abandoned_carts(created_at);

-- Create update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to tables with updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_abandoned_carts_updated_at BEFORE UPDATE ON abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();