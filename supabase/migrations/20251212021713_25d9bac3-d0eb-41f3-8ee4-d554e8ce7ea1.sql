-- WellWell Database Schema

-- Create profiles table (user anchor)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  persona TEXT CHECK (persona IN ('strategist', 'monk', 'commander', 'friend')),
  challenges TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  baseline_moment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sessions table (tool usage grouping)
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tool_name TEXT NOT NULL CHECK (tool_name IN ('pulse', 'intervene', 'debrief', 'decision', 'conflict', 'onboarding')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- Create events table (raw interactions - never blobs)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  question_key TEXT,
  raw_input TEXT NOT NULL,
  structured_values JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create insights table (meaning layer - scores & labels)
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  source_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  dimension_name TEXT NOT NULL CHECK (dimension_name IN ('courage', 'temperance', 'justice', 'wisdom', 'composure', 'clarity', 'resilience', 'focus')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  label TEXT,
  llm_summary TEXT,
  context_snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create virtue_scores table (aggregated virtue tracking)
CREATE TABLE public.virtue_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  virtue TEXT NOT NULL CHECK (virtue IN ('courage', 'temperance', 'justice', 'wisdom')),
  score INTEGER NOT NULL DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  delta INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtue_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = profile_id);

-- RLS Policies for events
CREATE POLICY "Users can view their own events" ON public.events
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- RLS Policies for insights
CREATE POLICY "Users can view their own insights" ON public.insights
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own insights" ON public.insights
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- RLS Policies for virtue_scores
CREATE POLICY "Users can view their own virtue scores" ON public.virtue_scores
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own virtue scores" ON public.virtue_scores
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own virtue scores" ON public.virtue_scores
  FOR UPDATE USING (auth.uid() = profile_id);

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  
  -- Initialize virtue scores
  INSERT INTO public.virtue_scores (profile_id, virtue, score) VALUES
    (NEW.id, 'courage', 50),
    (NEW.id, 'temperance', 50),
    (NEW.id, 'justice', 50),
    (NEW.id, 'wisdom', 50);
  
  RETURN NEW;
END;
$$;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for auto-updating updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();