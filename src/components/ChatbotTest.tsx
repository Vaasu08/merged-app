import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getChatbotService } from '@/lib/chatbotService';
import { toast } from 'sonner';

const ChatbotTest = () => {
  const [testResults, setTestResults] = useState<Array<{question: string, answer: string, success: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testQuestions = [
    "What is Horizon?",
    "How does career matching work?",
    "What skills are available?",
    "How do I create an account?",
    "What is the weather today?", // This should trigger fallback
    "Tell me about React development", // This should trigger fallback
    "What career paths are available?",
    "How do I upload my CV?"
  ];

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      const chatbotService = getChatbotService();
      const results = [];

      for (const question of testQuestions) {
        try {
          const answer = await chatbotService.processMessage(question);
          const isRelevant = !answer.toLowerCase().includes('for further inquiries');
          
          results.push({
            question,
            answer,
            success: true
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
      toast.success('Chatbot tests completed!');
    } catch (error) {
      toast.error('Failed to run tests');
      console.error('Test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Chatbot Test Suite</CardTitle>
        <CardDescription>
          Test the chatbot with various questions to verify it responds correctly to website-related queries
          and falls back to contact email for irrelevant questions.
        </CardDescription>
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="w-fit"
        >
          {isLoading ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </CardHeader>
      <CardContent>
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Error"}
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
            Click "Run Tests" to test the chatbot functionality
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatbotTest;
