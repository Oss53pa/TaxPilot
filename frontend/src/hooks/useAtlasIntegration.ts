/**
 * Hook to detect and import balance data from Atlas F&A.
 * Checks atlas_balance_exports table for available balances
 * when the user has both Atlas F&A and Liass'Pilot subscriptions.
 */
import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger'
import { supabase, isSupabaseEnabled } from '../lib/supabase';

export interface AtlasBalanceExport {
  id: string;
  fiscal_year: string;
  company_name: string | null;
  export_date: string;
  data: BalanceExportEntry[];
  status: string;
}

export interface BalanceExportEntry {
  accountNumber: string;
  accountName: string;
  debitOpening: number;
  creditOpening: number;
  debitMovement: number;
  creditMovement: number;
  debitClosing: number;
  creditClosing: number;
}

export function useAtlasIntegration() {
  const [availableBalances, setAvailableBalances] = useState<AtlasBalanceExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAtlasFNA, setHasAtlasFNA] = useState(false);

  const fetchAvailableBalances = useCallback(async () => {
    if (!isSupabaseEnabled || !supabase) {
      setLoading(false);
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user has Atlas F&A subscription
      const { data: fnaSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('app_id', 'atlas-compta')
        .in('status', ['active', 'trial'])
        .limit(1);

      setHasAtlasFNA(!!(fnaSub && fnaSub.length > 0));

      // Fetch available balance exports
      const { data: exports } = await supabase
        .from('atlas_balance_exports')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'available')
        .order('export_date', { ascending: false });

      if (exports) {
        setAvailableBalances(exports as AtlasBalanceExport[]);
      }
    } catch (err) {
      logger.error('[Atlas Integration] Error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAvailableBalances();
  }, [fetchAvailableBalances]);

  const markAsConsumed = useCallback(async (exportId: string) => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('atlas_balance_exports')
      .update({
        status: 'consumed',
        consumed_by: user?.id,
        consumed_at: new Date().toISOString(),
      })
      .eq('id', exportId);

    // Remove from local state
    setAvailableBalances(prev => prev.filter(b => b.id !== exportId));
  }, []);

  return {
    availableBalances,
    hasAtlasFNA,
    loading,
    markAsConsumed,
    refresh: fetchAvailableBalances,
  };
}
