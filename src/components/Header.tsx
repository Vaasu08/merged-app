import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { ModeToggle } from '@/components/mode-toggle';
import { NotificationBell } from '@/components/NotificationBell';

interface HeaderProps {
  showBackButton?: boolean;
  className?: string;
}

export const Header = ({ showBackButton = true, className = '' }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <nav className="flex items-center space-x-1 sm:space-x-6">
            {showBackButton && (
              <Link 
                to="/" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
              >
                ← Home
              </Link>
            )}
            <Link 
              to="/news" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
            >
              Job News
            </Link>
            <Link 
              to="/insights" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
            >
              Insights
            </Link>
            <Link 
              to="/linkedin" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
            >
              LinkedIn Analyzer
            </Link>
            {user && (
              <Link 
                to="/profile" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
              >
                Profile
              </Link>
            )}
          </nav>
          
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
