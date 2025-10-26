export interface RoadmapRequest {
    fields: string[];
    project: string;
    days: number;
    checkpoints: boolean;
    experience_level: string;
    learning_style: string;
    time_per_day: string;
    goals: string;
  }
  
  export interface Roadmap {
    id?: string;
    title: string;
    overview: string;
    duration_days: number;
    difficulty: string;
    phases: Phase[];
    final_project: FinalProject;
    next_steps: string[];
    created_at?: string;
  }
  
  export interface Phase {
    phase_number: number;
    title: string;
    duration_days: number;
    description: string;
    topics: string[];
    resources: Resource[];
    project: Project;
    checkpoint?: Checkpoint;
  }
  
  export interface Resource {
    type: string;
    name: string;
    url?: string;
    duration?: string;
  }
  
  export interface Project {
    title: string;
    description: string;
    skills_practiced: string[];
  }
  
  export interface Checkpoint {
    title: string;
    topics_covered: string[];
    estimated_time: string;
  }
  
  export interface FinalProject {
    title: string;
    description: string;
    skills_required: string[];
    estimated_duration: string;
  }
  