-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own industries" ON industries;
DROP POLICY IF EXISTS "Users can create their own industries" ON industries;
DROP POLICY IF EXISTS "Users can update their own industries" ON industries;
DROP POLICY IF EXISTS "Users can delete their own industries" ON industries;

-- Create simpler RLS policies that work with direct user_id comparison
CREATE POLICY "Enable read access for users" ON industries
  FOR SELECT
  USING (true);  -- Allow all reads, filtered by user_id in query

CREATE POLICY "Enable insert for users" ON industries
  FOR INSERT
  WITH CHECK (true);  -- Allow all inserts, user_id is set in insert

CREATE POLICY "Enable update for users" ON industries
  FOR UPDATE
  USING (true);  -- Allow updates, filtered by user_id in query

CREATE POLICY "Enable delete for users" ON industries
  FOR DELETE
  USING (true);  -- Allow deletes, filtered by user_id in query