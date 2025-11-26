/**
 * AI Voice Interview Session Component
 * 
 * Features:
 * - Role-specific interviews (FSD, ML, DSA)
 * - AI-powered dynamic questions and follow-ups
 * - Continuous conversation mode (like ChatGPT voice)
 * - Real-time transcription with silence detection
 * - ElevenLabs-style natural TTS
 * - Answer evaluation with feedback
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, MicOff, Volume2, VolumeX, Send, ArrowRight, 
  Brain, Code, Database, Cpu, AlertCircle, CheckCircle2,
  Loader2, MessageSquare, Sparkles, BarChart3, Radio
} from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";
import { useInterview, AIInterviewRole } from "@/contexts/InterviewContext";
import { voiceService, TranscriptionResult, VoiceState, VoiceEventType } from "@/lib/voiceService";
import { InterviewQuestion, AnswerEvaluation } from "@/lib/aiInterviewService";

// Role options with icons
const roleOptions: Array<{
  id: AIInterviewRole;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: 'full-stack-developer',
    label: 'Full Stack Developer',
    icon: <Code className="h-6 w-6" />,
    description: 'Frontend, backend, databases, and system design',
  },
  {
    id: 'ml-engineer',
    label: 'ML Engineer',
    icon: <Brain className="h-6 w-6" />,
    description: 'Machine learning, deep learning, and MLOps',
  },
  {
    id: 'dsa-focused',
    label: 'DSA Interview',
    icon: <Database className="h-6 w-6" />,
    description: 'Data structures, algorithms, and problem solving',
  },
  {
    id: 'frontend-developer',
    label: 'Frontend Developer',
    icon: <Code className="h-6 w-6" />,
    description: 'React, CSS, JavaScript, and web performance',
  },
  {
    id: 'backend-developer',
    label: 'Backend Developer',
    icon: <Cpu className="h-6 w-6" />,
    description: 'APIs, databases, and server architecture',
  },
];

const difficultyOptions = [
  { id: 'beginner', label: 'Junior', description: '0-2 years experience' },
  { id: 'intermediate', label: 'Mid-Level', description: '2-5 years experience' },
  { id: 'senior', label: 'Senior', description: '5+ years experience' },
] as const;

// Audio level visualizer component with wave effect
const AudioVisualizer: React.FC<{ level: number; isActive: boolean; isContinuous?: boolean }> = ({ 
  level, 
  isActive,
  isContinuous 
}) => {
  return (
    <div className="flex items-center gap-1 h-8">
      {[...Array(7)].map((_, i) => {
        const barHeight = isActive 
          ? Math.max(8, Math.min(32, 8 + (level - i * 12) * 0.9)) 
          : 8;
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-75 ${
              isActive && level > i * 12 
                ? isContinuous 
                  ? 'bg-gradient-to-t from-green-500 to-emerald-400' 
                  : 'bg-green-500' 
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            style={{ height: `${barHeight}px` }}
          />
        );
      })}
    </div>
  );
};

// Evaluation display component
const EvaluationDisplay: React.FC<{ evaluation: AnswerEvaluation }> = ({ evaluation }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", variant: "default" as const };
    if (score >= 80) return { label: "Very Good", variant: "default" as const };
    if (score >= 70) return { label: "Good", variant: "secondary" as const };
    if (score >= 60) return { label: "Fair", variant: "secondary" as const };
    return { label: "Needs Work", variant: "destructive" as const };
  };

  const scoreBadge = getScoreBadge(evaluation.overallScore);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-lg p-5 space-y-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Answer Quality</span>
          {evaluation.confidence && (
            <span className="text-xs text-muted-foreground">
              (AI confidence: {evaluation.confidence})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
            {evaluation.overallScore}
          </span>
          <span className="text-sm text-muted-foreground">/100</span>
          <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Clarity</span>
            <span className={`font-medium ${getScoreColor(evaluation.clarity)}`}>
              {evaluation.clarity}
            </span>
          </div>
          <Progress value={evaluation.clarity} className="h-2" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Technical</span>
            <span className={`font-medium ${getScoreColor(evaluation.technicalAccuracy)}`}>
              {evaluation.technicalAccuracy}
            </span>
          </div>
          <Progress value={evaluation.technicalAccuracy} className="h-2" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Complete</span>
            <span className={`font-medium ${getScoreColor(evaluation.completeness)}`}>
              {evaluation.completeness}
            </span>
          </div>
          <Progress value={evaluation.completeness} className="h-2" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Comm.</span>
            <span className={`font-medium ${getScoreColor(evaluation.communicationSkill)}`}>
              {evaluation.communicationSkill}
            </span>
          </div>
          <Progress value={evaluation.communicationSkill} className="h-2" />
        </div>
        {evaluation.depth !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Depth</span>
              <span className={`font-medium ${getScoreColor(evaluation.depth)}`}>
                {evaluation.depth}
              </span>
            </div>
            <Progress value={evaluation.depth} className="h-2" />
          </div>
        )}
      </div>
      
      {evaluation.strongPoints && evaluation.strongPoints.length > 0 && (
        <div className="text-xs space-y-1">
          <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Strong Points:
          </span>
          <ul className="ml-4 space-y-0.5 text-muted-foreground">
            {evaluation.strongPoints.map((point, i) => (
              <li key={i}>• {point}</li>
            ))}
          </ul>
        </div>
      )}
      
      {evaluation.weakPoints && evaluation.weakPoints.length > 0 && (
        <div className="text-xs space-y-1">
          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Areas to Improve:
          </span>
          <ul className="ml-4 space-y-0.5 text-muted-foreground">
            {evaluation.weakPoints.map((point, i) => (
              <li key={i}>• {point}</li>
            ))}
          </ul>
        </div>
      )}
      
      {evaluation.needsFollowUp && (
        <div className="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-2 text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span><strong>Follow-up needed:</strong> {evaluation.followUpReason || "Clarification required"}</span>
        </div>
      )}
      
      {evaluation.keyPointsCovered && evaluation.keyPointsCovered.length > 0 && (
        <div className="text-xs">
          <span className="text-blue-600 dark:text-blue-400 font-medium">Key points covered: </span>
          <span className="text-muted-foreground">{evaluation.keyPointsCovered.join(", ")}</span>
        </div>
      )}
    </div>
  );
};

const AIVoiceInterview: React.FC = () => {
  const navigate = useNavigate();
  const { 
    userName, 
    interviewMode,
    aiInterview,
    startAIInterview,
    submitAIAnswer,
    getAIFeedback,
    endAIInterview,
    questions,
    currentQuestionIndex,
  } = useInterview();

  // Setup phase state
  const [setupPhase, setSetupPhase] = useState<'role' | 'difficulty' | 'ready' | 'interview'>('role');
  const [selectedRole, setSelectedRole] = useState<AIInterviewRole | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'senior'>('intermediate');
  
  // Interview state
  const [currentResponse, setCurrentResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [continuousMode, setContinuousMode] = useState(true); // ChatGPT-style continuous
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    audioLevel: 0,
    error: null,
    mode: 'idle',
  });
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<AnswerEvaluation | null>(null);
  const [isVoiceReady, setIsVoiceReady] = useState(false);
  
  // Refs
  const voiceInitialized = useRef(false);
  const currentQuestionRef = useRef<string>("");
  const autoSubmitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle auto-submit from silence detection (defined first to be used in useEffect)
  const handleAutoSubmit = useCallback(async (transcript: string) => {
    if (!transcript.trim() || aiInterview.isProcessing) return;
    
    // Debounce auto-submit
    if (autoSubmitTimeoutRef.current) {
      clearTimeout(autoSubmitTimeoutRef.current);
    }
    
    autoSubmitTimeoutRef.current = setTimeout(async () => {
      if (transcript.trim().length > 20) {
        toast.info("Submitting your answer...");
        setCurrentResponse(transcript);
        // Use inline submit logic to avoid circular dep
        voiceService.pauseListening();
        try {
          const result = await submitAIAnswer(transcript.trim());
          setLastEvaluation(result.evaluation);
          setShowEvaluation(true);
          await new Promise(resolve => setTimeout(resolve, 2000));
          setShowEvaluation(false);
          if (result.nextQuestion) {
            setCurrentResponse("");
            voiceService.clearTranscript();
            if (result.isFollowUp) {
              toast.info("Follow-up question incoming...", { duration: 2000 });
            }
          } else {
            voiceService.stopContinuousMode();
            toast.success("Interview complete! Generating feedback...");
            await getAIFeedback();
            navigate("/interview-feedback");
          }
        } catch (error) {
          toast.error("Failed to submit answer");
          voiceService.resumeListening();
        }
      }
    }, 500);
  }, [aiInterview.isProcessing, submitAIAnswer, getAIFeedback, navigate]);

  // Initialize voice service
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const initVoice = async () => {
      if (!voiceInitialized.current) {
        console.log('🎙️ Initializing voice service...');
        const success = await voiceService.initialize({
          continuous: true,
          interimResults: true,
          language: 'en-US',
          silenceThreshold: 2500, // 2.5 seconds of silence = ready to submit
        });
        
        if (success) {
          voiceInitialized.current = true;
          setIsVoiceReady(true);
          console.log('✅ Voice service ready');
          
          // Subscribe to voice events
          unsubscribe = voiceService.on((event: VoiceEventType, data) => {
            if (event === 'stateChange') {
              const state = data as VoiceState;
              setVoiceState(state);
              setIsListening(state.isListening);
              setIsSpeaking(state.isSpeaking);
            } else if (event === 'transcription' || event === 'finalTranscription') {
              const result = data as TranscriptionResult;
              setCurrentResponse(result.transcript);
            } else if (event === 'silenceDetected') {
              // Auto-submit in continuous mode when silence detected
              const transcript = data as string;
              if (transcript.trim().length > 20) {
                console.log('🤫 Silence detected, auto-submitting...');
                handleAutoSubmit(transcript);
              }
            } else if (event === 'error') {
              const error = data as Error;
              const errorMessage = error.message || 'Voice error';
              
              // Handle network/connection errors specifically
              if (errorMessage.toLowerCase().includes('network') || 
                  errorMessage.toLowerCase().includes('internet') ||
                  errorMessage.toLowerCase().includes('connection')) {
                // Only show this error once, not on every retry
                if (errorMessage.includes('requires internet') || 
                    errorMessage.includes('unavailable') ||
                    errorMessage.includes('max retries')) {
                  toast.error('Speech recognition requires an internet connection. Please check your connection and try again.', {
                    duration: 5000,
                  });
                  // Disable continuous mode since we can't use voice
                  setContinuousMode(false);
                  setIsListening(false);
                }
                // Skip showing retry attempts
                return;
              }
              
              // Show other errors
              toast.error(errorMessage);
            }
          });
        } else {
          toast.error('Voice service not available in this browser');
        }
      }
    };
    
    initVoice();
    
    return () => {
      unsubscribe?.();
      // Don't cleanup voice service - it's a singleton
      // Just stop listening if active
      if (voiceState.isListening) {
        voiceService.stopListening();
      }
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
      }
    };
  }, [handleAutoSubmit]);

  // Start continuous listening mode (like ChatGPT) - defined early for speakQuestion
  const startContinuousListening = useCallback(async () => {
    if (!isVoiceReady) {
      toast.error("Voice service not ready yet");
      return;
    }
    
    try {
      console.log('🎙️ Starting continuous listening mode...');
      await voiceService.startContinuousMode();
      voiceService.clearTranscript();
      setCurrentResponse("");
      toast.success("Listening... Speak your answer", { duration: 2000 });
    } catch (error) {
      console.error('Failed to start continuous mode:', error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  }, [isVoiceReady]);

  // Stop continuous listening
  const stopContinuousListening = useCallback(() => {
    voiceService.stopContinuousMode();
    setIsListening(false);
  }, []);

  // Speak question when it changes (uses ElevenLabs-style natural speech)
  const speakQuestion = useCallback(async (question: string) => {
    setIsSpeaking(true);
    try {
      // Use speakNaturally for ElevenLabs-style speech
      await voiceService.speakNaturally(question, {
        onStart: () => console.log('🔊 AI speaking...'),
        onEnd: () => {
          console.log('🔊 AI finished speaking');
          setIsSpeaking(false);
          // Auto-start listening after AI finishes speaking (continuous mode)
          if (continuousMode && !aiInterview.isProcessing) {
            setTimeout(() => {
              if (!voiceState.isListening) {
                startContinuousListening();
              }
            }, 500);
          }
        },
      });
    } catch (error) {
      console.warn('Speech synthesis error:', error);
    }
    setIsSpeaking(false);
  }, [continuousMode, aiInterview.isProcessing, voiceState.isListening, startContinuousListening]);

  useEffect(() => {
    if (
      setupPhase === 'interview' &&
      aiInterview.currentQuestion &&
      audioEnabled &&
      aiInterview.currentQuestion.question !== currentQuestionRef.current
    ) {
      currentQuestionRef.current = aiInterview.currentQuestion.question;
      speakQuestion(aiInterview.currentQuestion.question);
    }
  }, [aiInterview.currentQuestion, setupPhase, audioEnabled, speakQuestion]);

  const startInterview = async () => {
    if (!selectedRole) return;
    
    try {
      console.log('🎬 Starting interview with role:', selectedRole, 'difficulty:', selectedDifficulty);
      await startAIInterview(selectedRole, selectedDifficulty);
      console.log('🎬 startAIInterview completed, aiInterview:', aiInterview);
      setSetupPhase('interview');
      toast.success("Interview started! Good luck!");
      
      // Enable continuous mode by default
      if (continuousMode) {
        setTimeout(() => startContinuousListening(), 1500);
      }
    } catch (error) {
      toast.error("Failed to start interview");
      console.error('🎬 Start interview error:', error);
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      if (continuousMode) {
        stopContinuousListening();
      } else {
        voiceService.stopListening();
        setIsListening(false);
      }
    } else {
      try {
        if (continuousMode) {
          await startContinuousListening();
        } else {
          await voiceService.startListening();
          setIsListening(true);
          voiceService.clearTranscript();
          setCurrentResponse("");
        }
      } catch (error) {
        console.error('Microphone error:', error);
        toast.error("Could not access microphone. Please check your browser permissions.");
      }
    }
  };

  // Internal submit handler for auto-submit
  const handleSubmitAnswerInternal = async (answer: string) => {
    console.log('🔄 handleSubmitAnswerInternal called with:', answer);
    console.log('🔄 aiInterview.isProcessing:', aiInterview.isProcessing);
    
    if (!answer.trim() || aiInterview.isProcessing) {
      console.log('❌ Blocked - empty answer or processing');
      return;
    }
    
    // Stop listening while processing
    if (continuousMode) {
      voiceService.pauseListening();
    } else {
      voiceService.stopListening();
      setIsListening(false);
    }
    
    try {
      console.log('🚀 Calling submitAIAnswer...');
      const result = await submitAIAnswer(answer.trim());
      console.log('✅ submitAIAnswer result:', result);
      
      setLastEvaluation(result.evaluation);
      setShowEvaluation(true);
      
      // Brief pause to show evaluation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowEvaluation(false);
      
      if (result.nextQuestion) {
        setCurrentResponse("");
        voiceService.clearTranscript();
        
        // Announce follow-up if applicable
        if (result.isFollowUp) {
          toast.info("Follow-up question incoming...", { duration: 2000 });
        }
      } else {
        // Interview complete
        if (continuousMode) {
          stopContinuousListening();
        }
        toast.success("Interview complete! Generating feedback...");
        await getAIFeedback();
        navigate("/interview-feedback");
      }
    } catch (error) {
      console.error('❌ handleSubmitAnswerInternal error:', error);
      toast.error(`Failed to submit answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Resume listening after error
      if (continuousMode) {
        voiceService.resumeListening();
      }
    }
  };

  const handleSubmitAnswer = async () => {
    console.log('📤 handleSubmitAnswer called');
    console.log('📤 currentResponse:', currentResponse);
    console.log('📤 aiInterview.isProcessing:', aiInterview.isProcessing);
    console.log('📤 aiInterview.currentQuestion:', aiInterview.currentQuestion);
    
    if (!currentResponse.trim()) {
      toast.error("Please provide an answer");
      console.log('❌ No response to submit');
      return;
    }
    
    console.log('✅ Submitting answer:', currentResponse.trim());
    await handleSubmitAnswerInternal(currentResponse.trim());
  };

  const handleEndInterview = async () => {
    if (continuousMode) {
      stopContinuousListening();
    }
    endAIInterview();
    await getAIFeedback();
    navigate("/interview-feedback");
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }
  };

  // Render setup phase
  if (setupPhase !== 'interview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <BackButton to="/interview-home" label="Back to Interview Home" />
          
          <div className="text-center mb-8 mt-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              AI Voice Interview
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Practice with our AI interviewer that adapts to your responses, asks follow-up questions, and provides real-time feedback.
            </p>
          </div>
          
          {/* Role Selection */}
          {setupPhase === 'role' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Select Interview Type</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roleOptions.map((role) => (
                  <Card
                    key={role.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedRole === role.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          selectedRole === role.id 
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {role.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{role.label}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center">
                <Button 
                  size="lg"
                  disabled={!selectedRole}
                  onClick={() => setSetupPhase('difficulty')}
                  className="gap-2"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Difficulty Selection */}
          {setupPhase === 'difficulty' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Select Difficulty Level</h2>
              
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {difficultyOptions.map((diff) => (
                  <Card
                    key={diff.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedDifficulty === diff.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => setSelectedDifficulty(diff.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-lg mb-1">{diff.label}</h3>
                      <p className="text-sm text-muted-foreground">{diff.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setSetupPhase('role')}
                >
                  Back
                </Button>
                <Button 
                  size="lg"
                  onClick={() => setSetupPhase('ready')}
                  className="gap-2"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Ready to Start */}
          {setupPhase === 'ready' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Ready to Begin!</h2>
                    <p className="text-muted-foreground">
                      You've selected a <span className="font-semibold text-foreground">{selectedDifficulty}</span> level{' '}
                      <span className="font-semibold text-foreground">
                        {roleOptions.find(r => r.id === selectedRole)?.label}
                      </span>{' '}
                      interview.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-left space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> What to expect:
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 8 AI-generated questions tailored to your role</li>
                      <li>• Follow-up questions if your answer needs clarification</li>
                      <li>• Real-time feedback on each answer</li>
                      <li>• Scenario-based and technical questions</li>
                      <li>• Final comprehensive feedback at the end</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button 
                      variant="outline"
                      onClick={() => setSetupPhase('difficulty')}
                    >
                      Back
                    </Button>
                    <Button 
                      size="lg"
                      onClick={startInterview}
                      disabled={aiInterview.isProcessing}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {aiInterview.isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          Start Interview
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render interview phase
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Debug Panel - Remove in production */}
        {import.meta.env.DEV && (
          <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs font-mono">
            <p>🐛 DEBUG:</p>
            <p>currentQuestion: {aiInterview.currentQuestion ? 'EXISTS' : 'NULL'}</p>
            <p>isProcessing: {String(aiInterview.isProcessing)}</p>
            <p>currentResponse length: {currentResponse.length}</p>
            <p>isListening: {String(isListening)}</p>
            <p>continuousMode: {String(continuousMode)}</p>
          </div>
        )}
        
        <div className="mb-4">
          <BackButton to="/interview-home" label="Back to Interview Home" />
        </div>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Voice Interview
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {roleOptions.find(r => r.id === selectedRole)?.label}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {selectedDifficulty}
              </Badge>
              {aiInterview.followUpCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Follow-up #{aiInterview.followUpCount}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleAudio}
              title={audioEnabled ? "Mute" : "Unmute"}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleEndInterview}
            >
              End Interview
            </Button>
          </div>
        </div>
        
        {/* AI Interviewer Question */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500">
                <AvatarFallback className="bg-transparent text-white">
                  <Brain className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold">AI Interviewer</p>
                  {isSpeaking && (
                    <span className="text-sm text-blue-600 dark:text-blue-400 animate-pulse flex items-center gap-1">
                      <Volume2 className="h-3 w-3" /> Speaking...
                    </span>
                  )}
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  {aiInterview.isProcessing ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200">
                      {aiInterview.currentQuestion?.question || "Loading question..."}
                    </p>
                  )}
                </div>
                
                {aiInterview.currentQuestion && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {aiInterview.currentQuestion.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {aiInterview.currentQuestion.difficulty}
                    </Badge>
                    <button 
                      className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                      onClick={() => speakQuestion(aiInterview.currentQuestion!.question)}
                    >
                      <Volume2 className="h-3 w-3" />
                      Repeat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Last Evaluation (if showing) */}
        {showEvaluation && lastEvaluation && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <EvaluationDisplay evaluation={lastEvaluation} />
          </div>
        )}
        
        {/* Candidate Response */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{userName.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="font-semibold mb-2">{userName || 'You'}</p>
                
                {/* Response Area */}
                <div className="space-y-4">
                  {/* Always show text area for manual input */}
                  <Textarea
                    value={currentResponse}
                    onChange={(e) => setCurrentResponse(e.target.value)}
                    placeholder={interviewMode === 'text' 
                      ? "Type your response here..." 
                      : isListening 
                        ? "Listening... or type manually"
                        : "Click 'Start Recording' to speak, or type your answer here"
                    }
                    className="min-h-32"
                    disabled={aiInterview.isProcessing}
                  />
                  
                  {/* Voice controls (only in voice mode) */}
                  {interviewMode !== 'text' && (
                    <>
                      {continuousMode && isListening && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                          <Radio className="h-4 w-4 animate-pulse" />
                          <span>Continuous Mode Active - stops after 2.5s of silence</span>
                        </div>
                      )}
                      
                      {/* Voice Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant={isListening ? "destructive" : "default"}
                            onClick={toggleListening}
                            className={`gap-2 ${!isListening && 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'}`}
                            disabled={aiInterview.isProcessing || !isVoiceReady}
                          >
                            {isListening ? (
                              <>
                                <MicOff className="h-4 w-4" />
                                Stop Recording
                              </>
                            ) : (
                              <>
                                <Mic className="h-4 w-4" />
                                {continuousMode ? 'Start Conversation' : 'Start Recording'}
                              </>
                            )}
                          </Button>
                          
                          <AudioVisualizer 
                            level={voiceState.audioLevel} 
                            isActive={isListening} 
                            isContinuous={continuousMode}
                          />
                          
                          {isListening && (
                            <span className="text-sm text-emerald-600 dark:text-emerald-400 animate-pulse flex items-center gap-1">
                              <Radio className="h-3 w-3" />
                              {continuousMode ? 'Conversation active...' : 'Listening...'}
                            </span>
                          )}
                        </div>
                        
                        {/* Continuous mode toggle */}
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={continuousMode}
                              onChange={(e) => {
                                setContinuousMode(e.target.checked);
                                if (!e.target.checked && isListening) {
                                  voiceService.stopContinuousMode();
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-muted-foreground">Auto-listen (ChatGPT style)</span>
                          </label>
                        </div>
                      </div>
                      
                      {!isVoiceReady && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Initializing voice service...
                        </p>
                      )}
                    </>
                  )}
                  
                  {/* Submit Button */}
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {continuousMode && isListening 
                        ? "Answer will auto-submit after 2.5s of silence"
                        : "Or click submit when ready"
                      }
                    </p>
                    <Button 
                      onClick={handleSubmitAnswer}
                      disabled={!currentResponse.trim() || aiInterview.isProcessing}
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {aiInterview.isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Answer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Progress */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <Progress 
            value={((currentQuestionIndex + 1) / questions.length) * 100} 
            className="h-2 max-w-md mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default AIVoiceInterview;