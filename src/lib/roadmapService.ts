import { supabase } from './supabaseClient';

interface RoadmapRequest {
  fields: string[];
  project: string;
  days: number;
  checkpoints: boolean;
  experience_level: string;
  learning_style: string;
  time_per_day: string;
  goals: string;
}

interface Roadmap {
  title: string;
  overview: string;
  duration_days: number;
  difficulty: string;
  phases: Phase[];
  final_project: FinalProject;
  next_steps: string[];
}

interface Phase {
  phase_number: number;
  title: string;
  duration_days: number;
  description: string;
  topics: string[];
  resources: Resource[];
  project: Project;
  checkpoint?: Checkpoint;
}

interface Resource {
  type: string;
  name: string;
  url?: string;
  duration?: string;
}

interface Project {
  title: string;
  description: string;
  skills_practiced: string[];
}

interface Checkpoint {
  title: string;
  topics_covered: string[];
  estimated_time: string;
}

interface FinalProject {
  title: string;
  description: string;
  skills_required: string[];
  estimated_duration: string;
}

export const roadmapService = {
  // Generate roadmap using Gemini API
  async generateRoadmap(request: RoadmapRequest, userId: string): Promise<Roadmap> {
    try {
      console.log('🤖 Generating roadmap with Gemini API...');
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const endpoint = `${apiUrl}/api/roadmap/generate-gemini`;
      
      console.log('📍 API endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        // Try to get error text
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`);
        }
        throw new Error(errorData.error || 'Gemini generation failed');
      }

      // Get response text first to debug
      const responseText = await response.text();
      console.log('📄 Response text length:', responseText.length);
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from API');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error. First 500 chars:', responseText.substring(0, 500));
        throw new Error('Invalid JSON response from API');
      }

      const roadmap = data.roadmap;

      if (!roadmap) {
        throw new Error('No roadmap data in response');
      }

      console.log('✅ Roadmap generated successfully with Gemini');

      // Save to database (optional - RLS policies may prevent this)
      try {
        await this.saveRoadmap(roadmap, userId, request.fields);
        await this.saveUserResponses(request, userId);
        console.log('💾 Roadmap saved to database');
      } catch (dbError) {
        // Database save is optional - suppress RLS and table not found errors
        const errorCode = (dbError as { code?: string })?.code;
        if (errorCode === '42501' || errorCode === '42P01') {
          // 42501: RLS policy violation, 42P01: table doesn't exist
          // These are expected and non-fatal
        } else {
          const errorMessage = (dbError as { message?: string })?.message || String(dbError);
          console.warn('Database save failed:', errorMessage);
        }
      }

      return roadmap;
    } catch (error) {
      console.error('❌ Gemini API failed:', error);
      
      // Fallback to mock data
      console.warn('🎭 Using mock roadmap data');
      return this.generateMockRoadmap(request);
    }
  },

  // Fallback mock roadmap generator
  generateMockRoadmap(request: RoadmapRequest): Roadmap {
    return {
      title: `Personalized ${request.fields[0] || 'Career'} Development Roadmap`,
      overview: `A ${request.days}-day journey tailored to your ${request.experience_level} experience level in ${request.fields.join(', ')}`,
      duration_days: request.days,
      difficulty: request.experience_level === 'beginner' ? 'Beginner' : request.experience_level === 'intermediate' ? 'Intermediate' : 'Advanced',
      phases: [
        {
          phase_number: 1,
          title: 'Foundation Setup',
          duration_days: Math.ceil(request.days / 4),
          description: `Build your fundamental knowledge in ${request.fields[0] || 'your chosen field'}`,
          topics: ['Core concepts', 'Essential tools', 'Best practices'],
          resources: [
            { type: 'Course', name: 'Getting Started Guide', duration: '2 weeks' },
            { type: 'Documentation', name: 'Official Docs', duration: '1 week' }
          ],
          project: {
            title: 'Setup Project',
            description: 'Create your first project to apply what you learn',
            skills_practiced: ['Setup', 'Basic concepts', 'Tool usage']
          },
          checkpoint: request.checkpoints ? {
            title: 'Foundation Checkpoint',
            topics_covered: ['Core concepts', 'Tool setup'],
            estimated_time: '30 minutes'
          } : undefined
        },
        {
          phase_number: 2,
          title: 'Core Development',
          duration_days: Math.ceil(request.days / 3),
          description: 'Deep dive into practical implementation',
          topics: ['Advanced concepts', 'Real-world applications', 'Problem solving'],
          resources: [
            { type: 'Course', name: 'Advanced Topics', duration: '3 weeks' },
            { type: 'Practice', name: 'Exercises', duration: '2 weeks' }
          ],
          project: {
            title: 'Core Project',
            description: 'Build something substantial using core concepts',
            skills_practiced: ['Implementation', 'Problem solving', 'Best practices']
          },
          checkpoint: request.checkpoints ? {
            title: 'Core Checkpoint',
            topics_covered: ['Advanced concepts', 'Implementation'],
            estimated_time: '45 minutes'
          } : undefined
        },
        {
          phase_number: 3,
          title: 'Advanced Topics',
          duration_days: Math.ceil(request.days / 3),
          description: 'Master advanced techniques and specialization',
          topics: ['Specialized knowledge', 'Industry standards', 'Expert techniques'],
          resources: [
            { type: 'Course', name: 'Masterclass', duration: '2 weeks' },
            { type: 'Project', name: 'Capstone Prep', duration: '2 weeks' }
          ],
          project: {
            title: 'Advanced Project',
            description: 'Create an advanced project showcasing expertise',
            skills_practiced: ['Specialization', 'Expert techniques', 'Innovation']
          }
        },
        {
          phase_number: 4,
          title: 'Capstone & Portfolio',
          duration_days: Math.ceil(request.days / 4),
          description: 'Build your final showcase project',
          topics: ['Portfolio development', 'Presentation skills', 'Career readiness'],
          resources: [
            { type: 'Project', name: 'Capstone Project', duration: '2 weeks' },
            { type: 'Material', name: 'Portfolio Guide', duration: '1 week' }
          ],
          project: {
            title: 'Capstone Project',
            description: 'Create an impressive final project for your portfolio',
            skills_practiced: ['Full-stack development', 'Project management', 'Portfolio building']
          }
        }
      ],
      final_project: {
        title: 'Final Showcase Project',
        description: 'A comprehensive project demonstrating all your learned skills',
        skills_required: [...request.fields, 'Problem solving', 'Design thinking'],
        estimated_duration: '2-3 weeks'
      },
      next_steps: [
        'Complete your capstone project',
        'Build your portfolio',
        'Start applying for opportunities',
        'Continue learning and growing'
      ]
    };
  },

  // Save roadmap to database
  async saveRoadmap(roadmap: Roadmap, userId: string, fields: string[]) {
    const { data: roadmapData, error: roadmapError } = await supabase
      .from('roadmaps')
      .insert({
        user_id: userId,
        title: roadmap.title,
        overview: roadmap.overview,
        duration_days: roadmap.duration_days,
        difficulty: roadmap.difficulty,
        fields: fields,
      })
      .select()
      .single();

    if (roadmapError) throw roadmapError;

    // Save phases
    const phases = roadmap.phases.map(phase => ({
      roadmap_id: roadmapData.id,
      phase_number: phase.phase_number,
      title: phase.title,
      duration_days: phase.duration_days,
      description: phase.description,
      topics: phase.topics,
      resources: phase.resources,
      project: phase.project,
      checkpoint: phase.checkpoint,
    }));

    const { error: phasesError } = await supabase
      .from('roadmap_phases')
      .insert(phases);

    if (phasesError) throw phasesError;

    return roadmapData;
  },

  // Save user responses
  async saveUserResponses(request: RoadmapRequest, userId: string) {
    const { error } = await supabase
      .from('user_roadmap_responses')
      .insert({
        user_id: userId,
        ...request,
      });

    if (error) throw error;
  },

  // Get user's roadmaps
  async getUserRoadmaps(userId: string) {
    const { data, error } = await supabase
      .from('roadmaps')
      .select(`
        *,
        roadmap_phases (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single roadmap
  async getRoadmap(roadmapId: string) {
    const { data, error } = await supabase
      .from('roadmaps')
      .select(`
        *,
        roadmap_phases (*)
      `)
      .eq('id', roadmapId)
      .single();

    if (error) throw error;
    return data;
  },
};
