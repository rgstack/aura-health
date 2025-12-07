import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSync } from '@/context/SyncContext';
import { useAuth } from '@/context/AuthContext';

const WalletWidget = () => {
  const { isSynced, lastSyncResult } = useSync();
  const { profile } = useAuth();
  
  // Use real data from profile if available, otherwise demo data
  const baseBalance = profile?.total_earnings ?? 124.50;
  const balance = isSynced && lastSyncResult ? lastSyncResult.total_earnings : baseBalance;
  const rewardAmount = lastSyncResult?.reward_amount ?? 0;
  const percentChange = isSynced ? 14 : 12;
  
  // Mini trend data points
  const baseTrendData = [20, 25, 22, 35, 30, 45, 42, 55, 50, 62];
  const trendData = isSynced ? [...baseTrendData, 68, 75] : baseTrendData;
  const maxVal = Math.max(...trendData);
  const minVal = Math.min(...trendData);
  const range = maxVal - minVal;

  const pathPoints = trendData
    .map((val, i) => {
      const x = (i / (trendData.length - 1)) * 100;
      const y = 100 - ((val - minVal) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="glass p-5 h-full flex flex-col justify-between glass-hover group cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Wallet Balance</span>
        <motion.div 
          className="flex items-center gap-1 text-success text-xs font-medium"
          animate={isSynced ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <TrendingUp className="w-3 h-3" />
          <span>+{percentChange}%</span>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center">
        <motion.span 
          className="text-3xl md:text-4xl font-bold tracking-tight"
          key={balance}
          initial={isSynced ? { scale: 1.1, color: '#eab308' } : {}}
          animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-muted-foreground text-xl">$</span>
          {balance.toFixed(2)}
        </motion.span>
      </div>

      {/* Mini trend chart */}
      <div className="h-12 mt-2 relative">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isSynced ? "#eab308" : "hsl(160 84% 39%)"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isSynced ? "#eab308" : "hsl(160 84% 39%)"} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <motion.polygon
            points={`0,100 ${pathPoints} 100,100`}
            fill="url(#trendGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Line */}
          <motion.polyline
            points={pathPoints}
            fill="none"
            stroke={isSynced ? "#eab308" : "hsl(160 84% 39%)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        
        {/* Reward indicator */}
        {isSynced && rewardAmount > 0 && (
          <motion.div
            className="absolute top-0 right-0 text-xs font-semibold text-yellow-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            +${rewardAmount.toFixed(2)}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WalletWidget;
