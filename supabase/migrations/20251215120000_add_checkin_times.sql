-- Add check-in time preferences to profiles
-- These store the user's preferred times for Morning Pulse and Evening Debrief

ALTER TABLE public.profiles 
ADD COLUMN morning_pulse_time TIME,
ADD COLUMN evening_debrief_time TIME;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.morning_pulse_time IS 'User preferred time for morning pulse check-in';
COMMENT ON COLUMN public.profiles.evening_debrief_time IS 'User preferred time for evening debrief check-in';

