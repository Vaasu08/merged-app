import React, { useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import Index from '@/pages/Index';

/**
 * Wrapper component for Index page with error boundary
 * This ensures the Index page failures don't crash the entire app
 */
const IndexWrapper: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    console.log('✅ IndexWrapper mounted');
  }, []);

  // If error occurred, show fallback
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Unable to Load Page</h1>
          <p className="text-muted-foreground mb-4">
            There was an error loading the homepage. Please refresh the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Page Error</h1>
            <p className="text-muted-foreground mb-4">
              An error occurred. Please refresh or try again later.
            </p>
          </div>
        </div>
      }
    >
      <Index />
    </ErrorBoundary>
  );
};

export default IndexWrapper;
