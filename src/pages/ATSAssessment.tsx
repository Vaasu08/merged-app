import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeUpload from '@/components/ResumeUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ModeToggle } from '@/components/mode-toggle';
import { parseCV } from '@/lib/cvParser';
import { ATSScorerAI, ATSScorerFallback } from '@/lib/atsScorerAI';
import { mlATSClient } from '@/lib/mlATSClient';
import { Loader2, Sparkles, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/BackButton';

export default function ATSAssessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false); // Start with ML backend
  const [useML, setUseML] = useState(true); // ML backend by default
  const [aiAvailable, setAiAvailable] = useState(true);
  const [mlAvailable, setMlAvailable] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

  // Check ML backend and API key validity on component mount
  useEffect(() => {
    const checkAvailability = async () => {
      // Check ML backend
      try {
        const mlReady = await mlATSClient.isAvailable();
        setMlAvailable(mlReady);
        setUseML(mlReady);
      } catch (error) {
        console.warn('ML backend check failed:', error);
        setMlAvailable(false);
        setUseML(false);
      }

      // Check AI API key
      try {
        const aiScorer = new ATSScorerAI();
        const isValid = await aiScorer.testConnection();
        setApiKeyValid(isValid);
        setAiAvailable(isValid);
      } catch (error) {
        console.warn('API key validation failed:', error);
        setApiKeyValid(false);
        setAiAvailable(false);
        setUseAI(false);
      }
    };

    checkAvailability();
  }, []);

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please upload your resume first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let scores;
      
      // Try ML backend first if enabled
      if (useML && mlAvailable) {
        try {
          const mlResult = await mlATSClient.scoreResume(file, jobDescription || undefined);
          
          // Convert ML response to ATSScores format - map ML fields to expected format
          // Grade based on score
          const grade = mlResult.overall_score >= 85 ? 'A' 
            : mlResult.overall_score >= 75 ? 'B'
            : mlResult.overall_score >= 60 ? 'C'
            : mlResult.overall_score >= 45 ? 'D'
            : 'F';
          
          scores = {
            overall: mlResult.overall_score,
            grade: grade,
            // Map ML breakdown fields to expected display fields
            keywordMatch: mlResult.breakdown.keywords,
            skillsMatch: mlResult.breakdown.skills,
            experience: mlResult.breakdown.experience,
            education: mlResult.breakdown.structure,  // Structure includes education
            formatting: mlResult.breakdown.formatting,
            // Also keep raw values for flexibility
            keywords: mlResult.breakdown.keywords,
            skills: mlResult.breakdown.skills,
            structure: mlResult.breakdown.structure,
            // Convert suggestions to expected format with priorities
            suggestions: mlResult.suggestions.map(s => ({
              type: s.category,
              priority: s.priority,
              message: s.suggestion,
            })),
            confidence: mlResult.confidence,
            modelVersion: mlResult.model_version,
          };
          
          toast({
            title: 'ML Analysis Complete',
            description: `Resume scored using ML model v${mlResult.model_version || '2.0'} (${(mlResult.confidence * 100).toFixed(0)}% confidence)`,
          });
        } catch (mlError) {
          console.warn('ML scoring failed, falling back:', mlError);
          setMlAvailable(false);
          
          // Fallback to AI or rule-based
          const parsedData = await parseCV(file);
          scores = ATSScorerFallback.calculateScore(parsedData, jobDescription || undefined);
          
          toast({
            title: 'Using Standard Analysis',
            description: 'ML backend unavailable, using fallback scoring',
            variant: 'default',
          });
        }
      } else if (useAI && aiAvailable) {
        // Parse resume for AI scoring
        const parsedData = await parseCV(file);
        
        try {
          // Use AI-powered scoring
          const aiScorer = new ATSScorerAI();
          scores = await aiScorer.calculateScore(parsedData, jobDescription || undefined);
          
          toast({
            title: 'AI Analysis Complete',
            description: 'Resume analyzed using advanced AI technology!',
          });
        } catch (aiError) {
          console.warn('AI scoring failed, falling back to rule-based:', aiError);
          setAiAvailable(false);
          
          // Fallback to rule-based scoring
          scores = ATSScorerFallback.calculateScore(parsedData, jobDescription || undefined);
          
          const errorMessage = aiError instanceof Error ? aiError.message : '';
          const isQuotaError = errorMessage.includes('quota') || errorMessage.includes('429');
          
          toast({
            title: isQuotaError ? 'AI Quota Reached' : 'Using Standard Analysis',
            description: isQuotaError 
              ? 'AI quota exceeded. Using rule-based scoring.'
              : 'Using rule-based scoring',
            variant: 'default',
          });
        }
      } else {
        // Use rule-based scoring
        const parsedData = await parseCV(file);
        scores = ATSScorerFallback.calculateScore(parsedData, jobDescription || undefined);
        
        toast({
          title: 'Analysis Complete',
          description: 'Resume analyzed using standard scoring',
        });
      }
      
      // Navigate to results with data
      navigate('/ats-results', { 
        state: { 
          scores, 
          parsedData: file, 
          usedAI: useAI && aiAvailable,
          usedML: useML && mlAvailable,
          modelVersion: useML && mlAvailable ? '2.0' : undefined
        } 
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl relative">
      <div className="mb-6">
        <BackButton to="/resume" />
      </div>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">ATS Resume Assessment</h1>
        <p className="text-lg text-muted-foreground">
          Get instant feedback on your resume's ATS compatibility
        </p>
        
        {/* Service Status */}
        <div className="mt-4 space-y-2">
          {mlAvailable && (
            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <CheckCircle className="h-4 w-4" />
              <span>ML Backend is available (Port 8000)</span>
            </div>
          )}
          {apiKeyValid === null ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking AI service availability...</span>
            </div>
          ) : apiKeyValid ? (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>AI service is available</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-4 w-4" />
              <span>AI service unavailable - using standard analysis</span>
            </div>
          )}
        </div>
        
        {/* Scoring Mode Toggles */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {/* ML Backend Toggle */}
          {mlAvailable && (
            <div className="flex items-center gap-3">
              <Switch
                id="ml-mode"
                checked={useML}
                onCheckedChange={(checked) => {
                  setUseML(checked);
                  if (checked) setUseAI(false);
                }}
                disabled={!mlAvailable}
              />
              <Label htmlFor="ml-mode" className="flex items-center gap-2 cursor-pointer">
                <Brain className="w-4 h-4 text-blue-500" />
                <span className="font-medium">ML Model</span>
              </Label>
            </div>
          )}
          
          {/* AI Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="ai-mode"
              checked={useAI}
              onCheckedChange={(checked) => {
                setUseAI(checked);
                if (checked) setUseML(false);
              }}
              disabled={!aiAvailable || apiKeyValid === null}
            />
            <Label htmlFor="ai-mode" className="flex items-center gap-2 cursor-pointer">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="font-medium">AI Analysis</span>
              {!aiAvailable && (
                <AlertCircle className="w-4 h-4 text-orange-500" />
              )}
            </Label>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mt-2">
          {useML && mlAvailable ? (
            <span className="text-blue-600 font-medium">
              🎯 Using Industry-Grade XGBoost ML model v2.0 (98.8% accuracy, 2.32pt MAE)
            </span>
          ) : useAI && aiAvailable ? (
            <span className="text-purple-600 font-medium">
              🤖 Using advanced AI for semantic analysis and personalized feedback
            </span>
          ) : (
            <span className="text-muted-foreground">
              📊 Using standard rule-based analysis
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Upload Your Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResumeUpload onFileSelect={setFile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Job Description (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the job description here for targeted analysis..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!file || loading}
            className={`${
              useAI && aiAvailable 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {useAI && aiAvailable ? 'AI Analyzing...' : 'Analyzing...'}
              </>
            ) : (
              <>
                {useAI && aiAvailable ? (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    AI Analyze Resume
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}