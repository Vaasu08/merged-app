
import React, { useEffect, useState } from 'react';
import SkillGraphVisualizer from '@/components/SkillGraphVisualizer';
import { useAuth } from '@/components/AuthProvider';
import { getUserSkills } from '@/lib/profile';

const SkillGraph: React.FC = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      if (!user) return;

      try {
        const userSkills = await getUserSkills(user.id);
        setSkills(userSkills);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Skill Graph</h1>
      <div className="w-full h-[600px] border rounded-lg">
        <SkillGraphVisualizer skills={skills} />
      </div>
    </div>
  );
};

export default SkillGraph;
