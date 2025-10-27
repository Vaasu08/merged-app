// Career Recommendation Engine based on Assessment Answers

export interface JobRecommendation {
  id: string;
  title: string;
  matchScore: number;
  description: string;
  keySkills: string[];
  averageSalary: string;
  growthRate: string;
  workEnvironment: string;
  reasons: string[];
}

// Career profiles based on answer patterns
const careerProfiles = {
  // High earners - money focused
  highEarner: {
    jobs: [
      {
        id: 'investment-banker',
        title: 'Investment Banker',
        description: 'Manage financial portfolios, advise clients on investments, and handle complex financial transactions.',
        keySkills: ['Financial Analysis', 'Risk Management', 'Market Research', 'Client Relations'],
        averageSalary: '$100k - $200k+',
        growthRate: 'High (15% annually)',
        workEnvironment: 'High pressure, competitive, corporate',
        traits: ['money', 'analytical', 'independent', 'planned', 'logical', 'research', 'complex-problem', 'early-finish', 'business']
      },
      {
        id: 'software-architect',
        title: 'Software Architect',
        description: 'Design large-scale software systems and guide development teams on technical decisions.',
        keySkills: ['System Design', 'Programming', 'Cloud Architecture', 'Leadership'],
        averageSalary: '$120k - $180k',
        growthRate: 'Very High (20% annually)',
        workEnvironment: 'Flexible, tech-driven, collaborative',
        traits: ['money', 'analytical', 'independent', 'conceptual', 'logical', 'research', 'complex-problem', 'math']
      },
      {
        id: 'data-scientist',
        title: 'Data Scientist',
        description: 'Analyze complex data sets to help companies make data-driven decisions.',
        keySkills: ['Python/R', 'Machine Learning', 'Statistics', 'Data Visualization'],
        averageSalary: '$90k - $150k',
        growthRate: 'Very High (25% annually)',
        workEnvironment: 'Tech-focused, analytical, flexible',
        traits: ['money', 'analytical', 'independent', 'conceptual', 'logical', 'research', 'complex-problem', 'math']
      }
    ]
  },
  
  // People-oriented - helping others
  peopleOriented: {
    jobs: [
      {
        id: 'counselor',
        title: 'Professional Counselor / Therapist',
        description: 'Help people navigate mental health challenges and personal growth.',
        keySkills: ['Active Listening', 'Empathy', 'Communication', 'Psychology'],
        averageSalary: '$45k - $75k',
        growthRate: 'Moderate (10% annually)',
        workEnvironment: 'Relaxed, one-on-one, empathetic',
        traits: ['people-focused', 'empathetic', 'small-team', 'conceptual', 'interpersonal', 'psychology', 'struggle-deadline']
      },
      {
        id: 'teacher',
        title: 'Educator / Teacher',
        description: 'Educate and inspire students across various subjects and age groups.',
        keySkills: ['Communication', 'Curriculum Design', 'Patience', 'Subject Expertise'],
        averageSalary: '$40k - $65k',
        growthRate: 'Stable (5% annually)',
        workEnvironment: 'Structured, social, impactful',
        traits: ['people-focused', 'empathetic', 'large-team', 'conceptual', 'interpersonal', 'team-goal', 'psychology']
      },
      {
        id: 'hr-manager',
        title: 'Human Resources Manager',
        description: 'Manage employee relations, recruitment, and organizational culture.',
        keySkills: ['People Management', 'Conflict Resolution', 'Policy Development', 'Communication'],
        averageSalary: '$60k - $95k',
        growthRate: 'Moderate (7% annually)',
        workEnvironment: 'Corporate, people-focused, strategic',
        traits: ['people-focused', 'empathetic', 'large-team', 'interpersonal', 'delegate', 'team-goal', 'business']
      }
    ]
  },
  
  // Creative types
  creative: {
    jobs: [
      {
        id: 'ux-designer',
        title: 'UX/UI Designer',
        description: 'Design intuitive and beautiful user experiences for digital products.',
        keySkills: ['Design Tools', 'User Research', 'Prototyping', 'Visual Design'],
        averageSalary: '$65k - $110k',
        growthRate: 'High (13% annually)',
        workEnvironment: 'Creative, collaborative, flexible',
        traits: ['creative', 'flexible', 'mixed-work', 'visual-design', 'brainstorm', 'beautiful', 'hands-on']
      },
      {
        id: 'creative-director',
        title: 'Creative Director',
        description: 'Lead creative teams and develop innovative campaigns and brand strategies.',
        keySkills: ['Creative Strategy', 'Team Leadership', 'Brand Development', 'Design'],
        averageSalary: '$80k - $140k',
        growthRate: 'Moderate (8% annually)',
        workEnvironment: 'Dynamic, creative, leadership-focused',
        traits: ['creative', 'flexible', 'small-team', 'visual-design', 'brainstorm', 'beautiful', 'delegate', 'recognition']
      },
      {
        id: 'content-creator',
        title: 'Content Creator / Digital Marketer',
        description: 'Create engaging content for social media, blogs, and marketing campaigns.',
        keySkills: ['Content Writing', 'Social Media', 'SEO', 'Video Editing'],
        averageSalary: '$45k - $80k',
        growthRate: 'Very High (18% annually)',
        workEnvironment: 'Flexible, independent, creative',
        traits: ['creative', 'flexible', 'independent', 'jump-in', 'beautiful', 'struggle-deadline', 'communication']
      }
    ]
  },
  
  // Stable & structured
  stable: {
    jobs: [
      {
        id: 'accountant',
        title: 'Accountant / Financial Analyst',
        description: 'Manage financial records, ensure compliance, and provide financial insights.',
        keySkills: ['Accounting', 'Excel', 'Tax Law', 'Financial Reporting'],
        averageSalary: '$55k - $85k',
        growthRate: 'Stable (6% annually)',
        workEnvironment: 'Structured, detail-oriented, stable',
        traits: ['stability', 'detail-oriented', 'planned', 'early-finish', 'business', 'analyzing']
      },
      {
        id: 'project-manager',
        title: 'Project Manager',
        description: 'Plan, execute, and oversee projects ensuring they meet deadlines and budgets.',
        keySkills: ['Project Planning', 'Team Coordination', 'Risk Management', 'Communication'],
        averageSalary: '$70k - $110k',
        growthRate: 'High (11% annually)',
        workEnvironment: 'Structured, collaborative, goal-driven',
        traits: ['stability', 'detail-oriented', 'large-team', 'planned', 'delegate', 'team-goal', 'steady-work']
      },
      {
        id: 'operations-manager',
        title: 'Operations Manager',
        description: 'Oversee daily operations and ensure business efficiency and productivity.',
        keySkills: ['Process Optimization', 'Team Management', 'Analytics', 'Problem Solving'],
        averageSalary: '$65k - $100k',
        growthRate: 'Moderate (8% annually)',
        workEnvironment: 'Corporate, structured, leadership-focused',
        traits: ['stability', 'detail-oriented', 'large-team', 'planned', 'delegate', 'team-goal', 'business']
      }
    ]
  },
  
  // Analytical & technical
  analytical: {
    jobs: [
      {
        id: 'software-engineer',
        title: 'Software Engineer',
        description: 'Develop, test, and maintain software applications and systems.',
        keySkills: ['Programming', 'Problem Solving', 'Algorithms', 'Version Control'],
        averageSalary: '$80k - $130k',
        growthRate: 'Very High (22% annually)',
        workEnvironment: 'Tech-driven, flexible, collaborative',
        traits: ['money', 'analytical', 'independent', 'conceptual', 'logical', 'complex-problem', 'hands-on', 'math']
      },
      {
        id: 'research-scientist',
        title: 'Research Scientist',
        description: 'Conduct research and experiments to advance knowledge in your field.',
        keySkills: ['Research Methods', 'Data Analysis', 'Scientific Writing', 'Critical Thinking'],
        averageSalary: '$70k - $120k',
        growthRate: 'Moderate (7% annually)',
        workEnvironment: 'Academic, independent, analytical',
        traits: ['stability', 'analytical', 'independent', 'conceptual', 'logical', 'research', 'complex-problem', 'math', 'reading']
      },
      {
        id: 'business-analyst',
        title: 'Business Analyst',
        description: 'Analyze business processes and recommend improvements using data.',
        keySkills: ['Data Analysis', 'SQL', 'Business Intelligence', 'Communication'],
        averageSalary: '$65k - $95k',
        growthRate: 'High (14% annually)',
        workEnvironment: 'Corporate, analytical, collaborative',
        traits: ['money', 'analytical', 'mixed-work', 'conceptual', 'business-challenge', 'research', 'business', 'analyzing']
      }
    ]
  },
  
  // Leadership focused
  leadership: {
    jobs: [
      {
        id: 'entrepreneur',
        title: 'Entrepreneur / Startup Founder',
        description: 'Build and grow your own business, taking calculated risks for high rewards.',
        keySkills: ['Business Strategy', 'Leadership', 'Sales', 'Innovation'],
        averageSalary: '$50k - $200k+ (variable)',
        growthRate: 'Variable (High potential)',
        workEnvironment: 'Dynamic, high-risk, autonomous',
        traits: ['money', 'flexible', 'independent', 'jump-in', 'delegate', 'team-goal', 'recognition', 'business']
      },
      {
        id: 'sales-director',
        title: 'Sales Director',
        description: 'Lead sales teams and drive revenue growth through strategic planning.',
        keySkills: ['Sales Strategy', 'Team Leadership', 'Negotiation', 'Client Relations'],
        averageSalary: '$90k - $150k',
        growthRate: 'High (10% annually)',
        workEnvironment: 'Fast-paced, people-focused, results-driven',
        traits: ['money', 'flexible', 'small-team', 'jump-in', 'delegate', 'team-goal', 'recognition', 'business']
      },
      {
        id: 'product-manager',
        title: 'Product Manager',
        description: 'Define product vision and strategy, working with cross-functional teams.',
        keySkills: ['Product Strategy', 'Stakeholder Management', 'Market Research', 'Agile'],
        averageSalary: '$95k - $150k',
        growthRate: 'Very High (17% annually)',
        workEnvironment: 'Tech-focused, collaborative, strategic',
        traits: ['money', 'flexible', 'mixed-work', 'delegate', 'team-goal', 'recognition', 'business', 'hands-on']
      }
    ]
  }
};

// Analyze answers and return job recommendations
export function analyzeAssessmentAnswers(answers: Record<number, string>): JobRecommendation[] {
  const traits: string[] = [];
  
  // Question 1: Work environment preference
  const q1 = answers[1];
  if (q1?.includes('lot of money')) traits.push('money');
  if (q1?.includes('less pressure')) traits.push('relaxed');
  if (q1?.includes('help and connect')) traits.push('people-focused');
  if (q1?.includes('stability')) traits.push('stability');
  
  // Question 2: Personal characteristics
  const q2 = answers[2];
  if (q2?.includes('detail-oriented')) traits.push('detail-oriented');
  if (q2?.includes('quick-thinking')) traits.push('flexible');
  if (q2?.includes('creative')) traits.push('creative');
  if (q2?.includes('empathetic')) traits.push('empathetic');
  
  // Question 3: Team preference
  const q3 = answers[3];
  if (q3?.includes('small close-knit')) traits.push('small-team');
  if (q3?.includes('large team')) traits.push('large-team');
  if (q3?.includes('alone')) traits.push('independent');
  if (q3?.includes('Mixed')) traits.push('mixed-work');
  
  // Question 4: Study approach
  const q4 = answers[4];
  if (q4?.includes('detailed plan')) traits.push('planned');
  if (q4?.includes('understood concepts')) traits.push('conceptual');
  if (q4?.includes('last moment')) traits.push('jump-in');
  if (q4?.includes('important topics')) traits.push('focused');
  
  // Question 5: Problem type
  const q5 = answers[5];
  if (q5?.includes('Logical or technical')) traits.push('logical');
  if (q5?.includes('Visual or design')) traits.push('visual-design');
  if (q5?.includes('Emotional or interpersonal')) traits.push('interpersonal');
  if (q5?.includes('Business or money')) traits.push('business-challenge');
  
  // Question 6: Project approach
  const q6 = answers[6];
  if (q6?.includes('Research and make')) traits.push('research');
  if (q6?.includes('Jump right in')) traits.push('jump-in');
  if (q6?.includes('Brainstorm creative')) traits.push('brainstorm');
  if (q6?.includes('delegate')) traits.push('delegate');
  
  // Question 7: Success definition
  const q7 = answers[7];
  if (q7?.includes('complex problem')) traits.push('complex-problem');
  if (q7?.includes('beautiful or unique')) traits.push('beautiful');
  if (q7?.includes('Leading a team')) traits.push('team-goal');
  if (q7?.includes('recognition, money')) traits.push('recognition');
  
  // Question 8: Deadline handling
  const q8 = answers[8];
  if (q8?.includes('finish early')) traits.push('early-finish');
  if (q8?.includes('steadily')) traits.push('steady-work');
  if (q8?.includes('Need pressure')) traits.push('pressure-performer');
  if (q8?.includes('struggle unless')) traits.push('struggle-deadline');
  
  // Question 9: Subject preference
  const q9 = answers[9];
  if (q9?.includes('Math or Science')) traits.push('math');
  if (q9?.includes('Social Studies or Psychology')) traits.push('psychology');
  if (q9?.includes('Languages or Communication')) traits.push('communication');
  if (q9?.includes('Business or Economics')) traits.push('business');
  
  // Question 10: Learning style
  const q10 = answers[10];
  if (q10?.includes('Watching tutorials')) traits.push('visual-learner');
  if (q10?.includes('Reading books')) traits.push('reading');
  if (q10?.includes('hands-on')) traits.push('hands-on');
  if (q10?.includes('Observing and analyzing')) traits.push('analyzing');
  
  // Determine dominant profile
  const profileScores = {
    highEarner: 0,
    peopleOriented: 0,
    creative: 0,
    stable: 0,
    analytical: 0,
    leadership: 0
  };
  
  // Score each profile based on traits
  if (traits.includes('money')) profileScores.highEarner += 3;
  if (traits.includes('logical') || traits.includes('math')) profileScores.analytical += 2;
  if (traits.includes('people-focused') || traits.includes('empathetic')) profileScores.peopleOriented += 3;
  if (traits.includes('creative') || traits.includes('beautiful')) profileScores.creative += 3;
  if (traits.includes('stability') || traits.includes('planned')) profileScores.stable += 2;
  if (traits.includes('delegate') || traits.includes('team-goal')) profileScores.leadership += 2;
  if (traits.includes('independent')) profileScores.analytical += 1;
  if (traits.includes('interpersonal')) profileScores.peopleOriented += 2;
  if (traits.includes('visual-design')) profileScores.creative += 2;
  if (traits.includes('recognition')) profileScores.leadership += 2;
  
  // Get all jobs and calculate match scores
  const allJobs: JobRecommendation[] = [];
  
  Object.entries(careerProfiles).forEach(([profileKey, profile]) => {
    profile.jobs.forEach(job => {
      const matchingTraits = job.traits.filter(trait => traits.includes(trait));
      const matchScore = Math.round((matchingTraits.length / job.traits.length) * 100);
      
      // Generate personalized reasons
      const reasons: string[] = [];
      if (traits.includes('money') && job.averageSalary.includes('$100k')) {
        reasons.push('High earning potential matches your financial goals');
      }
      if (traits.includes('people-focused') && job.description.toLowerCase().includes('people')) {
        reasons.push('Strong people interaction aligns with your social nature');
      }
      if (traits.includes('creative') && job.keySkills.some(s => s.toLowerCase().includes('design'))) {
        reasons.push('Creative aspects match your imaginative mindset');
      }
      if (traits.includes('stability') && job.workEnvironment.includes('Structured')) {
        reasons.push('Stable environment provides the security you value');
      }
      if (traits.includes('logical') && job.keySkills.some(s => s.toLowerCase().includes('analysis'))) {
        reasons.push('Analytical work suits your logical thinking style');
      }
      if (matchingTraits.length >= 3) {
        reasons.push(`Strong match with ${matchingTraits.length} of your key traits`);
      }
      
      allJobs.push({
        ...job,
        matchScore,
        reasons: reasons.length > 0 ? reasons : ['Good general match based on your assessment']
      });
    });
  });
  
  // Sort by match score and return top matches
  return allJobs
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6); // Return top 6 recommendations
}
