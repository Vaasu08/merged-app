import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, getUserSkills } from '@/lib/profile';
import { careerAgentSwarm, type SwarmState, type AgentMessage, type UserProfile } from '@/lib/careerAgentSwarm';
import { Brain, Users, Target, TrendingUp, CheckCircle2, Clock, Sparkles, RefreshCw, MessageSquare, Briefcase, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

const AgentSwarmPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [swarmState, setSwarmState] = useState<SwarmState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const loadSwarmState = async () => {
        // Try to load from localStorage
        const saved = localStorage.getItem(`swarm_state_${user.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.lastUpdated = new Date(parsed.lastUpdated);
          parsed.agentConversation = parsed.agentConversation.map((msg: AgentMessage) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setSwarmState(parsed);
        }
        setIsInitialLoad(false);
      };
      loadSwarmState();
    } else {
      setIsInitialLoad(false);
    }
  }, [user]);

  const saveSwarmState = (state: SwarmState) => {
    localStorage.setItem(`swarm_state_${user?.id}`, JSON.stringify(state));
    setSwarmState(state);
  };

  const toggleTaskStatus = (taskId: string) => {
    if (!swarmState) return;

    const updatedState = { ...swarmState };
    const currentPlan = updatedState.weeklyPlans[0];
    
    if (currentPlan) {
      const task = currentPlan.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        saveSwarmState(updatedState);
        toast.success(task.status === 'completed' ? '✅ Task marked as complete!' : '⏰ Task marked as pending');
      }
    }
  };

  const runAgentSwarm = async () => {
    if (!user?.id) {
      toast.error('Please log in to use AI Career Agents');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('🤖 Activating AI Career Agent Swarm...');

    try {
      // Fetch user profile
      const [profile, skills] = await Promise.all([
        getUserProfile(user.id),
        getUserSkills(user.id)
      ]);

      if (!profile) {
        toast.error('Please complete your profile first', { id: toastId });
        navigate('/profile');
        return;
      }

      // Build user profile for agents
      const userProfile: UserProfile = {
        fullName: profile.full_name || 'User',
        currentRole: profile.current_position || undefined,
        targetRole: undefined, // Not in database, would need to add this
        skills: skills, // Already an array of strings from getUserSkills
        experience: (profile.experience || []).map(exp => ({
          position: exp.position,
          company: exp.company,
          startDate: exp.start_date,
          endDate: exp.end_date || new Date().toISOString().split('T')[0],
          isCurrent: exp.is_current || false
        })),
        location: profile.location || undefined,
        preferences: {
          salaryMin: profile.salary_expectation || undefined,
          remotePreference: 'any'
        }
      };

      // Run the swarm
      const result = await careerAgentSwarm.runSwarm(userProfile, swarmState || undefined);
      
      saveSwarmState(result);
      toast.success('✨ AI Agents completed their analysis!', { id: toastId });
    } catch (error) {
      console.error('Swarm error:', error);
      toast.error('Failed to run AI agents. Please try again.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = swarmState?.weeklyPlans[0];
  const progress = swarmState?.userProgress;

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <BackButton to="/" />
        </div>
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">AI-Powered Career Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            AI Career Agent Swarm
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your personal team of AI agents working together to accelerate your career success
          </p>
        </div>

        {/* Agent Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">Planner</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Designs weekly goals and action plans</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-500" />
                <CardTitle className="text-lg">Recruiter</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Finds relevant job opportunities</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <CardTitle className="text-lg">Coach</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Tracks progress and motivates you</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-lg">Interviewer</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Assesses and improves readiness</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <Button
            size="lg"
            onClick={runAgentSwarm}
            disabled={isLoading}
            className="text-lg px-8 py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Agents Working...
              </>
            ) : swarmState ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Run Weekly Update
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Activate AI Agents
              </>
            )}
          </Button>
        </div>

        {swarmState && (
          <>
            {/* Progress Overview */}
            {progress && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Your Progress - Week {swarmState.currentWeek}
                  </CardTitle>
                  <CardDescription>
                    Last updated: {new Date(swarmState.lastUpdated).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Applications</span>
                        <span className="text-2xl font-bold">{progress.applicationsSubmitted}</span>
                      </div>
                      <Progress value={(progress.applicationsSubmitted / (currentPlan?.goals.applications || 7)) * 100} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Interviews</span>
                        <span className="text-2xl font-bold">{progress.interviewsCompleted}</span>
                      </div>
                      <Progress value={(progress.interviewsCompleted / (currentPlan?.goals.interviewPrep || 2)) * 100} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Readiness</span>
                        <span className="text-2xl font-bold">{progress.readinessScore}%</span>
                      </div>
                      <Progress value={progress.readinessScore} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Skills Learned</span>
                        <span className="text-2xl font-bold">{progress.skillsLearned.length}</span>
                      </div>
                      <Progress value={Math.min(100, (progress.skillsLearned.length / 5) * 100)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Agent Conversation */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Agent Team Updates
                </CardTitle>
                <CardDescription>Your AI agents are coordinating to help you succeed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {swarmState.agentConversation.map((msg, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0">
                        {msg.agentId === 'planner' && <Target className="w-6 h-6 text-blue-500" />}
                        {msg.agentId === 'recruiter' && <Briefcase className="w-6 h-6 text-green-500" />}
                        {msg.agentId === 'coach' && <TrendingUp className="w-6 h-6 text-purple-500" />}
                        {msg.agentId === 'interviewer' && <MessageSquare className="w-6 h-6 text-orange-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{msg.agentName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{msg.message}</p>
                        {msg.actionItems && msg.actionItems.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.actionItems.map((item, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {item}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Plan */}
            {currentPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Week {currentPlan.week} Plan ({currentPlan.startDate} to {currentPlan.endDate})
                  </CardTitle>
                  <CardDescription>Your personalized weekly action plan</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Goals */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{currentPlan.goals.applications}</div>
                      <div className="text-sm text-muted-foreground">Applications</div>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{currentPlan.goals.networking}</div>
                      <div className="text-sm text-muted-foreground">Connections</div>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{currentPlan.goals.interviewPrep}</div>
                      <div className="text-sm text-muted-foreground">Mock Interviews</div>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{currentPlan.goals.skillDevelopment.length}</div>
                      <div className="text-sm text-muted-foreground">Skills to Learn</div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Tasks */}
                  <div className="space-y-3">
                    <h4 className="font-semibold mb-3">Weekly Tasks</h4>
                    {currentPlan.tasks.map((task) => {
                      // Determine navigation path based on task type
                      const getTaskNavigation = () => {
                        const titleLower = task.title.toLowerCase();
                        const descLower = task.description.toLowerCase();
                        
                        // Application-related tasks
                        if (titleLower.includes('apply') || descLower.includes('apply') || task.assignedAgent === 'recruiter') {
                          return { path: '/job-listings', label: 'View Jobs', icon: Briefcase };
                        }
                        // Interview practice tasks
                        if (titleLower.includes('interview') || titleLower.includes('mock') || descLower.includes('interview') || task.assignedAgent === 'interviewer') {
                          return { path: '/interview-prep', label: 'Practice', icon: MessageSquare };
                        }
                        // Resume/ATS tasks
                        if (titleLower.includes('resume') || titleLower.includes('ats') || descLower.includes('resume')) {
                          return { path: '/ats-assessment', label: 'Optimize Resume', icon: Target };
                        }
                        // Skill development/learning tasks
                        if (titleLower.includes('learn') || titleLower.includes('course') || titleLower.includes('skill') || descLower.includes('learn')) {
                          return { path: '/roadmap', label: 'Learning Path', icon: TrendingUp };
                        }
                        // Networking/LinkedIn tasks
                        if (titleLower.includes('linkedin') || titleLower.includes('network') || titleLower.includes('connect')) {
                          return { path: '/profile', label: 'Update Profile', icon: Users };
                        }
                        // Default to profile
                        return { path: '/profile', label: 'Go to Profile', icon: Users };
                      };

                      const nav = getTaskNavigation();
                      const NavIcon = nav.icon;

                      return (
                        <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className="flex-shrink-0 mt-1 cursor-pointer hover:scale-110 transition-transform"
                            aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </h5>
                              <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                                {task.priority}
                              </Badge>
                            </div>
                            <p className={`text-sm text-muted-foreground mb-2 ${task.status === 'completed' ? 'line-through' : ''}`}>
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Assigned to: {task.assignedAgent}</span>
                                <span>Due: {task.dueDate}</span>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(nav.path)}
                                className="ml-2"
                              >
                                <NavIcon className="w-3 h-3 mr-1" />
                                {nav.label}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/job-listings')}>
                      <Briefcase className="w-4 h-4 mr-2" />
                      View Jobs
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/interview-prep')}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Practice Interview
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/roadmap')}>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      View Roadmap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!swarmState && !isLoading && (
          <Card className="text-center p-12">
            <div className="max-w-md mx-auto">
              <Brain className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6">
                Activate your AI Career Agent Swarm to get personalized weekly plans, job recommendations, progress tracking, and interview preparation.
              </p>
              <Button size="lg" onClick={runAgentSwarm} disabled={isLoading}>
                <Sparkles className="w-5 h-5 mr-2" />
                Activate AI Agents
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AgentSwarmPage;
