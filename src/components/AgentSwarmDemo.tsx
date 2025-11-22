/**
 * Agent Swarm Demo Component
 * Demonstrates all 8 agents working together
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { careerAgentSwarm, UserProfile, AgentMessage } from '../lib/careerAgentSwarm';
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export function AgentSwarmDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0);

  // Demo profile
  const demoProfile: UserProfile = {
    fullName: 'Demo User',
    currentRole: 'Software Engineer',
    targetRole: 'Senior Software Engineer',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'System Design'],
    experience: [
      {
        position: 'Software Engineer',
        company: 'Tech Startup',
        startDate: '2022-01-01',
        endDate: '2025-11-01',
        isCurrent: true
      }
    ],
    location: 'San Francisco, CA',
    preferences: {
      salaryMin: 150000,
      remotePreference: 'hybrid',
      industries: ['Technology', 'AI/ML']
    }
  };

  const demoProgress = {
    applicationsSubmitted: 12,
    interviewsCompleted: 3,
    networkingEvents: 5,
    skillsLearned: ['Kubernetes', 'GraphQL'],
    readinessScore: 78
  };

  const runSwarm = async () => {
    setIsRunning(true);
    setError(null);
    setMessages([]);

    try {
      const result = await careerAgentSwarm.runSwarm(demoProfile, {
        currentWeek: currentWeek,
        userProgress: demoProgress
      });

      setMessages(result.agentConversation);
      setCurrentWeek(result.currentWeek);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const getAgentColor = (agentName: string) => {
    const colors: Record<string, string> = {
      'Career Planner': 'bg-blue-500',
      'Job Recruiter': 'bg-green-500',
      'Career Coach': 'bg-purple-500',
      'Interview Coach': 'bg-orange-500',
      'Market Researcher': 'bg-cyan-500',
      'Networking Strategist': 'bg-pink-500',
      'Salary Negotiator': 'bg-yellow-500',
      'Personal Brand Strategist': 'bg-indigo-500'
    };
    return colors[agentName] || 'bg-gray-500';
  };

  const getAgentIcon = (agentName: string) => {
    const icons: Record<string, string> = {
      'Career Planner': '📋',
      'Job Recruiter': '💼',
      'Career Coach': '💪',
      'Interview Coach': '🎤',
      'Market Researcher': '🔍',
      'Networking Strategist': '🤝',
      'Salary Negotiator': '💰',
      'Personal Brand Strategist': '🎨'
    };
    return icons[agentName] || '🤖';
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            AI Career Agent Swarm Demo
          </CardTitle>
          <CardDescription>
            Watch 8 specialized AI agents work together to create your personalized career strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Demo Profile</p>
              <p className="text-xs text-muted-foreground">
                {demoProfile.currentRole} → {demoProfile.targetRole}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {demoProfile.skills.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              onClick={runSwarm}
              disabled={isRunning}
              size="lg"
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Swarm...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run Agent Swarm
                </>
              )}
            </Button>
          </div>

          {error && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-900/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">Error</p>
                    <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {messages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Agent Reports (Week {currentWeek})
                </h3>
                <Badge variant="outline" className="gap-1">
                  {messages.length} Agents Active
                </Badge>
              </div>

              <div className="grid gap-3">
                {messages.map((msg, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="flex">
                      <div className={`w-1 ${getAgentColor(msg.agentName)}`} />
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getAgentIcon(msg.agentName)}</span>
                            <div>
                              <p className="font-semibold text-sm">{msg.agentName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={getAgentColor(msg.agentName)}>
                            Agent #{index + 1}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {msg.message}
                        </p>

                        {msg.actionItems && msg.actionItems.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Action Items:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {msg.actionItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {msg.data && Object.keys(msg.data).length > 0 && (
                          <details className="mt-3">
                            <summary className="text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                              View Details
                            </summary>
                            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                              {JSON.stringify(msg.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!isRunning && messages.length === 0 && !error && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Click "Run Agent Swarm" to see all 8 agents in action</p>
                <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">📋</span>
                    <span>Planner</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">💼</span>
                    <span>Recruiter</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">💪</span>
                    <span>Coach</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">🎤</span>
                    <span>Interviewer</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">🔍</span>
                    <span>Researcher</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">🤝</span>
                    <span>Networker</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">💰</span>
                    <span>Negotiator</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">🎨</span>
                    <span>Branding</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
