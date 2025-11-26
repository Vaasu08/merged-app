import { useEffect, useState, useRef, type ReactNode } from 'react';

interface ViewportObserverProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  once?: boolean;
}

/**
 * Viewport Observer Component
 * Renders children only when they enter the viewport
 * Improves INP and reduces initial render time
 */
export const ViewportObserver = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback = null,
  once = true,
}: ViewportObserverProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return <div ref={containerRef}>{isVisible ? children : fallback}</div>;
};

export default ViewportObserver;
