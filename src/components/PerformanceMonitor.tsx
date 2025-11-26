import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { performanceMonitor, type PerformanceMetrics } from '@/lib/performance';
import { Activity, Zap, Clock, TrendingUp, RefreshCw } from 'lucide-react';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cls: null,
    fid: null,
    lcp: null,
    fcp: null,
    ttfb: null,
    inp: null,
  });
  const [grade, setGrade] = useState<'A' | 'B' | 'C' | 'D' | 'F'>('F');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to performance metrics updates
    const unsubscribe = performanceMonitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setGrade(performanceMonitor.getPerformanceGrade());
    });

    return unsubscribe;
  }, []);

  const getMetricRating = (value: number | null, thresholds: [number, number]): 'good' | 'needs-improvement' | 'poor' => {
    if (value === null) return 'poor';
    if (value < thresholds[0]) return 'good';
    if (value < thresholds[1]) return 'needs-improvement';
    return 'poor';
  };

  const getRatingColor = (rating: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good':
        return 'text-green-600 dark:text-green-400';
      case 'needs-improvement':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'poor':
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getRatingBadge = (rating: 'good' | 'needs-improvement' | 'poor'): 'default' | 'secondary' | 'destructive' => {
    const variants: Record<'good' | 'needs-improvement' | 'poor', 'default' | 'secondary' | 'destructive'> = {
      good: 'default',
      'needs-improvement': 'secondary',
      poor: 'destructive',
    };
    return variants[rating];
  };

  const formatValue = (value: number | null, unit: string): string => {
    if (value === null) return 'Measuring...';
    return unit === 'score' ? value.toFixed(3) : `${Math.round(value)}ms`;
  };

  const getGradeColor = () => {
    switch (grade) {
      case 'A':
        return 'text-green-600 dark:text-green-400 border-green-500';
      case 'B':
        return 'text-blue-600 dark:text-blue-400 border-blue-500';
      case 'C':
        return 'text-yellow-600 dark:text-yellow-400 border-yellow-500';
      case 'D':
        return 'text-orange-600 dark:text-orange-400 border-orange-500';
      case 'F':
        return 'text-red-600 dark:text-red-400 border-red-500';
    }
  };

  const getProgressValue = () => {
    const gradeValues = { A: 95, B: 85, C: 75, D: 65, F: 50 };
    return gradeValues[grade];
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Activity className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-2xl border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
            >
              ✕
            </Button>
          </div>
        </div>
        <CardDescription>Real-time Core Web Vitals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Grade */}
        <div className={`flex items-center justify-between p-4 border-2 rounded-lg ${getGradeColor()}`}>
          <div>
            <p className="text-sm text-muted-foreground">Performance Grade</p>
            <p className={`text-4xl font-bold ${getGradeColor()}`}>{grade}</p>
          </div>
          <Progress value={getProgressValue()} className="w-24" />
        </div>

        {/* Metrics */}
        <div className="space-y-3">
          {/* LCP - Largest Contentful Paint */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">LCP</p>
                <p className="text-xs text-muted-foreground">Largest Contentful Paint</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${getRatingColor(getMetricRating(metrics.lcp, [2500, 4000]))}`}>
                {formatValue(metrics.lcp, 'ms')}
              </p>
              <Badge variant={getRatingBadge(getMetricRating(metrics.lcp, [2500, 4000]))} className="text-xs mt-1">
                {getMetricRating(metrics.lcp, [2500, 4000])}
              </Badge>
            </div>
          </div>

          {/* FID - First Input Delay */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">FID</p>
                <p className="text-xs text-muted-foreground">First Input Delay</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${getRatingColor(getMetricRating(metrics.fid, [100, 300]))}`}>
                {formatValue(metrics.fid, 'ms')}
              </p>
              <Badge variant={getRatingBadge(getMetricRating(metrics.fid, [100, 300]))} className="text-xs mt-1">
                {getMetricRating(metrics.fid, [100, 300])}
              </Badge>
            </div>
          </div>

          {/* CLS - Cumulative Layout Shift */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">CLS</p>
                <p className="text-xs text-muted-foreground">Cumulative Layout Shift</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${getRatingColor(getMetricRating(metrics.cls, [0.1, 0.25]))}`}>
                {formatValue(metrics.cls, 'score')}
              </p>
              <Badge variant={getRatingBadge(getMetricRating(metrics.cls, [0.1, 0.25]))} className="text-xs mt-1">
                {getMetricRating(metrics.cls, [0.1, 0.25])}
              </Badge>
            </div>
          </div>

          {/* TTFB - Time to First Byte */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">TTFB</p>
                <p className="text-xs text-muted-foreground">Time to First Byte</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${getRatingColor(getMetricRating(metrics.ttfb, [800, 1800]))}`}>
                {formatValue(metrics.ttfb, 'ms')}
              </p>
              <Badge variant={getRatingBadge(getMetricRating(metrics.ttfb, [800, 1800]))} className="text-xs mt-1">
                {getMetricRating(metrics.ttfb, [800, 1800])}
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Metrics update automatically as you interact with the app
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
