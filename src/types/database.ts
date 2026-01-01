/**
 * WellWell Database Types
 * 
 * TypeScript interfaces matching the Supabase schema.
 * These provide type safety for database operations.
 */

// Enum types
export type Persona = 'strategist' | 'monk' | 'commander' | 'friend';
export type ToolName = 'pulse' | 'intervene' | 'debrief' | 'decision' | 'conflict' | 'onboarding';
export type Virtue = 'courage' | 'temperance' | 'justice' | 'wisdom';
export type Dimension = 'courage' | 'temperance' | 'justice' | 'wisdom' | 'composure' | 'clarity' | 'resilience' | 'focus';

// Activity types for welcome experience
export type ActivityType = 
  | 'reflection_prompt'
  | 'quick_challenge'
  | 'wisdom_card'
  | 'energy_checkin'
  | 'micro_commitment'
  | 'pattern_insight'
  | 'streak_celebration';

// Practice score source types
export type PracticeScoreSource = 
  | 'morning_pulse'
  | 'evening_debrief'
  | 'daily_checkin'
  | 'micro_commitment'
  | 'streak_bonus'
  | 'inactivity_decay';

// Profile table
export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  persona: Persona | null;
  challenges: string[];
  goals: string[];
  baseline_moment: string | null;
  morning_pulse_time: string | null; // TIME stored as HH:MM:SS string
  evening_debrief_time: string | null; // TIME stored as HH:MM:SS string
  // New fields for experience system
  preferred_activities: Record<string, number>; // activity type -> engagement count
  energy_patterns: Record<string, unknown>; // historical energy data
  commitment_completion_rate: number;
  last_welcome_activity: ActivityType | null;
  total_checkins: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null; // DATE as YYYY-MM-DD string
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  email?: string | null;
  display_name?: string | null;
  persona?: Persona | null;
  challenges?: string[];
  goals?: string[];
  baseline_moment?: string | null;
  morning_pulse_time?: string | null;
  evening_debrief_time?: string | null;
}

export interface ProfileUpdate {
  email?: string | null;
  display_name?: string | null;
  persona?: Persona | null;
  challenges?: string[];
  goals?: string[];
  baseline_moment?: string | null;
  morning_pulse_time?: string | null;
  evening_debrief_time?: string | null;
}

// Session table
export interface Session {
  id: string;
  profile_id: string;
  tool_name: ToolName;
  started_at: string;
  ended_at: string | null;
}

export interface SessionInsert {
  id?: string;
  profile_id: string;
  tool_name: ToolName;
  started_at?: string;
  ended_at?: string | null;
}

// Event table
export interface Event {
  id: string;
  profile_id: string;
  session_id: string | null;
  tool_name: string;
  question_key: string | null;
  raw_input: string;
  structured_values: Record<string, unknown>;
  created_at: string;
}

export interface EventInsert {
  id?: string;
  profile_id: string;
  session_id?: string | null;
  tool_name: string;
  question_key?: string | null;
  raw_input: string;
  structured_values?: Record<string, unknown>;
}

// Insight table
export interface Insight {
  id: string;
  profile_id: string;
  source_event_id: string | null;
  dimension_name: Dimension;
  score: number | null;
  label: string | null;
  llm_summary: string | null;
  context_snapshot: Record<string, unknown>;
  created_at: string;
}

export interface InsightInsert {
  id?: string;
  profile_id: string;
  source_event_id?: string | null;
  dimension_name: Dimension;
  score?: number | null;
  label?: string | null;
  llm_summary?: string | null;
  context_snapshot?: Record<string, unknown>;
}

// Virtue Score table
export interface VirtueScore {
  id: string;
  profile_id: string;
  virtue: Virtue;
  score: number;
  delta: number | null;
  recorded_at: string;
}

export interface VirtueScoreInsert {
  id?: string;
  profile_id: string;
  virtue: Virtue;
  score: number;
  delta?: number | null;
}

export interface VirtueScoreUpdate {
  score?: number;
  delta?: number | null;
}

// AI Response types
export interface StoicAnalysis {
  summary: string;
  control_map: {
    yours: string[];
    not_yours: string[];
  };
  virtue: Virtue;
  virtue_rationale: string;
  stance: string;
  key_actions: string[];
  surprise_or_tension: string;
  scores: {
    dimension: Dimension;
    score: number;
    label: string;
  }[];
}

export interface InterveneAnalysis {
  reality_check: string;
  virtue_applicable: Virtue;
  reframe: string;
  immediate_action: string;
  grounding_prompt: string;
  intensity_assessment: string;
}

export interface DebriefAnalysis {
  day_summary: string;
  virtue_movements: {
    virtue: Virtue;
    delta: number;
    reason: string;
  }[];
  tomorrow_focus: string;
  pattern_detected: string | null;
}

// API request types
export interface PulseRequest {
  challenge: string;
  profile_context?: {
    persona: Persona | null;
    challenges: string[];
    goals: string[];
  };
}

export interface InterveneRequest {
  trigger: string;
  intensity: number;
  profile_context?: {
    persona: Persona | null;
    challenges: string[];
    goals: string[];
  };
}

export interface DebriefRequest {
  challenge_faced: string;
  response_given: string;
  would_do_differently: string;
  profile_context?: {
    persona: Persona | null;
    challenges: string[];
    goals: string[];
  };
}

// Daily Check-in table
export interface DailyCheckin {
  id: string;
  profile_id: string;
  activity_type: ActivityType;
  prompt: string | null;
  response_data: Record<string, unknown>;
  completed: boolean;
  score_impact: number;
  created_at: string;
}

export interface DailyCheckinInsert {
  id?: string;
  profile_id: string;
  activity_type: ActivityType;
  prompt?: string | null;
  response_data?: Record<string, unknown>;
  completed?: boolean;
  score_impact?: number;
}

// Commitment table
export interface Commitment {
  id: string;
  profile_id: string;
  checkin_id: string | null;
  commitment_text: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface CommitmentInsert {
  id?: string;
  profile_id: string;
  checkin_id?: string | null;
  commitment_text: string;
  completed?: boolean;
  completed_at?: string | null;
}

// Practice Score table
export interface PracticeScore {
  id: string;
  profile_id: string;
  score: number;
  delta: number;
  source: string;
  source_type: PracticeScoreSource;
  recorded_at: string;
}

export interface PracticeScoreInsert {
  id?: string;
  profile_id: string;
  score: number;
  delta?: number;
  source: string;
  source_type: PracticeScoreSource;
}

// Activity configuration for welcome experience
export interface ActivityConfig {
  type: ActivityType;
  title: string;
  prompt: string;
  icon: string;
  color: string;
  scoreImpact: number;
}

// Energy check-in response structure
export interface EnergyCheckinResponse {
  mood: number; // 1-5
  energy: number; // 1-5
  clarity: number; // 1-5
}

// Reflection response structure
export interface ReflectionResponse {
  text: string;
  wordCount: number;
}

// Commitment response structure
export interface CommitmentResponse {
  commitment: string;
  timeframe: 'today' | 'this_week' | 'ongoing';
}
