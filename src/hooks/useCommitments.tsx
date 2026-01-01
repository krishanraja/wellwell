import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';
import type { Commitment, CommitmentInsert } from '@/types/database';

/**
 * Commitments Hook
 * 
 * Tracks micro-commitments made during welcome activities.
 * Users can mark commitments as complete and see their completion rate.
 */

export function useCommitments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get active commitments (not completed, created in last 7 days)
  const activeQuery = useQuery({
    queryKey: ['commitments', user?.id, 'active'],
    queryFn: async (): Promise<Commitment[]> => {
      if (!user?.id) return [];
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      logger.db('SELECT', 'commitments', { userId: user.id, purpose: 'active' });
      
      const { data, error } = await supabase
        .from('commitments')
        .select('*')
        .eq('profile_id', user.id)
        .eq('completed', false)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch active commitments', { error: error.message });
        return [];
      }

      return (data || []) as Commitment[];
    },
    enabled: !!user?.id,
  });

  // Get all commitments (for history)
  const allQuery = useQuery({
    queryKey: ['commitments', user?.id, 'all'],
    queryFn: async (): Promise<Commitment[]> => {
      if (!user?.id) return [];
      
      logger.db('SELECT', 'commitments', { userId: user.id, purpose: 'all' });
      
      const { data, error } = await supabase
        .from('commitments')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Failed to fetch all commitments', { error: error.message });
        return [];
      }

      return (data || []) as Commitment[];
    },
    enabled: !!user?.id,
  });

  // Calculate completion rate
  const completionRate = (): number => {
    const all = allQuery.data || [];
    if (all.length === 0) return 0;
    
    const completed = all.filter(c => c.completed).length;
    return Math.round((completed / all.length) * 100);
  };

  // Create a new commitment
  const createMutation = useMutation({
    mutationFn: async (params: { text: string; checkinId?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      logger.db('INSERT', 'commitments', { userId: user.id, text: params.text });
      
      const { data, error } = await supabase
        .from('commitments')
        .insert({
          profile_id: user.id,
          commitment_text: params.text,
          checkin_id: params.checkinId || null,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create commitment', { error: error.message });
        throw error;
      }

      logger.info('Commitment created', { commitmentId: data.id, text: params.text });
      return data as Commitment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commitments', user?.id] });
    },
  });

  // Mark commitment as complete
  const completeMutation = useMutation({
    mutationFn: async (commitmentId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      logger.db('UPDATE', 'commitments', { userId: user.id, commitmentId });
      
      const { data, error } = await supabase
        .from('commitments')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', commitmentId)
        .eq('profile_id', user.id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to complete commitment', { error: error.message });
        throw error;
      }

      // Update profile's completion rate
      const newRate = completionRate();
      await supabase
        .from('profiles')
        .update({ commitment_completion_rate: newRate / 100 })
        .eq('id', user.id);

      logger.info('Commitment completed', { commitmentId });
      return data as Commitment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commitments', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  // Get today's commitments
  const todaysCommitments = (): Commitment[] => {
    const all = allQuery.data || [];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    return all.filter(c => new Date(c.created_at) >= todayStart);
  };

  return {
    // Data
    activeCommitments: activeQuery.data || [],
    allCommitments: allQuery.data || [],
    todaysCommitments: todaysCommitments(),
    completionRate: completionRate(),
    isLoading: activeQuery.isLoading,
    
    // Actions
    createCommitment: createMutation.mutateAsync,
    completeCommitment: completeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isCompleting: completeMutation.isPending,
  };
}

