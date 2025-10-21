export interface TrendData {
  month: string;
  'Frontend Developer': number;
  'Backend Developer': number;
  'Full Stack Developer': number;
  'Data Scientist': number;
  'DevOps Engineer': number;
  'Mobile Developer': number;
  'ML Engineer': number;
}

export interface SkillTrend {
  skill: string;
  demand: number;
  growth: number;
  category: string;
}

export interface SalaryTrend {
  career: string;
  junior: number;
  mid: number;
  senior: number;
  growth: number;
}

export const jobDemandTrends: TrendData[] = [
  { month: 'Jan 2024', 'Frontend Developer': 85, 'Backend Developer': 92, 'Full Stack Developer': 88, 'Data Scientist': 95, 'DevOps Engineer': 78, 'Mobile Developer': 72, 'ML Engineer': 98 },
  { month: 'Feb 2024', 'Frontend Developer': 88, 'Backend Developer': 95, 'Full Stack Developer': 91, 'Data Scientist': 98, 'DevOps Engineer': 81, 'Mobile Developer': 75, 'ML Engineer': 101 },
  { month: 'Mar 2024', 'Frontend Developer': 91, 'Backend Developer': 98, 'Full Stack Developer': 94, 'Data Scientist': 101, 'DevOps Engineer': 84, 'Mobile Developer': 78, 'ML Engineer': 104 },
  { month: 'Apr 2024', 'Frontend Developer': 94, 'Backend Developer': 101, 'Full Stack Developer': 97, 'Data Scientist': 104, 'DevOps Engineer': 87, 'Mobile Developer': 81, 'ML Engineer': 107 },
  { month: 'May 2024', 'Frontend Developer': 97, 'Backend Developer': 104, 'Full Stack Developer': 100, 'Data Scientist': 107, 'DevOps Engineer': 90, 'Mobile Developer': 84, 'ML Engineer': 110 },
  { month: 'Jun 2024', 'Frontend Developer': 100, 'Backend Developer': 107, 'Full Stack Developer': 103, 'Data Scientist': 110, 'DevOps Engineer': 93, 'Mobile Developer': 87, 'ML Engineer': 113 },
  { month: 'Jul 2024', 'Frontend Developer': 103, 'Backend Developer': 110, 'Full Stack Developer': 106, 'Data Scientist': 113, 'DevOps Engineer': 96, 'Mobile Developer': 90, 'ML Engineer': 116 },
  { month: 'Aug 2024', 'Frontend Developer': 106, 'Backend Developer': 113, 'Full Stack Developer': 109, 'Data Scientist': 116, 'DevOps Engineer': 99, 'Mobile Developer': 93, 'ML Engineer': 119 },
  { month: 'Sep 2024', 'Frontend Developer': 109, 'Backend Developer': 116, 'Full Stack Developer': 112, 'Data Scientist': 119, 'DevOps Engineer': 102, 'Mobile Developer': 96, 'ML Engineer': 122 },
  { month: 'Oct 2024', 'Frontend Developer': 112, 'Backend Developer': 119, 'Full Stack Developer': 115, 'Data Scientist': 122, 'DevOps Engineer': 105, 'Mobile Developer': 99, 'ML Engineer': 125 },
  { month: 'Nov 2024', 'Frontend Developer': 115, 'Backend Developer': 122, 'Full Stack Developer': 118, 'Data Scientist': 125, 'DevOps Engineer': 108, 'Mobile Developer': 102, 'ML Engineer': 128 },
  { month: 'Dec 2024', 'Frontend Developer': 118, 'Backend Developer': 125, 'Full Stack Developer': 121, 'Data Scientist': 128, 'DevOps Engineer': 111, 'Mobile Developer': 105, 'ML Engineer': 131 },
];

export const skillTrends: SkillTrend[] = [
  { skill: 'Python', demand: 95, growth: 25, category: 'Programming' },
  { skill: 'Machine Learning', demand: 92, growth: 47, category: 'Data' },
  { skill: 'Data Science', demand: 88, growth: 36, category: 'Data' },
  { skill: 'JavaScript', demand: 85, growth: 15, category: 'Programming' },
  { skill: 'React', demand: 82, growth: 12, category: 'Frontend' },
  { skill: 'AWS', demand: 78, growth: 20, category: 'Cloud' },
  { skill: 'SQL', demand: 75, growth: 10, category: 'Database' },
  { skill: 'Docker', demand: 72, growth: 18, category: 'DevOps' },
  { skill: 'TypeScript', demand: 68, growth: 22, category: 'Programming' },
  { skill: 'Node.js', demand: 65, growth: 8, category: 'Backend' },
  { skill: 'Kubernetes', demand: 62, growth: 25, category: 'DevOps' },
  { skill: 'Angular', demand: 58, growth: 5, category: 'Frontend' },
];

export const salaryTrends: SalaryTrend[] = [
  { career: 'Frontend Developer', junior: 4.5, mid: 8.5, senior: 15.0, growth: 12 },
  { career: 'Backend Developer', junior: 5.2, mid: 9.8, senior: 18.0, growth: 15 },
  { career: 'Full Stack Developer', junior: 6.0, mid: 11.5, senior: 20.0, growth: 18 },
  { career: 'Data Scientist', junior: 7.5, mid: 14.0, senior: 25.0, growth: 36 },
  { career: 'DevOps Engineer', junior: 6.8, mid: 12.5, senior: 22.0, growth: 20 },
  { career: 'Mobile Developer', junior: 5.5, mid: 9.5, senior: 16.5, growth: 15 },
  { career: 'ML Engineer', junior: 8.5, mid: 16.0, senior: 28.0, growth: 47 },
];

export const chartConfig = {
  'Frontend Developer': {
    label: 'Frontend Developer',
    color: 'hsl(var(--primary))',
  },
  'Backend Developer': {
    label: 'Backend Developer',
    color: 'hsl(var(--accent))',
  },
  'Full Stack Developer': {
    label: 'Full Stack Developer',
    color: 'hsl(var(--success))',
  },
  'Data Scientist': {
    label: 'Data Scientist',
    color: 'hsl(var(--destructive))',
  },
  'DevOps Engineer': {
    label: 'DevOps Engineer',
    color: 'hsl(var(--muted-foreground))',
  },
  'Mobile Developer': {
    label: 'Mobile Developer',
    color: 'hsl(var(--secondary))',
  },
  'ML Engineer': {
    label: 'ML Engineer',
    color: 'hsl(var(--popover))',
  },
};
