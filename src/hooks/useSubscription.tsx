import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

export type SubscriptionPlan = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

export interface Subscription {
  id: string;
  profile_id: string;
  plan: SubscriptionPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<Subscription | null> => {
      if (!user?.id) return null;
      
      logger.db('SELECT', 'subscriptions', { userId: user.id });
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      if (error) {
        // If no subscription exists, create one
        if (error.code === 'PGRST116') {
          logger.info('No subscription found, creating free subscription');
          const { data: newSub, error: createError } = await supabase
            .from('subscriptions')
            .insert({ profile_id: user.id, plan: 'free', status: 'active' })
            .select()
            .single();
          
          if (createError) {
            logger.error('Failed to create subscription', { error: createError.message });
            return null;
          }
          return newSub as Subscription;
        }
        logger.error('Failed to fetch subscription', { error: error.message });
        return null;
      }

      return data as Subscription;
    },
    enabled: !!user?.id,
  });

  const refreshSubscription = async () => {
    if (!user?.id) return;

    try {
      logger.info('Refreshing subscription from Stripe');
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        logger.error('Failed to refresh subscription', { error });
        return;
      }

      // Invalidate to refetch from DB
      queryClient.invalidateQueries({ queryKey: ['subscription', user.id] });
      
      return data;
    } catch (err) {
      logger.error('Error refreshing subscription', { error: err });
    }
  };

  const isPro = subscriptionQuery.data?.plan === 'pro' && subscriptionQuery.data?.status === 'active';
  const isFree = !isPro;

  return {
    subscription: subscriptionQuery.data,
    isPro,
    isFree,
    isLoading: subscriptionQuery.isLoading,
    error: subscriptionQuery.error,
    refreshSubscription,
  };
}
