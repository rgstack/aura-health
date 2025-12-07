import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface SyncContextType {
  isSynced: boolean;
  isSyncing: boolean;
  triggerSync: () => Promise<void>;
  lastSyncResult: SyncResult | null;
  currentSteps: number;
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
  const [currentSteps, setCurrentSteps] = useState(8432); // Initial demo value
  const { session, refreshProfile } = useAuth();

  const triggerSync = async () => {
    if (isSyncing || !session) return;
    
    // Reset synced state to allow re-sync
    setIsSynced(false);
    setIsSyncing(true);

    try {
      // Generate random steps between 10,000 and 15,000 for demo
      const randomSteps = Math.floor(Math.random() * 5000) + 10000;
      setCurrentSteps(randomSteps);

      // Call the edge function with demo_mode enabled
      const { data, error } = await supabase.functions.invoke('sync-health-data', {
        body: {
          steps: randomSteps,
          date: new Date().toISOString().split('T')[0],
          sleep_hours: 7 + Math.random() * 2,
          heart_rate_avg: 65 + Math.floor(Math.random() * 20),
          demo_mode: true, // Enable demo mode to always grant rewards
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
    setCurrentSteps(8432);
  }, [session?.user?.id]);

  return (
    <SyncContext.Provider value={{ isSynced, isSyncing, triggerSync, lastSyncResult, currentSteps }}>
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
