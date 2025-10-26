import React from 'react';
import { useRoadmap } from '@/contexts/RoadmapContext';

const FIELDS = [
  { id: 'web-dev', label: 'Web Dev', icon: '💻' },
  { id: 'data-science', label: 'Data Science', icon: '📊' },
  { id: 'ux-ui', label: 'UX/UI Design', icon: '🎨' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: '🔒' },
  { id: 'ai-ml', label: 'AI/ML', icon: '🤖' },
  { id: 'devops', label: 'DevOps', icon: '⚙️' },
];

export default function Step1Fields() {
  const { responses, setResponse } = useRoadmap();

  const toggleField = (fieldId: string) => {
    const current = responses.fields;
    if (current.includes(fieldId)) {
      setResponse('fields', current.filter(f => f !== fieldId));
    } else {
      setResponse('fields', [...current, fieldId]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-white font-semibold text-lg mb-4">
        Which field are you looking for?
      </label>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((field) => (
          <button
            key={field.id}
            type="button"
            onClick={() => toggleField(field.id)}
            className={`p-4 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 ${
              responses.fields.includes(field.id)
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
            }`}
          >
            <span className="text-2xl block mb-1">{field.icon}</span>
            <span className="text-sm">{field.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}