import { z } from 'zod';

// Quiz types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  subtopic?: string;
}

export interface QuizRequest {
  topic: string;
  subtopic?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  numQuestions: number;
  duration: number; // in minutes
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  streak: number;
}

// Validation schemas
const QuizRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  subtopic: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  numQuestions: z.number().min(1).max(20),
  duration: z.number().min(5).max(120),
});

export const quizService = {
  // Generate quiz using Gemini API
  async generateQuiz(request: QuizRequest): Promise<Quiz> {
    try {
      // Validate request
      const parse = QuizRequestSchema.safeParse(request);
      if (!parse.success) {
        throw new Error('Invalid quiz request: ' + parse.error.flatten().fieldErrors);
      }

      const { topic, subtopic, difficulty, numQuestions, duration } = parse.data;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          subtopic,
          difficulty,
          numQuestions,
          duration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      return data.quiz;
    } catch (error) {
      console.error('Error generating quiz:', error);
      
      // Fallback to mock quiz if API fails
      console.warn('Falling back to mock quiz due to API error');
      return this.generateMockQuiz(request);
    }
  },

  // Fallback mock quiz generator
  generateMockQuiz(request: QuizRequest): Quiz {
    const { topic, subtopic, difficulty, numQuestions, duration } = request;
    
    const mockQuestions: QuizQuestion[] = [
      {
        id: '1',
        question: `What is the primary purpose of ${topic}?`,
        options: [
          'Creating web applications',
          'Data manipulation and analysis',
          'Machine learning model training',
          'Game development'
        ],
        correctAnswer: 1,
        explanation: `${topic} is primarily used for data manipulation and analysis tasks.`
      },
      {
        id: '2',
        question: `Which function is commonly used in ${topic}?`,
        options: [
          'create_function()',
          'main_function()',
          'primary_function()',
          'core_function()'
        ],
        correctAnswer: 1,
        explanation: 'The main_function() is a standard pattern in this field.'
      },
      {
        id: '3',
        question: `How do you implement best practices in ${topic}?`,
        options: [
          'By following coding standards',
          'By using proper documentation',
          'By implementing error handling',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'Best practices include all of these elements.'
      },
      {
        id: '4',
        question: `What is the most important aspect of ${topic}?`,
        options: [
          'Speed',
          'Accuracy',
          'Simplicity',
          'Scalability'
        ],
        correctAnswer: 1,
        explanation: 'Accuracy is crucial for reliable results.'
      }
    ];

    // Generate additional questions if needed
    while (mockQuestions.length < numQuestions) {
      const questionNum = mockQuestions.length + 1;
      mockQuestions.push({
        id: questionNum.toString(),
        question: `Question ${questionNum} about ${topic}?`,
        options: [
          'Option A',
          'Option B',
          'Option C',
          'Option D'
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `This is the explanation for question ${questionNum}.`
      });
    }

    return {
      id: `quiz_${Date.now()}`,
      title: `${topic} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
      description: `Test your knowledge of ${topic}${subtopic ? ` - ${subtopic}` : ''}`,
      questions: mockQuestions.slice(0, numQuestions),
      duration,
      difficulty,
      topic,
      subtopic,
    };
  },

  // Save quiz result to database
  async saveQuizResult(quizId: string, userId: string, result: QuizResult): Promise<void> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/quiz/save-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId,
          userId,
          result,
        }),
      });

      if (!response.ok) {
        console.warn('⚠️ Failed to save quiz result to database (non-fatal)');
        // Save to localStorage as fallback
        try {
          const storageKey = `quiz_result_${quizId}_${userId}`;
          localStorage.setItem(storageKey, JSON.stringify(result));
        } catch (storageError) {
          console.warn('⚠️ Also failed to save to localStorage:', storageError);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error saving quiz result (non-fatal):', error);
      // Save to localStorage as fallback
      try {
        const storageKey = `quiz_result_${quizId}_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(result));
      } catch (storageError) {
        // Ignore localStorage errors - saving is optional
      }
    }
  },

  // Get user's quiz history
  async getUserQuizHistory(userId: string): Promise<QuizResult[]> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/quiz/history/${userId}`);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.warn('Error fetching quiz history:', error);
      return [];
    }
  },

  // Generate quiz based on roadmap checkpoint
  async generateCheckpointQuiz(
    checkpointTitle: string,
    topicsCovered: string[],
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<Quiz> {
    const topic = topicsCovered[0] || checkpointTitle;
    const subtopic = topicsCovered.length > 1 ? topicsCovered.slice(1).join(', ') : undefined;

    return this.generateQuiz({
      topic,
      subtopic,
      difficulty,
      numQuestions: 4,
      duration: 10,
    });
  }
};
