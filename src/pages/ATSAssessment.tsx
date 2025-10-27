import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeUpload from '@/components/ResumeUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { parseCV } from '@/lib/cvParser';
import { ATSScorer } from '@/lib/atsScorer';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function ATSAssessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);


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
     
      // Calculate ATS score
      const scores = ATSScorer.calculateScore(parsedData, jobDescription || undefined);
     
      // Navigate to results with data
      navigate('/ats-results', { state: { scores, parsedData } });
     
      toast({
        title: 'Success',
        description: 'Resume analyzed successfully!',
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
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">ATS Resume Assessment</h1>
        <p className="text-lg text-muted-foreground">
          Get instant feedback on your resume's ATS compatibility
        </p>
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
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Resume'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}