import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ATSScoreDisplay from '@/components/ATSScoreDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface Suggestion {
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  impact?: string;
  action?: string;
}

interface ATSScores {
  total?: number;
  overall?: number;
  grade?: string;
  breakdown?: Record<string, number>;
  suggestions: Suggestion[];
  matchedKeywords?: string[];
  missingKeywords?: string[];
  keywordMatch?: number;
  skillsMatch?: number;
  experience?: number;
  education?: number;
  formatting?: number;
}

export default function ATSResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scores, parsedData, usedAI } = location.state as { 
    scores: ATSScores; 
    parsedData: unknown; 
    usedAI: boolean 
  } || {};


  useEffect(() => {
    if (!scores) {
      navigate('/ats-assessment');
    } else {
      console.log('📋 ATSResults received:', {
        suggestionCount: scores.suggestions?.length || 0,
        suggestions: scores.suggestions
      });
    }
  }, [scores, navigate]);


  if (!scores) return null;


  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-6">
        <BackButton to="/ats-assessment" label="Back to Assessment" />
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Assessment Results</h1>
            {usedAI ? (
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Brain className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="w-3 h-3 mr-1" />
                Standard Analysis
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {usedAI 
              ? "Advanced AI analysis with semantic understanding and personalized feedback"
              : "Standard rule-based analysis of your resume's ATS compatibility"
            }
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/ats-assessment')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>


      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ATSScoreDisplay
            score={scores.overall || 0}
            grade={scores.grade || 'N/A'}
            breakdown={{
              keywordMatch: scores.keywordMatch || 0,
              skillsMatch: scores.skillsMatch || 0,
              experience: scores.experience || 0,
              education: scores.education || 0,
              formatting: scores.formatting || 0,
            }}
          />
        </div>


        <div className="lg:col-span-2 space-y-6">
          {/* Matched Keywords */}
          {scores.matchedKeywords && scores.matchedKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Matched Keywords ✓</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {scores.matchedKeywords.slice(0, 15).map((kw: string, idx: number) => (
                    <Badge key={idx} variant="default">{kw}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Missing Keywords */}
          {scores.missingKeywords && scores.missingKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Missing Keywords ⚠️</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {scores.missingKeywords.map((kw: string, idx: number) => (
                    <Badge key={idx} variant="destructive">{kw}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Improvement Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scores.suggestions.map((suggestion: Suggestion, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      suggestion.priority === 'critical'
                        ? 'border-red-600 bg-red-50 dark:bg-red-950/20'
                        : suggestion.priority === 'high'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                        : suggestion.priority === 'medium'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                        : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Badge 
                          variant="outline" 
                          className="mt-0.5 uppercase text-xs"
                        >
                          {suggestion.priority}
                        </Badge>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium">{suggestion.message}</p>
                          {suggestion.impact && (
                            <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              <span className="font-semibold">Impact:</span> {suggestion.impact}
                            </p>
                          )}
                          {suggestion.action && (
                            <p className="text-sm text-blue-700 dark:text-blue-400 flex items-start gap-1">
                              <AlertCircle className="h-3 w-3 mt-0.5" />
                              <span>
                                <span className="font-semibold">Action:</span> {suggestion.action}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}