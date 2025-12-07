import { Bell, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="flex items-center justify-between py-4 px-1">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gradient">Aura Health</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {user ? `Welcome, ${profile?.full_name || user.email?.split('@')[0]}` : 'Welcome back'}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="glass w-10 h-10 flex items-center justify-center glass-hover">
          <Bell className="w-4 h-4 text-muted-foreground" />
        </button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="glass w-10 h-10 flex items-center justify-center glass-hover">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-border/50">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive">
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button 
            onClick={() => navigate('/auth')}
            className="glass px-4 h-10 flex items-center justify-center glass-hover text-sm font-medium"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
