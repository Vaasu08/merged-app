/**
 * AI Interview Service - Voice AI Interview Agent
 * 
 * Features:
 * - Role-specific interviews (FSD, ML Engineer, DSA)
 * - Dynamic follow-up questions for unclear answers
 * - Scenario-based questions
 * - Gemini API integration for intelligent responses
 * - Voice transcription support
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ==================== TYPES ====================
export type InterviewRole = 
  | 'full-stack-developer' 
  | 'ml-engineer' 
  | 'dsa-focused'
  | 'frontend-developer'
  | 'backend-developer'
  | 'devops-engineer'
  | 'data-scientist'
  | 'custom';

export type QuestionType = 
  | 'technical' 
  | 'behavioral' 
  | 'scenario' 
  | 'follow-up' 
  | 'dsa-problem'
  | 'system-design';

export interface InterviewQuestion {
  id: string;
  question: string;
  type: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  expectedKeyPoints?: string[];
  followUpTriggered?: boolean;
  parentQuestionId?: string; // For follow-up questions
}

export interface AnswerEvaluation {
  clarity: number; // 0-100
  completeness: number; // 0-100
  technicalAccuracy: number; // 0-100
  communicationSkill: number; // 0-100
  depth: number; // 0-100 - how deep the understanding is
  overallScore: number; // 0-100
  confidence: 'low' | 'medium' | 'high'; // AI's confidence in evaluation
  needsFollowUp: boolean;
  followUpReason?: string;
  missingConcepts?: string[];
  feedback: string;
  keyPointsCovered: string[];
  suggestedImprovement?: string;
  strongPoints?: string[]; // Specific things done well
  weakPoints?: string[]; // Specific things to improve
}

export interface ConversationTurn {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: number;
  questionId?: string;
  evaluation?: AnswerEvaluation;
}

export interface InterviewSession {
  id: string;
  role: InterviewRole;
  difficulty: 'beginner' | 'intermediate' | 'senior';
  questions: InterviewQuestion[];
  conversation: ConversationTurn[];
  currentQuestionIndex: number;
  followUpCount: number;
  maxFollowUps: number;
  startTime: number;
  status: 'preparing' | 'active' | 'paused' | 'completed';
}

// ==================== ROLE-SPECIFIC QUESTION BANKS ====================
const questionBank: Record<InterviewRole, Partial<Record<QuestionType, string[]>>> = {
  'full-stack-developer': {
    technical: [
      "Explain the difference between REST and GraphQL APIs. When would you choose one over the other?",
      "How does the Virtual DOM work in React, and why is it beneficial for performance?",
      "Describe the concept of database indexing. How do you decide which columns to index?",
      "What is the difference between SQL and NoSQL databases? Give examples of when to use each.",
      "Explain the concept of microservices architecture. What are its advantages and challenges?",
      "How do you handle state management in a large React application?",
      "What is CORS and how do you handle cross-origin requests in a full-stack application?",
      "Explain the concept of WebSockets. When would you use them over HTTP?",
    ],
    scenario: [
      "You're building an e-commerce platform. A user reports that their cart items disappear randomly. How would you debug this issue?",
      "Your application is experiencing slow page loads. Walk me through your approach to identify and fix performance bottlenecks.",
      "You need to implement real-time notifications for a social media app. Describe your technical approach.",
      "A critical production bug is affecting 10% of users. Walk me through your incident response process.",
      "You're tasked with migrating a monolithic application to microservices. What's your strategy?",
    ],
    behavioral: [
      "Tell me about a time when you had to learn a new technology quickly for a project.",
      "Describe a situation where you disagreed with a technical decision. How did you handle it?",
      "How do you prioritize tasks when working on multiple features simultaneously?",
    ],
  },
  'ml-engineer': {
    technical: [
      "Explain the bias-variance tradeoff. How do you balance it in practice?",
      "What is gradient descent? Explain the differences between batch, mini-batch, and stochastic gradient descent.",
      "How do you handle imbalanced datasets in classification problems?",
      "Explain the concept of regularization. Compare L1 and L2 regularization.",
      "What is the vanishing gradient problem? How do modern architectures address it?",
      "Describe the transformer architecture and its key innovation - self-attention.",
      "How do you evaluate a machine learning model in production vs development?",
      "Explain the concept of feature engineering. What techniques do you commonly use?",
      "What is transfer learning and when would you use it?",
      "How do you handle overfitting in neural networks?",
    ],
    scenario: [
      "You've trained a model that performs well on test data but poorly in production. What could be the causes and how would you investigate?",
      "You need to build a recommendation system for a streaming platform with millions of users. Describe your approach.",
      "Your model's predictions are being challenged for potential bias. How do you investigate and address this?",
      "You're tasked with deploying an ML model that needs to make predictions in under 100ms. What optimizations would you consider?",
      "A stakeholder wants you to explain why your model made a specific prediction. How do you approach model interpretability?",
    ],
    behavioral: [
      "Describe a project where your ML solution didn't work as expected. What did you learn?",
      "How do you communicate complex ML concepts to non-technical stakeholders?",
      "Tell me about a time when you had to choose between model accuracy and deployment constraints.",
    ],
  },
  'dsa-focused': {
    'dsa-problem': [
      "Given an array of integers, find two numbers that add up to a target sum. What's the optimal approach?",
      "How would you detect a cycle in a linked list? Explain your solution's time and space complexity.",
      "Explain the concept of dynamic programming. Walk me through solving the coin change problem.",
      "How would you implement a LRU (Least Recently Used) cache? What data structures would you use?",
      "Given a binary tree, how would you find the lowest common ancestor of two nodes?",
      "Explain different sorting algorithms and their time complexities. When would you choose each?",
      "How would you find the kth largest element in an unsorted array? What's the optimal approach?",
      "Explain the concept of graph traversal. Compare BFS and DFS with use cases.",
      "How would you implement a trie? What problems is it useful for?",
      "Explain the sliding window technique. Solve the problem of finding the longest substring without repeating characters.",
    ],
    technical: [
      "What is the time complexity of operations in a hash table? When does it degrade?",
      "Explain the concept of amortized time complexity with examples.",
      "Compare and contrast arrays vs linked lists. When would you use each?",
      "What are balanced binary search trees? Explain how AVL trees maintain balance.",
      "Explain the concept of heap data structure. How is it used in priority queues?",
    ],
    scenario: [
      "You need to design a system that can efficiently find the top 10 trending hashtags from millions of tweets. What data structures would you use?",
      "Design an autocomplete system for a search engine. What data structures and algorithms would you employ?",
      "You're building a navigation system. How would you implement shortest path finding between two locations?",
    ],
  },
  'frontend-developer': {
    technical: [
      "Explain the JavaScript event loop. How does it handle asynchronous operations?",
      "What are closures in JavaScript? Give practical examples of their use.",
      "Describe the CSS box model and how different properties affect layout.",
      "What is the difference between CSS Grid and Flexbox? When would you use each?",
      "Explain React hooks. What problems do they solve compared to class components?",
      "How does browser rendering work? Explain the critical rendering path.",
      "What are Web Components? How do they compare to framework-based components?",
      "Explain the concept of accessibility (a11y) in web development. What are key considerations?",
    ],
    scenario: [
      "A user reports that a form is very slow when typing. How would you diagnose and fix this?",
      "You need to optimize a website for Core Web Vitals. What metrics would you focus on and how?",
      "Design a reusable component library. What patterns and considerations would you follow?",
    ],
    behavioral: [
      "How do you stay updated with the rapidly evolving frontend ecosystem?",
      "Describe a time when you had to advocate for better user experience against tight deadlines.",
    ],
  },
  'backend-developer': {
    technical: [
      "Explain database transactions and ACID properties. Why are they important?",
      "What is database sharding? When and how would you implement it?",
      "Describe different caching strategies. When would you use each?",
      "Explain the CAP theorem. How does it influence distributed system design?",
      "What is message queuing? Compare different message queue systems.",
      "How do you design APIs for high availability and scalability?",
      "Explain authentication vs authorization. Describe JWT and OAuth2.",
      "What is rate limiting? How would you implement it in a distributed system?",
    ],
    scenario: [
      "Your API is experiencing increased latency during peak hours. How would you investigate and resolve this?",
      "Design a URL shortening service like bit.ly. What components would you need?",
      "You need to implement a payment processing system. What are the key considerations?",
    ],
    behavioral: [
      "Tell me about a production incident you handled. What was your approach?",
      "How do you balance technical debt with feature development?",
    ],
  },
  'devops-engineer': {
    technical: [
      "Explain the concept of Infrastructure as Code. Compare Terraform and CloudFormation.",
      "What is container orchestration? Compare Kubernetes and Docker Swarm.",
      "Describe CI/CD pipelines. What are best practices for implementing them?",
      "How do you implement monitoring and observability in a microservices architecture?",
      "Explain blue-green and canary deployment strategies.",
      "What is service mesh? When would you implement one?",
      "How do you manage secrets and configuration in a distributed system?",
      "Explain the concept of GitOps. What are its benefits?",
    ],
    scenario: [
      "Your Kubernetes cluster is experiencing pod evictions. How would you diagnose and resolve this?",
      "Design a disaster recovery strategy for a critical application. What RTO and RPO would you target?",
      "You need to migrate an on-premises application to the cloud. What's your migration strategy?",
    ],
    behavioral: [
      "Describe a time when you had to balance system reliability with rapid feature deployment.",
      "How do you handle on-call responsibilities and incident management?",
    ],
  },
  'data-scientist': {
    technical: [
      "Explain the difference between supervised and unsupervised learning with examples.",
      "What is cross-validation? Why is it important for model evaluation?",
      "Describe different types of ensemble methods. How does Random Forest work?",
      "What is dimensionality reduction? Compare PCA and t-SNE.",
      "Explain the concept of A/B testing. What statistical considerations are important?",
      "How do you handle missing data in a dataset? What are the tradeoffs of different approaches?",
      "What is time series analysis? Describe ARIMA and its components.",
      "Explain the difference between correlation and causation with examples.",
    ],
    scenario: [
      "A marketing team wants to predict customer churn. How would you approach this problem?",
      "You need to analyze the effectiveness of a new feature launch. Design the experiment.",
      "Your dataset has 1000 features but only 500 samples. How do you approach modeling?",
    ],
    behavioral: [
      "Tell me about a time when your analysis led to a significant business decision.",
      "How do you communicate uncertainty in your predictions to stakeholders?",
    ],
  },
  'custom': {
    behavioral: [
      "Tell me about yourself and your professional background.",
      "What are your greatest professional strengths?",
      "Describe a challenging situation you've faced at work and how you resolved it.",
      "Why are you interested in this position?",
      "Where do you see yourself professionally in 5 years?",
    ],
  },
};

// ==================== GEMINI SERVICE ====================
class AIInterviewService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private currentSession: InterviewSession | null = null;
  
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    }
  }

  /**
   * Initialize a new interview session
   */
  async startSession(
    role: InterviewRole,
    difficulty: 'beginner' | 'intermediate' | 'senior' = 'intermediate',
    customTopic?: string
  ): Promise<InterviewSession> {
    const questions = await this.generateQuestions(role, difficulty, customTopic);
    
    this.currentSession = {
      id: `session_${Date.now()}`,
      role,
      difficulty,
      questions,
      conversation: [],
      currentQuestionIndex: 0,
      followUpCount: 0,
      maxFollowUps: 2, // Max follow-ups per question
      startTime: Date.now(),
      status: 'active',
    };

    return this.currentSession;
  }

  /**
   * Generate interview questions using AI
   */
  private async generateQuestions(
    role: InterviewRole,
    difficulty: 'beginner' | 'intermediate' | 'senior',
    customTopic?: string
  ): Promise<InterviewQuestion[]> {
    const questions: InterviewQuestion[] = [];
    const bank = questionBank[role] || questionBank['custom'];
    
    // Mix different question types
    const questionTypes: QuestionType[] = role === 'dsa-focused' 
      ? ['dsa-problem', 'dsa-problem', 'dsa-problem', 'technical', 'scenario']
      : ['technical', 'technical', 'scenario', 'behavioral', 'technical', 'scenario'];
    
    for (let i = 0; i < 8; i++) {
      const type = questionTypes[i % questionTypes.length];
      const typeQuestions = bank[type] || bank['technical'] || bank['behavioral'] || [];
      
      if (typeQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * typeQuestions.length);
        questions.push({
          id: `q_${i + 1}`,
          question: typeQuestions[randomIndex],
          type,
          difficulty: difficulty === 'senior' ? 'hard' : difficulty === 'beginner' ? 'easy' : 'medium',
          topic: role,
        });
      }
    }

    // If we have AI, enhance with dynamic questions
    if (this.model && questions.length < 8) {
      try {
        const prompt = `Generate ${8 - questions.length} unique interview questions for a ${difficulty} ${role.replace(/-/g, ' ')} position.
        ${customTopic ? `Focus on: ${customTopic}` : ''}
        Mix technical, scenario-based, and behavioral questions.
        Return ONLY a JSON array of question strings, no other text.`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          const aiQuestions = JSON.parse(match[0]) as string[];
          aiQuestions.forEach((q, idx) => {
            questions.push({
              id: `q_ai_${idx + 1}`,
              question: q,
              type: 'technical',
              difficulty: difficulty === 'senior' ? 'hard' : 'medium',
              topic: customTopic || role,
            });
          });
        }
      } catch (error) {
        console.warn('Failed to generate AI questions:', error);
      }
    }

    return questions.slice(0, 8); // Limit to 8 questions
  }

  /**
   * Evaluate candidate's answer
   */
  async evaluateAnswer(
    question: InterviewQuestion,
    answer: string,
    conversationHistory: ConversationTurn[]
  ): Promise<AnswerEvaluation> {
    if (!this.model) {
      return this.getFallbackEvaluation(answer);
    }

    try {
      const historyContext = conversationHistory
        .slice(-6) // Last 3 exchanges
        .map(turn => `${turn.role}: ${turn.content}`)
        .join('\n');

      // Determine scoring rubric based on difficulty
      const difficultyMultiplier = question.difficulty === 'easy' ? 0.7 : question.difficulty === 'medium' ? 0.85 : 1.0;
      const minExpectedLength = question.difficulty === 'easy' ? 30 : question.difficulty === 'medium' ? 60 : 100;
      
      const prompt = `You are an expert technical interviewer with 15+ years of experience evaluating candidates. Use a rigorous, fair, and consistent scoring rubric.

QUESTION DETAILS:
- Question: ${question.question}
- Type: ${question.type}
- Topic: ${question.topic}
- Difficulty: ${question.difficulty}
- Expected depth: ${question.difficulty === 'easy' ? 'Basic understanding with examples' : question.difficulty === 'medium' ? 'Good understanding with real-world application' : 'Deep understanding with edge cases, trade-offs, and best practices'}

CONVERSATION HISTORY:
${historyContext}

CANDIDATE'S ANSWER:
${answer}

SCORING RUBRIC (0-100 for each):

1. CLARITY (How well-structured and understandable):
   - 90-100: Crystal clear, logical flow, perfect structure
   - 70-89: Clear with minor organizational issues
   - 50-69: Somewhat clear but disorganized
   - 0-49: Confusing or unclear

2. COMPLETENESS (Coverage of key concepts):
   - 90-100: Addresses all aspects thoroughly
   - 70-89: Covers main points, minor gaps
   - 50-69: Partial coverage, significant gaps
   - 0-49: Incomplete or missing key points

3. TECHNICAL ACCURACY (Correctness of information):
   - 90-100: Fully accurate, no errors
   - 70-89: Mostly accurate, minor inaccuracies
   - 50-69: Some correct, some incorrect
   - 0-49: Significant errors or misconceptions

4. COMMUNICATION SKILL (Articulation and professionalism):
   - 90-100: Excellent communication, professional
   - 70-89: Good communication, minor issues
   - 50-69: Adequate but could be better
   - 0-49: Poor communication

5. DEPTH (Level of understanding demonstrated):
   - 90-100: Deep understanding with nuances, trade-offs, best practices
   - 70-89: Good understanding with examples
   - 50-69: Surface-level understanding
   - 0-49: Minimal or superficial understanding

IMPORTANT GUIDELINES:
- Be fair but rigorous - this is a real interview
- Consider answer length: minimum ${minExpectedLength} words expected for ${question.difficulty} question
- Short answers (<30 words) rarely deserve >60 score unless exceptionally concise and complete
- Reward practical examples, real-world experience, and critical thinking
- Penalize vague statements, lack of specifics, or incorrect information
- For ${question.difficulty} difficulty, adjust expectations accordingly

Respond with ONLY valid JSON (no markdown, no code blocks, no extra text):
{
  "clarity": <0-100 number>,
  "completeness": <0-100 number>,
  "technicalAccuracy": <0-100 number>,
  "communicationSkill": <0-100 number>,
  "depth": <0-100 number>,
  "overallScore": <0-100 weighted average: (clarity*0.15 + completeness*0.25 + technicalAccuracy*0.35 + communicationSkill*0.10 + depth*0.15)>,
  "confidence": "<low|medium|high - your confidence in this evaluation>",
  "needsFollowUp": <true if unclear, incomplete, wrong, or shows knowledge gaps that need probing>,
  "followUpReason": "<specific reason for follow-up, or null if not needed>",
  "missingConcepts": [<specific concepts/topics that should have been mentioned>],
  "feedback": "<2-3 sentences of constructive, specific feedback>",
  "keyPointsCovered": [<specific good points the candidate made>],
  "strongPoints": [<specific things done well>],
  "weakPoints": [<specific things to improve>],
  "suggestedImprovement": "<actionable advice for improvement>"
}`;

      const result = await this.model.generateContent(prompt);
      let text = result.response.text();
      
      // Clean up the response - remove markdown code blocks and extra whitespace
      text = text.replace(/```json\n?|\n?```/g, '').trim();
      text = text.replace(/```\n?|\n?```/g, '').trim();
      
      // Try to extract JSON if there's extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }
      
      let evaluation: AnswerEvaluation;
      try {
        evaluation = JSON.parse(text) as AnswerEvaluation;
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Text:', text);
        throw parseError;
      }
      
      // Validate and fix the evaluation
      evaluation.clarity = Math.min(100, Math.max(0, evaluation.clarity || 50));
      evaluation.completeness = Math.min(100, Math.max(0, evaluation.completeness || 50));
      evaluation.technicalAccuracy = Math.min(100, Math.max(0, evaluation.technicalAccuracy || 50));
      evaluation.communicationSkill = Math.min(100, Math.max(0, evaluation.communicationSkill || 50));
      evaluation.depth = Math.min(100, Math.max(0, evaluation.depth || 50));
      evaluation.overallScore = Math.min(100, Math.max(0, evaluation.overallScore || 50));
      evaluation.confidence = evaluation.confidence || 'medium';
      evaluation.keyPointsCovered = evaluation.keyPointsCovered || [];
      evaluation.strongPoints = evaluation.strongPoints || [];
      evaluation.weakPoints = evaluation.weakPoints || [];
      
      return evaluation;
    } catch (error) {
      console.error('Evaluation failed:', error);
      return this.getFallbackEvaluation(answer);
    }
  }

  /**
   * Generate a follow-up question based on the answer
   */
  async generateFollowUp(
    originalQuestion: InterviewQuestion,
    answer: string,
    evaluation: AnswerEvaluation
  ): Promise<InterviewQuestion | null> {
    if (!evaluation.needsFollowUp || !this.model) {
      return null;
    }

    try {
      const prompt = `You are an expert interviewer. Based on the candidate's answer, generate ONE follow-up question to probe deeper into their understanding.

ORIGINAL QUESTION: ${originalQuestion.question}
CANDIDATE'S ANSWER: ${answer}
MISSING CONCEPTS: ${evaluation.missingConcepts?.join(', ') || 'None identified'}
REASON FOR FOLLOW-UP: ${evaluation.followUpReason || 'Unclear answer'}

Generate a specific follow-up question that:
1. Tests fundamental knowledge gaps
2. Is direct and clear
3. Allows the candidate to demonstrate understanding

Respond with ONLY the follow-up question text, nothing else.`;

      const result = await this.model.generateContent(prompt);
      const followUpText = result.response.text().trim();

      return {
        id: `${originalQuestion.id}_followup`,
        question: followUpText,
        type: 'follow-up',
        difficulty: originalQuestion.difficulty,
        topic: originalQuestion.topic,
        parentQuestionId: originalQuestion.id,
      };
    } catch (error) {
      console.error('Follow-up generation failed:', error);
      return null;
    }
  }

  /**
   * Generate scenario-based question dynamically
   */
  async generateScenarioQuestion(
    role: InterviewRole,
    context?: string
  ): Promise<InterviewQuestion | null> {
    if (!this.model) return null;

    try {
      const prompt = `Generate a realistic scenario-based interview question for a ${role.replace(/-/g, ' ')} position.
${context ? `Context: ${context}` : ''}

The scenario should:
1. Present a real-world problem
2. Require critical thinking
3. Allow multiple valid approaches
4. Test both technical and soft skills

Respond with ONLY the scenario question, nothing else.`;

      const result = await this.model.generateContent(prompt);
      const scenarioText = result.response.text().trim();

      return {
        id: `scenario_${Date.now()}`,
        question: scenarioText,
        type: 'scenario',
        difficulty: 'medium',
        topic: role,
      };
    } catch (error) {
      console.error('Scenario generation failed:', error);
      return null;
    }
  }

  /**
   * Get the next question or follow-up
   */
  async getNextQuestion(
    currentAnswer?: string,
    currentEvaluation?: AnswerEvaluation
  ): Promise<{ question: InterviewQuestion; isFollowUp: boolean } | null> {
    if (!this.currentSession) return null;

    const session = this.currentSession;
    
    // Check if we need a follow-up
    if (
      currentEvaluation?.needsFollowUp &&
      session.followUpCount < session.maxFollowUps &&
      currentAnswer
    ) {
      const currentQ = session.questions[session.currentQuestionIndex];
      const followUp = await this.generateFollowUp(currentQ, currentAnswer, currentEvaluation);
      
      if (followUp) {
        session.followUpCount++;
        return { question: followUp, isFollowUp: true };
      }
    }

    // Move to next question
    session.followUpCount = 0;
    session.currentQuestionIndex++;
    
    if (session.currentQuestionIndex >= session.questions.length) {
      session.status = 'completed';
      return null;
    }

    return {
      question: session.questions[session.currentQuestionIndex],
      isFollowUp: false,
    };
  }

  /**
   * Add a conversation turn
   */
  addConversationTurn(
    role: 'interviewer' | 'candidate',
    content: string,
    questionId?: string,
    evaluation?: AnswerEvaluation
  ): void {
    if (!this.currentSession) return;

    this.currentSession.conversation.push({
      role,
      content,
      timestamp: Date.now(),
      questionId,
      evaluation,
    });
  }

  /**
   * Generate final interview feedback
   */
  async generateFinalFeedback(): Promise<{
    overallScore: number;
    strengths: string[];
    improvements: string[];
    detailedReview: string;
    recommendation: 'strong-hire' | 'hire' | 'maybe' | 'no-hire';
  } | null> {
    if (!this.currentSession || !this.model) return null;

    const session = this.currentSession;
    const evaluations = session.conversation
      .filter(turn => turn.evaluation)
      .map(turn => turn.evaluation!);

    if (evaluations.length === 0) return null;

    try {
      const avgScore = evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length;
      
      const conversationSummary = session.conversation
        .map(turn => `${turn.role.toUpperCase()}: ${turn.content.substring(0, 200)}...`)
        .join('\n');

      const prompt = `Analyze this complete interview and provide final feedback.

ROLE: ${session.role.replace(/-/g, ' ')}
DIFFICULTY: ${session.difficulty}
AVERAGE SCORE: ${avgScore.toFixed(1)}

INTERVIEW TRANSCRIPT:
${conversationSummary}

INDIVIDUAL EVALUATIONS:
${evaluations.map((e, i) => `Q${i + 1}: Score ${e.overallScore}, ${e.feedback}`).join('\n')}

Provide a final assessment as JSON (no markdown):
{
  "overallScore": <0-100>,
  "strengths": [<3-5 specific strengths>],
  "improvements": [<3-5 areas to improve>],
  "detailedReview": "<2-3 paragraph detailed review>",
  "recommendation": "<strong-hire|hire|maybe|no-hire>"
}`

      const result = await this.model.generateContent(prompt);
      const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Final feedback generation failed:', error);
      return {
        overallScore: evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length,
        strengths: ['Completed the interview'],
        improvements: ['Review the questions and prepare better responses'],
        detailedReview: 'Interview completed. Please review your responses for improvement opportunities.',
        recommendation: 'maybe',
      };
    }
  }

  /**
   * Get current session
   */
  getSession(): InterviewSession | null {
    return this.currentSession;
  }

  /**
   * End current session
   */
  endSession(): void {
    if (this.currentSession) {
      this.currentSession.status = 'completed';
    }
  }

  /**
   * Fallback evaluation when AI is unavailable
   */
  private getFallbackEvaluation(answer: string): AnswerEvaluation {
    const wordCount = answer.split(/\s+/).length;
    const sentenceCount = (answer.match(/[.!?]+/g) || []).length;
    const hasStructure = sentenceCount >= 2 && answer.length > 50;
    const hasTechnicalTerms = /\b(function|class|method|API|database|algorithm|server|client|architecture|design|pattern|framework)\b/i.test(answer);
    const hasExamples = /\b(example|instance|such as|like|for example)\b/i.test(answer);
    
    // More sophisticated scoring
    const lengthScore = Math.min(100, (wordCount / 100) * 100);
    const structureBonus = hasStructure ? 20 : 0;
    const technicalBonus = hasTechnicalTerms ? 15 : 0;
    const exampleBonus = hasExamples ? 10 : 0;
    
    const clarity = Math.min(100, (hasStructure ? 60 : 40) + (sentenceCount * 5));
    const completeness = Math.min(100, (wordCount / 80) * 100);
    const technicalAccuracy = hasTechnicalTerms ? 70 : 50;
    const communicationSkill = Math.min(100, (hasStructure ? 65 : 45) + (sentenceCount * 3));
    const depth = Math.min(100, 40 + technicalBonus + exampleBonus);
    
    const overallScore = Math.min(100, 
      (clarity * 0.15) + 
      (completeness * 0.25) + 
      (technicalAccuracy * 0.35) + 
      (communicationSkill * 0.10) + 
      (depth * 0.15)
    );
    
    return {
      clarity,
      completeness,
      technicalAccuracy,
      communicationSkill,
      depth,
      overallScore: Math.round(overallScore),
      confidence: 'low',
      needsFollowUp: wordCount < 40 || !hasTechnicalTerms,
      followUpReason: wordCount < 40 ? 'Answer needs more detail and depth' : !hasTechnicalTerms ? 'Missing technical specifics' : undefined,
      missingConcepts: [],
      feedback: `Your answer is ${wordCount < 40 ? 'brief' : 'recorded'}. ${!hasTechnicalTerms ? 'Include more technical details. ' : ''}${!hasExamples ? 'Add specific examples to strengthen your response.' : ''}`,
      keyPointsCovered: [],
      strongPoints: hasStructure ? ['Well-structured response'] : [],
      weakPoints: [
        ...(wordCount < 40 ? ['Answer is too brief'] : []),
        ...(!hasTechnicalTerms ? ['Lacks technical depth'] : []),
        ...(!hasExamples ? ['No concrete examples provided'] : [])
      ],
      suggestedImprovement: 'Expand your answer with: 1) More technical details, 2) Specific examples from your experience, 3) Better structure with clear points.',
    };
  }
}

// Export singleton instance
export const aiInterviewService = new AIInterviewService();
export default aiInterviewService;
