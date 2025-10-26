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
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #9333ea 0%, #ec4899 ${((responses.days - 30) / 60) * 100}%, #374151 ${((responses.days - 30) / 60) * 100}%, #374151 100%)`
          }}
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