-- Daily Quote History Table
-- Tracks which quotes users have seen, saved, and reflected upon

CREATE TABLE IF NOT EXISTS quote_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_year INTEGER NOT NULL CHECK (day_of_year >= 1 AND day_of_year <= 366),
  quote_text TEXT NOT NULL,
  author TEXT NOT NULL,
  virtue TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  saved BOOLEAN NOT NULL DEFAULT false,
  reflection TEXT,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  
  -- Ensure one entry per user per day per year
  CONSTRAINT unique_user_day_year UNIQUE (profile_id, day_of_year, year)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_quote_history_profile_id ON quote_history(profile_id);

-- Index for finding saved quotes
CREATE INDEX IF NOT EXISTS idx_quote_history_saved ON quote_history(profile_id, saved) WHERE saved = true;

-- Index for recent quotes
CREATE INDEX IF NOT EXISTS idx_quote_history_viewed_at ON quote_history(profile_id, viewed_at DESC);

-- Enable RLS
ALTER TABLE quote_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own quote history
CREATE POLICY "Users can view their own quote history"
  ON quote_history FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can insert their own quote history
CREATE POLICY "Users can insert their own quote history"
  ON quote_history FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can update their own quote history (for saving/reflecting)
CREATE POLICY "Users can update their own quote history"
  ON quote_history FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Users can delete their own quote history
CREATE POLICY "Users can delete their own quote history"
  ON quote_history FOR DELETE
  USING (auth.uid() = profile_id);

-- Add comment for documentation
COMMENT ON TABLE quote_history IS 'Tracks daily stoic quotes shown to users, including saves and reflections';
COMMENT ON COLUMN quote_history.day_of_year IS 'Day of year (1-366) for calendar-based rotation';
COMMENT ON COLUMN quote_history.saved IS 'Whether user has saved this quote as a favorite';
COMMENT ON COLUMN quote_history.reflection IS 'User''s personal reflection on this quote';
