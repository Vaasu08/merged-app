
import React, { useEffect, useState } from 'react';
import { ForceGraph3D } from 'react-force-graph';

interface SkillGraphVisualizerProps {
  skills: string[];
}

const SkillGraphVisualizer: React.FC<SkillGraphVisualizerProps> = ({ skills }) => {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch('/api/skill-graph', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: skills.join(', ') }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch skill graph data');
        }

        const data = await response.json();
        setGraphData(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [skills]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <ForceGraph3D graphData={graphData} />;
};

export default SkillGraphVisualizer;
