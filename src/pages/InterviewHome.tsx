import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { useInterview } from "@/contexts/InterviewContext";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles } from "lucide-react";

const InterviewHome = () => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const { setUserName, setInterviewMode } = useInterview();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    
    setUserName(name);
    navigate("/interview-welcome");
  };

  const handleStartAI = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    
    setUserName(name);
    setInterviewMode("audio");
    navigate("/interview-session?ai=true");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 flex flex-col justify-center items-center p-4">
      <div className="absolute top-4 left-4">
        <BackButton to="/" />
      </div>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Interview Simulator
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Practice job interviews with our advanced AI. Get real-time feedback on your answers, 
            communication skills, and body language.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md mx-auto mt-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Ready to ace your interview?</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                What's your name?
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(false);
                }}
                className={`w-full ${nameError ? 'border-red-500' : ''}`}
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-1 text-left">Please enter your name</p>
              )}
            </div>
            
            <Button 
              onClick={handleStart}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
            
            {/* AI Interview Button */}
            <div className="relative mt-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg blur opacity-25 animate-pulse"></div>
              <Button 
                onClick={handleStartAI}
                className="relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white gap-2"
              >
                <Brain className="h-4 w-4" />
                Try AI Voice Interview
                <Badge variant="secondary" className="ml-1 bg-white/20 text-white text-xs">
                  NEW
                </Badge>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Dynamic questions • Follow-ups • Real-time feedback
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Text Interview</h3>
            <p className="text-gray-600 dark:text-gray-300">Practice with text-based interviews. Type your answers and get instant feedback.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">🎙️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Audio Interview</h3>
            <p className="text-gray-600 dark:text-gray-300">Practice speaking your answers with voice recognition technology.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">📹</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Video Interview</h3>
            <p className="text-gray-600 dark:text-gray-300">Full simulation with video recording and body language analysis.</p>
          </div>
        </div>
        
        {/* AI Interview Features Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-900/10 via-pink-900/10 to-blue-900/10 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              AI Voice Interview Features
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Role-Specific</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">FSD, ML Engineer, DSA & more</p>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Follow-ups</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">AI asks clarifying questions</p>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🎤</div>
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Voice-First</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Speak naturally, get transcribed</p>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Real-time Eval</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Instant answer feedback</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewHome;


