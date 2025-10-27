import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface QuizInterfaceProps {
  quiz: Quiz;
  onComplete: (score: number, totalQuestions: number, timeSpent: number) => void;
  onClose: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quiz, onComplete, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const { toast } = useToast();

  const currentQuestion = quiz.questions[currentQuestionIndex];

  useEffect(() => {
    if (timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isCompleted) {
      handleSubmit();
    }
  }, [timeRemaining, isCompleted]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsCompleted(true);
    
    let correctAnswers = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    setScore(finalScore);
    setStreak(maxStreak);
    setShowResults(true);

    toast({
      title: "Quiz Completed!",
      description: `You scored ${finalScore}% with a streak of ${maxStreak}`,
    });

    onComplete(finalScore, quiz.questions.length, timeSpent);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
            <p className="text-white/80">{quiz.title}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-white font-semibold">Score</span>
                </div>
                <div className="text-2xl font-bold text-white">{score}%</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Flame className="w-5 h-5 text-red-400 mr-2" />
                  <span className="text-white font-semibold">Streak</span>
                </div>
                <div className="text-2xl font-bold text-white">{streak}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-white font-semibold">Time</span>
                </div>
                <div className="text-2xl font-bold text-white">{formatTime(Math.round((Date.now() - startTime) / 1000))}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Question Review</h3>
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <Card key={question.id} className={`bg-slate-800/50 border-slate-700 ${isCorrect ? 'border-green-500/50' : 'border-red-500/50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mr-2" />
                        )}
                        <span className="text-white font-medium">Question {index + 1}</span>
                      </div>
                      <Badge className={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-white/90 mb-3">{question.question}</p>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded-lg text-sm ${
                            optionIndex === question.correctAnswer
                              ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                              : optionIndex === userAnswer && !isCorrect
                              ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                              : 'bg-slate-700/50 text-white/70'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                    
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-300 text-sm">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{quiz.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-400" />
                <span className="text-white">Score: {score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400" />
                <span className="text-white">Streak: {streak}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
          <Badge className={`${getDifficultyColor(quiz.difficulty)} text-white`}>
            {quiz.difficulty}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Question {currentQuestionIndex + 1}: {currentQuestion.question}
            </h2>
            
            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ''}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer text-white"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-800"
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : answers[quiz.questions[index].id] !== undefined
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-700 text-white/70 hover:bg-slate-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={currentQuestionIndex === quiz.questions.length - 1 ? handleSubmit : handleNext}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit Test' : 'Next'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizInterface;
