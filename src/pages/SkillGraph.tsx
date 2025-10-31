/**
 * Skill Graph Page
 * Displays the AI-powered skill graph visualizer
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SkillGraphVisualizer from '@/components/SkillGraphVisualizer';
import { SkillInput } from '@/components/SkillInput';
import { useAuth } from '@/components/AuthProvider';
import { getUserSkills } from '@/lib/profile';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Brain,
  ArrowRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SkillGraph() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserSkills = async () => {
    setIsLoading(true);
    try {
      if (user?.id) {
        const userSkills = await getUserSkills(user.id);
        setSkills(userSkills);
        if (userSkills.length >= 5) {
          setShowGraph(true);
        }
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillsUpdate = (newSkills: string[]) => {
    setSkills(newSkills);
    if (newSkills.length >= 5) {
      setShowGraph(true);
    } else {
      setShowGraph(false);
    }
  };

  const handleAnalyze = () => {
    if (skills.length >= 5) {
      setShowGraph(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        {!showGraph && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Career Intelligence</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Skill Graph Visualizer
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See your entire skill ecosystem as a dynamic map. Discover how close you are to roles like 
              <Badge variant="secondary" className="mx-1">SDE</Badge>
              <Badge variant="secondary" className="mx-1">DevOps</Badge>
              <Badge variant="secondary" className="mx-1">Data Scientist</Badge>
            </p>
            
            <div className="mt-4 text-sm text-muted-foreground">
              ⚡ Requires minimum 5 skills for accurate AI analysis
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <Brain className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>AI-Powered Analysis</CardTitle>
                  <CardDescription>
                    Uses Google Gemini AI to analyze your skills and calculate proximity to 10+ career roles
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-purple-500 transition-colors">
                <CardHeader>
                  <Target className="h-10 w-10 text-purple-500 mb-2" />
                  <CardTitle>Interactive Visualization</CardTitle>
                  <CardDescription>
                    Beautiful 2D graph showing connections between your skills and potential career paths
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-pink-500 transition-colors">
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-pink-500 mb-2" />
                  <CardTitle>Personalized Roadmap</CardTitle>
                  <CardDescription>
                    Get AI-generated recommendations for skills to learn and steps to reach your target role
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Skill Input Section */}
        {!showGraph && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Add Your Skills</CardTitle>
                <CardDescription>
                  Add at least 5 skills to generate your personalized skill graph for more accurate analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SkillInput
                  selectedSkills={skills}
                  onSkillsChange={handleSkillsUpdate}
                  onAnalyze={handleAnalyze}
                />

                {skills.length > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {skills.length < 5 ? (
                        <>Add {5 - skills.length} more skill{5 - skills.length > 1 ? 's' : ''} to generate your graph</>
                      ) : (
                        <>✓ Ready to analyze! You have {skills.length} skills.</>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={skills.length < 5}
                    className="flex-1"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate AI Skill Graph
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  
                  {user && (
                    <Button
                      variant="outline"
                      onClick={() => navigate('/profile')}
                      size="lg"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                    <span><strong>Add your skills</strong> - Technical skills, soft skills, tools, frameworks, languages (minimum 5 for best results)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                    <span><strong>AI analyzes</strong> - Gemini AI calculates your proximity to 10+ career roles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                    <span><strong>Visualize</strong> - See an interactive graph showing connections between skills and roles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                    <span><strong>Get recommendations</strong> - AI suggests specific skills to learn for your target role</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Skill Graph Visualization */}
        {showGraph && skills.length >= 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SkillGraphVisualizer 
              userSkills={skills}
              onClose={() => setShowGraph(false)}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}
