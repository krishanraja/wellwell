import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';
import type { Event, EventInsert, ToolName } from '@/types/database';

export function useEvents(toolName?: ToolName) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['events', user?.id, toolName],
    queryFn: async (): Promise<Event[]> => {
      if (!user?.id) return [];
      
      logger.db('SELECT', 'events', { userId: user.id, toolName });
      
      let query = supabase
        .from('events')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (toolName) {
        query = query.eq('tool_name', toolName);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch events', { error: error.message });
        throw error;
      }

      logger.debug('Events fetched', { count: data?.length || 0 });
      return (data || []) as Event[];
    },
    enabled: !!user?.id,
  });

  const createEventMutation = useMutation({
    mutationFn: async (event: Omit<EventInsert, 'profile_id'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      logger.db('INSERT', 'events', { userId: user.id, toolName: event.tool_name });
      
      const insertData = {
        profile_id: user.id,
        tool_name: event.tool_name,
        raw_input: event.raw_input,
        question_key: event.question_key,
        session_id: event.session_id,
        structured_values: event.structured_values,
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create event', { error: error.message });
        throw error;
      }

      logger.info('Event created', { eventId: data.id, toolName: event.tool_name });
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    createEvent: createEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
  };
}
