import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSync } from '@/context/SyncContext';
import { useAuth } from '@/context/AuthContext';

const StreakWidget = () => {
  const { isSynced, lastSyncResult } = useSync();
  const { profile } = useAuth();
  
  // Use real data from profile if available
  const baseStreak = profile?.current_streak ?? 12;
  const streakDays = isSynced && lastSyncResult ? lastSyncResult.current_streak : baseStreak;

  return (
    <div className="glass p-5 h-full flex flex-col items-center justify-center glass-hover group cursor-pointer relative overflow-hidden">
      {/* Ambient glow */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: isSynced 
            ? 'linear-gradient(to top, rgba(234, 179, 8, 0.15), transparent)'
            : 'linear-gradient(to top, rgba(251, 146, 60, 0.1), transparent)'
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Flame icon with glow */}
      <div className="relative mb-3">
        <motion.div 
          className="absolute inset-0 blur-xl rounded-full scale-150"
          animate={{
            backgroundColor: isSynced ? 'rgba(234, 179, 8, 0.5)' : 'rgba(251, 146, 60, 0.4)',
            scale: isSynced ? [1.5, 1.8, 1.5] : 1.5,
          }}
          transition={{ duration: 1, repeat: isSynced ? Infinity : 0 }}
        />
        <motion.div
          animate={isSynced ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Flame 
            className={`w-10 h-10 md:w-12 md:h-12 relative z-10 drop-shadow-lg ${isSynced ? 'text-yellow-400' : 'text-streak'}`}
            fill={isSynced ? '#facc15' : 'hsl(var(--streak))'}
            strokeWidth={1.5}
          />
        </motion.div>
      </div>

      {/* Streak count */}
      <div className="text-center relative z-10">
        <motion.span 
          className="text-3xl md:text-4xl font-bold"
          key={streakDays}
          initial={isSynced ? { scale: 1.2, color: '#eab308' } : {}}
          animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
          transition={{ duration: 0.5 }}
        >
          {streakDays}
        </motion.span>
        <span className="text-muted-foreground text-sm block mt-1">Day Streak</span>
      </div>

      {/* Sparkle effects */}
      <motion.div 
        className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full animate-pulse"
        animate={{ backgroundColor: isSynced ? '#facc15' : 'hsl(var(--streak))' }}
      />
      <motion.div 
        className="absolute bottom-6 left-4 w-1 h-1 rounded-full animate-pulse"
        style={{ animationDelay: '0.5s' }}
        animate={{ backgroundColor: isSynced ? 'rgba(250, 204, 21, 0.6)' : 'hsl(var(--streak) / 0.6)' }}
      />
      
      {/* +1 indicator on sync */}
      {isSynced && (
        <motion.div
          className="absolute top-3 right-3 text-xs font-bold text-yellow-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          +1
        </motion.div>
      )}
    </div>
  );
};

export default StreakWidget;
