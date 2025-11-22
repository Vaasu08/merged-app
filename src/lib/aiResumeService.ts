import geminiService from './geminiService';

interface EnhancedExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  isCurrent: boolean;
  bulletPoints: string[];
  impactMetrics?: string;
}

interface EnhancedEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: number | null;
  isCurrent: boolean;
  relevantCoursework?: string[];
  achievements?: string[];
}

interface PersonalInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location?: string;
  isCurrent?: boolean;
  description?: string;
  achievements?: string[];
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  isCurrent?: boolean;
}

interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
}

interface ResumeEnhancementInput {
  personalInfo: PersonalInfo;
  summary?: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  targetRole?: string;
  targetIndustry?: string;
}


interface UserData extends PersonalInfo {
  skills?: string[];
  experience?: Experience[];
  targetRole?: string;
  experienceYears?: number;
}

export class AIResumeService {
  static async generateSummary(
    userData: UserData,
    jobDescription: string
  ): Promise<string> {
    const prompt = `You are an ELITE career strategist and professional resume writer who has crafted 10,000+ successful resumes for Fortune 500 hires, FAANG engineers, and executive leaders.

🎯 YOUR MISSION: Write a magnetic, ATS-optimized professional summary that will make recruiters WANT to interview this candidate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CANDIDATE PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Target Role: ${userData.targetRole || 'Professional role'}
⏱️ Experience: ${userData.experienceYears || 0}+ years
💡 Core Skills: ${userData.skills?.slice(0, 10).join(', ') || 'Various technical skills'}
📍 Location: ${userData.location || 'Available'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TARGET JOB (First 800 chars)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${jobDescription.slice(0, 800)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎓 MASTER SUMMARY FORMULA:

[Opening Hook] + [Expertise Areas] + [Key Achievements] + [Value Proposition]

STRUCTURE (60-85 words | 3-4 sentences):

Sentence 1 - IDENTITY & IMPACT:
"[Job Title] with [X] years specializing in [2-3 key areas from job desc] | Proven track record of [primary value: scaling, optimizing, leading, building]"

Sentence 2 - TECHNICAL DEPTH:
"Expert in [4-5 must-have technologies from job] with deep experience in [specific application: cloud infrastructure, full-stack development, data pipelines]"

Sentence 3 - ACHIEVEMENTS (QUANTIFIED):
"[Specific win with metrics: increased efficiency 40%, reduced costs $500K, led team of 12, deployed systems serving 5M users]"

Sentence 4 - ALIGNMENT & PASSION:
"Seeking to leverage [key skills] to [specific company goal from description] at [type of company: innovative tech firm, fast-growing startup]"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CRITICAL REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEYWORDS (MUST INCLUDE):
1. Extract 8-12 critical keywords from job description
2. Use EXACT terminology (if JD says "CI/CD" don't say "continuous integration")
3. Front-load most important keywords in first sentence
4. Natural integration - never keyword stuff

IMPACT METRICS:
- Include at least ONE quantifiable achievement
- Use real numbers if available, otherwise logical estimates
- Examples: "40% faster", "10-person team", "5M+ users", "$2M budget"

TONE:
- Confident but not arrogant ("proven track record" ✅ vs "best developer ever" ❌)
- Active voice only ("Led development" ✅ vs "Was responsible for" ❌)
- Technical but accessible (CTO and recruiter can both understand)

ATS OPTIMIZATION:
- Zero fluff words (passionate, motivated, team player)
- Zero buzzwords without context (synergy, innovative, dynamic)
- Industry-standard terminology only
- Clean, scannable formatting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 EXAMPLES (Study these patterns)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BAD (Generic, no keywords, no metrics):
"Motivated software developer with experience in programming. Team player who works well with others and is passionate about technology. Looking for new opportunities to grow my career."

GOOD (Keyword-rich, quantified, role-aligned):
"Full-Stack Engineer with 5+ years specializing in React, Node.js, and AWS cloud architecture | Built and scaled microservices handling 10M+ daily requests with 99.9% uptime | Expert in TypeScript, GraphQL, Docker, and CI/CD pipelines | Seeking to leverage cloud-native expertise to accelerate digital transformation at an enterprise SaaS platform."

BAD (Vague, no specifics):
"Experienced professional with various skills in technology and management."

GOOD (Specific, impactful):
"Senior DevOps Engineer with 7 years architecting infrastructure for high-traffic applications | Reduced deployment time from 4 hours to 15 minutes using Kubernetes and Terraform | Expert in AWS, Azure, Python automation, and GitOps workflows | Ready to optimize reliability engineering for a fintech unicorn."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY the professional summary text (no quotes, no markdown, no labels).
Length: 60-85 words | 3-4 sentences
First 5 words must grab attention.
Every word must earn its place.`;

    const result = await geminiService.generateText(prompt, {
      temperature: 0.7, // Creative but controlled
      maxOutputTokens: 300,
      useCache: false, // Each summary should be unique
    });
    
    return result.data.trim();
  }


  static async generateBulletPoints(
    roleData: { title?: string; company?: string; description?: string; achievements?: string[] },
    jobDescription: string
  ): Promise<string[]> {
    const prompt = `You are a MASTER resume writer who has helped 1000+ candidates land interviews at Google, Amazon, Microsoft, and top tech firms.

🎯 YOUR MISSION: Transform this work experience into 4-6 POWERFUL, ATS-optimized achievement bullets that will make recruiters say "I need to interview this person."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 ROLE TO ENHANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Position: ${roleData.title || 'Professional Role'}
Company: ${roleData.company || 'Tech Company'}
Responsibilities: ${roleData.description || 'Various technical responsibilities'}
Current Achievements: ${roleData.achievements?.join(' | ') || 'None listed'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TARGET JOB REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${jobDescription.slice(0, 800)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 THE WINNING BULLET FORMULA:

[ACTION VERB] + [What You Did] + [How/Tech Used] + [QUANTIFIED IMPACT]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 MASTER STRUCTURE (4-6 bullets)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bullet 1 - BIGGEST TECHNICAL WIN:
"[Architected/Engineered/Built] [specific system/feature] using [key technologies from JD], [resulting in X% improvement/serving Y users/$Z savings]"

Example: "Architected microservices platform using Node.js, Docker, and Kubernetes, reducing deployment time by 75% and enabling 50+ developers to ship features 3x faster"

Bullet 2 - LEADERSHIP/SCOPE IMPACT:
"[Led/Managed/Drove] [project/team] of [X people/systems], [achieving specific outcome with metrics]"

Example: "Led cross-functional team of 8 engineers to migrate legacy monolith to AWS cloud infrastructure, completing 6-month project 20% under budget while maintaining zero downtime"

Bullet 3 - TECHNICAL DEPTH:
"[Developed/Implemented/Optimized] [technical solution] with [specific technologies], [improving key metric: performance/reliability/security]"

Example: "Implemented CI/CD pipeline using Jenkins, Terraform, and AWS CodeDeploy, automating 90% of deployment process and reducing production incidents by 60%"

Bullet 4 - BUSINESS/USER IMPACT:
"[Enhanced/Improved/Delivered] [feature/product] that [served X users/generated $Y/increased Z metric]"

Example: "Delivered customer-facing dashboard using React and GraphQL, increasing user engagement by 45% and contributing to $2M ARR growth"

Bullet 5 - INNOVATION/PROBLEM SOLVING (if applicable):
"[Resolved/Eliminated/Transformed] [critical problem] by [creative solution with tech], [saving time/money/improving experience]"

Example: "Resolved critical performance bottleneck by implementing Redis caching and database query optimization, improving API response time from 2000ms to 150ms"

Bullet 6 - COLLABORATION/STANDARDS (if senior role):
"[Established/Mentored/Standardized] [processes/people/practices], [raising quality/productivity/knowledge across team]"

Example: "Established code review standards and mentored 5 junior developers, improving code quality scores by 40% and reducing bug rate by 35%"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CRITICAL REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTION VERBS (Choose power verbs):
✅ STRONG: Architected, Engineered, Spearheaded, Optimized, Delivered, Scaled, Automated, Reduced, Increased, Eliminated, Transformed, Led
❌ WEAK: Worked on, Helped with, Was responsible for, Participated in, Assisted, Involved in

KEYWORDS FROM JOB DESCRIPTION:
- Extract 10-15 MUST-HAVE technical keywords from job description
- Use EXACT terminology (React.js vs React, AWS vs Amazon Cloud)
- Distribute keywords naturally across all bullets
- NEVER force keywords awkwardly

QUANTIFIED METRICS (Every bullet needs a number):
- Performance: "60% faster", "latency reduced from 500ms to 80ms"
- Scale: "serving 5M users", "processing 10K requests/sec"
- Team: "led 8 engineers", "mentored 3 developers"  
- Money: "$500K cost reduction", "contributed to $2M revenue"
- Time: "delivered 2 months early", "reduced from 4 hours to 15 minutes"
- Quality: "bug rate down 40%", "99.9% uptime achieved"

If no exact metrics available, use logical estimates:
- "processing millions of requests daily"
- "used by 100+ enterprise clients"
- "improved performance significantly (est. 50%+)"

LENGTH & FORMATTING:
- Each bullet: 15-30 words (one line ideally, two max)
- Start with powerful action verb
- No periods at end of bullets
- Technical terms in context (not just listed)

RELEVANCE RANKING:
- Bullets should be ordered by impact (biggest win first)
- Focus on achievements that match target job requirements
- If current role is junior, emphasize technical depth over leadership
- If current role is senior, balance technical and leadership

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 QUALITY EXAMPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ BAD (No metrics, weak verb, vague):
"Worked on the backend system using various technologies"

✅ GOOD (Specific tech, quantified impact):
"Architected REST API using Node.js, Express, and PostgreSQL, handling 500K daily requests with 99.8% uptime and sub-200ms latency"

❌ BAD (Responsibilities, not achievements):
"Responsible for code reviews and testing"

✅ GOOD (Impact-focused with metrics):
"Established automated testing framework with Jest and Cypress, increasing code coverage from 45% to 92% and reducing production bugs by 65%"

❌ BAD (No context or numbers):
"Improved application performance significantly"

✅ GOOD (Specific, measurable, technical):
"Optimized React application by implementing code splitting, lazy loading, and service workers, reducing initial load time from 8s to 1.2s and improving Lighthouse score from 62 to 94"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return as clean JSON array (no markdown, no code blocks):

["Architected microservices platform using Node.js, Docker, and Kubernetes, reducing deployment time by 75% and enabling 50+ developers to ship features 3x faster", "Led cross-functional team of 8 engineers to migrate legacy monolith to AWS cloud infrastructure, completing 6-month project 20% under budget while maintaining zero downtime", "Implemented CI/CD pipeline using Jenkins, Terraform, and AWS CodeDeploy, automating 90% of deployment process and reducing production incidents by 60%", "Delivered customer-facing dashboard using React and GraphQL, increasing user engagement by 45% and contributing to $2M ARR growth"]

4-6 bullets total.
Each bullet = ONE achievement with metrics.
Every word must add value.`;

    const result = await geminiService.generateJSON<string[]>(prompt, {
      temperature: 0.75, // Creative but stay factual
      maxOutputTokens: 1024,
      useCache: false,
    });
    
    return result.data;
  }


  static async optimizeSkills(
    currentSkills: string[],
    jobDescription: string
  ): Promise<{ technical: string[]; tools: string[]; soft: string[] }> {
    const prompt = `You are a STRATEGIC ATS optimization expert who has analyzed 100,000+ job postings and knows exactly which skills get interviews.

🎯 YOUR MISSION: Transform this skills list into an ATS-optimized, keyword-rich powerhouse that will make recruiters' eyes light up.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CURRENT SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${currentSkills.join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TARGET JOB REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${jobDescription.slice(0, 1000)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎓 OPTIMIZATION STRATEGY:

STEP 1 - EXTRACT TARGET KEYWORDS:
- Identify MUST-HAVE technical skills (mentioned 2+ times in JD)
- Identify NICE-TO-HAVE skills (mentioned once in JD)
- Note exact terminology used (React vs React.js vs ReactJS)

STEP 2 - CATEGORIZE STRATEGICALLY:
TECHNICAL SKILLS: Core programming/development skills
- Languages: JavaScript, Python, TypeScript, Java, Go
- Frameworks: React, Node.js, Django, Spring Boot
- Databases: PostgreSQL, MongoDB, Redis, MySQL
- Architecture: Microservices, REST APIs, GraphQL

TOOLS & PLATFORMS: Development tools and cloud platforms
- Cloud: AWS (S3, EC2, Lambda), Azure, GCP
- DevOps: Docker, Kubernetes, Jenkins, Terraform
- Version Control: Git, GitHub, GitLab
- Monitoring: Datadog, New Relic, Prometheus

SOFT SKILLS: (Only include if explicitly mentioned in JD)
- Leadership, Agile/Scrum, Cross-functional collaboration
- NOTE: Most tech roles don't need soft skills section

STEP 3 - PRIORITIZATION RULES:
1. Put MUST-HAVE keywords first in each category
2. Use EXACT terminology from job description
3. Group related skills (all AWS services together)
4. Remove outdated tech unless explicitly requested
5. Add 2-3 relevant skills candidate likely has but didn't list

STEP 4 - QUALITY CHECKS:
✅ Every skill is relevant to target role
✅ Modern, in-demand technologies prioritized
✅ No generic buzzwords without technical substance
✅ Matches industry-standard terminology
✅ Logical grouping and ordering

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 STRUCTURE REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TECHNICAL SKILLS (10-18 items):
- Core languages/frameworks from JD listed first
- Most important to least important
- Group similar tech together
- Include version numbers if JD specifies (React 18, Node.js 20)

TOOLS & PLATFORMS (8-15 items):
- Cloud platforms and specific services (AWS Lambda, not just AWS)
- DevOps/CI/CD tools if relevant
- Development tools and environments
- Specific cloud services mentioned in JD

SOFT SKILLS (0-6 items):
- ONLY if job description explicitly mentions them
- ONLY if relevant to role (leadership for senior roles)
- Skip entirely for junior technical roles
- Never add generic skills (team player, motivated)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 EXAMPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INPUT: ["javascript", "react", "some backend"]
JOB: Full-stack developer, React, Node.js, AWS, TypeScript required

OUTPUT:
{
  "technical": [
    "TypeScript",
    "JavaScript (ES6+)", 
    "React.js",
    "Node.js",
    "Express.js",
    "RESTful APIs",
    "GraphQL",
    "HTML5/CSS3",
    "PostgreSQL",
    "MongoDB",
    "Jest",
    "React Testing Library"
  ],
  "tools": [
    "AWS (Lambda, S3, EC2, RDS)",
    "Docker",
    "Git/GitHub",
    "CI/CD (Jenkins)",
    "Webpack",
    "VS Code",
    "Postman"
  ],
  "soft": []
}

INPUT: ["Python", "Data Analysis", "Excel"]
JOB: Data Engineer, Python, Spark, Airflow, SQL, AWS required

OUTPUT:
{
  "technical": [
    "Python",
    "Apache Spark",
    "Apache Airflow",
    "SQL (PostgreSQL, Redshift)",
    "PySpark",
    "Pandas",
    "NumPy",
    "ETL Pipelines",
    "Data Modeling",
    "Scala"
  ],
  "tools": [
    "AWS (Redshift, S3, Glue, Lambda)",
    "Databricks",
    "Docker",
    "Kafka",
    "dbt",
    "Git",
    "Jupyter Notebooks",
    "Terraform"
  ],
  "soft": []
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON with no markdown code blocks, no commentary, no additional text:

{
  "technical": ["TypeScript", "React.js", "Node.js", "..."],
  "tools": ["AWS (Lambda, S3)", "Docker", "..."],
  "soft": ["Agile/Scrum", "Team Leadership"]
}

CRITICAL RULES:
- Use job description's EXACT terminology
- Order by importance (must-haves first)
- Be specific (AWS Lambda, not just AWS)
- Skip soft skills unless JD emphasizes them
- 10-18 technical, 8-15 tools, 0-6 soft
- Return PURE JSON only - no markdown formatting`;

    const result = await geminiService.generateJSON<{
      technical: string[];
      tools: string[];
      soft: string[];
    }>(prompt, {
      temperature: 0.4, // Balance creativity with accuracy
      maxOutputTokens: 1024,
      useCache: false,
    });
    
    return result.data;
  }
}