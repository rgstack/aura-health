import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface SyncContextType {
  isSynced: boolean;
  isSyncing: boolean;
  triggerSync: () => Promise<void>;
  lastSyncResult: SyncResult | null;
}

interface SyncResult {
  success: boolean;
  reward_granted: boolean;
  reward_amount: number;
  current_streak: number;
  total_earnings: number;
  message: string;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const [isSynced, setIsSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const { session, refreshProfile } = useAuth();

  const triggerSync = async () => {
    if (isSyncing || isSynced || !session) return;
    
    setIsSyncing(true);

    try {
      // Call the edge function with hardcoded demo data (10,500 steps)
      const { data, error } = await supabase.functions.invoke('sync-health-data', {
        body: {
          steps: 10500,
          date: new Date().toISOString().split('T')[0],
          sleep_hours: 7.5,
          heart_rate_avg: 72,
        },
      });

      if (error) {
        console.error('Sync error:', error);
        throw error;
      }

      console.log('Sync result:', data);
      setLastSyncResult(data);
      setIsSynced(true);

      // Refresh profile to get updated data
      await refreshProfile();

    } catch (error) {
      console.error('Failed to sync:', error);
      setIsSynced(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset sync state when user changes
  useEffect(() => {
    setIsSynced(false);
    setLastSyncResult(null);
  }, [session?.user?.id]);

  return (
    <SyncContext.Provider value={{ isSynced, isSyncing, triggerSync, lastSyncResult }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
