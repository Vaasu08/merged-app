import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CareerPath } from '@/types/career';
import { TrendingUp, DollarSign, Users, ChevronRight, CheckCircle2, Clock, ExternalLink, AlertTriangle, Target, Download, FileText } from 'lucide-react';
import { skillsDatabase } from '@/data/careerData';
import { generateCareerPlanPDF, generateCareerPlanText, ExportData } from '@/lib/pdfExporter';
import { toast } from 'sonner';

interface CareerRecommendationsProps {
  careerPaths: CareerPath[];
  onSelectCareer: (career: CareerPath) => void;
  selectedCareer?: CareerPath;
  completedSteps: string[];
  onToggleStep: (stepId: string) => void;
  userSkills: string[];
  onAddSkills?: (skills: string[]) => void;
}

export const CareerRecommendations = ({ 
  careerPaths, 
  onSelectCareer, 
  selectedCareer,
  completedSteps,
  onToggleStep,
  userSkills,
  onAddSkills
}: CareerRecommendationsProps) => {
  const [checkedSkills, setCheckedSkills] = useState<string[]>([]);
  const [showOnlyHighPriority, setShowOnlyHighPriority] = useState(false);

  const getSkillName = (skillId: string) => {
    return skillsDatabase.find(skill => skill.id === skillId)?.name || skillId;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCompletedStepsCount = (career: CareerPath) => {
    return career.nextSteps.filter(step => completedSteps.includes(step.id)).length;
  };

  const getProgressPercentage = (career: CareerPath) => {
    const completed = getCompletedStepsCount(career);
    return Math.round((completed / career.nextSteps.length) * 100);
  };

  // Skill Gap Analysis Functions
  const getMissingSkills = (career: CareerPath) => {
    return career.requiredSkills.filter(skill => !userSkills.includes(skill));
  };

  const getSkillGapAnalysis = (career: CareerPath) => {
    const missingSkills = getMissingSkills(career);
    const totalSkills = career.requiredSkills.length;
    const userSkillCount = career.requiredSkills.filter(skill => userSkills.includes(skill)).length;
    
    return {
      missingSkills: missingSkills.map(skillId => ({
        id: skillId,
        name: getSkillName(skillId),
        priority: getSkillPriority(skillId, career.id)
      })),
      gapPercentage: Math.round((missingSkills.length / totalSkills) * 100),
      userSkillCount,
      totalSkills
    };
  };

  const getSkillPriority = (skillId: string, careerId: string): 'high' | 'medium' | 'low' => {
    // Define skill priorities for different careers
    const skillPriorities: Record<string, Record<string, 'high' | 'medium' | 'low'>> = {
      'frontend-developer': {
        'js': 'high', 'ts': 'high', 'react': 'high', 'nextjs': 'high',
        'html': 'high', 'css': 'high', 'tailwind': 'medium'
      },
      'fullstack-dev': {
        'js': 'high', 'react': 'high', 'node': 'high', 'sql': 'high',
        'html': 'high', 'css': 'high', 'git': 'medium'
      },
      'data-scientist': {
        'py': 'high', 'sql': 'high', 'pandas': 'high', 'numpy': 'high',
        'r': 'medium', 'tableau': 'medium'
      }
    };
    
    return skillPriorities[careerId]?.[skillId] || 'medium';
  };

  // Missing Skills Checklist Functions
  const handleSkillToggle = (skillId: string) => {
    setCheckedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleAddSelectedSkills = () => {
    if (checkedSkills.length === 0) {
      toast.error('Please select at least one skill to add');
      return;
    }

    if (onAddSkills) {
      onAddSkills(checkedSkills);
      setCheckedSkills([]);
      toast.success(`Added ${checkedSkills.length} skill${checkedSkills.length > 1 ? 's' : ''} to your profile!`);
    }
  };

  const handleSelectAllSkills = (missingSkills: Array<{id: string, name: string, priority: string}>) => {
    setCheckedSkills(missingSkills.map(skill => skill.id));
  };

  const handleSelectHighPrioritySkills = (missingSkills: Array<{id: string, name: string, priority: string}>) => {
    const highPrioritySkills = missingSkills.filter(skill => skill.priority === 'high');
    setCheckedSkills(highPrioritySkills.map(skill => skill.id));
  };

  const handleClearSelection = () => {
    setCheckedSkills([]);
  };

  // Skill Gap Analysis Component
  const SkillGapAnalysis = ({ career }: { career: CareerPath }) => {
    const analysis = getSkillGapAnalysis(career);
    
    if (analysis.missingSkills.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="text-lg font-semibold">All Required Skills Covered!</h3>
          </div>
          <p className="text-muted-foreground">
            You have all the essential skills for this career path. Focus on advancing your expertise!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold">Skill Gap Analysis</h3>
        </div>
        
        <div className="grid gap-2">
          <div className="flex items-center justify-between text-sm">
            <span>Skills Gap</span>
            <span className="font-medium">{analysis.gapPercentage}% missing</span>
          </div>
          <Progress value={100 - analysis.gapPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{analysis.userSkillCount}/{analysis.totalSkills} skills</span>
            <span>{analysis.missingSkills.length} to learn</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Missing Skills Checklist:</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOnlyHighPriority(!showOnlyHighPriority)}
                className={`text-xs ${showOnlyHighPriority ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {showOnlyHighPriority ? 'Show All' : 'High Priority Only'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectHighPrioritySkills(analysis.missingSkills)}
                className="text-xs"
              >
                Select High Priority
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAllSkills(analysis.missingSkills)}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {analysis.missingSkills
              .filter(skill => !showOnlyHighPriority || skill.priority === 'high')
              .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
              })
              .map(skill => (
                <div key={skill.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <input
                    type="checkbox"
                    id={`skill-${skill.id}`}
                    checked={checkedSkills.includes(skill.id)}
                    onChange={() => handleSkillToggle(skill.id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label 
                    htmlFor={`skill-${skill.id}`}
                    className="flex-1 flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-sm font-medium">{skill.name}</span>
                    <Badge 
                      variant={skill.priority === 'high' ? 'destructive' : skill.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {skill.priority} priority
                    </Badge>
                  </label>
                </div>
              ))}
          </div>
          
          {showOnlyHighPriority && analysis.missingSkills.filter(skill => skill.priority !== 'high').length > 0 && (
            <div className="text-xs text-muted-foreground text-center py-2">
              Showing only high priority skills. {analysis.missingSkills.filter(skill => skill.priority !== 'high').length} medium/low priority skills hidden.
            </div>
          )}
          
          {checkedSkills.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">
                  {checkedSkills.length} skill{checkedSkills.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-muted-foreground">
                  Click "Add Selected Skills" to add them to your profile
                </p>
              </div>
              <Button
                onClick={handleAddSelectedSkills}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                Add Selected Skills
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Export Functions
  const handleExportPDF = () => {
    if (!selectedCareer) {
      toast.error('Please select a career path first');
      return;
    }

    const exportData: ExportData = {
      userSkills,
      selectedCareer,
      completedSteps,
      generatedDate: new Date()
    };

    try {
      generateCareerPlanPDF(exportData);
      toast.success('Career plan exported as PDF!');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportText = () => {
    if (!selectedCareer) {
      toast.error('Please select a career path first');
      return;
    }

    const exportData: ExportData = {
      userSkills,
      selectedCareer,
      completedSteps,
      generatedDate: new Date()
    };

    try {
      const textContent = generateCareerPlanText(exportData);
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career-plan-${selectedCareer.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Career plan exported as text file!');
    } catch (error) {
      toast.error('Failed to export text file');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Recommended Career Paths
        </h2>
        <p className="text-muted-foreground">
          Based on your skills, here are the best career matches for you
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {careerPaths.map((career) => (
          <Card 
            key={career.id} 
            className={`cursor-pointer transition-all duration-300 hover:shadow-large hover:scale-105 bg-gradient-card border-border/50 ${
              selectedCareer?.id === career.id ? 'ring-2 ring-primary shadow-large' : ''
            }`}
            onClick={() => onSelectCareer(career)}
          >
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-foreground">
                  {career.title}
                </CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
                  {career.matchPercentage}% Match
                </Badge>
              </div>
              <Progress value={career.matchPercentage} className="w-full h-2" />
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                {career.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-success" />
                  <span className="font-medium text-foreground">{career.averageSalary}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">Growth: {career.growthRate}</span>
                </div>
              </div>

              {/* Key Skills */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-foreground">Key Skills:</h4>
                <div className="flex flex-wrap gap-1">
                  {career.requiredSkills.slice(0, 4).map(skillId => (
                    <Badge key={skillId} variant="outline" className="text-xs">
                      {getSkillName(skillId)}
                    </Badge>
                  ))}
                  {career.requiredSkills.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{career.requiredSkills.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress */}
              {selectedCareer?.id === career.id && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {getCompletedStepsCount(career)}/{career.nextSteps.length} steps
                    </span>
                  </div>
                  <Progress value={getProgressPercentage(career)} className="w-full h-2" />
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full group hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                View Details
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Career Path */}
      {selectedCareer && (
        <Card className="bg-gradient-card shadow-large border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {selectedCareer.title} - Action Plan
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Follow these steps to advance your career
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {getProgressPercentage(selectedCareer)}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
            
            {/* Export Buttons */}
            <div className="flex gap-2 justify-end">
              <Button 
                onClick={handleExportPDF}
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button 
                onClick={handleExportText}
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Export Text
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Skill Gap Analysis */}
            <SkillGapAnalysis career={selectedCareer} />

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Next Steps</h3>
              <div className="space-y-3">
                {selectedCareer.nextSteps.map((step) => {
                  const isCompleted = completedSteps.includes(step.id);
                  return (
                    <div 
                      key={step.id}
                      className={`p-4 rounded-lg border border-border bg-background transition-all duration-200 ${
                        isCompleted ? 'bg-success/5 border-success/20' : 'hover:shadow-soft'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onToggleStep(step.id)}
                          className={`mt-1 rounded-full transition-colors duration-200 ${
                            isCompleted ? 'text-success' : 'text-muted-foreground hover:text-primary'
                          }`}
                        >
                          <CheckCircle2 className={`h-5 w-5 ${isCompleted ? 'fill-current' : ''}`} />
                        </button>
                        
                        <div className="flex-grow space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {step.title}
                            </h4>
                            <Badge className={getPriorityColor(step.priority)}>
                              {step.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {step.timeEstimate}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Recommended Resources</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {selectedCareer.resources.map((resource) => (
                  <div 
                    key={resource.id}
                    className="p-4 rounded-lg border border-border bg-background hover:shadow-soft transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-grow">
                        <h4 className="font-medium text-foreground">{resource.title}</h4>
                        <p className="text-sm text-muted-foreground">{resource.provider}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {resource.type}
                          </Badge>
                          {resource.free && (
                            <Badge variant="secondary" className="bg-success/10 text-success">
                              Free
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};