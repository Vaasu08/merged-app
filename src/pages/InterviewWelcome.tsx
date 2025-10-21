import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInterview } from "@/contexts/InterviewContext";

const InterviewWelcome = () => {
  const { userName, setJobField, setInterviewMode } = useInterview();
  const navigate = useNavigate();

  const jobFields = [
    { id: "software-engineering", label: "Software Engineering", icon: "💻" },
    { id: "data-science", label: "Data Science", icon: "📊" },
    { id: "marketing", label: "Marketing", icon: "📈" },
    { id: "sales", label: "Sales", icon: "💼" },
    { id: "design", label: "Design", icon: "🎨" },
    { id: "product-management", label: "Product Management", icon: "🚀" },
  ];

  const interviewModes = [
    { id: "text", label: "Text Interview", description: "Type your responses", icon: "💬" },
    { id: "audio", label: "Audio Interview", description: "Speak your responses", icon: "🎙️" },
    { id: "video", label: "Video Interview", description: "Full video simulation", icon: "📹" },
  ];

  const handleJobFieldSelect = (fieldId: string) => {
    setJobField(fieldId);
  };

  const handleModeSelect = (mode: "text" | "audio" | "video") => {
    setInterviewMode(mode);
    navigate("/interview-prep");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome, {userName}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Let's set up your personalized interview experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Choose Your Field
              </CardTitle>
              <CardDescription>
                Select the job field you're interviewing for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobFields.map((field) => (
                <Button
                  key={field.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleJobFieldSelect(field.id)}
                >
                  <span className="text-2xl mr-3">{field.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{field.label}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                Choose Interview Mode
              </CardTitle>
              <CardDescription>
                How would you like to practice?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {interviewModes.map((mode) => (
                <Button
                  key={mode.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleModeSelect(mode.id as "text" | "audio" | "video")}
                >
                  <span className="text-2xl mr-3">{mode.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-sm text-gray-500">{mode.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-gray-500"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewWelcome;


