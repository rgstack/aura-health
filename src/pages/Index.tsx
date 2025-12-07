import Header from '@/components/Header';
import HealthOrb from '@/components/HealthOrb';
import WalletWidget from '@/components/WalletWidget';
import ActivityWidget from '@/components/ActivityWidget';
import StreakWidget from '@/components/StreakWidget';
import ActionBar from '@/components/ActionBar';
import { SyncProvider } from '@/context/SyncContext';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SyncProvider>
      <div className="min-h-screen bg-background">
        {/* Ambient background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto px-4 pb-8">
          <Header />

          {/* Bento Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4">
            {/* Hero Orb - spans full width */}
            <div className="col-span-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <HealthOrb />
            </div>

            {/* Wallet Widget - top right position in grid */}
            <div className="col-span-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <WalletWidget />
            </div>

            {/* Streak Widget */}
            <div className="col-span-1 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <StreakWidget />
            </div>

            {/* Activity Widget - spans full width */}
            <div className="col-span-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <ActivityWidget />
            </div>

            {/* Action Bar */}
            <div className="col-span-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <ActionBar />
            </div>
          </div>
        </div>
      </div>
    </SyncProvider>
  );
};

export default Index;
