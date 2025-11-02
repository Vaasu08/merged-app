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
import { Loader2, Sparkles, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/BackButton';

export default function ATSAssessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(true); // AI-powered by default
  const [aiAvailable, setAiAvailable] = useState(true);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

  // Check API key validity on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const aiScorer = new ATSScorerAI();
        const isValid = await aiScorer.testConnection();
        setApiKeyValid(isValid);
        setAiAvailable(isValid);
        setUseAI(isValid); // Enable AI by default if API key is valid
      } catch (error) {
        console.warn('API key validation failed:', error);
        setApiKeyValid(false);
        setAiAvailable(false);
        setUseAI(false);
      }
    };

    checkApiKey();
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
      // Parse resume using existing cvParser
      const parsedData = await parseCV(file);
      
      let scores;
      
      if (useAI && aiAvailable) {
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
          
          toast({
            title: 'Analysis Complete',
            description: 'Resume analyzed using standard scoring (AI temporarily unavailable)',
            variant: 'default',
          });
        }
      } else {
        // Use rule-based scoring
        scores = ATSScorerFallback.calculateScore(parsedData, jobDescription || undefined);
        
        toast({
          title: 'Analysis Complete',
          description: 'Resume analyzed using standard scoring',
        });
      }
      
      // Navigate to results with data
      navigate('/ats-results', { state: { scores, parsedData, usedAI: useAI && aiAvailable } });
      
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
        
        {/* API Key Status */}
        <div className="mt-4">
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
        
        {/* AI Toggle */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <Switch
            id="ai-mode"
            checked={useAI}
            onCheckedChange={setUseAI}
            disabled={!aiAvailable || apiKeyValid === null}
          />
          <Label htmlFor="ai-mode" className="flex items-center gap-2 cursor-pointer">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="font-medium">AI-Powered Analysis</span>
            {!aiAvailable && (
              <AlertCircle className="w-4 h-4 text-orange-500" />
            )}
          </Label>
        </div>
        
        <div className="text-sm text-muted-foreground mt-2">
          {useAI && aiAvailable ? (
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