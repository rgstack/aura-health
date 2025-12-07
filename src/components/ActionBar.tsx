import { Watch, ChevronRight, Check, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useSync } from '@/context/SyncContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const ActionBar = () => {
  const { isSynced, isSyncing, triggerSync, lastSyncResult } = useSync();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (isSynced && lastSyncResult?.reward_granted && !hasShownToast.current) {
      hasShownToast.current = true;
      
      // Fire confetti
      const colors = ['#eab308', '#fbbf24', '#fcd34d', '#14b8a6', '#06b6d4'];
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: colors,
      });

      // Additional burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });
      }, 200);

      // Play success sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      } catch (e) {
        console.log('Audio not supported');
      }

      // Show toast with real reward data
      toast({
        title: "Activity Verified",
        description: `+$${lastSyncResult.reward_amount.toFixed(2)} Reward added to your wallet!`,
        duration: 5000,
      });
    }
  }, [isSynced, lastSyncResult, toast]);

  // Reset toast flag when sync state changes
  useEffect(() => {
    if (!isSynced) {
      hasShownToast.current = false;
    }
  }, [isSynced]);

  const handleClick = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!isSyncing) {
      await triggerSync();
    }
  };

  return (
    <div className="glass p-4 md:p-5">
      <Button 
        onClick={handleClick}
        disabled={isSyncing}
        className={`w-full h-14 md:h-16 font-semibold text-base md:text-lg rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group ${
          isSynced 
            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-500/90 hover:to-amber-500/90 shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30' 
            : 'bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
        } text-primary-foreground`}
      >
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center"
            >
              <LogIn className="w-5 h-5 md:w-6 md:h-6 mr-3" />
              <span>Sign In to Sync</span>
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          ) : isSyncing ? (
            <motion.div
              key="syncing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center"
            >
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 mr-3 animate-spin" />
              <span>Syncing...</span>
            </motion.div>
          ) : isSynced ? (
            <motion.div
              key="synced"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center"
            >
              <Check className="w-5 h-5 md:w-6 md:h-6 mr-3" />
              <span>Synced & Verified!</span>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center"
            >
              <Watch className="w-5 h-5 md:w-6 md:h-6 mr-3 group-hover:animate-pulse" />
              <span>Sync Wearable</span>
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
};

export default ActionBar;
