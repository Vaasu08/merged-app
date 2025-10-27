import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface CareerAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (answers: Record<number, string>) => void;
}

// Sample MCQ questions - you can replace these later
const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "What kind of work environment do you want the most?",
    options: [
      "One that offers a lot of money",
      "One with less pressure and a relaxed pace",
      "One that lets me help and connect with people",
      "One that gives stability and long-term security"
    ]
  },
  {
    id: 2,
    question: "Which statement fits you best?",
    options: [
      "I'm detail-oriented and like things perfect",
      "I'm quick-thinking and flexible",
      "I'm creative and imaginative",
      "I'm empathetic and understand people"
    ]
  },
  {
    id: 3,
    question: "In what kind of team do you feel you do your best work?",
    options: [
      "A small close-knit team where everyone collaborates",
      "A large team with defined roles and hierarchy",
      "Mostly alone, independently",
      "Mixed: both independent and team work"
    ]
  },
  {
    id: 4,
    question: "When preparing for school exams, what was your usual study approach?",
    options: [
      "I made a detailed plan or timetable and stuck to it",
      "I mostly understood concepts deeply, not just memorized",
      "I study at the last moment and still managed to do fine",
      "I focused only on important topics that would likely come in exam"
    ]
  },
  {
    id: 5,
    question: "What type of problems do you enjoy solving the most?",
    options: [
      "Logical or technical puzzles",
      "Visual or design-based problems",
      "Emotional or interpersonal conflicts",
      "Business or money-related challenges"
    ]
  },
  {
    id: 6,
    question: "When faced with a new project, what's your first instinct?",
    options: [
      "Research and make a step-by-step plan",
      "Jump right in and figure things out as I go",
      "Brainstorm creative ideas before starting",
      "Focus on the main goal and delegate tasks"
    ]
  },
  {
    id: 7,
    question: "What kind of success makes you feel proud?",
    options: [
      "Solving a complex problem others couldn't",
      "Making something beautiful or unique",
      "Leading a team or achieving a big goal",
      "Earning recognition, money, or awards"
    ]
  },
  {
    id: 8,
    question: "How do you handle deadlines?",
    options: [
      "Always finish early and review twice",
      "Work steadily and complete just in time",
      "Need pressure to perform my best",
      "Usually struggle unless it's something I love"
    ]
  },
  {
    id: 9,
    question: "Which school subject did you genuinely enjoy?",
    options: [
      "Math or Science",
      "Social Studies or Psychology",
      "Languages or Communication",
      "Business or Economics"
    ]
  },
  {
    id: 10,
    question: "How do you prefer to learn something new?",
    options: [
      "Watching tutorials or videos",
      "Reading books or articles",
      "Trying it out hands-on",
      "Observing and analyzing real examples"
    ]
  }
];

export const CareerAssessmentModal: React.FC<CareerAssessmentModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>("");

  console.log('CareerAssessmentModal render - isOpen:', isOpen);

  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;
  const isLastQuestion = currentQuestion === sampleQuestions.length - 1;
  const isFirstQuestion = currentQuestion === 0;

  const handleNext = () => {
    if (selectedOption) {
      const newAnswers = { ...answers, [sampleQuestions[currentQuestion].id]: selectedOption };
      setAnswers(newAnswers);
      
      if (isLastQuestion) {
        // Assessment complete
        onComplete?.(newAnswers);
        handleClose();
      } else {
        setCurrentQuestion(prev => prev + 1);
        // Load saved answer for next question if exists
        const nextQuestionId = sampleQuestions[currentQuestion + 1].id;
        setSelectedOption(newAnswers[nextQuestionId] || "");
      }
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestion(prev => prev - 1);
      // Load saved answer for previous question
      const prevQuestionId = sampleQuestions[currentQuestion - 1].id;
      setSelectedOption(answers[prevQuestionId] || "");
    }
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedOption("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-2xl mx-4"
        >
          <Card className="border-2 shadow-2xl">
            <CardHeader className="space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Career Assessment
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Question {currentQuestion + 1} of {sampleQuestions.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Question */}
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-foreground leading-relaxed">
                  {sampleQuestions[currentQuestion].question}
                </h3>

                {/* Options */}
                <RadioGroup
                  value={selectedOption}
                  onValueChange={setSelectedOption}
                  className="space-y-3"
                >
                  {sampleQuestions[currentQuestion].options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Label
                        htmlFor={`option-${index}`}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                          selectedOption === option
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem
                          value={option}
                          id={`option-${index}`}
                          className="mt-0"
                        />
                        <span className="flex-1 text-sm font-medium leading-relaxed">
                          {option}
                        </span>
                        {selectedOption === option && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstQuestion}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!selectedOption}
                  className="gap-2"
                >
                  {isLastQuestion ? 'Complete' : 'Next'}
                  {!isLastQuestion && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
              {/* Helper Text */}
              <p className="text-xs text-center text-muted-foreground">
                Select your answer and click Next to continue
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
