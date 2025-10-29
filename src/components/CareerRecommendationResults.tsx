import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, DollarSign, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { JobRecommendation } from '@/lib/geminiCareerRecommendation';

interface CareerRecommendationResultsProps {
  recommendations: JobRecommendation[];
  onClose: () => void;
}

export const CareerRecommendationResults: React.FC<CareerRecommendationResultsProps> = ({
  recommendations,
  onClose
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Assessment Complete</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Your Career Recommendations
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Based on your assessment, we've identified {recommendations.length} career paths that align with your personality, 
            skills, and preferences. Each recommendation is personalized to your unique profile.
          </p>
        </motion.div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {recommendations.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        {job.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`text-2xl font-bold ${
                        job.matchScore >= 80 ? 'text-green-600' :
                        job.matchScore >= 60 ? 'text-blue-600' :
                        'text-orange-600'
                      }`}>
                        {job.matchScore}%
                      </div>
                      <span className="text-xs text-muted-foreground">Match</span>
                    </div>
                  </div>

                  <Progress value={job.matchScore} className="h-2" />
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Why This Career */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Why This Career Fits You
                    </h4>
                    <ul className="space-y-1">
                      {job.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Skills */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Key Skills Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.keySkills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Career Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="text-xs text-muted-foreground">Avg. Salary</div>
                        <div className="text-sm font-semibold">{job.averageSalary}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-xs text-muted-foreground">Growth</div>
                        <div className="text-sm font-semibold">{job.growthRate}</div>
                      </div>
                    </div>
                  </div>

                  {/* Work Environment */}
                  <div className="pt-3 border-t">
                    <div className="text-xs text-muted-foreground mb-1">Work Environment</div>
                    <div className="text-sm">{job.workEnvironment}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(job.title + ' career path')}`, '_blank')}
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                      onClick={() => navigate('/job-listings', { state: { careerTitle: job.title } })}
                    >
                      View Jobs
                      <Briefcase className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            onClick={onClose}
            className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
          >
            Explore Skills & Learning Paths
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retake Assessment
          </Button>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8 text-sm text-muted-foreground"
        >
          <p>
            These recommendations are based on your assessment responses. 
            Consider exploring multiple paths and doing further research before making career decisions.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
