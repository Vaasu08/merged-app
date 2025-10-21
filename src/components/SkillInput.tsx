import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Search, Upload, FileText, CheckCircle2, Save, Loader2 } from 'lucide-react';
import { skillsDatabase } from '@/data/careerData';
import { Skill } from '@/types/career';
import { parseCV, ParsedCV } from '@/lib/cvParser';
import { saveUserSkills } from '@/lib/profile';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface SkillInputProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  onAnalyze: () => void;
}

export const SkillInput = ({ selectedSkills, onSkillsChange, onAnalyze }: SkillInputProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [isParsingCV, setIsParsingCV] = useState(false);
  const [parsedCV, setParsedCV] = useState<ParsedCV | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveStatus, setLastSaveStatus] = useState<'success' | 'error' | null>(null);

  const filteredSkills = skillsDatabase.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSkills.includes(skill.id)
  );

  // Save skills to Supabase immediately when changed
  const saveSkillsToDatabase = async (newSkills: string[]) => {
    if (!user?.id) {
      // If user not logged in, just update local state
      onSkillsChange(newSkills);
      
      // Auto-analyze when reaching 3 skills (for non-logged in users)
      if (newSkills.length === 3 && selectedSkills.length < 3) {
        setTimeout(() => {
          toast.success('🎉 You now have 3 skills! Click "Analyze My Career Path" to see your recommendations.', { 
            duration: 5000 
          });
        }, 500);
      }
      return;
    }

    setIsSaving(true);
    setLastSaveStatus(null);
    
    try {
      await saveUserSkills(user.id, newSkills);
      onSkillsChange(newSkills);
      setLastSaveStatus('success');
      
      // Show success toast for skill additions/removals
      if (newSkills.length > selectedSkills.length) {
        toast.success('Skill added and saved to your profile!', { duration: 2000 });
        
        // Auto-analyze when reaching 3 skills
        if (newSkills.length === 3 && selectedSkills.length < 3) {
          setTimeout(() => {
            toast.success('🎉 Great! You now have 3 skills. Analyzing your career path...', { 
              duration: 3000 
            });
            setTimeout(() => {
              onAnalyze();
            }, 1000);
          }, 1000);
        }
        
      } else if (newSkills.length < selectedSkills.length) {
        toast.success('Skill removed and updated in your profile!', { duration: 2000 });
      }
      
    } catch (error) {
      console.error('Failed to save skills:', error);
      setLastSaveStatus('error');
      toast.error('Failed to save skill. Please try again.', { duration: 3000 });
      
      // Still update local state for better UX
      onSkillsChange(newSkills);
    } finally {
      setIsSaving(false);
      
      // Clear status after a short delay
      setTimeout(() => setLastSaveStatus(null), 3000);
    }
  };

  const addSkill = async (skillId: string) => {
    if (!selectedSkills.includes(skillId)) {
      const newSkills = [...selectedSkills, skillId];
      await saveSkillsToDatabase(newSkills);
    }
  };

  const removeSkill = async (skillId: string) => {
    const newSkills = selectedSkills.filter(id => id !== skillId);
    await saveSkillsToDatabase(newSkills);
  };

  const addCustomSkill = async () => {
    if (customSkill.trim()) {
      const customId = `custom-${Date.now()}`;
      skillsDatabase.push({
        id: customId,
        name: customSkill,
        category: 'Custom'
      });
      await addSkill(customId);
      setCustomSkill('');
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingCV(true);
    try {
      const parsed = await parseCV(file);
      setParsedCV(parsed);
      
      // Add parsed skills to selected skills and save immediately
      const newSkills = [...new Set([...selectedSkills, ...parsed.skills])];
      await saveSkillsToDatabase(newSkills);
      
      toast.success(`CV parsed successfully! Found ${parsed.skills.length} skills with ${parsed.confidence}% confidence.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse CV');
    } finally {
      setIsParsingCV(false);
    }
  };

  const getSkillName = (skillId: string) => {
    return skillsDatabase.find(skill => skill.id === skillId)?.name || skillId;
  };

  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-card shadow-medium border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          What skills do you have?
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Select your current skills from the list below or add custom ones. We'll recommend career paths based on your expertise.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Your Skills ({selectedSkills.length})</h3>
              {user && (
                <div className="flex items-center gap-1 text-sm">
                  {isSaving && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                      <span className="text-blue-500">Saving...</span>
                    </>
                  )}
                  {lastSaveStatus === 'success' && (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">Saved</span>
                    </>
                  )}
                  {lastSaveStatus === 'error' && (
                    <>
                      <X className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">Save failed</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map(skillId => (
                <Badge
                  key={skillId}
                  variant="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 px-3 py-1"
                >
                  {getSkillName(skillId)}
                  <button
                    onClick={() => removeSkill(skillId)}
                    className="ml-2 hover:text-destructive transition-colors"
                    disabled={isSaving}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* CV Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Or upload your CV</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".txt,.pdf,.csv,.json"
                onChange={handleCVUpload}
                disabled={isParsingCV}
                className="border-border focus:ring-primary flex-1"
                id="cv-upload"
              />
              <Button
                variant="outline"
                disabled={isParsingCV}
                className="inline-flex items-center gap-2"
                onClick={() => document.getElementById('cv-upload')?.click()}
              >
                <Upload className="h-4 w-4" />
                {isParsingCV ? 'Parsing...' : 'Choose File'}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Supported formats: .txt, .pdf, .csv, .json
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  // Create and download a sample CV for testing
                  const sampleCV = `John Doe - Software Developer Resume

CONTACT INFORMATION
Email: john.doe@email.com
Phone: (555) 123-4567

TECHNICAL SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java
Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express.js, Django, Flask
Databases: PostgreSQL, MongoDB, MySQL
Cloud & DevOps: AWS, Docker, Kubernetes, Git
Tools: Jest, Cypress, Webpack, Agile/Scrum

EXPERIENCE
Senior Full Stack Developer | TechCorp Inc. | 2022 - Present
- Developed React-based web applications
- Implemented RESTful APIs using Node.js
- Worked with PostgreSQL and MongoDB
- Deployed applications using Docker and AWS

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2016 - 2020`;
                  
                  const blob = new Blob([sampleCV], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'sample-cv.txt';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                Download Sample CV
              </Button>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">Try uploading this sample CV to test the feature</span>
            </div>
          </div>
          
          {parsedCV && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 text-success mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">CV Parsed Successfully</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Found {parsedCV.skills.length} skills • Confidence: {parsedCV.confidence}%
              </div>
              {parsedCV.skills.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground mb-1">Skills found:</div>
                  <div className="flex flex-wrap gap-1">
                    {parsedCV.skills.slice(0, 5).map(skillId => (
                      <Badge key={skillId} variant="secondary" className="text-xs">
                        {getSkillName(skillId)}
                      </Badge>
                    ))}
                    {parsedCV.skills.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{parsedCV.skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Skills */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border focus:ring-primary"
            />
          </div>

          {/* Add Custom Skill */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a custom skill..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
              className="border-border focus:ring-primary"
            />
            <Button onClick={addCustomSkill} variant="outline" size="icon" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Skill Categories */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => addSkill(skill.id)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-border bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3 mr-1" />
                    )}
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Analyze Button */}
        {selectedSkills.length > 0 && (
          <div className="text-center pt-4 space-y-3">
            {selectedSkills.length < 3 && (
              <p className="text-sm text-muted-foreground">
                Add {3 - selectedSkills.length} more skill{3 - selectedSkills.length === 1 ? '' : 's'} to unlock career analysis
                {user && ' (auto-saved to your profile)'}
              </p>
            )}
            <Button 
              onClick={onAnalyze}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl shadow-large transition-all duration-300 hover:scale-105"
              disabled={selectedSkills.length === 0}
            >
              {selectedSkills.length >= 3 
                ? 'Analyze My Career Path' 
                : `Analyze Career Path (${selectedSkills.length}/3 skills)`
              }
            </Button>
            {user && selectedSkills.length > 0 && (
              <p className="text-xs text-muted-foreground">
                All skills are automatically saved to your profile
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};