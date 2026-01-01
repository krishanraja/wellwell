-- WellWell Experience System Redesign
-- Daily Check-ins and Enhanced Scoring

-- Create daily_checkins table for rotating welcome activities
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'reflection_prompt',
    'quick_challenge',
    'wisdom_card',
    'energy_checkin',
    'micro_commitment',
    'pattern_insight',
    'streak_celebration'
  )),
  prompt TEXT, -- The prompt shown to user
  response_data JSONB DEFAULT '{}', -- User's response (flexible structure)
  completed BOOLEAN DEFAULT false,
  score_impact INTEGER DEFAULT 0, -- How much this affected practice score
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create commitments table for tracking micro-commitments
CREATE TABLE IF NOT EXISTS public.commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  checkin_id UUID REFERENCES public.daily_checkins(id) ON DELETE SET NULL,
  commitment_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create practice_scores table for the new scoring system
CREATE TABLE IF NOT EXISTS public.practice_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  delta INTEGER DEFAULT 0,
  source TEXT NOT NULL, -- What caused this score change
  source_type TEXT NOT NULL CHECK (source_type IN (
    'morning_pulse',
    'evening_debrief',
    'daily_checkin',
    'micro_commitment',
    'streak_bonus',
    'inactivity_decay'
  )),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_activities JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS energy_patterns JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS commitment_completion_rate FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_welcome_activity TEXT,
ADD COLUMN IF NOT EXISTS total_checkins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- Enable RLS on new tables
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_checkins
CREATE POLICY "Users can view their own checkins" ON public.daily_checkins
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own checkins" ON public.daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own checkins" ON public.daily_checkins
  FOR UPDATE USING (auth.uid() = profile_id);

-- RLS Policies for commitments
CREATE POLICY "Users can view their own commitments" ON public.commitments
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own commitments" ON public.commitments
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own commitments" ON public.commitments
  FOR UPDATE USING (auth.uid() = profile_id);

-- RLS Policies for practice_scores
CREATE POLICY "Users can view their own practice_scores" ON public.practice_scores
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own practice_scores" ON public.practice_scores
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_checkins_profile_id ON public.daily_checkins(profile_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_created_at ON public.daily_checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commitments_profile_id ON public.commitments(profile_id);
CREATE INDEX IF NOT EXISTS idx_commitments_completed ON public.commitments(completed);
CREATE INDEX IF NOT EXISTS idx_practice_scores_profile_id ON public.practice_scores(profile_id);
CREATE INDEX IF NOT EXISTS idx_practice_scores_recorded_at ON public.practice_scores(recorded_at DESC);

-- Function to update streak on activity
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_date_val DATE;
BEGIN
  current_date_val := CURRENT_DATE;
  
  SELECT last_active_date INTO last_date
  FROM public.profiles
  WHERE id = NEW.profile_id;
  
  IF last_date IS NULL OR last_date < current_date_val - INTERVAL '1 day' THEN
    -- Streak broken or first activity
    UPDATE public.profiles
    SET current_streak = 1,
        last_active_date = current_date_val
    WHERE id = NEW.profile_id;
  ELSIF last_date = current_date_val - INTERVAL '1 day' THEN
    -- Continuing streak
    UPDATE public.profiles
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_active_date = current_date_val
    WHERE id = NEW.profile_id;
  ELSIF last_date = current_date_val THEN
    -- Already active today, just update date
    UPDATE public.profiles
    SET last_active_date = current_date_val
    WHERE id = NEW.profile_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update streak on new checkin
DROP TRIGGER IF EXISTS on_checkin_update_streak ON public.daily_checkins;
CREATE TRIGGER on_checkin_update_streak
  AFTER INSERT ON public.daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

-- Trigger to update streak on new event (existing events table)
DROP TRIGGER IF EXISTS on_event_update_streak ON public.events;
CREATE TRIGGER on_event_update_streak
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

