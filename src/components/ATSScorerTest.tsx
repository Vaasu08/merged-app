import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ATSScorerAI, ATSScorerFallback } from '@/lib/atsScorerAI';

const sampleResume = {
  text: `John Doe - Software Developer

CONTACT INFORMATION
Email: john.doe@email.com
Phone: (555) 123-4567
Location: San Francisco, CA
LinkedIn: linkedin.com/in/johndoe

TECHNICAL SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java
Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express.js, Django, Flask
Databases: PostgreSQL, MongoDB, MySQL
Cloud & DevOps: AWS, Docker, Kubernetes, Git
Tools: Jest, Cypress, Webpack, Agile/Scrum

EXPERIENCE
Senior Full Stack Developer | TechCorp Inc. | 2022 - Present
- Developed React-based web applications serving 10,000+ users
- Implemented RESTful APIs using Node.js and Express.js
- Worked with PostgreSQL and MongoDB databases
- Deployed applications using Docker and AWS
- Improved application performance by 40% through optimization

Software Developer | StartupXYZ | 2020 - 2022
- Built responsive web applications using React and TypeScript
- Collaborated with cross-functional teams using Agile methodology
- Implemented automated testing with Jest and Cypress
- Managed version control with Git and GitHub

EDUCATION
B.S. Computer Science | University of California | 2016 - 2020
- Graduated with Honors
- Relevant Coursework: Data Structures, Algorithms, Software Engineering`,
  skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Vue.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Node.js', 'Express.js', 'Django', 'Flask', 'PostgreSQL', 'MongoDB', 'MySQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Jest', 'Cypress', 'Webpack', 'Agile', 'Scrum'],
  experience: [
    'Senior Full Stack Developer at TechCorp Inc (2022 - Present): Developed React-based web applications serving 10,000+ users, implemented RESTful APIs using Node.js and Express.js, worked with PostgreSQL and MongoDB databases, deployed applications using Docker and AWS, improved application performance by 40% through optimization',
    'Software Developer at StartupXYZ (2020 - 2022): Built responsive web applications using React and TypeScript, collaborated with cross-functional teams using Agile methodology, implemented automated testing with Jest and Cypress, managed version control with Git and GitHub'
  ],
  education: ['B.S. Computer Science - University of California (2016 - 2020)'],
  confidence: 95,
  keywords: ['javascript', 'typescript', 'python', 'java', 'react', 'vue', 'html', 'css', 'tailwind', 'node', 'express', 'django', 'flask', 'postgresql', 'mongodb', 'mysql', 'aws', 'docker', 'kubernetes', 'git', 'jest', 'cypress', 'webpack', 'agile', 'scrum', 'developer', 'full', 'stack', 'web', 'applications', 'api', 'database', 'deployed', 'performance', 'responsive', 'testing', 'version', 'control', 'team', 'software', 'computer', 'science'],
  experienceYears: 4,
  contactInfo: {
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    linkedin: 'linkedin.com/in/johndoe',
    location: 'San Francisco, CA'
  },
  sections: {
    summary: '',
    experience: 'Senior Full Stack Developer | TechCorp Inc. | 2022 - Present\n- Developed React-based web applications serving 10,000+ users\n- Implemented RESTful APIs using Node.js and Express.js\n- Worked with PostgreSQL and MongoDB databases\n- Deployed applications using Docker and AWS\n- Improved application performance by 40% through optimization\n\nSoftware Developer | StartupXYZ | 2020 - 2022\n- Built responsive web applications using React and TypeScript\n- Collaborated with cross-functional teams using Agile methodology\n- Implemented automated testing with Jest and Cypress\n- Managed version control with Git and GitHub',
    education: 'B.S. Computer Science | University of California | 2016 - 2020\n- Graduated with Honors\n- Relevant Coursework: Data Structures, Algorithms, Software Engineering',
    skills: 'Programming Languages: JavaScript, TypeScript, Python, Java\nFrontend: React, Vue.js, HTML5, CSS3, Tailwind CSS\nBackend: Node.js, Express.js, Django, Flask\nDatabases: PostgreSQL, MongoDB, MySQL\nCloud & DevOps: AWS, Docker, Kubernetes, Git\nTools: Jest, Cypress, Webpack, Agile/Scrum'
  }
};

const sampleJobDescription = `We are looking for a Senior Full Stack Developer to join our team.

Requirements:
- 3+ years of experience in full-stack development
- Strong proficiency in JavaScript, TypeScript, and React
- Experience with Node.js and Express.js
- Database experience with PostgreSQL and MongoDB
- Cloud experience with AWS
- Knowledge of Docker and containerization
- Experience with Git version control
- Understanding of Agile/Scrum methodologies
- Strong problem-solving and communication skills

Nice to have:
- Experience with Python and Java
- Knowledge of Kubernetes
- Experience with automated testing (Jest, Cypress)
- Previous startup experience`;

export default function ATSScorerTest() {
  const [jobDescription, setJobDescription] = useState(sampleJobDescription);
  const [aiResults, setAiResults] = useState<any>(null);
  const [fallbackResults, setFallbackResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAIScoring = async () => {
    setLoading(true);
    setError(null);
    try {
      const aiScorer = new ATSScorerAI();
      const results = await aiScorer.calculateScore(sampleResume, jobDescription);
      setAiResults(results);
    } catch (err) {
      setError(`AI Scoring Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('AI Scoring Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testFallbackScoring = () => {
    try {
      const results = ATSScorerFallback.calculateScore(sampleResume, jobDescription);
      setFallbackResults(results);
    } catch (err) {
      setError(`Fallback Scoring Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Fallback Scoring Error:', err);
    }
  };

  const testApiKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const aiScorer = new ATSScorerAI();
      const isValid = await aiScorer.testConnection();
      if (isValid) {
        setError('API Key is valid!');
      } else {
        setError('API Key is invalid or service is unavailable');
      }
    } catch (err) {
      setError(`API Key Test Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('API Key Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">ATS Scorer Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="job-description">Paste a job description to test against:</Label>
          <Textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={testAIScoring} disabled={loading}>
          {loading ? 'Testing...' : 'Test AI Scoring'}
        </Button>
        <Button onClick={testFallbackScoring} variant="secondary">
          Test Fallback Scoring
        </Button>
        <Button onClick={testApiKey} variant="outline">
          Test API Key
        </Button>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {aiResults && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Scoring Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-bold">{aiResults.overall}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grade</p>
                <p className="text-2xl font-bold">{aiResults.grade}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience Years</p>
                <p className="text-2xl font-bold">{sampleResume.experienceYears}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Category Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p>Keyword Match: {aiResults.keywordMatch}%</p>
                <p>Skills Match: {aiResults.skillsMatch}%</p>
                <p>Experience: {aiResults.experience}%</p>
                <p>Education: {aiResults.education}%</p>
                <p>Formatting: {aiResults.formatting}%</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Matched Keywords ({aiResults.matchedKeywords?.length || 0})</h3>
              <div className="flex flex-wrap gap-2">
                {aiResults.matchedKeywords?.map((kw: string, idx: number) => (
                  <span key={idx} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm">
                    {kw}
                  </span>
                )) || <p>None</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Missing Keywords ({aiResults.missingKeywords?.length || 0})</h3>
              <div className="flex flex-wrap gap-2">
                {aiResults.missingKeywords?.map((kw: string, idx: number) => (
                  <span key={idx} className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded text-sm">
                    {kw}
                  </span>
                )) || <p>None</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Suggestions</h3>
              <ul className="list-disc pl-5 space-y-1">
                {aiResults.suggestions?.map((suggestion: any, idx: number) => (
                  <li key={idx} className="text-muted-foreground">
                    <span className={`font-medium ${
                      suggestion.priority === 'high' ? 'text-red-600' :
                      suggestion.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      [{suggestion.priority.toUpperCase()}]
                    </span> {suggestion.message}
                  </li>
                )) || <li>None</li>}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {fallbackResults && (
        <Card>
          <CardHeader>
            <CardTitle>Fallback Scoring Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-bold">{fallbackResults.overall}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grade</p>
                <p className="text-2xl font-bold">{fallbackResults.grade}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience Years</p>
                <p className="text-2xl font-bold">{sampleResume.experienceYears}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Category Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p>Keyword Match: {fallbackResults.keywordMatch}%</p>
                <p>Skills Match: {fallbackResults.skillsMatch}%</p>
                <p>Experience: {fallbackResults.experience}%</p>
                <p>Education: {fallbackResults.education}%</p>
                <p>Formatting: {fallbackResults.formatting}%</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Matched Keywords ({fallbackResults.matchedKeywords?.length || 0})</h3>
              <div className="flex flex-wrap gap-2">
                {fallbackResults.matchedKeywords?.map((kw: string, idx: number) => (
                  <span key={idx} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm">
                    {kw}
                  </span>
                )) || <p>None</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Missing Keywords ({fallbackResults.missingKeywords?.length || 0})</h3>
              <div className="flex flex-wrap gap-2">
                {fallbackResults.missingKeywords?.map((kw: string, idx: number) => (
                  <span key={idx} className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded text-sm">
                    {kw}
                  </span>
                )) || <p>None</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Suggestions</h3>
              <ul className="list-disc pl-5 space-y-1">
                {fallbackResults.suggestions?.map((suggestion: any, idx: number) => (
                  <li key={idx} className="text-muted-foreground">
                    <span className={`font-medium ${
                      suggestion.priority === 'high' ? 'text-red-600' :
                      suggestion.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      [{suggestion.priority.toUpperCase()}]
                    </span> {suggestion.message}
                  </li>
                )) || <li>None</li>}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}