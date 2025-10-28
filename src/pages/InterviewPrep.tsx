import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInterview } from "@/contexts/InterviewContext";

const InterviewPrep = () => {
  const { userName, jobField, interviewMode, questions } = useInterview();
  const navigate = useNavigate();

  const getJobFieldLabel = (fieldId: string) => {
    const fields: { [key: string]: string } = {
      "software-engineering": "Software Engineering",
      "data-science": "Data Science",
      "marketing": "Marketing",
      "sales": "Sales",
      "design": "Design",
      "product-management": "Product Management",
    };
    return fields[fieldId] || fieldId;
  };

  const getModeLabel = (mode: string) => {
    const modes: { [key: string]: string } = {
      "text": "Text Interview",
      "audio": "Audio Interview",
      "video": "Video Interview",
    };
    return modes[mode] || mode;
  };

  const getModeIcon = (mode: string) => {
    const icons: { [key: string]: string } = {
      "text": "💬",
      "audio": "🎙️",
      "video": "📹",
    };
    return icons[mode] || "💬";
  };

  const handleStartInterview = () => {
    navigate("/interview-session");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Interview Preparation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Review your settings and get ready for your interview
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
              <CardDescription>Your interview configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Name:</span>
                <span>{userName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Field:</span>
                <Badge variant="secondary">{getJobFieldLabel(jobField || "")}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Mode:</span>
                <div className="flex items-center gap-2">
                  <span>{getModeIcon(interviewMode || "")}</span>
                  <span>{getModeLabel(interviewMode || "")}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Questions:</span>
                <span>{questions.length} questions</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for Success</CardTitle>
              <CardDescription>Make the most of your interview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400">💡</span>
                <p className="text-sm">Take your time to think before answering</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400">📝</span>
                <p className="text-sm">Use specific examples from your experience</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400">🎯</span>
                <p className="text-sm">Be clear and concise in your responses</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400">🤝</span>
                <p className="text-sm">Show enthusiasm and engagement</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button
            onClick={handleStartInterview}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
          >
            Start Interview
          </Button>
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/interview-welcome")}
              className="text-gray-500 dark:text-gray-400"
            >
              ← Back to Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;


