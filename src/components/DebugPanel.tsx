import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DebugPanel = () => {
  const testCVParsing = () => {
    console.log('Testing CV parsing...');
    // Create a test file
    const testContent = 'Skills: JavaScript, React, Node.js, Python, SQL';
    const blob = new Blob([testContent], { type: 'text/plain' });
    const file = new File([blob], 'test-cv.txt', { type: 'text/plain' });
    
    // Test the parser
    import('@/lib/cvParser').then(({ parseCV }) => {
      parseCV(file).then(result => {
        console.log('CV Parsing Result:', result);
        alert(`CV parsed successfully! Found ${result.skills.length} skills.`);
      }).catch(error => {
        console.error('CV Parsing Error:', error);
        alert('CV parsing failed: ' + error.message);
      });
    });
  };

  const testPDFExport = () => {
    console.log('Testing PDF export...');
    import('@/lib/pdfExporter').then(({ generateCareerPlanText }) => {
      const testData = {
        userSkills: ['js', 'react', 'node'],
        selectedCareer: {
          id: 'test',
          title: 'Full Stack Developer',
          description: 'Test career description',
          averageSalary: '$80,000',
          growthRate: '+15%',
          requiredSkills: ['js', 'react', 'node', 'sql'],
          nextSteps: [{
            id: 'test-step',
            title: 'Learn Advanced React',
            description: 'Master hooks and context',
            priority: 'high' as const,
            timeEstimate: '4 weeks'
          }],
          resources: [{
            id: 'test-resource',
            title: 'React Documentation',
            type: 'tutorial' as const,
            url: 'https://react.dev',
            provider: 'Meta',
            free: true
          }],
          matchPercentage: 75
        },
        completedSteps: [],
        generatedDate: new Date()
      };

      try {
        const textContent = generateCareerPlanText(testData);
        console.log('PDF Export Test:', textContent.substring(0, 200) + '...');
        alert('PDF export test successful! Check console for details.');
      } catch (error) {
        console.error('PDF Export Error:', error);
        alert('PDF export failed: ' + error.message);
      }
    });
  };

  const testSkillGapAnalysis = () => {
    console.log('Testing skill gap analysis...');
    const userSkills = ['js', 'react'];
    const careerSkills = ['js', 'react', 'node', 'sql', 'python'];
    const missingSkills = careerSkills.filter(skill => !userSkills.includes(skill));
    
    console.log('User Skills:', userSkills);
    console.log('Career Skills:', careerSkills);
    console.log('Missing Skills:', missingSkills);
    alert(`Skill gap analysis: ${missingSkills.length} skills missing`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Panel - Test New Features</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={testCVParsing} variant="outline">
            Test CV Parsing
          </Button>
          <Button onClick={testPDFExport} variant="outline">
            Test PDF Export
          </Button>
          <Button onClick={testSkillGapAnalysis} variant="outline">
            Test Skill Gap
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Click the buttons above to test each new feature. Check the browser console for detailed logs.</p>
          <p>Features implemented:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>✅ Skill Gap Analysis</li>
            <li>✅ CV Parsing</li>
            <li>✅ Career Trends Dashboard</li>
            <li>✅ Exportable Career Plan</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
