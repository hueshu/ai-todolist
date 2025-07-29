-- Create industries table
CREATE TABLE IF NOT EXISTS industries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- Create index for user_id
CREATE INDEX idx_industries_user_id ON industries(user_id);

-- Enable RLS
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own industries" ON industries
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can create their own industries" ON industries
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can update their own industries" ON industries
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can delete their own industries" ON industries
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::text);

-- Add industry_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS industry_id UUID REFERENCES industries(id) ON DELETE SET NULL;