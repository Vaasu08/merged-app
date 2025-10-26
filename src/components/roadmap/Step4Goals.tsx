import React from 'react';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { Badge } from '@/components/ui/badge';

export default function Step4Goals() {
  const { responses, setResponse } = useRoadmap();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white font-semibold mb-3 text-lg">
          What are your specific goals?
        </label>
        <p className="text-gray-400 text-sm mb-4">
          Tell us what you want to achieve. Be as specific as possible!
        </p>
        <textarea
          value={responses.goals}
          onChange={(e) => setResponse('goals', e.target.value)}
          className="w-full px-4 py-3 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all"
          rows={6}
          placeholder="E.g., I want to build a full-stack e-commerce website, get a job as a data scientist, contribute to open source ML projects..."
        />
      </div>

      {/* Summary Preview */}
      <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <span className="mr-2">📋</span>
          Your Roadmap Summary
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start">
            <span className="text-gray-400 w-32 flex-shrink-0">Fields:</span>
            <div className="flex flex-wrap gap-2">
              {responses.fields.length > 0 ? (
                responses.fields.map((field) => (
                  <Badge key={field} variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                    {field}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500 italic">None selected</span>
              )}
            </div>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-32">Duration:</span>
            <span className="text-purple-300 font-medium">{responses.days} days</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-32">Experience:</span>
            <span className="text-purple-300 font-medium capitalize">{responses.experience_level}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-32">Learning Style:</span>
            <span className="text-purple-300 font-medium capitalize">{responses.learning_style}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-32">Daily Time:</span>
            <span className="text-purple-300 font-medium">{responses.time_per_day} hours</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-32">Checkpoints:</span>
            <span className="text-purple-300 font-medium">{responses.checkpoints ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}