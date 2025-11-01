/**
 * Minimal Test Component - Verify React is rendering
 * If you see this, React is working
 */
import React from 'react';

export const MinimalTest: React.FC = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      zIndex: 9999, 
      padding: '10px', 
      background: 'red', 
      color: 'white',
      fontSize: '14px',
      fontFamily: 'monospace'
    }}>
      ✅ React is rendering!
    </div>
  );
};

