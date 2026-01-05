/**
 * useDailyWisdom Hook
 * 
 * Provides daily stoic quotes with:
 * - Calendar-based rotation (365 quotes, one per day like The Daily Stoic)
 * - Virtue-based personalization for users with low virtue scores
 * - Quote history tracking and saving functionality
 * - Midnight rollover support
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { logger } from '@/lib/logger';
import {
  DailyWisdom,
  getDayOfYear,
  getDateString,
  getTodaysWisdom,
  getWisdomByDay,
  getRandomWisdomForVirtue,
  dailyWisdomEntries,
  type StoicVirtue,
} from '@/data/dailyWisdom';
import type { QuoteHistory, QuoteHistoryInsert, QuoteHistoryUpdate, Virtue } from '@/types/database';

// Low virtue threshold - if below this, prioritize virtue-boosting quotes
const LOW_VIRTUE_THRESHOLD = 40;

interface UseDailyWisdomResult {
  // Current quote
  todaysQuote: DailyWisdom;
  // Whether this is a personalized (virtue-boosted) quote
  isPersonalized: boolean;
  // The reason for personalization (if any)
  personalizationReason: string | null;
  // Loading state
  isLoading: boolean;
  // Error state
  error: Error | null;
  // Save/favorite the current quote
  saveQuote: (reflection?: string) => Promise<void>;
  // Whether current quote is saved
  isSaved: boolean;
  // Is save operation in progress
  isSaving: boolean;
  // Get a different random quote (for refresh functionality)
  refreshQuote: () => void;
  // Current day of year (for debugging/display)
  dayOfYear: number;
  // All saved quotes
  savedQuotes: QuoteHistory[];
}

export function useDailyWisdom(): UseDailyWisdomResult {
  const { user } = useAuth();
  const { profile, virtueScores } = useProfile();
  const queryClient = useQueryClient();
  
  // Track the current date string to detect day changes
  const [currentDateString, setCurrentDateString] = useState(getDateString);
  
  // For refresh functionality - allows showing alternate quotes
  const [alternateQuoteIndex, setAlternateQuoteIndex] = useState<number | null>(null);
  
  // Update date at midnight
  useEffect(() => {
    const checkDate = () => {
      const newDateString = getDateString();
      if (newDateString !== currentDateString) {
        setCurrentDateString(newDateString);
        setAlternateQuoteIndex(null); // Reset alternate when day changes
      }
    };
    
    // Check every minute for day rollover
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, [currentDateString]);
  
  // Calculate the day of year
  const dayOfYear = useMemo(() => getDayOfYear(), [currentDateString]);
  
  // Determine if user needs a virtue boost
  const lowestVirtue = useMemo(() => {
    if (!virtueScores || virtueScores.length === 0) return null;
    
    const sorted = [...virtueScores].sort((a, b) => a.score - b.score);
    const lowest = sorted[0];
    
    if (lowest && lowest.score < LOW_VIRTUE_THRESHOLD) {
      return {
        virtue: lowest.virtue as StoicVirtue,
        score: lowest.score,
      };
    }
    return null;
  }, [virtueScores]);
  
  // Select today's quote with personalization
  const { todaysQuote, isPersonalized, personalizationReason } = useMemo(() => {
    // If using alternate quote (refresh was clicked)
    if (alternateQuoteIndex !== null) {
      return {
        todaysQuote: dailyWisdomEntries[alternateQuoteIndex],
        isPersonalized: false,
        personalizationReason: null,
      };
    }
    
    // Check if user needs virtue boost
    if (lowestVirtue) {
      const virtueQuote = getRandomWisdomForVirtue(lowestVirtue.virtue);
      return {
        todaysQuote: virtueQuote,
        isPersonalized: true,
        personalizationReason: `Boosting your ${lowestVirtue.virtue} (currently at ${lowestVirtue.score}%)`,
      };
    }
    
    // Default: calendar-based quote
    return {
      todaysQuote: getWisdomByDay(dayOfYear),
      isPersonalized: false,
      personalizationReason: null,
    };
  }, [dayOfYear, lowestVirtue, alternateQuoteIndex]);
  
  // Fetch today's quote history
  const historyQuery = useQuery({
    queryKey: ['quote_history', user?.id, dayOfYear, new Date().getFullYear()],
    queryFn: async (): Promise<QuoteHistory | null> => {
      if (!user?.id) return null;
      
      const year = new Date().getFullYear();
      
      const { data, error } = await supabase
        .from('quote_history')
        .select('*')
        .eq('profile_id', user.id)
        .eq('day_of_year', dayOfYear)
        .eq('year', year)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        logger.error('Failed to fetch quote history', { error: error.message });
        return null;
      }
      
      return data as QuoteHistory | null;
    },
    enabled: !!user?.id,
  });
  
  // Fetch all saved quotes
  const savedQuotesQuery = useQuery({
    queryKey: ['quote_history', user?.id, 'saved'],
    queryFn: async (): Promise<QuoteHistory[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('quote_history')
        .select('*')
        .eq('profile_id', user.id)
        .eq('saved', true)
        .order('viewed_at', { ascending: false });
      
      if (error) {
        logger.error('Failed to fetch saved quotes', { error: error.message });
        return [];
      }
      
      return (data || []) as QuoteHistory[];
    },
    enabled: !!user?.id,
  });
  
  // Track quote view (upsert on first view of the day)
  useEffect(() => {
    if (!user?.id || !todaysQuote || historyQuery.isLoading) return;
    
    // If we already have a history entry for today, don't create another
    if (historyQuery.data) return;
    
    const trackView = async () => {
      const insert: QuoteHistoryInsert = {
        profile_id: user.id,
        day_of_year: dayOfYear,
        quote_text: todaysQuote.quote,
        author: todaysQuote.author,
        virtue: todaysQuote.virtue as Virtue,
        year: new Date().getFullYear(),
      };
      
      const { error } = await supabase
        .from('quote_history')
        .upsert(insert, {
          onConflict: 'profile_id,day_of_year,year',
        });
      
      if (error) {
        logger.warn('Failed to track quote view', { error: error.message });
      } else {
        queryClient.invalidateQueries({ queryKey: ['quote_history', user.id] });
      }
    };
    
    trackView();
  }, [user?.id, todaysQuote, dayOfYear, historyQuery.isLoading, historyQuery.data, queryClient]);
  
  // Save/favorite mutation
  const saveMutation = useMutation({
    mutationFn: async ({ reflection }: { reflection?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const update: QuoteHistoryUpdate = {
        saved: true,
        reflection: reflection || null,
      };
      
      const { error } = await supabase
        .from('quote_history')
        .update(update)
        .eq('profile_id', user.id)
        .eq('day_of_year', dayOfYear)
        .eq('year', new Date().getFullYear());
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote_history', user?.id] });
    },
  });
  
  const saveQuote = useCallback(async (reflection?: string) => {
    await saveMutation.mutateAsync({ reflection });
  }, [saveMutation]);
  
  const refreshQuote = useCallback(() => {
    // Pick a random quote different from today's
    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * dailyWisdomEntries.length);
    } while (newIndex === (alternateQuoteIndex ?? dayOfYear - 1));
    
    setAlternateQuoteIndex(newIndex);
  }, [alternateQuoteIndex, dayOfYear]);
  
  return {
    todaysQuote,
    isPersonalized,
    personalizationReason,
    isLoading: historyQuery.isLoading,
    error: historyQuery.error as Error | null,
    saveQuote,
    isSaved: historyQuery.data?.saved ?? false,
    isSaving: saveMutation.isPending,
    refreshQuote,
    dayOfYear,
    savedQuotes: savedQuotesQuery.data || [],
  };
}

// Re-export types for convenience
export type { DailyWisdom, StoicVirtue };
