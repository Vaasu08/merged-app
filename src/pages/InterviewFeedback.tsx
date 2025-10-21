import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useInterview } from "@/contexts/InterviewContext";

const InterviewFeedback = () => {
  const { userName, feedback, resetInterview } = useInterview();
  const navigate = useNavigate();

  const handleStartNewInterview = () => {
    resetInterview();
    navigate("/interview-home");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Satisfactory";
    if (score >= 60) return "Needs Improvement";
    return "Poor";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Interview Feedback
          </h1>
          <p className="text-lg text-gray-600">
            Great job, {userName}! Here's your detailed performance analysis
          </p>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Performance</span>
              <Badge 
                variant={feedback.passed ? "default" : "destructive"}
                className="text-lg px-4 py-2"
              >
                {feedback.passed ? "PASSED" : "NEEDS IMPROVEMENT"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${getScoreColor(feedback.overallScore)}`}>
                {feedback.overallScore}
              </div>
              <div className={`text-xl font-semibold mb-2 ${getScoreColor(feedback.overallScore)}`}>
                {getScoreLabel(feedback.overallScore)}
              </div>
              <Progress value={feedback.overallScore} className="w-full max-w-md mx-auto" />
            </div>
          </CardContent>
        </Card>

        {/* Detailed Criteria Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Assessment</CardTitle>
            <CardDescription>Breakdown of your performance across key areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Technical Knowledge</span>
                    <span className={`font-bold ${getScoreColor(feedback.criteria.technicalKnowledge)}`}>
                      {feedback.criteria.technicalKnowledge}
                    </span>
                  </div>
                  <Progress value={feedback.criteria.technicalKnowledge} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Communication</span>
                    <span className={`font-bold ${getScoreColor(feedback.criteria.communication)}`}>
                      {feedback.criteria.communication}
                    </span>
                  </div>
                  <Progress value={feedback.criteria.communication} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Problem Solving</span>
                    <span className={`font-bold ${getScoreColor(feedback.criteria.problemSolving)}`}>
                      {feedback.criteria.problemSolving}
                    </span>
                  </div>
                  <Progress value={feedback.criteria.problemSolving} />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Cultural Fit</span>
                    <span className={`font-bold ${getScoreColor(feedback.criteria.culturalFit)}`}>
                      {feedback.criteria.culturalFit}
                    </span>
                  </div>
                  <Progress value={feedback.criteria.culturalFit} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Experience</span>
                    <span className={`font-bold ${getScoreColor(feedback.criteria.experience)}`}>
                      {feedback.criteria.experience}
                    </span>
                  </div>
                  <Progress value={feedback.criteria.experience} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strengths and Improvements */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Strengths</CardTitle>
              <CardDescription>What you did well</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
              <CardDescription>Where you can grow</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-orange-600 text-xl">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Review */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Review</CardTitle>
            <CardDescription>Comprehensive analysis of your interview performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {feedback.detailedReview}
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartNewInterview}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
            >
              Start New Interview
            </Button>
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="px-8 py-3"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewFeedback;


