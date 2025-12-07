import { Footprints } from 'lucide-react';
import { useSync } from '@/context/SyncContext';
import { motion } from 'framer-motion';

const ActivityWidget = () => {
  const { currentSteps, isSynced } = useSync();
  const goal = 10000;
  const progress = Math.min((currentSteps / goal) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass p-5 h-full flex flex-col glass-hover group cursor-pointer">
      <div className="flex items-center gap-2 mb-4">
        <Footprints className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Daily Activity</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Progress ring */}
          <svg className="w-24 h-24 md:w-28 md:h-28 -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={isSynced && currentSteps >= goal ? "url(#successGradient)" : "url(#progressGradient)"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={false}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(180 70% 50%)" />
                <stop offset="100%" stopColor="hsl(280 70% 60%)" />
              </linearGradient>
              <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(45 100% 50%)" />
                <stop offset="100%" stopColor="hsl(35 100% 55%)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              key={currentSteps}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xl md:text-2xl font-bold"
            >
              {currentSteps.toLocaleString()}
            </motion.span>
            <span className="text-xs text-muted-foreground">/ {(goal / 1000).toFixed(0)}k</span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className="text-xs text-muted-foreground">
          {currentSteps >= goal ? '🎉 Goal reached!' : `${Math.round(progress)}% of daily goal`}
        </span>
      </div>
    </div>
  );
};

export default ActivityWidget;
