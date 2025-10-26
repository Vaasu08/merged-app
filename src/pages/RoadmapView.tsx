import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, Clock, BookOpen, Code, Target, ArrowLeft, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RoadmapView() {
  const navigate = useNavigate();
  const { roadmap, reset } = useRoadmap();
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);

  if (!roadmap) {
    navigate('/roadmap');
    return null;
  }

  const togglePhaseComplete = (phaseNumber: number) => {
    if (completedPhases.includes(phaseNumber)) {
      setCompletedPhases(completedPhases.filter(p => p !== phaseNumber));
    } else {
      setCompletedPhases([...completedPhases, phaseNumber]);
    }
  };

  const progressPercentage = (completedPhases.length / roadmap.phases.length) * 100;

  const handleDownload = () => {
    // Create text version of roadmap
    let content = `${roadmap.title}\n${'='.repeat(roadmap.title.length)}\n\n`;
    content += `${roadmap.overview}\n\n`;
    content += `Duration: ${roadmap.duration_days} days\n`;
    content += `Difficulty: ${roadmap.difficulty}\n\n`;
    
    roadmap.phases.forEach((phase) => {
      content += `\n## Phase ${phase.phase_number}: ${phase.title}\n`;
      content += `Duration: ${phase.duration_days} days\n`;
      content += `${phase.description}\n\n`;
      content += `Topics:\n${phase.topics.map(t => `- ${t}`).join('\n')}\n\n`;
      
      if (phase.resources.length > 0) {
        content += `Resources:\n`;
        phase.resources.forEach(r => {
          content += `- ${r.name} (${r.type})`;
          if (r.url) content += ` - ${r.url}`;
          content += `\n`;
        });
        content += `\n`;
      }
      
      if (phase.project) {
        content += `Project: ${phase.project.title}\n`;
        content += `${phase.project.description}\n`;
        content += `Skills: ${phase.project.skills_practiced.join(', ')}\n\n`;
      }
      
      if (phase.checkpoint) {
        content += `Checkpoint: ${phase.checkpoint.title}\n`;
        content += `Topics: ${phase.checkpoint.topics_covered.join(', ')}\n`;
        content += `Time: ${phase.checkpoint.estimated_time}\n\n`;
      }
    });
    
    if (roadmap.final_project) {
      content += `\n## Final Project: ${roadmap.final_project.title}\n`;
      content += `${roadmap.final_project.description}\n`;
      content += `Skills Required: ${roadmap.final_project.skills_required.join(', ')}\n`;
      content += `Duration: ${roadmap.final_project.estimated_duration}\n\n`;
    }
    
    content += `\n## Next Steps\n`;
    roadmap.next_steps.forEach((step, index) => {
      content += `${index + 1}. ${step}\n`;
    });

    // Download as text file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roadmap.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Roadmap downloaded successfully!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: roadmap.title,
        text: roadmap.overview,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleStartOver = () => {
    reset();
    navigate('/roadmap');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">{roadmap.title}</h1>
                <p className="text-gray-400 text-sm">{roadmap.overview}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleStartOver}>
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <Card className="mb-8 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Overall Progress</span>
                <span className="text-white font-semibold">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{roadmap.duration_days}</div>
                  <div className="text-sm text-gray-400">Total Days</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-400">{roadmap.phases.length}</div>
                  <div className="text-sm text-gray-400">Phases</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{completedPhases.length}</div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Content */}
        <Tabs defaultValue="phases" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="phases" className="text-gray-300 data-[state=active]:text-white">
              Learning Phases
            </TabsTrigger>
            <TabsTrigger value="final" className="text-gray-300 data-[state=active]:text-white">
              Final Project
            </TabsTrigger>
            <TabsTrigger value="next" className="text-gray-300 data-[state=active]:text-white">
              Next Steps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phases" className="space-y-6">
            <Accordion type="single" collapsible className="space-y-4">
              {roadmap.phases.map((phase) => (
                <AccordionItem
                  key={phase.phase_number}
                  value={`phase-${phase.phase_number}`}
                  className="bg-gray-800/50 border-gray-700 rounded-lg"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-4 text-left">
                      <div className="flex items-center gap-2">
                        {completedPhases.includes(phase.phase_number) ? (
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-500" />
                        )}
                        <span className="text-lg font-semibold text-white">
                          Phase {phase.phase_number}: {phase.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {phase.duration_days} days
                        </div>
                        <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                          {roadmap.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6">
                      <p className="text-gray-300">{phase.description}</p>
                      
                      {/* Topics */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Topics Covered
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.topics.map((topic, index) => (
                            <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Resources */}
                      {phase.resources.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-3">Resources</h4>
                          <div className="space-y-2">
                            {phase.resources.map((resource, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                <div>
                                  <div className="text-white font-medium">{resource.name}</div>
                                  <div className="text-sm text-gray-400">{resource.type} • {resource.duration}</div>
                                </div>
                                {resource.url && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                      View
                                    </a>
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Project */}
                      {phase.project && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Project: {phase.project.title}
                          </h4>
                          <Card className="bg-gray-700/30 border-gray-600">
                            <CardContent className="p-4">
                              <p className="text-gray-300 mb-3">{phase.project.description}</p>
                              <div>
                                <div className="text-sm text-gray-400 mb-2">Skills Practiced:</div>
                                <div className="flex flex-wrap gap-2">
                                  {phase.project.skills_practiced.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-300">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Checkpoint */}
                      {phase.checkpoint && (
                        <div>
                          <h4 className="text-white font-semibold mb-3">Checkpoint</h4>
                          <Card className="bg-gray-700/30 border-gray-600">
                            <CardContent className="p-4">
                              <div className="text-white font-medium mb-2">{phase.checkpoint.title}</div>
                              <div className="text-sm text-gray-400 mb-2">
                                Topics: {phase.checkpoint.topics_covered.join(', ')}
                              </div>
                              <div className="text-sm text-gray-400">
                                Estimated Time: {phase.checkpoint.estimated_time}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Complete Button */}
                      <div className="pt-4">
                        <Button
                          onClick={() => togglePhaseComplete(phase.phase_number)}
                          variant={completedPhases.includes(phase.phase_number) ? "outline" : "default"}
                          className={completedPhases.includes(phase.phase_number) 
                            ? "border-green-500 text-green-400 hover:bg-green-500/10" 
                            : "bg-purple-600 hover:bg-purple-700"
                          }
                        >
                          {completedPhases.includes(phase.phase_number) ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Completed
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="final" className="space-y-6">
            {roadmap.final_project && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {roadmap.final_project.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Duration: {roadmap.final_project.estimated_duration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">{roadmap.final_project.description}</p>
                  <div>
                    <h4 className="text-white font-semibold mb-3">Skills Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.final_project.skills_required.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="next" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">What's Next?</CardTitle>
                <CardDescription className="text-gray-400">
                  Your journey continues beyond this roadmap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roadmap.next_steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-700/30 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-gray-300">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}