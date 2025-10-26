import React from 'react';
import { useRoadmap } from '@/contexts/RoadmapContext';

export default function Step3Preferences() {
  const { responses, setResponse } = useRoadmap();

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', desc: 'New to the field' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
    { value: 'advanced', label: 'Advanced', desc: 'Experienced' },
  ];

  const learningStyles = [
    { value: 'video', label: '🎥 Video Courses', desc: 'Visual learning' },
    { value: 'reading', label: '📚 Books & Docs', desc: 'Text-based' },
    { value: 'hands-on', label: '🛠️ Projects First', desc: 'Learning by doing' },
    { value: 'balanced', label: '⚖️ Balanced Mix', desc: 'All of the above' },
  ];

  const timeCommitments = [
    { value: '1-2', label: '1-2 hours/day' },
    { value: '2-3', label: '2-3 hours/day' },
    { value: '3-5', label: '3-5 hours/day' },
    { value: '5+', label: '5+ hours/day' },
  ];

  return (
    <div className="space-y-6">
      {/* Experience Level */}
      <div>
        <label className="block text-white font-semibold mb-3">
          What's your current experience level?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {experienceLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setResponse('experience_level', level.value)}
              className={`p-3 rounded-xl font-medium transition-all text-center ${
                responses.experience_level === level.value
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
              }`}
            >
              <div className="font-semibold text-sm">{level.label}</div>
              <div className="text-xs mt-1 opacity-80">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Learning Style */}
      <div>
        <label className="block text-white font-semibold mb-3">
          Preferred learning style?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {learningStyles.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setResponse('learning_style', style.value)}
              className={`p-3 rounded-xl font-medium transition-all ${
                responses.learning_style === style.value
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
              }`}
            >
              <div className="text-sm">{style.label}</div>
              <div className="text-xs mt-1 opacity-80">{style.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Commitment */}
      <div>
        <label className="block text-white font-semibold mb-3">
          Daily time commitment?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {timeCommitments.map((time) => (
            <button
              key={time.value}
              type="button"
              onClick={() => setResponse('time_per_day', time.value)}
              className={`p-3 rounded-xl font-medium transition-all ${
                responses.time_per_day === time.value
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}