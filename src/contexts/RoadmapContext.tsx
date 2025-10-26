import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RoadmapRequest, Roadmap } from '@/types/roadmap';

interface RoadmapContextType {
  responses: RoadmapRequest;
  setResponse: (field: keyof RoadmapRequest, value: any) => void;
  roadmap: Roadmap | null;
  setRoadmap: (roadmap: Roadmap | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

const initialResponses: RoadmapRequest = {
  fields: [],
  project: '',
  days: 60,
  checkpoints: true,
  experience_level: 'intermediate',
  learning_style: 'balanced',
  time_per_day: '2-3',
  goals: '',
};

export const RoadmapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [responses, setResponses] = useState<RoadmapRequest>(initialResponses);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setLoading] = useState(false);

  const totalSteps = 4;

  const setResponse = (field: keyof RoadmapRequest, value: any) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const reset = () => {
    setResponses(initialResponses);
    setRoadmap(null);
    setCurrentStep(1);
  };

  return (
    <RoadmapContext.Provider
      value={{
        responses,
        setResponse,
        roadmap,
        setRoadmap,
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
        isLoading,
        setLoading,
        reset,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within RoadmapProvider');
  }
  return context;
};
