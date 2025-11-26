import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Eye, 
  Target,
  BarChart3,
  Award,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { resumeAnalyticsService, type ResumeAnalytics } from '@/lib/resumeAnalytics';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface IndustryComparison {
  yourScore: number;
  industryAverage: number;
  scoreDifference: number;
  percentile: string;
  topTemplatesInIndustry: string[];
  yourTemplate: string;
  recommendations: string[];
}

interface AnalyticsDashboardProps {
  userId: string;
  resumeId: string;
  industry?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  userId, 
  resumeId,
  industry = 'Technology' 
}) => {
  const [analytics, setAnalytics] = useState<ResumeAnalytics | null>(null);
  const [comparison, setComparison] = useState<IndustryComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, comparisonData] = await Promise.all([
        resumeAnalyticsService.getResumeAnalytics(userId, resumeId),
        resumeAnalyticsService.compareToIndustry(userId, resumeId, industry)
      ]);
      setAnalytics(analyticsData);
      setComparison(comparisonData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, resumeId, industry]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No analytics data available yet.</p>
            <p className="text-sm text-muted-foreground">Download your resume to start tracking!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestScore = analytics.atsScoreTrend[analytics.atsScoreTrend.length - 1] || 0;
  const scoreChange = analytics.atsScoreTrend.length > 1
    ? analytics.atsScoreTrend[analytics.atsScoreTrend.length - 1] - 
      analytics.atsScoreTrend[analytics.atsScoreTrend.length - 2]
    : 0;

  const chartData = analytics.atsScoreTrend.map((score, index) => ({
    version: `V${index + 1}`,
    score
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Resume Performance Dashboard
              </CardTitle>
              <CardDescription>
                Track your resume's performance and compare with industry standards
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadAnalytics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current ATS Score */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Current ATS Score</p>
                <Target className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{latestScore}</p>
                {scoreChange !== 0 && (
                  <Badge variant={scoreChange > 0 ? "default" : "destructive"} className="gap-1">
                    {scoreChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(scoreChange).toFixed(1)}
                  </Badge>
                )}
              </div>
              <Progress value={latestScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Views */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{analytics.views}</p>
              <p className="text-xs text-muted-foreground">
                Times you've previewed your resume
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Downloads */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                <Download className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{analytics.downloads}</p>
              <p className="text-xs text-muted-foreground">
                PDF downloads completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{analytics.applicationConversionRate.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">
                Download rate from views
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ATS Score Trend Chart */}
      {analytics.atsScoreTrend.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ATS Score Trend</CardTitle>
            <CardDescription>Track how your score improves over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="version" stroke="currentColor" className="text-xs" />
                <YAxis stroke="currentColor" className="text-xs" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Industry Comparison */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5" />
              Industry Comparison
            </CardTitle>
            <CardDescription>
              How you compare to other professionals in {industry}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Your Score</p>
                <p className="text-2xl font-bold">{comparison.yourScore}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Industry Average</p>
                <p className="text-2xl font-bold">{comparison.industryAverage.toFixed(1)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Badge 
                variant={comparison.scoreDifference >= 0 ? "default" : "secondary"}
                className="mb-3"
              >
                {comparison.percentile}
              </Badge>
              <p className="text-sm text-muted-foreground">
                You're {Math.abs(comparison.scoreDifference).toFixed(1)} points{' '}
                {comparison.scoreDifference >= 0 ? 'above' : 'below'} the industry average
              </p>
            </div>

            {comparison.topTemplatesInIndustry && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-2">Popular Templates in {industry}</p>
                <div className="flex gap-2">
                  {comparison.topTemplatesInIndustry.map((template: string) => (
                    <Badge 
                      key={template} 
                      variant={template === comparison.yourTemplate ? "default" : "outline"}
                    >
                      {template.charAt(0).toUpperCase() + template.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Keywords */}
      {analytics.topKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Keywords</CardTitle>
            <CardDescription>Most frequently used terms in your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.topKeywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {comparison?.recommendations && comparison.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Recommendations
            </CardTitle>
            <CardDescription>Actionable insights to improve your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparison.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Template</p>
              <p className="font-medium">{analytics.templateUsed.charAt(0).toUpperCase() + analytics.templateUsed.slice(1)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Accent Color</p>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: analytics.customizations.accentColor }}
                />
                <p className="font-medium">{analytics.customizations.accentColor}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Font</p>
              <p className="font-medium">{analytics.customizations.fontFamily}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Size</p>
              <p className="font-medium">{analytics.customizations.fontSize}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
