import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInterview } from "@/contexts/InterviewContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Video, VideoOff, Send, Volume, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";

// Define TypeScript interfaces for speech recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

// Augment the window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechSynthesisUtterance: new (text: string) => SpeechSynthesisUtterance;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  }
}

const InterviewSession = () => {
  const { 
    userName, 
    jobField, 
    interviewMode, 
    questions, 
    currentQuestionIndex, 
    setCurrentQuestionIndex,
    addAnswer,
    setAnswers,
    generateFeedback
  } = useInterview();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const [currentResponse, setCurrentResponse] = useState("");
  const [responses, setResponses] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Set up camera for video mode
  useEffect(() => {
    const setupCamera = async () => {
      if (interviewMode === "video" && videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        } catch (error) {
          console.error("Error accessing camera:", error);
          toast.error("Unable to access camera. Please check permissions.");
        }
      }
    };

    // Auto start the interview with a delay
    const timer = setTimeout(() => {
      if (currentQuestionIndex === 0) {
        speakQuestion(questions[0]);
      }
    }, 1000);
    
    if (interviewMode === "video") {
      setupCamera();
    }
    
    return () => {
      clearTimeout(timer);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Clean up camera
      if (cameraActive && videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [interviewMode, questions, currentQuestionIndex, setAnswers]);

  // Initialize speech recognition for audio and video modes
  useEffect(() => {
    if (interviewMode === "audio" || interviewMode === "video") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const last = event.results.length - 1;
          const transcript = event.results[last][0].transcript;
          
          setCurrentResponse(prev => {
            // If it's a final result, append it to the current response
            if (event.results[last].isFinal) {
              return prev + " " + transcript;
            }
            // Otherwise, just update the current response
            return transcript;
          });
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        toast.error("Speech recognition is not supported in your browser.");
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [interviewMode]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleResponseSubmit = () => {
    if (currentResponse.trim() === "") {
      toast.error("Please provide a response before continuing.");
      return;
    }
    
    // Save the current response both locally and in the context
    const updatedResponses = [...responses];
    updatedResponses[currentQuestionIndex] = currentResponse.trim();
    setResponses(updatedResponses);
    
    // Add answer to the global context
    addAnswer(currentResponse.trim());
    
    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    // Move to the next question or end interview
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentResponse("");
      
      // Speak the next question after a short delay
      setTimeout(() => {
        speakQuestion(questions[currentQuestionIndex + 1]);
      }, 500);
    } else {
      setInterviewComplete(true);
      
      // Generate feedback based on all answers
      setTimeout(() => {
        generateFeedback();
        navigate("/interview-feedback");
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleResponseSubmit();
    }
  };

  const endInterview = () => {
    // Generate feedback before navigating
    generateFeedback();
    navigate("/interview-feedback");
  };

  const speakQuestion = (question: string) => {
    toast.info(question, {
      id: "current-question",
      duration: 5000,
    });
    
    if ((interviewMode === "audio" || interviewMode === "video") && audioEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      const utterance = new window.SpeechSynthesisUtterance(question);
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = voices.filter(voice => 
        voice.lang.includes('en-') && !voice.name.includes('Google')
      );
      
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        console.error("Speech synthesis error");
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    
    if (audioEnabled && isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <BackButton to="/interview-home" label="Back to Interview Home" />
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {interviewMode === "text" ? "Text" : 
             interviewMode === "audio" ? "Audio" : 
             "Video"} Interview
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* Audio toggle button */}
            {(interviewMode === "audio" || interviewMode === "video") && (
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleAudio}
                  title={audioEnabled ? "Mute interviewer" : "Unmute interviewer"}
                >
                  {audioEnabled ? <Volume2 /> : <VolumeX />}
                </Button>
                {isSpeaking && (
                  <span className="ml-2 text-sm text-blue-600 dark:text-blue-400 animate-pulse">
                    Speaking...
                  </span>
                )}
              </div>
            )}
            
            <Button 
              variant="destructive" 
              onClick={endInterview}
            >
              End Interview
            </Button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 mb-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg" alt="Interviewer" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="font-semibold text-gray-700 dark:text-gray-300">AI Interviewer</p>
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-800 dark:text-gray-200">{questions[currentQuestionIndex]}</p>
              </div>
              
              {(interviewMode === "audio" || interviewMode === "video") && (
                <button 
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 flex items-center"
                  onClick={() => speakQuestion(questions[currentQuestionIndex])}
                >
                  <Volume className="h-4 w-4 mr-1" />
                  Repeat question
                </button>
              )}
            </div>
          </div>
        </div>
        
        {interviewMode === "video" && (
          <div className="mb-6">
            <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video">
              <video 
                ref={videoRef}
                autoPlay 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white">Camera access required for video interview</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="font-semibold text-gray-700 dark:text-gray-300">{userName}</p>
              
              {interviewMode === "text" ? (
                <div className="mt-2">
                  <Textarea
                    value={currentResponse}
                    onChange={(e) => setCurrentResponse(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your response here..."
                    className="min-h-32"
                  />
                </div>
              ) : (
                <div className="mt-2">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-32">
                    <p className="text-gray-800 dark:text-gray-200">{currentResponse || "Your response will appear here as you speak..."}</p>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <Button
                      variant={isListening ? "destructive" : "default"}
                      className="flex items-center"
                      onClick={toggleListening}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="mr-2 h-5 w-5" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-5 w-5" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    
                    {isListening && (
                      <span className="text-blue-600 dark:text-blue-400 animate-pulse">
                        Listening...
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Button onClick={handleResponseSubmit} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="mr-2 h-4 w-4" />
                  {currentQuestionIndex < questions.length - 1 ? "Submit & Next Question" : "Complete Interview"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;


