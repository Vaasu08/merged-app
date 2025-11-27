import { CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';




interface ATSScoreDisplayProps {
  score: number;
  grade: string;
  breakdown: {
    keywordMatch?: number;
    keywords?: number;
    skillsMatch?: number;
    skills?: number;
    experience: number;
    education?: number;
    formatting: number;
    structure?: number;
  };
}




export default function ATSScoreDisplay({ score, grade, breakdown }: ATSScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 65) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Map breakdown to display - handle both old and new formats
  const normalizedBreakdown = {
    keywordMatch: breakdown.keywordMatch ?? breakdown.keywords ?? 0,
    skillsMatch: breakdown.skillsMatch ?? breakdown.skills ?? 0,
    experience: breakdown.experience ?? 0,
    education: breakdown.education ?? breakdown.structure ?? 0,
    formatting: breakdown.formatting ?? 0,
  };


  const categories = [
    { key: 'keywordMatch', label: 'Keyword Match', weight: '35%' },
    { key: 'skillsMatch', label: 'Skills Alignment', weight: '18%' },
    { key: 'experience', label: 'Experience', weight: '25%' },
    { key: 'education', label: 'Education/Structure', weight: '12%' },
    { key: 'formatting', label: 'Formatting', weight: '10%' },
  ];




  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ATS Score</CardTitle>
            {score >= 80 ? (
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <div className="text-gray-500 dark:text-gray-400 mt-2">out of 100</div>
            <div className={`text-3xl font-bold mt-4 ${getScoreColor(score)}`}>
              Grade: {grade}
            </div>
          </div>
        </CardContent>
      </Card>




      {/* Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map(({ key, label, weight }) => (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {label} <span className="text-xs text-gray-500 dark:text-gray-400">({weight})</span>
                  </span>
                  <span className="font-semibold">
                    {normalizedBreakdown[key as keyof typeof normalizedBreakdown]?.toFixed(1)}%
                  </span>
                </div>
                <Progress value={normalizedBreakdown[key as keyof typeof normalizedBreakdown]} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}











