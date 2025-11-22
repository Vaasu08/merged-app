/**
 * AI Skill Graph Service
 * Analyzes user skills and calculates proximity to various career roles
 * Uses Google Gemini AI for intelligent role mapping
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import geminiService from './geminiService';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Define career roles with their typical skill requirements
export interface CareerRole {
  id: string;
  title: string;
  category: string;
  requiredSkills: string[];
  color: string;
  icon: string;
}

export interface SkillNode {
  id: string;
  label: string;
  type: 'skill' | 'role';
  level?: number; // User's proficiency level
  category?: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface SkillEdge {
  id: string;
  source: string;
  target: string;
  strength: number; // 0-1, how strong the connection is
  type?: 'has' | 'requires' | 'related';
}

export interface RoleProximity {
  roleId: string;
  roleName: string;
  proximity: number; // 0-100, how close user is to this role
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  color: string;
}

export interface SkillGraphData {
  nodes: SkillNode[];
  edges: SkillEdge[];
  roleProximities: RoleProximity[];
  userSkills: string[];
}

// Predefined career roles with skill requirements
const CAREER_ROLES: CareerRole[] = [
  {
    id: 'sde',
    title: 'Software Development Engineer',
    category: 'Engineering',
    requiredSkills: ['JavaScript', 'Python', 'Java', 'TypeScript', 'React', 'Node.js', 'Git', 'Data Structures', 'Algorithms', 'REST APIs', 'SQL', 'Testing'],
    color: '#3b82f6',
    icon: '💻'
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    category: 'Engineering',
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Python', 'Bash', 'Terraform', 'Jenkins', 'Git', 'Monitoring', 'Networking'],
    color: '#10b981',
    icon: '⚙️'
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data',
    requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Data Visualization', 'R', 'Jupyter', 'Deep Learning'],
    color: '#8b5cf6',
    icon: '📊'
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    category: 'Engineering',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Responsive Design', 'Tailwind CSS', 'Vue.js', 'Webpack', 'Git', 'UI/UX', 'Testing'],
    color: '#ec4899',
    icon: '🎨'
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    category: 'Engineering',
    requiredSkills: ['Node.js', 'Python', 'Java', 'SQL', 'REST APIs', 'GraphQL', 'Microservices', 'MongoDB', 'PostgreSQL', 'Redis', 'Authentication', 'Security'],
    color: '#f59e0b',
    icon: '🔧'
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    category: 'Engineering',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'SQL', 'REST APIs', 'Git', 'HTML', 'CSS', 'MongoDB', 'Express', 'Testing'],
    color: '#06b6d4',
    icon: '🚀'
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    category: 'Data',
    requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Deep Learning', 'Neural Networks', 'MLOps', 'Docker', 'Kubernetes', 'AWS', 'Git', 'Model Deployment'],
    color: '#6366f1',
    icon: '🤖'
  },
  {
    id: 'cloud-architect',
    title: 'Cloud Architect',
    category: 'Infrastructure',
    requiredSkills: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'Networking', 'Security', 'Microservices', 'Serverless', 'CI/CD', 'Cost Optimization'],
    color: '#14b8a6',
    icon: '☁️'
  },
  {
    id: 'mobile-dev',
    title: 'Mobile Developer',
    category: 'Engineering',
    requiredSkills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI', 'REST APIs', 'Firebase', 'App Store', 'Git', 'TypeScript', 'Testing', 'Performance'],
    color: '#a855f7',
    icon: '📱'
  },
  {
    id: 'security-engineer',
    title: 'Security Engineer',
    category: 'Security',
    requiredSkills: ['Cybersecurity', 'Penetration Testing', 'Network Security', 'Linux', 'Python', 'Encryption', 'OWASP', 'Security Audits', 'Firewalls', 'Vulnerability Assessment', 'Compliance', 'Incident Response'],
    color: '#ef4444',
    icon: '🔒'
  }
];

class SkillGraphService {
  private model;
  private hasApiKey: boolean;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.hasApiKey = !!apiKey && apiKey.length > 0;
    if (this.hasApiKey) {
      this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    } else {
      console.warn('⚠️ Gemini API key not configured. Skill graph AI insights will use fallback recommendations.');
      this.model = null;
    }
  }

  /**
   * Normalize skill names for better matching
   */
  private normalizeSkill(skill: string): string {
    return skill.toLowerCase().trim()
      .replace(/[^a-z0-9\s+#]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Calculate skill match percentage between user skills and role requirements
   */
  private calculateSkillMatch(userSkills: string[], requiredSkills: string[]): number {
    const normalizedUserSkills = userSkills.map(s => this.normalizeSkill(s));
    const normalizedRequiredSkills = requiredSkills.map(s => this.normalizeSkill(s));

    let matchCount = 0;
    for (const required of normalizedRequiredSkills) {
      for (const user of normalizedUserSkills) {
        if (user.includes(required) || required.includes(user)) {
          matchCount++;
          break;
        }
      }
    }

    return (matchCount / requiredSkills.length) * 100;
  }

  /**
   * Use AI to get additional skill insights and recommendations
   */
  private async getAIInsights(userSkills: string[], role: CareerRole, matchedSkills: string[], missingSkills: string[]): Promise<string[]> {
    // Return fallback if no API key
    if (!this.hasApiKey || !this.model) {
      console.warn('⚠️ API key not available, using fallback recommendations');
      return [
        'Learn ' + (missingSkills.slice(0, 2).join(' and ') || 'core technologies'),
        'Build projects showcasing your skills',
        'Get certified in core technologies'
      ];
    }

    try {
      const prompt = `
You are a career advisor AI. A user has these skills: ${userSkills.join(', ')}

They are ${(matchedSkills.length / role.requiredSkills.length * 100).toFixed(0)}% ready for the role: ${role.title}

Matched skills: ${matchedSkills.join(', ') || 'None'}
Missing skills: ${missingSkills.join(', ') || 'None'}

Provide exactly 3 SHORT, actionable recommendations (max 10 words each) to help them progress toward this role.
Format as a simple list, one per line, no numbering or bullets.
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse recommendations (split by newlines, filter empty, take first 3)
      const recommendations = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.length < 100)
        .slice(0, 3);

      return recommendations.length > 0 ? recommendations : [
        'Build projects to practice skills',
        'Take online courses in missing areas',
        'Contribute to open-source projects'
      ];
    } catch (error) {
      console.warn('⚠️ AI insights failed, using fallback:', error);
      return [
        'Learn ' + (missingSkills.slice(0, 2).join(' and ') || 'core technologies'),
        'Build projects showcasing your skills',
        'Get certified in core technologies'
      ];
    }
  }

  /**
   * Calculate proximity to each career role
   */
  async calculateRoleProximities(userSkills: string[]): Promise<RoleProximity[]> {
    const proximities: RoleProximity[] = [];

    for (const role of CAREER_ROLES) {
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      // Find matched and missing skills
      for (const requiredSkill of role.requiredSkills) {
        const isMatched = userSkills.some(userSkill => 
          this.normalizeSkill(userSkill).includes(this.normalizeSkill(requiredSkill)) ||
          this.normalizeSkill(requiredSkill).includes(this.normalizeSkill(userSkill))
        );

        if (isMatched) {
          matchedSkills.push(requiredSkill);
        } else {
          missingSkills.push(requiredSkill);
        }
      }

      const proximity = this.calculateSkillMatch(userSkills, role.requiredSkills);

      // Get AI-powered recommendations
      const recommendations = await this.getAIInsights(userSkills, role, matchedSkills, missingSkills);

      proximities.push({
        roleId: role.id,
        roleName: role.title,
        proximity: Math.round(proximity),
        matchedSkills,
        missingSkills: missingSkills.slice(0, 5), // Limit to top 5
        recommendations,
        color: role.color
      });
    }

    // Sort by proximity (highest first)
    return proximities.sort((a, b) => b.proximity - a.proximity);
  }

  /**
   * Generate complete skill graph data structure
   * Requires minimum 5 skills for meaningful analysis
   */
  async generateSkillGraph(userSkills: string[]): Promise<SkillGraphData> {
    if (!userSkills || userSkills.length === 0) {
      throw new Error('No skills provided');
    }

    if (userSkills.length < 5) {
      throw new Error('Minimum 5 skills required for accurate analysis');
    }

    // Calculate role proximities
    const roleProximities = await this.calculateRoleProximities(userSkills);

    // Create nodes
    const nodes: SkillNode[] = [];
    const edges: SkillEdge[] = [];

    // Add skill nodes (user's skills)
    userSkills.forEach((skill, index) => {
      nodes.push({
        id: `skill-${index}`,
        label: skill,
        type: 'skill',
        level: 1,
        category: 'user-skill'
      });
    });

    // Add role nodes (only roles with >20% proximity)
    const relevantRoles = roleProximities.filter(rp => rp.proximity >= 20);
    relevantRoles.forEach((rp, index) => {
      const role = CAREER_ROLES.find(r => r.id === rp.roleId);
      if (role) {
        nodes.push({
          id: `role-${role.id}`,
          label: `${role.icon} ${role.title}`,
          type: 'role',
          category: role.category
        });

        // Create edges from skills to roles
        userSkills.forEach((skill, skillIndex) => {
          if (rp.matchedSkills.some(ms => 
            this.normalizeSkill(ms).includes(this.normalizeSkill(skill)) ||
            this.normalizeSkill(skill).includes(this.normalizeSkill(ms))
          )) {
            edges.push({
              id: `edge-skill${skillIndex}-role${role.id}`,
              source: `skill-${skillIndex}`,
              target: `role-${role.id}`,
              strength: rp.proximity / 100,
              type: 'has'
            });
          }
        });
      }
    });

    return {
      nodes,
      edges,
      roleProximities,
      userSkills
    };
  }
}

export const skillGraphService = new SkillGraphService();
