import React from 'react';
import { useRoadmap } from '@/contexts/RoadmapContext';

export default function Step2Details() {
  const { responses, setResponse } = useRoadmap();

  return (
    <div className="space-y-6">
      {/* Project Description */}
      <div>
        <label className="block text-white font-semibold mb-3">
          Project you did closest to this field
        </label>
        <textarea
          value={responses.project}
          onChange={(e) => setResponse('project', e.target.value)}
          className="w-full px-4 py-3 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all"
          rows={4}
          placeholder="Describe your most relevant project or experience..."
        />
      </div>

      {/* Days Slider */}
      <div>
        <label className="block text-white font-semibold mb-3">
          How many days are you ready to give in?
        </label>
        <input
          type="range"
          min={30}
          max={90}
          value={responses.days}
          onChange={(e) => setResponse('days', Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-500 [&::-moz-range-thumb]:border-0"
          aria-label="Days ready to commit"
          title="Select number of days"
        />
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>30 days</span>
          <span className="text-purple-400 font-bold text-xl">{responses.days} days</span>
          <span>90 days</span>
        </div>
      </div>

      {/* Checkpoints */}
      <div>
        <label className="block text-white font-semibold mb-3">
          Do you want checkpoints & tests included?
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setResponse('checkpoints', true)}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              responses.checkpoints
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
            }`}
          >
            <span className="mr-2">✓</span>
            Yes
          </button>
          <button
            type="button"
            onClick={() => setResponse('checkpoints', false)}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              !responses.checkpoints
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
            }`}
          >
            <span className="mr-2">✗</span>
            No
          </button>
        </div>
      </div>
    </div>
  );
}