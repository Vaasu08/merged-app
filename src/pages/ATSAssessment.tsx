import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Loader2, ArrowLeft, Sparkles, Zap, Brain } from 'lucide-react';
import { ATSScorerHybrid } from '@/lib/atsScorerHybrid';
import { ATSScorerFallback } from '@/lib/atsScorerAI';
import { pdfParser } from '@/lib/pdfParser';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

// Helper functions for resume parsing
const extractSkills = (text: string): string[] => {
  const skillPatterns = [
    'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'next\\.?js', 'node\\.?js', 'express', 'django', 'flask', 'spring', 'rails',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'material-?ui',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'graphql', 'rest',
    'git', 'github', 'gitlab', 'jira', 'agile', 'scrum',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp',
    'sql', 'nosql', 'api', 'microservices', 'serverless'
  ];
  
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  skillPatterns.forEach(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.push(skill.replace(/\\./g, '.').replace(/\\+/g, '+'));
    }
  });
  
  return [...new Set(found)];
};

const extractExperience = (text: string): number => {
  const yearPatterns = [
    /(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i,
    /experience[:\s]+(\d+)\+?\s*years?/i,
    /(senior|lead|principal|staff)/i
  ];
  
  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  // Estimate from job history
  const dateMatches = text.match(/\b(20\d{2}|19\d{2})\b/g);
  if (dateMatches && dateMatches.length >= 2) {
    const years = dateMatches.map(y => parseInt(y, 10));
    const range = Math.max(...years) - Math.min(...years);
    return Math.min(range, 20);
  }
  
  return 0;
};

const extractEducation = (text: string): string[] => {
  const eduPatterns = [
    /(?:bachelor|b\.?s\.?|b\.?a\.?|b\.?e\.?|b\.?tech)/i,
    /(?:master|m\.?s\.?|m\.?a\.?|m\.?e\.?|m\.?tech|mba)/i,
    /(?:ph\.?d|doctorate|doctor)/i,
    /(?:computer science|engineering|information technology|data science)/i
  ];
  
  const found: string[] = [];
  eduPatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match) {
      found.push(match[0]);
    }
  });
  
  return found;
};

const extractKeywords = (text: string): string[] => {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'that', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very']);
  return [...new Set(words.filter(w => w.length > 3 && !stopWords.has(w)))];
};

const ATSAssessment = () => {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [useAI, setUseAI] = useState(true);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      if (file.type === 'application/pdf') {
        try {
          toast({
            title: "Processing PDF",
            description: "Extracting text from your resume...",
          });
          
          const text = await pdfParser.parseFile(file);
          setResumeText(text);
          
          toast({
            title: "PDF Processed",
            description: "Resume text extracted successfully!",
          });
        } catch (error) {
          console.error('PDF parsing error:', error);
          toast({
            title: "PDF Error",
            description: "Could not extract text from PDF. Please paste your resume text manually.",
            variant: "destructive",
          });
        }
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setResumeText(text);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast({
        title: "Resume Required",
        description: "Please upload or paste your resume text.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      let result;
      
      if (useAI) {
        // Use Hybrid ATS scoring (rule-based + AI suggestions)
        try {
          toast({
            title: "🔄 Analyzing Resume",
            description: "Using hybrid AI scoring for accurate results...",
          });
          result = await ATSScorerHybrid.analyzeResume(resumeText, jobDescription || undefined);
          result.usedAI = true;
        } catch (aiError) {
          console.warn('Hybrid scoring failed, using fallback:', aiError);
          // Parse resume for fallback - create a complete ParsedCV object
          const parsedData = {
            text: resumeText,
            skills: extractSkills(resumeText),
            experienceYears: extractExperience(resumeText),
            education: extractEducation(resumeText),
            keywords: extractKeywords(resumeText),
            contactInfo: {},
            experience: [],
            confidence: 50,
            sections: {}
          };
          result = ATSScorerFallback.calculateScore(parsedData, jobDescription || undefined);
          result.usedAI = false;
          toast({
            title: "Using Fallback Scoring",
            description: "Groq AI unavailable, using rule-based analysis.",
          });
        }
      } else {
        // Use rule-based fallback scoring
        const parsedData = {
          text: resumeText,
          skills: extractSkills(resumeText),
          experienceYears: extractExperience(resumeText),
          education: extractEducation(resumeText),
          keywords: extractKeywords(resumeText),
          contactInfo: {},
          experience: [],
          confidence: 50,
          sections: {}
        };
        result = ATSScorerFallback.calculateScore(parsedData, jobDescription || undefined);
        result.usedAI = false;
      }
      
      // Navigate to results page with the analysis data
      navigate('/ats-results', { 
        state: { 
          result,
          resumeText,
          jobDescription
        } 
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-horizon-blue via-horizon-purple to-horizon-pink p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white flex items-center justify-center gap-2">
              <FileText className="w-8 h-8" />
              ATS Resume Assessment
            </CardTitle>
            <CardDescription className="text-white/70 text-lg">
              Get your resume scored and optimized for Applicant Tracking Systems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scoring Method Toggle */}
            <div className="flex items-center justify-center gap-4 p-4 bg-white/5 rounded-lg">
              <span className="text-white/70 text-sm">Scoring Method:</span>
              <div className="flex gap-2">
                <Button
                  variant={useAI ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseAI(true)}
                  className={useAI ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/10 border-white/20 text-white"}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI Powered
                </Button>
                <Button
                  variant={!useAI ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseAI(false)}
                  className={!useAI ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-white/10 border-white/20 text-white"}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Rule-Based
                </Button>
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="space-y-4">
              <Label className="text-white text-lg">Your Resume</Label>
              
              {/* File Upload */}
              <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-white/50 transition-colors">
                <Input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-white/50 mb-2" />
                  <p className="text-white/70">
                    {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-white/50 text-sm mt-1">PDF, TXT, DOC, DOCX</p>
                </label>
              </div>

              {/* Text Area */}
              <Textarea
                placeholder="Or paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Job Description Section (Optional) */}
            <div className="space-y-4">
              <Label className="text-white text-lg">Job Description (Optional)</Label>
              <Textarea
                placeholder="Paste the job description to get tailored recommendations..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeText.trim()}
              className="w-full bg-gradient-to-r from-horizon-orange to-horizon-pink hover:opacity-90 text-white py-6 text-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Analyze My Resume
                </>
              )}
            </Button>

            {/* Info Section */}
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <h3 className="text-white font-semibold">What you'll get:</h3>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Overall ATS compatibility score</li>
                <li>• Keyword analysis and optimization tips</li>
                <li>• Format and structure recommendations</li>
                <li>• Industry-specific suggestions</li>
                <li>• Actionable improvement checklist</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ATSAssessment;
