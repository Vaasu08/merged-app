import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  aiInterviewService, 
  InterviewRole, 
  InterviewSession as AISession,
  InterviewQuestion,
  AnswerEvaluation,
  ConversationTurn
} from "@/lib/aiInterviewService";

export type InterviewMode = "text" | "audio" | "video";
export type JobField = string;

// AI Interview specific types
export type AIInterviewRole = InterviewRole;

interface AIInterviewState {
  isAIMode: boolean;
  session: AISession | null;
  currentQuestion: InterviewQuestion | null;
  lastEvaluation: AnswerEvaluation | null;
  isProcessing: boolean;
  followUpCount: number;
  conversationHistory: ConversationTurn[];
}

interface InterviewContextType {
  userName: string;
  setUserName: (name: string) => void;
  jobField: JobField | null;
  setJobField: (field: JobField) => void;
  interviewMode: InterviewMode | null;
  setInterviewMode: (mode: InterviewMode) => void;
  questions: string[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  answers: string[];
  addAnswer: (answer: string) => void;
  setAnswers: (answers: string[]) => void;
  behaviorAnalysis: {
    eyeContact: number;
    confidence: number;
    clarity: number;
    engagement: number;
    attentiveness: number;
  };
  updateBehaviorAnalysis: (key: keyof InterviewContextType['behaviorAnalysis'], value: number) => void;
  expressionData: {
    expressions: Array<{ timestamp: number; blink: boolean; smile: boolean; mouth_open: boolean }>;
    posture: Array<{ timestamp: number; slouch_level: string; slouch_score: number }>;
  };
  addExpressionData: (expressions: any, posture: any) => void;
  feedback: {
    strengths: string[];
    improvements: string[];
    overallScore: number;
    passed: boolean;
    criteria: {
      technicalKnowledge: number;
      communication: number;
      problemSolving: number;
      culturalFit: number;
      experience: number;
      professionalPresence?: number; // For video interviews
    };
    detailedReview: string;
    postureScore?: number; // For video interviews
  };
  setFeedback: (feedback: InterviewContextType['feedback']) => void;
  generateFeedback: () => void;
  resetInterview: () => void;
  addCustomJobField: (id: string, label: string) => void;
  customJobFields: Array<{ id: string; label: string; icon: string }>;
  
  // AI Interview methods
  aiInterview: AIInterviewState;
  startAIInterview: (role: AIInterviewRole, difficulty?: 'beginner' | 'intermediate' | 'senior') => Promise<void>;
  submitAIAnswer: (answer: string) => Promise<{ nextQuestion: InterviewQuestion | null; evaluation: AnswerEvaluation; isFollowUp: boolean }>;
  getAIFeedback: () => Promise<void>;
  endAIInterview: () => void;
}

const defaultQuestions = {
  "software-engineering": [
    "Tell me about your experience with software development?",
    "How do you approach debugging a complex issue?",
    "Explain a challenging project you've worked on and how you overcame obstacles.",
    "Describe a time when you had to refactor a large codebase. What was your approach and what challenges did you face?",
    "How do you ensure your code is maintainable and scalable for future developers?",
    "Explain the concept of dependency injection and when you would use it.",
    "How do you stay updated with the latest technologies?",
    "Describe your ideal development environment and team structure."
  ],
  "data-science": [
    "Explain your approach to a data analysis project from start to finish.",
    "How do you handle missing or incomplete data?",
    "Describe a complex data problem you solved and the impact it had.",
    "Explain the difference between supervised and unsupervised learning with examples.",
    "How would you detect and handle outliers in a dataset?",
    "Describe a situation where you had to balance statistical rigor with business needs.",
    "What statistical methods do you commonly use and why?",
    "How do you communicate technical findings to non-technical stakeholders?"
  ],
  "marketing": [
    "Describe a successful marketing campaign you've led.",
    "How do you measure the success of marketing initiatives?",
    "How do you identify and target key customer segments?",
    "Explain how you would create a comprehensive omnichannel marketing strategy.",
    "How do you balance creativity with data-driven decision making?",
    "Describe a marketing campaign that failed and what you learned from it.",
    "What's your approach to digital marketing and social media?",
    "How do you stay on top of marketing trends and changes?"
  ],
  "sales": [
    "Describe your sales methodology.",
    "How do you handle objections from potential clients?",
    "Tell me about a difficult sale you closed successfully.",
    "How do you qualify leads and prioritize your sales pipeline?",
    "Describe a situation where you lost a sale and what you learned from it.",
    "What strategies do you use to upsell or cross-sell to existing customers?",
    "How do you build relationships with clients?",
    "What CRM systems have you used and how did they improve your process?"
  ],
  "design": [
    "Walk me through your design process from concept to delivery.",
    "How do you incorporate user feedback into your designs?",
    "Describe a project where you had to balance aesthetics with functionality.",
    "How do you approach designing for accessibility and inclusive experiences?",
    "Explain how you would conduct effective user research before beginning a design.",
    "How do you handle conflicting feedback from stakeholders?",
    "How do you stay inspired and generate new ideas?",
    "How do you collaborate with developers and other team members?"
  ],
  "product-management": [
    "How do you prioritize features for a product roadmap?",
    "Describe how you gather and incorporate user feedback.",
    "Tell me about a product launch you managed and any challenges you faced.",
    "How do you make decisions when you don't have all the data you need?",
    "Describe a time when you had to pivot a product strategy and how you managed stakeholder expectations.",
    "How do you evaluate the success of a product after launch?",
    "How do you balance business goals with user needs?",
    "How do you work with engineering, design, and other departments?"
  ]
};

const defaultContext: InterviewContextType = {
  userName: "",
  setUserName: () => {},
  jobField: null,
  setJobField: () => {},
  interviewMode: null,
  setInterviewMode: () => {},
  questions: [],
  currentQuestionIndex: 0,
  setCurrentQuestionIndex: () => {},
  answers: [],
  addAnswer: () => {},
  setAnswers: () => {},
  behaviorAnalysis: {
    eyeContact: 0,
    confidence: 0,
    clarity: 0,
    engagement: 0,
    attentiveness: 0,
  },
  updateBehaviorAnalysis: () => {},
  expressionData: {
    expressions: [],
    posture: [],
  },
  addExpressionData: () => {},
  feedback: {
    strengths: [],
    improvements: [],
    overallScore: 0,
    passed: false,
    criteria: {
      technicalKnowledge: 0,
      communication: 0,
      problemSolving: 0,
      culturalFit: 0,
      experience: 0,
      professionalPresence: undefined,
    },
    detailedReview: "",
    postureScore: undefined,
  },
  setFeedback: () => {},
  generateFeedback: () => {},
  resetInterview: () => {},
  addCustomJobField: () => {},
  customJobFields: [],
  
  // AI Interview defaults
  aiInterview: {
    isAIMode: false,
    session: null,
    currentQuestion: null,
    lastEvaluation: null,
    isProcessing: false,
    followUpCount: 0,
    conversationHistory: [],
  },
  startAIInterview: async () => {},
  submitAIAnswer: async () => ({ nextQuestion: null, evaluation: {} as AnswerEvaluation, isFollowUp: false }),
  getAIFeedback: async () => {},
  endAIInterview: () => {},
};

const InterviewContext = createContext<InterviewContextType>(defaultContext);

export const useInterview = () => useContext(InterviewContext);

interface InterviewProviderProps {
  children: ReactNode;
}

export const InterviewProvider = ({ children }: InterviewProviderProps) => {
  const [userName, setUserName] = useState("");
  const [jobField, setJobField] = useState<JobField | null>(null);
  const [interviewMode, setInterviewMode] = useState<InterviewMode | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [customJobFields, setCustomJobFields] = useState<Array<{ id: string; label: string; icon: string }>>([]);
  const [behaviorAnalysis, setBehaviorAnalysis] = useState({
    eyeContact: 0,
    confidence: 0,
    clarity: 0,
    engagement: 0,
    attentiveness: 0,
  });
  const [expressionData, setExpressionData] = useState({
    expressions: [] as Array<{ timestamp: number; blink: boolean; smile: boolean; mouth_open: boolean }>,
    posture: [] as Array<{ timestamp: number; slouch_level: string; slouch_score: number }>,
  });
  const [feedback, setFeedback] = useState<InterviewContextType['feedback']>({
    strengths: [],
    improvements: [],
    overallScore: 0,
    passed: false,
    criteria: {
      technicalKnowledge: 0,
      communication: 0,
      problemSolving: 0,
      culturalFit: 0,
      experience: 0,
      professionalPresence: undefined,
    },
    detailedReview: "",
    postureScore: undefined,
  });

  // AI Interview State
  const [aiInterview, setAIInterview] = useState<AIInterviewState>({
    isAIMode: false,
    session: null,
    currentQuestion: null,
    lastEvaluation: null,
    isProcessing: false,
    followUpCount: 0,
    conversationHistory: [],
  });

  // AI Interview Methods
  const startAIInterview = async (
    role: AIInterviewRole,
    difficulty: 'beginner' | 'intermediate' | 'senior' = 'intermediate'
  ) => {
    console.log('🎯 startAIInterview called with role:', role, 'difficulty:', difficulty);
    try {
      setAIInterview(prev => ({ ...prev, isProcessing: true }));
      
      console.log('🎯 Calling aiInterviewService.startSession...');
      const session = await aiInterviewService.startSession(role, difficulty);
      console.log('🎯 Session created:', session);
      
      const firstQuestion = session.questions[0];
      console.log('🎯 First question:', firstQuestion);
      
      // Add interviewer's first question to conversation
      aiInterviewService.addConversationTurn('interviewer', firstQuestion.question, firstQuestion.id);
      
      setAIInterview({
        isAIMode: true,
        session,
        currentQuestion: firstQuestion,
        lastEvaluation: null,
        isProcessing: false,
        followUpCount: 0,
        conversationHistory: [{
          role: 'interviewer',
          content: firstQuestion.question,
          timestamp: Date.now(),
          questionId: firstQuestion.id,
        }],
      });
      console.log('🎯 aiInterview state updated');
      
      // Also set in main questions array for compatibility
      setQuestions(session.questions.map(q => q.question));
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('🎯 Failed to start AI interview:', error);
      setAIInterview(prev => ({ ...prev, isProcessing: false }));
      throw error; // Re-throw so the component can handle it
    }
  };

  const submitAIAnswer = async (answer: string): Promise<{
    nextQuestion: InterviewQuestion | null;
    evaluation: AnswerEvaluation;
    isFollowUp: boolean;
  }> => {
    console.log('📝 submitAIAnswer called with:', answer);
    console.log('📝 aiInterview.currentQuestion:', aiInterview.currentQuestion);
    
    if (!aiInterview.currentQuestion) {
      console.error('❌ No current question!');
      throw new Error('No current question');
    }

    console.log('✅ Setting isProcessing to true');
    setAIInterview(prev => ({ ...prev, isProcessing: true }));

    try {
      // Add candidate's answer to conversation
      console.log('📝 Adding conversation turn...');
      aiInterviewService.addConversationTurn('candidate', answer, aiInterview.currentQuestion.id);
      
      // Evaluate the answer
      console.log('📝 Evaluating answer...');
      const evaluation = await aiInterviewService.evaluateAnswer(
        aiInterview.currentQuestion,
        answer,
        aiInterview.conversationHistory
      );
      console.log('📝 Evaluation result:', evaluation);
      
      // Store evaluation
      aiInterviewService.addConversationTurn(
        'candidate',
        answer,
        aiInterview.currentQuestion.id,
        evaluation
      );
      
      // Get next question (might be follow-up or next in sequence)
      const nextResult = await aiInterviewService.getNextQuestion(answer, evaluation);
      
      // Update conversation history
      const updatedHistory: ConversationTurn[] = [
        ...aiInterview.conversationHistory,
        {
          role: 'candidate',
          content: answer,
          timestamp: Date.now(),
          questionId: aiInterview.currentQuestion.id,
          evaluation,
        },
      ];
      
      if (nextResult) {
        // Add next question to history
        updatedHistory.push({
          role: 'interviewer',
          content: nextResult.question.question,
          timestamp: Date.now(),
          questionId: nextResult.question.id,
        });
        
        aiInterviewService.addConversationTurn('interviewer', nextResult.question.question, nextResult.question.id);
      }
      
      setAIInterview(prev => ({
        ...prev,
        currentQuestion: nextResult?.question || null,
        lastEvaluation: evaluation,
        isProcessing: false,
        followUpCount: nextResult?.isFollowUp ? prev.followUpCount + 1 : 0,
        conversationHistory: updatedHistory,
      }));
      
      // Update main state for compatibility
      addAnswer(answer);
      if (nextResult && !nextResult.isFollowUp) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      
      return {
        nextQuestion: nextResult?.question || null,
        evaluation,
        isFollowUp: nextResult?.isFollowUp || false,
      };
    } catch (error) {
      console.error('Failed to submit AI answer:', error);
      setAIInterview(prev => ({ ...prev, isProcessing: false }));
      throw error;
    }
  };

  const getAIFeedback = async () => {
    try {
      setAIInterview(prev => ({ ...prev, isProcessing: true }));
      
      const aiFeedback = await aiInterviewService.generateFinalFeedback();
      
      if (aiFeedback) {
        setFeedback({
          strengths: aiFeedback.strengths,
          improvements: aiFeedback.improvements,
          overallScore: aiFeedback.overallScore,
          passed: aiFeedback.recommendation === 'hire' || aiFeedback.recommendation === 'strong-hire',
          criteria: {
            technicalKnowledge: aiFeedback.overallScore,
            communication: aiFeedback.overallScore - 5 + Math.random() * 10,
            problemSolving: aiFeedback.overallScore - 5 + Math.random() * 10,
            culturalFit: aiFeedback.overallScore - 5 + Math.random() * 10,
            experience: aiFeedback.overallScore - 5 + Math.random() * 10,
          },
          detailedReview: aiFeedback.detailedReview,
        });
      }
      
      setAIInterview(prev => ({ ...prev, isProcessing: false }));
    } catch (error) {
      console.error('Failed to get AI feedback:', error);
      setAIInterview(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const endAIInterview = () => {
    aiInterviewService.endSession();
    setAIInterview({
      isAIMode: false,
      session: null,
      currentQuestion: null,
      lastEvaluation: null,
      isProcessing: false,
      followUpCount: 0,
      conversationHistory: [],
    });
  };

  const handleSetJobField = (field: JobField) => {
    setJobField(field);
    
    if (defaultQuestions[field as keyof typeof defaultQuestions]) {
      setQuestions(defaultQuestions[field as keyof typeof defaultQuestions]);
    } else {
      const customField = customJobFields.find(f => f.id === field);
      if (customField) {
        setQuestions([
          `Tell me about your experience in ${customField.label}?`,
          `What are the most important skills for success in ${customField.label}?`,
          `Describe a challenging situation you've faced in ${customField.label} and how you resolved it.`,
          `How do you stay current with trends and developments in ${customField.label}?`,
          `What achievement in ${customField.label} are you most proud of and why?`,
          `How do you handle pressure or tight deadlines in ${customField.label}?`,
          `Describe your approach to problem-solving in ${customField.label}.`,
          `Where do you see the ${customField.label} field evolving in the next 5 years?`,
        ]);
      } else {
        setQuestions([
          "Tell me about your relevant experience?",
          "What are your greatest professional strengths?",
          "Describe a challenging situation you've faced at work and how you resolved it.",
          "Why are you interested in this position?",
          "Where do you see yourself professionally in 5 years?",
          "How do you handle pressure or stressful situations?",
          "Describe your approach to problem-solving.",
          "What questions do you have for me?",
        ]);
      }
    }
  };

  const addAnswer = (answer: string) => {
    setAnswers((prev) => [...prev, answer]);
  };

  const updateBehaviorAnalysis = (
    key: keyof typeof behaviorAnalysis,
    value: number
  ) => {
    setBehaviorAnalysis((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addExpressionData = (expressions: any, posture: any) => {
    const timestamp = Date.now();
    setExpressionData((prev) => ({
      expressions: [
        ...prev.expressions,
        {
          timestamp,
          blink: expressions.blink || false,
          smile: expressions.smile || false,
          mouth_open: expressions.mouth_open || false,
        },
      ],
      posture: [
        ...prev.posture,
        {
          timestamp,
          slouch_level: posture.slouch_level || 'GOOD',
          slouch_score: posture.slouch_score || 0,
        },
      ],
    }));
  };
  
  const addCustomJobField = (id: string, label: string) => {
    const newField = {
      id,
      label,
      icon: "🔍",
    };
    
    setCustomJobFields((prev) => [...prev, newField]);
  };

  const generateFeedback = () => {
    if (answers.length === 0) return;
    
    // Analyze posture data if available (for video interviews)
    let postureScore = 100; // Default to perfect if no video data
    let postureAnalysis = {
      avgSlouchScore: 0,
      worstSlouchLevel: 'GOOD' as string,
      postureIssues: [] as string[],
      totalMeasurements: 0
    };
    
    if (interviewMode === "video" && expressionData.posture.length > 0) {
      const postureScores = expressionData.posture.map(p => p.slouch_score || 0);
      const slouchLevels = expressionData.posture.map(p => p.slouch_level || 'GOOD');
      
      postureAnalysis.avgSlouchScore = postureScores.reduce((sum, score) => sum + score, 0) / postureScores.length;
      postureAnalysis.worstSlouchLevel = slouchLevels.reduce((worst, level) => {
        const severity = { 'GOOD': 0, 'MILD': 1, 'MODERATE': 2, 'SEVERE': 3 };
        return severity[level as keyof typeof severity] > severity[worst as keyof typeof severity] ? level : worst;
      }, 'GOOD');
      postureAnalysis.totalMeasurements = expressionData.posture.length;
      
      // Count posture issues
      const severeCount = slouchLevels.filter(l => l === 'SEVERE').length;
      const moderateCount = slouchLevels.filter(l => l === 'MODERATE').length;
      const mildCount = slouchLevels.filter(l => l === 'MILD').length;
      
      if (severeCount > postureAnalysis.totalMeasurements * 0.3) {
        postureAnalysis.postureIssues.push('Frequent severe slouching detected');
      }
      if (moderateCount > postureAnalysis.totalMeasurements * 0.4) {
        postureAnalysis.postureIssues.push('Consistent moderate slouching');
      }
      if (mildCount > postureAnalysis.totalMeasurements * 0.5) {
        postureAnalysis.postureIssues.push('Occasional slouching');
      }
      
      // Calculate posture score (inverse of slouch score)
      postureScore = Math.max(0, Math.min(100, 100 - postureAnalysis.avgSlouchScore));
    }
    
    // More strict evaluation of response quality
    const avgResponseLength = answers.reduce((sum, ans) => sum + ans.length, 0) / answers.length;
    
    // Stricter scoring for response length: penalize very short answers more significantly
    let responseQualityScore = 0;
    if (avgResponseLength < 50) {
      responseQualityScore = Math.floor((avgResponseLength / 50) * 40); // Max 40 points for very short answers
    } else if (avgResponseLength < 150) {
      responseQualityScore = 40 + Math.floor(((avgResponseLength - 50) / 100) * 30); // 40-70 points for short answers
    } else if (avgResponseLength < 300) {
      responseQualityScore = 70 + Math.floor(((avgResponseLength - 150) / 150) * 20); // 70-90 points for medium answers
    } else {
      responseQualityScore = 90 + Math.floor(Math.min((avgResponseLength - 300) / 200, 1) * 10); // 90-100 points for comprehensive answers
    }
    
    // Evaluation of answer quality based on keyword presence and structured responses
    // This is a simplified evaluation that would be more sophisticated in a real system
    const keywordsScore = Math.floor(Math.random() * 15) + 65; // For demo, we're using random, but in real system this would be based on content analysis
    
    // Check for structured answers (e.g., containing examples, evidence, reflection)
    const hasStructure = answers.reduce((count, ans) => {
      // Count responses that likely have a structured approach (contains examples, reflection, etc.)
      const hasExample = /example|instance|case|situation|scenario/i.test(ans);
      const hasReflection = /learned|realized|understood|discovered|insight|reflect/i.test(ans);
      const hasEvidence = /data|statistics|research|study|evidence|proven|measured/i.test(ans);
      
      return count + (hasExample || hasReflection || hasEvidence ? 1 : 0);
    }, 0);
    
    const structureScore = Math.floor((hasStructure / answers.length) * 100);
    
    // More accurate behavioral analysis
    const clarity = Math.floor((responseQualityScore * 0.6) + (keywordsScore * 0.4));
    const confidence = structureScore;
    const engagement = Math.floor((responseQualityScore * 0.5) + (structureScore * 0.5));
    
    // Video-specific metrics
    const eyeContact = interviewMode === "video" ? Math.floor(65 + Math.random() * 35) : 0;
    
    // Attentiveness combines engagement with posture
    const baseAttentiveness = interviewMode === "video" ? Math.floor(65 + Math.random() * 25) : 0;
    // Reduce attentiveness based on poor posture
    const posturePenalty = interviewMode === "video" ? Math.max(0, (100 - postureScore) * 0.3) : 0;
    const attentiveness = Math.max(0, Math.min(100, baseAttentiveness - posturePenalty));
    
    // Confidence is also affected by posture (good posture = more confident appearance)
    const postureConfidenceBoost = interviewMode === "video" && postureScore > 80 ? 5 : 0;
    const adjustedConfidence = Math.min(100, confidence + postureConfidenceBoost);
    
    setBehaviorAnalysis({
      clarity,
      confidence: adjustedConfidence,
      engagement,
      eyeContact,
      attentiveness
    });
    
    // Technical evaluation
    // Use a stricter baseline
    const baselineScore = 60; // Starting point for evaluation
    
    // Calculate individual criteria scores with more variability and strictness
    const calculateCriteriaScore = (answerQuality: number, threshold: number) => {
      // More nuanced scoring that's harder to achieve high scores
      if (answerQuality > 90) return Math.floor(baselineScore + 35 + (Math.random() * 5)); // 95-100
      if (answerQuality > 80) return Math.floor(baselineScore + 25 + (Math.random() * 10)); // 85-95
      if (answerQuality > 70) return Math.floor(baselineScore + 15 + (Math.random() * 10)); // 75-85
      if (answerQuality > 60) return Math.floor(baselineScore + 5 + (Math.random() * 10)); // 65-75
      if (answerQuality > 50) return Math.floor(baselineScore - 5 + (Math.random() * 10)); // 55-65
      return Math.floor(baselineScore - 15 + (Math.random() * 10)); // 45-55
    };
    
    // Calculate scores for each criterion using the new algorithm
    const technicalKnowledge = calculateCriteriaScore(responseQualityScore, 75);
    const communication = calculateCriteriaScore(clarity, 80);
    const problemSolving = calculateCriteriaScore(structureScore, 70);
    const culturalFit = calculateCriteriaScore(engagement, 70);
    const experience = calculateCriteriaScore(keywordsScore, 75);
    
    // Professional presence score (includes posture for video interviews)
    let professionalPresence = 75; // Base score
    if (interviewMode === "video") {
      // Professional presence heavily influenced by posture
      professionalPresence = Math.floor(
        (postureScore * 0.6) + // 60% posture
        (adjustedConfidence * 0.2) + // 20% confidence
        (attentiveness * 0.2) // 20% attentiveness
      );
    }
    
    // Weighted overall score calculation
    // For video interviews, include professional presence (10% weight)
    const overallScore = interviewMode === "video"
      ? Math.floor(
          (technicalKnowledge * 0.22) +
          (communication * 0.18) +
          (problemSolving * 0.22) +
          (culturalFit * 0.13) +
          (experience * 0.15) +
          (professionalPresence * 0.10) // Add posture/professional presence
        )
      : Math.floor(
          (technicalKnowledge * 0.25) +
          (communication * 0.2) +
          (problemSolving * 0.25) +
          (culturalFit * 0.15) +
          (experience * 0.15)
        );
    
    // Strict pass/fail threshold - 70 is the passing score
    const passed = overallScore >= 70;
    
    // Generate meaningful strengths and areas for improvement
    const strengths = [];
    const improvements = [];
    
    // More detailed and specific feedback
    if (technicalKnowledge >= 80) {
      strengths.push("Demonstrated exceptional technical knowledge with specific examples");
    } else if (technicalKnowledge >= 70) {
      strengths.push("Showed good technical understanding of core concepts");
    } else {
      improvements.push("Need to develop deeper technical knowledge with concrete examples");
    }
    
    if (communication >= 80) {
      strengths.push("Communicated ideas with clarity, precision and confidence");
    } else if (communication >= 70) {
      strengths.push("Expressed thoughts clearly and logically");
    } else {
      improvements.push("Should work on more structured and concise communication");
    }
    
    if (problemSolving >= 80) {
      strengths.push("Excellent analytical approach to complex problems with methodical solutions");
    } else if (problemSolving >= 70) {
      strengths.push("Demonstrated sound problem-solving methodology");
    } else {
      improvements.push("Could improve problem-solving approach with more structured frameworks");
    }
    
    if (culturalFit >= 80) {
      strengths.push("Values and work approach align exceptionally well with organizational culture");
    } else if (culturalFit >= 70) {
      strengths.push("Showed good understanding of and alignment with company values");
    } else {
      improvements.push("Research company culture further to demonstrate better alignment");
    }
    
    if (experience >= 80) {
      strengths.push("Effectively leveraged relevant experience with measurable achievements");
    } else if (experience >= 70) {
      strengths.push("Appropriately referenced past experiences to support answers");
    } else {
      improvements.push("Should connect answers more directly to relevant past experiences");
    }
    
    if (responseQualityScore >= 80) {
      strengths.push("Provided comprehensive, detailed responses with supporting evidence");
    } else if (responseQualityScore >= 70) {
      strengths.push("Answers were adequately detailed and relevant");
    } else {
      improvements.push("Responses would benefit from more depth, specificity and examples");
    }
    
    // Posture feedback for video interviews
    if (interviewMode === "video" && expressionData.posture.length > 0) {
      if (postureScore >= 85) {
        strengths.push("Maintained excellent posture throughout the interview, demonstrating professionalism");
      } else if (postureScore >= 70) {
        strengths.push("Generally maintained good posture and professional appearance");
      } else if (postureScore >= 50) {
        improvements.push("Work on maintaining better posture - sit upright and keep shoulders back");
      } else {
        improvements.push("Posture needs significant improvement - frequent slouching was detected. Practice sitting upright with shoulders aligned");
      }
      
      // Specific posture feedback
      if (postureAnalysis.worstSlouchLevel === 'SEVERE') {
        improvements.push("Severe slouching detected - maintain an upright position with chin parallel to the floor");
      } else if (postureAnalysis.worstSlouchLevel === 'MODERATE') {
        improvements.push("Moderate slouching observed - focus on keeping your back straight and head aligned with your spine");
      }
      
      if (postureAnalysis.postureIssues.length > 0) {
        improvements.push(...postureAnalysis.postureIssues);
      }
    }
    
    // Ensure we always have some feedback
    if (strengths.length === 0) {
      strengths.push("Shows willingness to learn and adaptability");
    }
    if (improvements.length === 0) {
      improvements.push("Continue building confidence through interview practice");
    }
    
    // Limit to top three most relevant points
    const finalStrengths = strengths.slice(0, 3);
    const finalImprovements = improvements.slice(0, 3);
    
    // Generate a more detailed performance review based on scores
    let detailedReview = "";
    
    // Add posture context for video interviews
    const postureContext = interviewMode === "video" && expressionData.posture.length > 0
      ? postureScore >= 85
        ? " The candidate maintained excellent posture throughout, projecting confidence and professionalism."
        : postureScore >= 70
        ? " Posture was generally good, though occasional improvement opportunities were noted."
        : postureScore >= 50
        ? " Posture needs attention - frequent slouching was observed which may have impacted the professional presentation."
        : " Significant posture issues were detected throughout the interview, with frequent slouching that negatively impacted professional presence."
      : "";
    
    if (overallScore >= 85) {
      detailedReview = `The candidate demonstrated exceptional mastery of technical concepts and communication skills. Responses were comprehensive, well-structured, and showed deep understanding of the field.${postureContext} The candidate would likely excel in this role and bring significant value to the organization.`;
    } else if (overallScore >= 75) {
      detailedReview = `The candidate showed strong competency in most areas with clear communication and good technical knowledge. Responses were thoughtful and demonstrated relevant experience.${postureContext} With minor improvements, the candidate would be a strong asset to the team.`;
    } else if (overallScore >= 70) {
      detailedReview = `The candidate met the basic requirements with adequate technical knowledge and communication skills. While some answers lacked depth or specificity, the overall performance demonstrated capability for the role with proper guidance and development.${postureContext}`;
    } else if (overallScore >= 60) {
      detailedReview = `The candidate showed potential but fell short in key areas. Responses lacked sufficient depth, specificity, or relevant examples.${postureContext} With additional preparation and development, the candidate might be suitable for a more junior position or future opportunities.`;
    } else {
      detailedReview = `The candidate needs significant improvement in technical knowledge and communication skills. Responses were often vague, lacked structure, or missed key points.${postureContext} Additional training and experience would be necessary before reconsidering for a similar role.`;
    }
    
    setFeedback({
      strengths: finalStrengths,
      improvements: finalImprovements,
      overallScore,
      passed,
      criteria: {
        technicalKnowledge,
        communication,
        problemSolving,
        culturalFit,
        experience,
        ...(interviewMode === "video" && { professionalPresence }),
      },
      detailedReview,
      ...(interviewMode === "video" && { postureScore: Math.round(postureScore) }),
    });
  };

  const resetInterview = () => {
    setJobField(null);
    setInterviewMode(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setBehaviorAnalysis({
      eyeContact: 0,
      confidence: 0,
      clarity: 0,
      engagement: 0,
      attentiveness: 0,
    });
    setExpressionData({
      expressions: [],
      posture: [],
    });
    setFeedback({
      strengths: [],
      improvements: [],
      overallScore: 0,
      passed: false,
      criteria: {
        technicalKnowledge: 0,
        communication: 0,
        problemSolving: 0,
        culturalFit: 0,
        experience: 0,
        professionalPresence: undefined,
      },
      detailedReview: "",
      postureScore: undefined,
    });
  };

  return (
    <InterviewContext.Provider
      value={{
        userName,
        setUserName,
        jobField,
        setJobField: handleSetJobField,
        interviewMode,
        setInterviewMode,
        questions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        answers,
        addAnswer,
        setAnswers,
        behaviorAnalysis,
        updateBehaviorAnalysis,
        expressionData,
        addExpressionData,
        feedback,
        setFeedback,
        generateFeedback,
        resetInterview,
        addCustomJobField,
        customJobFields,
        // AI Interview
        aiInterview,
        startAIInterview,
        submitAIAnswer,
        getAIFeedback,
        endAIInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export default InterviewContext;


