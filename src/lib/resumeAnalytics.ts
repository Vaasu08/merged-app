import { supabase } from './supabaseClient';

export interface ResumeAnalytics {
  userId: string;
  resumeId: string;
  views: number;
  downloads: number;
  atsScoreTrend: number[];
  topKeywords: string[];
  applicationConversionRate: number;
  lastUpdated: string;
  templateUsed: string;
  customizations: {
    accentColor: string;
    fontFamily: string;
    fontSize: string;
  };
}

export interface AnalyticsEvent {
  userId: string;
  eventType: 'view' | 'download' | 'edit' | 'ats_score';
  resumeId: string;
  metadata?: {
    score?: number;
    template?: string;
    keywords?: string[];
    [key: string]: unknown;
  };
  timestamp: string;
}

export interface IndustryBenchmark {
  industry: string;
  avgATSScore: number;
  avgKeywordCount: number;
  avgExperienceYears: number;
  topTemplates: string[];
}

class ResumeAnalyticsService {
  /**
   * Track a resume event (view, download, edit, etc.)
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('resume_analytics_events')
        .insert([
          {
            user_id: event.userId,
            event_type: event.eventType,
            resume_id: event.resumeId,
            metadata: event.metadata,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  /**
   * Get analytics for a specific resume
   */
  async getResumeAnalytics(userId: string, resumeId: string): Promise<ResumeAnalytics | null> {
    try {
      // Get all events for this resume
      const { data: events, error } = await supabase
        .from('resume_analytics_events')
        .select('*')
        .eq('user_id', userId)
        .eq('resume_id', resumeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!events || events.length === 0) return null;

      // Calculate analytics
      const views = events.filter(e => e.event_type === 'view').length;
      const downloads = events.filter(e => e.event_type === 'download').length;
      
      // Get ATS score trend (last 10 scores)
      const atsScores = events
        .filter(e => e.event_type === 'ats_score' && e.metadata?.score)
        .slice(0, 10)
        .map(e => e.metadata.score)
        .reverse();

      // Extract top keywords from metadata
      const allKeywords = events
        .filter(e => e.metadata?.keywords)
        .flatMap(e => e.metadata.keywords);
      const keywordFreq = allKeywords.reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topKeywords = Object.entries(keywordFreq)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([keyword]) => keyword);

      // Get template used (from latest edit event)
      const latestEdit = events.find(e => e.event_type === 'edit');
      const templateUsed = latestEdit?.metadata?.template || 'ada';

      // Get customizations
      const customizations = latestEdit?.metadata?.customizations || {
        accentColor: '#000000',
        fontFamily: 'helvetica',
        fontSize: 'medium'
      };

      return {
        userId,
        resumeId,
        views,
        downloads,
        atsScoreTrend: atsScores,
        topKeywords,
        applicationConversionRate: downloads > 0 ? (downloads / views) * 100 : 0,
        lastUpdated: events[0].created_at,
        templateUsed,
        customizations
      };
    } catch (error) {
      console.error('Failed to get resume analytics:', error);
      return null;
    }
  }

  /**
   * Get all analytics for a user
   */
  async getUserAnalytics(userId: string): Promise<ResumeAnalytics[]> {
    try {
      // Get all unique resume IDs for this user
      const { data: events, error } = await supabase
        .from('resume_analytics_events')
        .select('resume_id')
        .eq('user_id', userId);

      if (error) throw error;
      if (!events) return [];

      const uniqueResumeIds = [...new Set(events.map(e => e.resume_id))];

      // Get analytics for each resume
      const analyticsPromises = uniqueResumeIds.map(resumeId =>
        this.getResumeAnalytics(userId, resumeId as string)
      );

      const results = await Promise.all(analyticsPromises);
      return results.filter((a): a is ResumeAnalytics => a !== null);
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return [];
    }
  }

  /**
   * Get industry benchmarks for comparison
   */
  async getIndustryBenchmarks(industry: string): Promise<IndustryBenchmark | null> {
    try {
      // Get aggregated data for this industry
      const { data, error } = await supabase
        .from('resume_analytics_events')
        .select('metadata')
        .eq('metadata->>industry', industry);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Calculate benchmarks
      const scores = data
        .filter(d => d.metadata?.score)
        .map(d => d.metadata.score);
      const avgATSScore = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;

      const templates = data
        .filter(d => d.metadata?.template)
        .map(d => d.metadata.template);
      const templateFreq = templates.reduce((acc, t) => {
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topTemplates = Object.entries(templateFreq)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([template]) => template);

      return {
        industry,
        avgATSScore,
        avgKeywordCount: 15, // Default for now
        avgExperienceYears: 3, // Default for now
        topTemplates
      };
    } catch (error) {
      console.error('Failed to get industry benchmarks:', error);
      return null;
    }
  }

  /**
   * Compare resume performance to benchmarks
   */
  async compareToIndustry(userId: string, resumeId: string, industry: string) {
    const [analytics, benchmark] = await Promise.all([
      this.getResumeAnalytics(userId, resumeId),
      this.getIndustryBenchmarks(industry)
    ]);

    if (!analytics || !benchmark) return null;

    const latestScore = analytics.atsScoreTrend[analytics.atsScoreTrend.length - 1] || 0;

    return {
      yourScore: latestScore,
      industryAverage: benchmark.avgATSScore,
      scoreDifference: latestScore - benchmark.avgATSScore,
      percentile: latestScore >= benchmark.avgATSScore ? 'Above Average' : 'Below Average',
      topTemplatesInIndustry: benchmark.topTemplates,
      yourTemplate: analytics.templateUsed,
      recommendations: this.generateRecommendations(analytics, benchmark)
    };
  }

  /**
   * Generate recommendations based on analytics
   */
  private generateRecommendations(analytics: ResumeAnalytics, benchmark: IndustryBenchmark): string[] {
    const recommendations: string[] = [];
    const latestScore = analytics.atsScoreTrend[analytics.atsScoreTrend.length - 1] || 0;

    if (latestScore < benchmark.avgATSScore) {
      recommendations.push(`Your ATS score (${latestScore}) is below industry average (${benchmark.avgATSScore.toFixed(1)}). Consider adding more relevant keywords.`);
    }

    if (!benchmark.topTemplates.includes(analytics.templateUsed)) {
      recommendations.push(`Consider trying the ${benchmark.topTemplates[0]} template, which is popular in your industry.`);
    }

    if (analytics.applicationConversionRate < 30) {
      recommendations.push('Your download rate is low. Consider enhancing your resume with AI to make it more compelling.');
    }

    if (analytics.atsScoreTrend.length > 1) {
      const trend = analytics.atsScoreTrend[analytics.atsScoreTrend.length - 1] - 
                    analytics.atsScoreTrend[analytics.atsScoreTrend.length - 2];
      if (trend < 0) {
        recommendations.push('Your ATS score has decreased. Review recent changes and consider reverting to a previous version.');
      }
    }

    return recommendations;
  }

  /**
   * Track resume download
   */
  async trackDownload(userId: string, resumeId: string, template: string): Promise<void> {
    await this.trackEvent({
      userId,
      eventType: 'download',
      resumeId,
      metadata: { template }
    });
  }

  /**
   * Track ATS score calculation
   */
  async trackATSScore(userId: string, resumeId: string, score: number, keywords: string[]): Promise<void> {
    await this.trackEvent({
      userId,
      eventType: 'ats_score',
      resumeId,
      metadata: { score, keywords }
    });
  }

  /**
   * Track resume edit
   */
  async trackEdit(userId: string, resumeId: string, template: string, customizations: Record<string, unknown>): Promise<void> {
    await this.trackEvent({
      userId,
      eventType: 'edit',
      resumeId,
      metadata: { template, customizations }
    });
  }
}

export const resumeAnalyticsService = new ResumeAnalyticsService();
