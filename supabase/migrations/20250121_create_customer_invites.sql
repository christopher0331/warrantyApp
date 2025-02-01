-- Create the customer_invites table
CREATE TABLE customer_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE customer_invites ENABLE ROW LEVEL SECURITY;

-- Allow employees to insert invites
CREATE POLICY "Employees can create invites"
ON customer_invites FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' LIKE '%@greenviewsolutions.net'
  OR auth.jwt() ->> 'email' LIKE '%@gvsco.net'
);

-- Allow employees to view invites
CREATE POLICY "Employees can view invites"
ON customer_invites FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' LIKE '%@greenviewsolutions.net'
  OR auth.jwt() ->> 'email' LIKE '%@gvsco.net'
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_customer_invites_updated_at
  BEFORE UPDATE ON customer_invites
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
