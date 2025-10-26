import React from 'react';
import { motion } from 'framer-motion';

interface HorizonLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'light' | 'dark';
}

export const HorizonLogo = ({ 
  className = '', 
  size = 'md', 
  showTagline = false,
  variant = 'light'
}: HorizonLogoProps) => {
  const sizeClasses = {
    sm: {
      container: 'h-8',
      text: 'text-lg',
      tagline: 'text-xs',
      sphere: 'w-6 h-6',
      dot: 'w-1 h-1'
    },
    md: {
      container: 'h-10',
      text: 'text-xl',
      tagline: 'text-sm',
      sphere: 'w-8 h-8',
      dot: 'w-1.5 h-1.5'
    },
    lg: {
      container: 'h-12',
      text: 'text-2xl',
      tagline: 'text-base',
      sphere: 'w-10 h-10',
      dot: 'w-2 h-2'
    }
  };

  const colors = {
    light: {
      text: 'text-white',
      tagline: 'text-white/70',
      sphere: 'text-white/40',
      dot: 'text-white/80',
      gradient: 'from-purple-400 via-pink-400 to-red-400'
    },
    dark: {
      text: 'text-gray-800',
      tagline: 'text-gray-600',
      sphere: 'text-gray-500',
      dot: 'text-gray-700',
      gradient: 'from-purple-500 via-pink-500 to-red-500'
    }
  };

  const currentSize = sizeClasses[size];
  const currentColors = colors[variant];

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {/* Sophisticated Wireframe Sphere */}
      <div className={`relative ${currentSize.sphere} ${currentColors.sphere}`}>
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        >
          {/* Intertwined curved shapes - creating the sophisticated wireframe */}
          <g>
            {/* Main curved spirals */}
            <path d="M 20 20 Q 30 10 40 20 Q 50 30 60 20 Q 70 10 80 20" strokeWidth="1.2" />
            <path d="M 20 80 Q 10 70 20 60 Q 30 50 20 40 Q 10 30 20 20" strokeWidth="1.2" />
            <path d="M 80 80 Q 70 90 60 80 Q 50 70 40 80 Q 30 90 20 80" strokeWidth="1.2" />
            <path d="M 80 20 Q 90 30 80 40 Q 70 50 80 60 Q 90 70 80 80" strokeWidth="1.2" />
            
            {/* Inner connecting curves */}
            <path d="M 30 30 Q 40 25 50 30 Q 60 35 70 30" strokeWidth="0.8" />
            <path d="M 30 70 Q 25 60 30 50 Q 35 40 30 30" strokeWidth="0.8" />
            <path d="M 70 70 Q 60 75 50 70 Q 40 65 30 70" strokeWidth="0.8" />
            <path d="M 70 30 Q 75 40 70 50 Q 65 60 70 70" strokeWidth="0.8" />
            
            {/* Central focal point lines */}
            <line x1="50" y1="20" x2="50" y2="80" strokeWidth="0.6" />
            <line x1="20" y1="50" x2="80" y2="50" strokeWidth="0.6" />
            <line x1="30" y1="30" x2="70" y2="70" strokeWidth="0.6" />
            <line x1="70" y1="30" x2="30" y2="70" strokeWidth="0.6" />
            
            {/* Outer boundary circle */}
            <circle cx="50" cy="50" r="40" strokeWidth="0.5" opacity="0.6" />
          </g>
        </svg>
      </div>

      {/* Logo Text with Gradient */}
      <div className="flex flex-col relative">
        <div className={`font-bold uppercase tracking-wide ${currentSize.text} relative`}>
          <span className={`bg-gradient-to-r ${currentColors.gradient} bg-clip-text text-transparent`}>
            HORIZON
          </span>
          {/* Compass dot in the second O */}
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`${currentSize.dot} ${currentColors.dot} rounded-full bg-current`} 
                 style={{ marginLeft: '0.4em' }} />
          </span>
        </div>
        {showTagline && (
          <div className={`${currentSize.tagline} ${currentColors.tagline} uppercase tracking-wide`}>
            YOUR AI-POWERED CAREER COMPASS
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HorizonLogo;

