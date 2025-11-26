import { onCLS, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals';

/**
 * Performance monitoring utility
 * Tracks Core Web Vitals and sends to analytics
 */

interface PerformanceMetrics {
  cls: number | null; // Cumulative Layout Shift
  fid: number | null; // First Input Delay (deprecated, using INP instead)
  lcp: number | null; // Largest Contentful Paint
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  inp: number | null; // Interaction to Next Paint
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    cls: null,
    fid: null,
    lcp: null,
    fcp: null,
    ttfb: null,
    inp: null,
  };

  private listeners: Array<(metrics: PerformanceMetrics) => void> = [];

  constructor() {
    this.initWebVitals();
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initWebVitals() {
    // Cumulative Layout Shift (CLS) - should be < 0.1
    onCLS((metric: Metric) => {
      this.updateMetric('cls', metric.value);
      this.logMetric('CLS', metric.value, metric.value < 0.1 ? 'good' : metric.value < 0.25 ? 'needs-improvement' : 'poor');
    });

    // Interaction to Next Paint (INP) - should be < 200ms (replaces FID)
    onINP((metric: Metric) => {
      this.updateMetric('fid', metric.value); // Using fid slot for INP
      this.updateMetric('inp', metric.value);
      this.logMetric('INP', metric.value, metric.value < 200 ? 'good' : metric.value < 500 ? 'needs-improvement' : 'poor');
    });

    // Largest Contentful Paint (LCP) - should be < 2.5s
    onLCP((metric: Metric) => {
      this.updateMetric('lcp', metric.value);
      this.logMetric('LCP', metric.value, metric.value < 2500 ? 'good' : metric.value < 4000 ? 'needs-improvement' : 'poor');
    });

    // First Contentful Paint (FCP) - should be < 1.8s
    onFCP((metric: Metric) => {
      this.updateMetric('fcp', metric.value);
      this.logMetric('FCP', metric.value, metric.value < 1800 ? 'good' : metric.value < 3000 ? 'needs-improvement' : 'poor');
    });

    // Time to First Byte (TTFB) - should be < 800ms
    onTTFB((metric: Metric) => {
      this.updateMetric('ttfb', metric.value);
      this.logMetric('TTFB', metric.value, metric.value < 800 ? 'good' : metric.value < 1800 ? 'needs-improvement' : 'poor');
    });
  }

  /**
   * Update metric and notify listeners
   */
  private updateMetric(key: keyof PerformanceMetrics, value: number) {
    this.metrics[key] = value;
    this.notifyListeners();
  }

  /**
   * Log metric to console with color coding
   */
  private logMetric(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
    const color = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴';
    const formattedValue = name === 'CLS' ? value.toFixed(3) : `${Math.round(value)}ms`;
    console.log(`${color} ${name}: ${formattedValue} (${rating})`);
  }

  /**
   * Subscribe to metrics updates
   */
  subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(callback);
    // Immediately call with current metrics
    callback(this.metrics);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners of metric changes
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.metrics));
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Send metrics to analytics endpoint (placeholder)
   */
  async sendToAnalytics() {
    try {
      // Replace with your actual analytics endpoint
      // await fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     metrics: this.metrics,
      //     timestamp: Date.now(),
      //     url: window.location.href,
      //     userAgent: navigator.userAgent,
      //   }),
      // });
      
      console.log('📊 Performance metrics ready for analytics:', this.metrics);
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  /**
   * Get performance grade
   */
  getPerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const { cls, fid, lcp, fcp, ttfb } = this.metrics;
    let score = 0;
    let count = 0;

    if (cls !== null) {
      score += cls < 0.1 ? 100 : cls < 0.25 ? 75 : 50;
      count++;
    }
    if (fid !== null) {
      score += fid < 100 ? 100 : fid < 300 ? 75 : 50;
      count++;
    }
    if (lcp !== null) {
      score += lcp < 2500 ? 100 : lcp < 4000 ? 75 : 50;
      count++;
    }
    if (fcp !== null) {
      score += fcp < 1800 ? 100 : fcp < 3000 ? 75 : 50;
      count++;
    }
    if (ttfb !== null) {
      score += ttfb < 800 ? 100 : ttfb < 1800 ? 75 : 50;
      count++;
    }

    const average = count > 0 ? score / count : 0;
    
    if (average >= 90) return 'A';
    if (average >= 80) return 'B';
    if (average >= 70) return 'C';
    if (average >= 60) return 'D';
    return 'F';
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type { PerformanceMetrics };
