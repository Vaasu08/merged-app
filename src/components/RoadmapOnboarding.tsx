import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useAuth } from '@/components/AuthProvider';
import Step1Fields from './roadmap/Step1Fields';
import Step2Details from './roadmap/Step2Details';
import Step3Preferences from './roadmap/Step3Preferences';
import Step4Goals from './roadmap/Step4Goals';
import { roadmapService } from '@/lib/roadmapService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function RoadmapOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    responses,
    currentStep,
    nextStep,
    prevStep,
    isLoading,
    setLoading,
    setRoadmap,
  } = useRoadmap();

  const totalSteps = 4;

  const handleNext = () => {
    // Validation
    if (currentStep === 1 && responses.fields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }

    if (currentStep === 2 && !responses.project.trim()) {
      toast.error('Please describe your project experience');
      return;
    }

    nextStep();
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to generate roadmap');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const roadmap = await roadmapService.generateRoadmap(responses, user.id);
      setRoadmap(roadmap);
      toast.success('Your personalized roadmap is ready!');
      navigate('/roadmap/view');
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast.error('Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Fields />;
      case 2:
        return <Step2Details />;
      case 3:
        return <Step3Preferences />;
      case 4:
        return <Step4Goals />;
      default:
        return <Step1Fields />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">Creating your personalized roadmap...</p>
          <p className="text-gray-300 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-300">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-300">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Create Your Personalised Roadmap
            </h1>
            <p className="text-gray-400">
              Here are some quick questions to get you started.
            </p>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="flex-1 py-3 px-6 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                Let's Get Into It
              </button>
            )}
          </div>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Also check out our{' '}
              <button
                onClick={() => navigate('/interview')}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                interview simulator
              </button>
              {' '}to get realtime updates about your prep.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}