export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced';
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  averageSalary: string;
  growthRate: string;
  requiredSkills: string[];
  nextSteps: NextStep[];
  resources: Resource[];
  matchPercentage: number;
}

export interface NextStep {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeEstimate: string;
  completed?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'course' | 'tutorial' | 'book' | 'certification';
  url: string;
  provider: string;
  free: boolean;
}

export interface UserProfile {
  skills: Skill[];
  careerPaths: CareerPath[];
  completedSteps: string[];
}