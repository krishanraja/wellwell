import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';
import { extractWordsForAnalysis } from '@/lib/formatRawInput';
interface PatternInsight {
  type: 'trigger_pattern' | 'time_pattern' | 'virtue_trend' | 'tool_preference';
  title: string;
  description: string;
  data?: Record<string, unknown>;
}

interface PatternAnalysis {
  patterns: PatternInsight[];
  triggerClusters: string[];
  peakDays: string[];
  strongestVirtue: string;
  weakestVirtue: string;
  recommendedFocus: string;
  totalSessions: number;
}

export function usePatterns() {
  const { user } = useAuth();

  const patternsQuery = useQuery({
    queryKey: ['patterns', user?.id],
    queryFn: async (): Promise<PatternAnalysis> => {
      if (!user?.id) {
        return {
          patterns: [],
          triggerClusters: [],
          peakDays: [],
          strongestVirtue: 'wisdom',
          weakestVirtue: 'courage',
          recommendedFocus: 'courage',
          totalSessions: 0,
        };
      }
      
      logger.db('SELECT', 'events', { userId: user.id, purpose: 'pattern-analysis' });
      
      // Get last 30 days of events
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [eventsResult, virtuesResult] = await Promise.all([
        supabase
          .from('events')
          .select('tool_name, raw_input, created_at')
          .eq('profile_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('virtue_scores')
          .select('virtue, score, recorded_at')
          .eq('profile_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(20),
      ]);

      if (eventsResult.error) {
        logger.error('Failed to fetch events for patterns', { error: eventsResult.error.message });
      }

      const events = eventsResult.data || [];
      const virtues = virtuesResult.data || [];
      
      // Analyze patterns
      const patterns: PatternInsight[] = [];
      const dayCount: Record<string, number> = {};
      const toolCount: Record<string, number> = {};
      const triggerWords: Record<string, number> = {};

      events.forEach(event => {
        // Count by day of week
        const dayOfWeek = new Date(event.created_at).toLocaleDateString('en-US', { weekday: 'long' });
        dayCount[dayOfWeek] = (dayCount[dayOfWeek] || 0) + 1;
        
        // Count by tool
        toolCount[event.tool_name] = (toolCount[event.tool_name] || 0) + 1;
        
        // Extract common words from inputs (filters out JSON keys and artifacts)
        const words = extractWordsForAnalysis(event.raw_input);
        words.forEach(word => {
          triggerWords[word] = (triggerWords[word] || 0) + 1;
        });
      });

      // Find peak days
      const peakDays = Object.entries(dayCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([day]) => day);

      if (peakDays.length > 0) {
        patterns.push({
          type: 'time_pattern',
          title: `Most active on ${peakDays[0]}s`,
          description: `You tend to use WellWell most on ${peakDays.join(' and ')}. Consider setting a reminder for other days.`,
        });
      }

      // Find trigger clusters (most common trigger words)
      const triggerClusters = Object.entries(triggerWords)
        .filter(([word]) => !['about', 'their', 'there', 'would', 'could', 'should'].includes(word))
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);

      if (triggerClusters.length >= 2) {
        patterns.push({
          type: 'trigger_pattern',
          title: `Common themes: ${triggerClusters.slice(0, 3).join(', ')}`,
          description: `These words appear frequently in your reflections. They may represent recurring patterns worth examining.`,
          data: { words: triggerClusters },
        });
      }

      // Analyze virtue trends
      const latestVirtues: Record<string, number> = {};
      virtues.forEach(v => {
        if (!latestVirtues[v.virtue]) {
          latestVirtues[v.virtue] = v.score;
        }
      });

      const virtueEntries = Object.entries(latestVirtues);
      const strongestVirtue = virtueEntries.length > 0 
        ? virtueEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0]
        : 'wisdom';
      const weakestVirtue = virtueEntries.length > 0
        ? virtueEntries.reduce((a, b) => a[1] < b[1] ? a : b)[0]
        : 'courage';

      patterns.push({
        type: 'virtue_trend',
        title: `${strongestVirtue.charAt(0).toUpperCase() + strongestVirtue.slice(1)} is your strength`,
        description: `Your ${strongestVirtue} score is highest. Consider leveraging this virtue to support ${weakestVirtue}.`,
      });

      // Tool preference
      const favoriteTools = Object.entries(toolCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([tool]) => tool);

      if (favoriteTools.length > 0) {
        patterns.push({
          type: 'tool_preference',
          title: `Favorite tool: ${favoriteTools[0]}`,
          description: `You use ${favoriteTools[0]} most often. Try mixing in other tools for balanced growth.`,
        });
      }

      logger.debug('Pattern analysis complete', { 
        totalEvents: events.length, 
        patternCount: patterns.length 
      });

      return {
        patterns,
        triggerClusters,
        peakDays,
        strongestVirtue,
        weakestVirtue,
        recommendedFocus: weakestVirtue,
        totalSessions: events.length,
      };
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    patterns: patternsQuery.data?.patterns || [],
    triggerClusters: patternsQuery.data?.triggerClusters || [],
    peakDays: patternsQuery.data?.peakDays || [],
    strongestVirtue: patternsQuery.data?.strongestVirtue || 'wisdom',
    weakestVirtue: patternsQuery.data?.weakestVirtue || 'courage',
    recommendedFocus: patternsQuery.data?.recommendedFocus || 'courage',
    totalSessions: patternsQuery.data?.totalSessions || 0,
    isLoading: patternsQuery.isLoading,
    error: patternsQuery.error,
  };
}
