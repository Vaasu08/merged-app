import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { ModeToggle } from '@/components/mode-toggle';
import { HorizonLogo } from '@/components/HorizonLogo';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <HorizonLogo size="md" variant="dark" />
          </Link>

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
              to="/insights" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
            >
              Insights
            </Link>
            {/* === Add ATS Assessment Nav Link === */}
            <Link 
              to="/ats-assessment"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
            >
              ATS Assessment
            </Link>
            {/* === Add Skill Graph Link === */}
            <Link 
              to="/skill-graph"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
            >
              🗺️ Skill Graph
            </Link>
            {/* === AI Career Agents === */}
            {user && (
              <Link 
                to="/agent-swarm"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
              >
                🤖 AI Agents
              </Link>
            )}
            {/* === Add Resume Builder Link (optional, usually for authenticated users) === */}
            {user && (
              <>
                <Link 
                  to="/resume"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
                >
                  Resume Builder
                </Link>
                <Link 
                  to="/profile" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
                >
                  Profile
                </Link>
              </>
            )}
            {/* Roadmap Builder Link */}
            <Link to="/roadmap">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                <Target className="w-4 h-4 mr-2" />
                Roadmap Builder
              </Button>
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
