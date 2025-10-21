import { CareerPath, Skill } from '../types/career';

// Predefined skills database
export const skillsDatabase: Skill[] = [
  // Programming Languages
  { id: 'js', name: 'JavaScript', category: 'Programming' },
  { id: 'py', name: 'Python', category: 'Programming' },
  { id: 'java', name: 'Java', category: 'Programming' },
  { id: 'cpp', name: 'C++', category: 'Programming' },
  { id: 'ts', name: 'TypeScript', category: 'Programming' },
  { id: 'go', name: 'Go', category: 'Programming' },
  { id: 'rust', name: 'Rust', category: 'Programming' },
  { id: 'php', name: 'PHP', category: 'Programming' },
  { id: 'csharp', name: 'C#', category: 'Programming' },
  { id: 'swift', name: 'Swift', category: 'Programming' },
  { id: 'kotlin', name: 'Kotlin', category: 'Programming' },
  { id: 'dart', name: 'Dart', category: 'Programming' },
  
  // Frameworks & Libraries
  { id: 'react', name: 'React', category: 'Frontend' },
  { id: 'vue', name: 'Vue.js', category: 'Frontend' },
  { id: 'angular', name: 'Angular', category: 'Frontend' },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend' },
  { id: 'nuxt', name: 'Nuxt', category: 'Frontend' },
  { id: 'svelte', name: 'Svelte', category: 'Frontend' },
  { id: 'react-native', name: 'React Native', category: 'Mobile' },
  { id: 'flutter', name: 'Flutter', category: 'Mobile' },
  { id: 'node', name: 'Node.js', category: 'Backend' },
  { id: 'express', name: 'Express.js', category: 'Backend' },
  { id: 'django', name: 'Django', category: 'Backend' },
  { id: 'flask', name: 'Flask', category: 'Backend' },
  { id: 'spring', name: 'Spring Boot', category: 'Backend' },
  { id: 'laravel', name: 'Laravel', category: 'Backend' },
  { id: 'rails', name: 'Ruby on Rails', category: 'Backend' },
  { id: 'graphql', name: 'GraphQL', category: 'Backend' },
  { id: 'grpc', name: 'gRPC', category: 'Backend' },
  { id: 'redis', name: 'Redis', category: 'Backend' },
  { id: 'mongodb', name: 'MongoDB', category: 'Backend' },
  { id: 'postgres', name: 'PostgreSQL', category: 'Backend' },
  { id: 'mysql', name: 'MySQL', category: 'Backend' },
  
  // Data & Analytics
  { id: 'sql', name: 'SQL', category: 'Data' },
  { id: 'pandas', name: 'Pandas', category: 'Data' },
  { id: 'numpy', name: 'NumPy', category: 'Data' },
  { id: 'r', name: 'R', category: 'Data' },
  { id: 'tableau', name: 'Tableau', category: 'Data' },
  { id: 'powerbi', name: 'Power BI', category: 'Data' },
  { id: 'spark', name: 'Apache Spark', category: 'Data' },
  { id: 'hadoop', name: 'Hadoop', category: 'Data' },
  { id: 'airflow', name: 'Apache Airflow', category: 'Data' },
  { id: 'ml', name: 'Machine Learning', category: 'Data' },
  { id: 'dl', name: 'Deep Learning', category: 'Data' },
  { id: 'nlp', name: 'Natural Language Processing', category: 'Data' },
  
  // Cloud & DevOps
  { id: 'aws', name: 'AWS', category: 'Cloud' },
  { id: 'azure', name: 'Azure', category: 'Cloud' },
  { id: 'gcp', name: 'Google Cloud', category: 'Cloud' },
  { id: 'docker', name: 'Docker', category: 'DevOps' },
  { id: 'k8s', name: 'Kubernetes', category: 'DevOps' },
  { id: 'terraform', name: 'Terraform', category: 'DevOps' },
  { id: 'ansible', name: 'Ansible', category: 'DevOps' },
  { id: 'jenkins', name: 'Jenkins', category: 'DevOps' },
  { id: 'gitlab-ci', name: 'GitLab CI', category: 'DevOps' },
  { id: 'linux', name: 'Linux', category: 'DevOps' },
  { id: 'bash', name: 'Bash', category: 'DevOps' },
  
  // Web Fundamentals & Tools
  { id: 'html', name: 'HTML', category: 'Web' },
  { id: 'css', name: 'CSS', category: 'Web' },
  { id: 'sass', name: 'Sass', category: 'Web' },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Web' },
  { id: 'git', name: 'Git', category: 'Tools' },
  { id: 'testing', name: 'Automated Testing', category: 'Tools' },
  { id: 'jest', name: 'Jest', category: 'Tools' },
  { id: 'cypress', name: 'Cypress', category: 'Tools' },

  // Soft Skills
  { id: 'leadership', name: 'Leadership', category: 'Soft Skills' },
  { id: 'communication', name: 'Communication', category: 'Soft Skills' },
  { id: 'problem-solving', name: 'Problem Solving', category: 'Soft Skills' },
  { id: 'teamwork', name: 'Teamwork', category: 'Soft Skills' },
  { id: 'project-management', name: 'Project Management', category: 'Soft Skills' },
  { id: 'agile', name: 'Agile/Scrum', category: 'Soft Skills' },
  { id: 'product-thinking', name: 'Product Thinking', category: 'Soft Skills' },
  { id: 'uiux', name: 'UI/UX Design', category: 'Design' },
  { id: 'figma', name: 'Figma', category: 'Design' },
  { id: 'seo', name: 'SEO', category: 'Marketing' },
  { id: 'analytics', name: 'Digital Analytics', category: 'Marketing' },
];

// Career paths database with skill mappings
export const careerPaths: CareerPath[] = [
  {
    id: 'fullstack-dev',
    title: 'Full Stack Developer',
    description: 'Build complete web applications from frontend to backend, working with modern frameworks and databases.',
    averageSalary: '$75,000 - $120,000',
    growthRate: '+13% (2023-2033)',
    requiredSkills: ['js', 'react', 'node', 'sql', 'html', 'css', 'git'],
    matchPercentage: 0,
    nextSteps: [
      {
        id: 'fs-1',
        title: 'Master React Advanced Patterns',
        description: 'Learn hooks, context, and state management patterns',
        priority: 'high',
        timeEstimate: '4-6 weeks'
      },
      {
        id: 'fs-2',
        title: 'Build REST APIs with Node.js',
        description: 'Create scalable backend services and APIs',
        priority: 'high',
        timeEstimate: '3-4 weeks'
      },
      {
        id: 'fs-3',
        title: 'Learn Database Design',
        description: 'Master SQL and NoSQL database concepts',
        priority: 'medium',
        timeEstimate: '2-3 weeks'
      },
      {
        id: 'fs-4',
        title: 'Deploy Applications',
        description: 'Learn cloud deployment with AWS or Vercel',
        priority: 'medium',
        timeEstimate: '1-2 weeks'
      }
    ],
    resources: [
      {
        id: 'fs-r1',
        title: 'The Complete Web Developer Course',
        type: 'course',
        url: 'https://www.udemy.com/course/the-complete-web-developer-course-2/',
        provider: 'Udemy',
        free: false
      },
      {
        id: 'fs-r2',
        title: 'freeCodeCamp Full Stack',
        type: 'course',
        url: 'https://www.freecodecamp.org/',
        provider: 'freeCodeCamp',
        free: true
      }
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Extract insights from data using statistical analysis, machine learning, and data visualization.',
    averageSalary: '$95,000 - $165,000',
    growthRate: '+35% (2023-2033)',
    requiredSkills: ['py', 'sql', 'pandas', 'numpy', 'r', 'tableau'],
    matchPercentage: 0,
    nextSteps: [
      {
        id: 'ds-1',
        title: 'Master Machine Learning',
        description: 'Learn scikit-learn, TensorFlow, and model evaluation',
        priority: 'high',
        timeEstimate: '8-10 weeks'
      },
      {
        id: 'ds-2',
        title: 'Advanced Statistics',
        description: 'Strengthen statistical analysis and hypothesis testing',
        priority: 'high',
        timeEstimate: '6-8 weeks'
      },
      {
        id: 'ds-3',
        title: 'Data Visualization',
        description: 'Create compelling visualizations with matplotlib, seaborn',
        priority: 'medium',
        timeEstimate: '3-4 weeks'
      },
      {
        id: 'ds-4',
        title: 'Build Portfolio Projects',
        description: 'Complete 3-5 end-to-end data science projects',
        priority: 'high',
        timeEstimate: '12-16 weeks'
      }
    ],
    resources: [
      {
        id: 'ds-r1',
        title: 'Python for Data Science Handbook',
        type: 'book',
        url: 'https://jakevdp.github.io/PythonDataScienceHandbook/',
        provider: "O'Reilly",
        free: true
      },
      {
        id: 'ds-r2',
        title: 'Kaggle Learn',
        type: 'course',
        url: 'https://www.kaggle.com/learn',
        provider: 'Kaggle',
        free: true
      }
    ]
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    description: 'Bridge development and operations by automating deployments, managing infrastructure, and ensuring scalability.',
    averageSalary: '$85,000 - $140,000',
    growthRate: '+23% (2023-2033)',
    requiredSkills: ['docker', 'k8s', 'aws', 'terraform', 'linux', 'py', 'bash'],
    matchPercentage: 0,
    nextSteps: [
      {
        id: 'do-1',
        title: 'Master Container Orchestration',
        description: 'Deep dive into Kubernetes and container management',
        priority: 'high',
        timeEstimate: '6-8 weeks'
      },
      {
        id: 'do-2',
        title: 'Infrastructure as Code',
        description: 'Learn Terraform and CloudFormation',
        priority: 'high',
        timeEstimate: '4-6 weeks'
      },
      {
        id: 'do-3',
        title: 'CI/CD Pipelines',
        description: 'Set up automated testing and deployment workflows',
        priority: 'medium',
        timeEstimate: '3-4 weeks'
      },
      {
        id: 'do-4',
        title: 'Monitoring & Logging',
        description: 'Implement observability with Prometheus, Grafana',
        priority: 'medium',
        timeEstimate: '2-3 weeks'
      }
    ],
    resources: [
      {
        id: 'do-r1',
        title: 'AWS Certified DevOps Engineer',
        type: 'certification',
        url: 'https://aws.amazon.com/certification/certified-devops-engineer-professional/',
        provider: 'AWS',
        free: false
      },
      {
        id: 'do-r2',
        title: 'Kubernetes Documentation',
        type: 'tutorial',
        url: 'https://kubernetes.io/docs/tutorials/',
        provider: 'Kubernetes',
        free: true
      }
    ]
  },
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    description: 'Build interactive, accessible user interfaces with modern JS frameworks and CSS tooling.',
    averageSalary: '$65,000 - $110,000',
    growthRate: '+15% (2023-2033)',
    requiredSkills: ['js', 'ts', 'react', 'nextjs', 'html', 'css', 'tailwind'],
    matchPercentage: 0,
    nextSteps: [
      { id: 'fe-1', title: 'Master React & Next.js', description: 'SSR/SSG, routing, data fetching patterns', priority: 'high', timeEstimate: '4-6 weeks' },
      { id: 'fe-2', title: 'Advanced CSS Architecture', description: 'BEM, utility-first, design systems', priority: 'medium', timeEstimate: '2-3 weeks' },
      { id: 'fe-3', title: 'Testing UI', description: 'Write tests with Jest, React Testing Library, Cypress', priority: 'medium', timeEstimate: '2-3 weeks' }
    ],
    resources: [
      { id: 'fe-r1', title: 'React Docs', type: 'tutorial', url: 'https://react.dev/learn', provider: 'React', free: true },
      { id: 'fe-r2', title: 'Next.js Learn', type: 'tutorial', url: 'https://nextjs.org/learn', provider: 'Vercel', free: true }
    ]
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    description: 'Design and implement robust APIs, services, and data layers for scalable systems.',
    averageSalary: '$75,000 - $125,000',
    growthRate: '+12% (2023-2033)',
    requiredSkills: ['node', 'express', 'postgres', 'redis', 'graphql', 'docker', 'aws'],
    matchPercentage: 0,
    nextSteps: [
      { id: 'be-1', title: 'API Design', description: 'RESTful design, GraphQL schemas, gRPC contracts', priority: 'high', timeEstimate: '3-4 weeks' },
      { id: 'be-2', title: 'Data Modeling', description: 'Relational design, indexing, caching strategies', priority: 'high', timeEstimate: '3-4 weeks' },
      { id: 'be-3', title: 'Observability', description: 'Logging, tracing, metrics with modern stacks', priority: 'medium', timeEstimate: '2-3 weeks' }
    ],
    resources: [
      { id: 'be-r1', title: 'Express Guide', type: 'tutorial', url: 'https://expressjs.com/', provider: 'Express', free: true },
      { id: 'be-r2', title: 'Postgres Tutorial', type: 'tutorial', url: 'https://www.postgresql.org/docs/', provider: 'PostgreSQL', free: true }
    ]
  },
  {
    id: 'mobile-developer',
    title: 'Mobile App Developer',
    description: 'Build high-quality mobile apps for iOS and Android using cross-platform or native tools.',
    averageSalary: '$70,000 - $120,000',
    growthRate: '+18% (2023-2033)',
    requiredSkills: ['react-native', 'flutter', 'kotlin', 'swift', 'git', 'testing'],
    matchPercentage: 0,
    nextSteps: [
      { id: 'mo-1', title: 'Master Cross-Platform', description: 'Learn React Native/Flutter advanced patterns', priority: 'high', timeEstimate: '4-6 weeks' },
      { id: 'mo-2', title: 'Native Integrations', description: 'Bridges, platform APIs, performance tuning', priority: 'medium', timeEstimate: '2-3 weeks' }
    ],
    resources: [
      { id: 'mo-r1', title: 'React Native Docs', type: 'tutorial', url: 'https://reactnative.dev/docs/getting-started', provider: 'Meta', free: true },
      { id: 'mo-r2', title: 'Flutter Docs', type: 'tutorial', url: 'https://docs.flutter.dev/', provider: 'Google', free: true }
    ]
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    description: 'Productionize ML models, build pipelines, and deploy inference at scale.',
    averageSalary: '$110,000 - $180,000',
    growthRate: '+21% (2023-2033)',
    requiredSkills: ['py', 'ml', 'dl', 'sql', 'airflow', 'spark', 'aws'],
    matchPercentage: 0,
    nextSteps: [
      { id: 'ml-1', title: 'Model Serving', description: 'FastAPI/TensorFlow Serving, batch vs realtime', priority: 'high', timeEstimate: '3-4 weeks' },
      { id: 'ml-2', title: 'Pipelines & Orchestration', description: 'Airflow/Kubeflow, feature stores', priority: 'high', timeEstimate: '3-5 weeks' }
    ],
    resources: [
      { id: 'ml-r1', title: 'MLOps Guide', type: 'tutorial', url: 'https://ml-ops.org/', provider: 'MLOps', free: true },
      { id: 'ml-r2', title: 'TensorFlow', type: 'tutorial', url: 'https://www.tensorflow.org/', provider: 'Google', free: true }
    ]
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    description: 'Design data platforms, pipelines, and warehouses to power analytics and ML.',
    averageSalary: '$100,000 - $160,000',
    growthRate: '+20% (2023-2033)',
    requiredSkills: ['py', 'sql', 'spark', 'airflow', 'gcp', 'aws', 'hadoop'],
    matchPercentage: 0,
    nextSteps: [
      { id: 'de-1', title: 'Batch & Streaming', description: 'ETL/ELT, stream processing patterns', priority: 'high', timeEstimate: '3-4 weeks' },
      { id: 'de-2', title: 'Data Warehousing', description: 'Dimensional modeling, BigQuery/Redshift', priority: 'high', timeEstimate: '3-4 weeks' }
    ],
    resources: [
      { id: 'de-r1', title: 'Airflow Docs', type: 'tutorial', url: 'https://airflow.apache.org/docs/', provider: 'Apache', free: true },
      { id: 'de-r2', title: 'Spark Guide', type: 'tutorial', url: 'https://spark.apache.org/docs/latest/', provider: 'Apache', free: true }
    ]
  },
  {
    id: 'cloud-architect',
    title: 'Cloud Architect',
    description: 'Design cloud-native architectures emphasizing reliability, performance, and cost efficiency.',
    averageSalary: '$120,000 - $190,000',
    growthRate: '+17% (2023-2033)',
    requiredSkills: ['aws', 'gcp', 'azure', 'terraform', 'k8s', 'linux', 'networking'],
    matchPercentage: 0,
    nextSteps: [
      { id: 'ca-1', title: 'Well-Architected', description: 'Cloud best practices, security, cost controls', priority: 'high', timeEstimate: '3-4 weeks' },
      { id: 'ca-2', title: 'Multi-Cloud Patterns', description: 'Abstractions, portability, hybrid approaches', priority: 'medium', timeEstimate: '2-3 weeks' }
    ],
    resources: [
      { id: 'ca-r1', title: 'AWS Well-Architected', type: 'tutorial', url: 'https://aws.amazon.com/architecture/well-architected/', provider: 'AWS', free: true },
      { id: 'ca-r2', title: 'GCP Architecture Center', type: 'tutorial', url: 'https://cloud.google.com/architecture', provider: 'Google', free: true }
    ]
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    description: 'Design intuitive, delightful user experiences and interfaces informed by research.',
    averageSalary: '$70,000 - $120,000',
    growthRate: '+11% (2023-2033)',
    requiredSkills: ['uiux', 'figma', 'html', 'css', 'communication', 'product-thinking'],
    matchPercentage: 0,
    nextSteps: [
      { id: 'ux-1', title: 'Design Systems', description: 'Tokens, components, accessibility', priority: 'high', timeEstimate: '2-3 weeks' },
      { id: 'ux-2', title: 'User Research', description: 'Interviews, usability testing, synthesis', priority: 'medium', timeEstimate: '2-3 weeks' }
    ],
    resources: [
      { id: 'ux-r1', title: 'Figma Learn', type: 'tutorial', url: 'https://help.figma.com/hc/en-us/articles/360040514213-Get-started-in-Figma', provider: 'Figma', free: true },
      { id: 'ux-r2', title: 'Material Design', type: 'tutorial', url: 'https://m3.material.io/', provider: 'Google', free: true }
    ]
  },
  {
    id: 'qa-engineer',
    title: 'QA/Test Automation Engineer',
    description: 'Ensure product quality with automated tests and resilient testing strategies.',
    averageSalary: '$65,000 - $110,000',
    growthRate: '+9% (2023-2033)',
    requiredSkills: ['testing', 'jest', 'cypress', 'js', 'ts', 'git', 'ci'],
    matchPercentage: 0,
    nextSteps: [
      { id: 'qa-1', title: 'Automation Frameworks', description: 'Design scalable test frameworks', priority: 'high', timeEstimate: '2-3 weeks' },
      { id: 'qa-2', title: 'CI Integration', description: 'Integrate tests into CI/CD pipelines', priority: 'medium', timeEstimate: '1-2 weeks' }
    ],
    resources: [
      { id: 'qa-r1', title: 'Testing Library', type: 'tutorial', url: 'https://testing-library.com/docs/react-testing-library/intro/', provider: 'RTL', free: true },
      { id: 'qa-r2', title: 'Cypress Docs', type: 'tutorial', url: 'https://docs.cypress.io/', provider: 'Cypress', free: true }
    ]
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    description: 'Protect systems and data through monitoring, threat analysis, and security best practices.',
    averageSalary: '$85,000 - $140,000',
    growthRate: '+28% (2023-2033)',
    requiredSkills: ['linux', 'networking', 'aws', 'python', 'siem', 'k8s'],
    matchPercentage: 0,
    nextSteps: [
      { id: 'sec-1', title: 'Threat Modeling', description: 'STRIDE, attack trees, risk assessment', priority: 'high', timeEstimate: '2-3 weeks' },
      { id: 'sec-2', title: 'Hardening & Monitoring', description: 'CIS benchmarks, SIEM tooling', priority: 'medium', timeEstimate: '2-3 weeks' }
    ],
    resources: [
      { id: 'sec-r1', title: 'OWASP Top 10', type: 'tutorial', url: 'https://owasp.org/www-project-top-ten/', provider: 'OWASP', free: true },
      { id: 'sec-r2', title: 'CIS Benchmarks', type: 'tutorial', url: 'https://www.cisecurity.org/cis-benchmarks', provider: 'CIS', free: true }
    ]
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    description: 'Drive product strategy, prioritize roadmaps, and align teams to deliver customer value.',
    averageSalary: '$95,000 - $160,000',
    growthRate: '+10% (2023-2033)',
    requiredSkills: ['communication', 'leadership', 'analytics', 'seo', 'product-thinking', 'project-management'],
    matchPercentage: 0,
    nextSteps: [
      { id: 'pm-1', title: 'Roadmapping', description: 'Prioritization frameworks, stakeholder alignment', priority: 'high', timeEstimate: '2-3 weeks' },
      { id: 'pm-2', title: 'Discovery', description: 'Customer interviews, problem validation', priority: 'high', timeEstimate: '2-3 weeks' }
    ],
    resources: [
      { id: 'pm-r1', title: 'SVPG Articles', type: 'tutorial', url: 'https://www.svpg.com/articles/', provider: 'SVPG', free: true },
      { id: 'pm-r2', title: 'Intercom on Product', type: 'book', url: 'https://www.intercom.com/resources/books/intercom-on-product-management', provider: 'Intercom', free: true }
    ]
  }
];

// Skill-to-career matching algorithm
export const getCareerRecommendations = (userSkills: string[]): CareerPath[] => {
  return careerPaths.map(career => {
    const matchingSkills = career.requiredSkills.filter(skill => 
      userSkills.includes(skill)
    ).length;
    
    const matchPercentage = Math.round((matchingSkills / career.requiredSkills.length) * 100);
    
    return {
      ...career,
      matchPercentage
    };
  })
  .filter(career => career.matchPercentage > 20) // Only show careers with >20% match
  .sort((a, b) => b.matchPercentage - a.matchPercentage); // Sort by match percentage
};