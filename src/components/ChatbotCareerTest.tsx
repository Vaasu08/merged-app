import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getChatbotService } from '@/lib/chatbotService';
import { toast } from 'sonner';

const ChatbotCareerTest = () => {
  const [testResults, setTestResults] = useState<Array<{question: string, answer: string, success: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const careerQuestions = [
    "How do I get career recommendations?",
    "What career paths are available?",
    "How does skill matching work?",
    "What skills should I learn for data science?",
    "How do I build a resume?",
    "What are the salary ranges for developers?",
    "How do I track my career progress?",
    "What job opportunities are available?"
  ];

  const runCareerTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      const chatbotService = getChatbotService();
      const results = [];

      for (const question of careerQuestions) {
        try {
          const answer = await chatbotService.processMessage(question);
          const isRelevant = !answer.toLowerCase().includes('for further inquiries');
          
          results.push({
            question,
            answer,
            success: isRelevant
          });

          // Small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          results.push({
            question,
            answer: `Error: ${error}`,
            success: false
          });
        }
      }

      setTestResults(results);
      const successCount = results.filter(r => r.success).length;
      toast.success(`Career tests completed! ${successCount}/${results.length} questions answered correctly.`);
    } catch (error) {
      toast.error('Failed to run career tests');
      console.error('Test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Career Questions Test</CardTitle>
        <CardDescription>
          Test the chatbot with career-related questions to verify it provides helpful answers about Horizon's features
        </CardDescription>
        <Button 
          onClick={runCareerTests} 
          disabled={isLoading}
          className="w-fit"
        >
          {isLoading ? 'Testing Career Questions...' : 'Test Career Questions'}
        </Button>
      </CardHeader>
      <CardContent>
        {testResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Career Test Results:</h3>
              <Badge variant="outline">
                {testResults.filter(r => r.success).length}/{testResults.length} passed
              </Badge>
            </div>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "✓ Helpful" : "✗ Fallback"}
                  </Badge>
                  <span className="font-medium">Q{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Question:</p>
                  <p className="text-sm">{result.question}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Answer:</p>
                  <p className="text-sm">{result.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {testResults.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Test Career Questions" to verify the chatbot responds appropriately to career-related questions
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatbotCareerTest;
