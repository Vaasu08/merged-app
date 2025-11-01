import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { HorizonLogo } from '@/components/HorizonLogo';
import { 
  Heart, MessageCircle, Share2, ArrowLeft, BookOpen, Clock,
  Calendar, Tag, User, ChevronLeft, ChevronRight, MessageSquare, FileText, 
  Target, TrendingUp, Users
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BlogPost {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  image: string;
}

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(0);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  // This should match the blogPosts from Blog.tsx
  const allBlogPosts: BlogPost[] = [
    {
      id: 1,
      title: "How AI is Transforming Career Guidance in 2025",
      author: "Sarah Chen",
      authorAvatar: "SC",
      date: "Dec 15, 2024",
      readTime: "5 min read",
      excerpt: "Discover how artificial intelligence is revolutionizing the way we approach career planning and job matching. Learn about the latest trends and how HORIZON is leading the charge.",
      content: "In 2025, AI-powered career guidance has become more sophisticated than ever. Artificial intelligence is no longer just a buzzword—it's a transformative force reshaping how individuals discover, plan, and navigate their career paths.\n\n**The Evolution of Career Guidance**\n\nTraditional career counseling relied heavily on human intuition and standardized tests. While these methods had their merits, they often lacked the depth and personalization needed for today's rapidly evolving job market. AI has changed this landscape entirely, offering unprecedented insights through data analysis and machine learning.\n\n**Personalized Career Matching**\n\nOne of the most significant breakthroughs is AI's ability to analyze vast amounts of data—from job market trends to individual skills and preferences—to create highly personalized career recommendations. Platforms like HORIZON use advanced algorithms to match individuals with career paths that align not just with their skills, but with their values, work style, and long-term goals.\n\n**Real-Time Market Insights**\n\nAI systems continuously monitor job markets, industry trends, and emerging opportunities. This means career recommendations aren't based on outdated information but reflect real-time changes in the economy. When new roles emerge or industries shift, AI-powered platforms adapt instantly, providing users with the most current and relevant guidance.\n\n**Skill Gap Analysis**\n\nPerhaps one of the most valuable AI applications in career guidance is skill gap analysis. By comparing an individual's current skillset with the requirements of their desired career path, AI can identify specific gaps and recommend targeted learning opportunities. This precision saves time and ensures that skill development efforts are strategic and effective.\n\n**The HORIZON Advantage**\n\nAt HORIZON, we've integrated cutting-edge AI technology to provide users with a comprehensive career guidance experience. Our platform combines:\n\n- Advanced skill assessments\n- Real-time job market analysis\n- Personalized career recommendations\n- Learning pathway suggestions\n- Industry trend insights\n\n**Looking Ahead**\n\nAs AI technology continues to evolve, we can expect even more sophisticated career guidance tools. Natural language processing will enable more intuitive interactions, while predictive analytics will help individuals anticipate industry changes and prepare accordingly.\n\nThe future of career guidance is here, and it's powered by AI. Whether you're just starting your career journey or looking to make a strategic pivot, AI-powered platforms like HORIZON provide the insights and tools needed to navigate today's complex job market with confidence.",
      category: "AI & Technology",
      tags: ["AI", "Career Guidance", "Technology"],
      likes: 142,
      comments: 28,
      shares: 45,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800"
    },
    {
      id: 2,
      title: "Mastering the Art of Skill Gap Analysis",
      author: "Michael Rodriguez",
      authorAvatar: "MR",
      date: "Dec 14, 2024",
      readTime: "7 min read",
      excerpt: "Learn how to identify skill gaps effectively and create actionable learning paths to advance your career. A comprehensive guide to skill development.",
      content: "Skill gap analysis is crucial for career growth. Understanding where you stand versus where you need to be is the first step toward meaningful professional development.\n\n**What is Skill Gap Analysis?**\n\nSkill gap analysis is the process of comparing your current skills with the skills required for your desired role or career path. It identifies specific areas where you need to improve and helps you prioritize learning efforts.\n\n**Why It Matters**\n\nIn today's rapidly changing job market, skills become obsolete quickly. A skill gap analysis helps you:\n\n- Stay competitive in your field\n- Make informed decisions about professional development\n- Avoid wasting time on irrelevant training\n- Focus resources on high-impact learning\n\n**How to Conduct a Skill Gap Analysis**\n\n1. **Define Your Target Role**: Be specific about the position or career path you're aiming for.\n\n2. **List Required Skills**: Research job descriptions, industry standards, and speak with professionals in your target role.\n\n3. **Assess Current Skills**: Honestly evaluate your current skill level for each required competency.\n\n4. **Identify Gaps**: Compare required skills with your current abilities to find gaps.\n\n5. **Prioritize**: Rank gaps by importance and feasibility of closing them.\n\n6. **Create an Action Plan**: Develop a learning strategy to address priority gaps.\n\n**Common Skill Categories**\n\n- **Technical Skills**: Programming languages, software proficiency, industry-specific tools\n- **Soft Skills**: Communication, leadership, problem-solving\n- **Industry Knowledge**: Trends, regulations, best practices\n- **Certifications**: Professional credentials that validate expertise\n\n**Using Tools and Technology**\n\nModern platforms like HORIZON leverage AI to automate skill gap analysis, providing:\n\n- Automated skill assessments\n- Personalized learning recommendations\n- Progress tracking\n- Industry benchmark comparisons\n\n**Overcoming Challenges**\n\nCommon challenges in skill gap analysis include:\n\n- **Overestimating abilities**: Be honest in self-assessment\n- **Unclear goals**: Define your target role clearly\n- **Information overload**: Focus on priority skills first\n- **Lack of time**: Use technology to streamline the process\n\n**Building Your Learning Path**\n\nOnce you've identified gaps, create a structured learning path:\n\n1. Start with foundational skills\n2. Progress to intermediate competencies\n3. Master advanced techniques\n4. Stay updated with continuous learning\n\n**Measuring Progress**\n\nRegular reassessment is key. Set milestones and evaluate progress:\n\n- Monthly skill assessments\n- Project-based validation\n- Peer feedback\n- Professional certifications\n\n**The Continuous Process**\n\nSkill gap analysis isn't a one-time activity. Industries evolve, roles change, and new technologies emerge. Make it a regular practice to stay ahead of the curve and maintain your competitive edge.",
      category: "Career Development",
      tags: ["Skills", "Learning", "Career Growth"],
      likes: 98,
      comments: 19,
      shares: 32,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800"
    },
    {
      id: 3,
      title: "Interview Preparation: A Complete Guide",
      author: "Emily Watson",
      authorAvatar: "EW",
      date: "Dec 13, 2024",
      readTime: "10 min read",
      excerpt: "Everything you need to know to ace your next interview. From preparation strategies to handling tough questions with confidence.",
      content: "Interview preparation is more than just rehearsing answers. It's about understanding the company, articulating your value, and demonstrating cultural fit.\n\n**Pre-Interview Research**\n\nThorough research sets successful candidates apart. Before your interview:\n\n- **Company History**: Understand the company's mission, values, and culture\n- **Recent News**: Stay updated on company developments and industry trends\n- **Role Requirements**: Study the job description carefully\n- **Interviewer Background**: Research your interviewer on LinkedIn\n- **Competitors**: Understand the competitive landscape\n\n**Common Interview Formats**\n\n1. **Phone/Video Screening**: Initial screening to assess basic qualifications\n2. **Technical Interviews**: Skills assessment for technical roles\n3. **Behavioral Interviews**: Questions about past experiences using STAR method\n4. **Panel Interviews**: Multiple interviewers assessing different aspects\n5. **Case Study Interviews**: Problem-solving scenarios\n\n**The STAR Method**\n\nStructure behavioral interview answers using STAR:\n\n- **Situation**: Set the context\n- **Task**: Describe your responsibility\n- **Action**: Explain what you did\n- **Result**: Share the outcome\n\n**Handling Common Questions**\n\n**Tell me about yourself**: Provide a concise professional summary (2-3 minutes) highlighting relevant experience.\n\n**Why do you want this job?**: Connect your values and goals with the role and company.\n\n**What are your weaknesses?**: Be honest but show growth. Choose a real weakness you're actively improving.\n\n**Where do you see yourself in 5 years?**: Align your goals with the company's growth trajectory.\n\n**Why should we hire you?**: Summarize your unique value proposition.\n\n**Questions to Ask**\n\nAsking thoughtful questions demonstrates genuine interest:\n\n- What does success look like in this role?\n- How does this team collaborate?\n- What are the biggest challenges facing the team?\n- What opportunities are there for professional development?\n- What do you enjoy most about working here?\n\n**Technical Interview Preparation**\n\nFor technical roles:\n\n- Review fundamental concepts\n- Practice coding problems\n- Prepare for system design questions\n- Study relevant frameworks and tools\n- Practice explaining your thought process\n\n**Virtual Interview Tips**\n\n- Test technology beforehand\n- Ensure good lighting and clear audio\n- Choose a professional background\n- Minimize distractions\n- Maintain eye contact with the camera\n\n**Handling Difficult Questions**\n\n- **Employment Gaps**: Be honest and focus on what you learned during the gap\n- **Job Hopping**: Emphasize growth and diverse experience\n- **Salary Expectations**: Research market rates and provide a range\n- **Failure Questions**: Show resilience and learning from mistakes\n\n**Post-Interview Follow-up**\n\n- Send a thank-you email within 24 hours\n- Reference specific conversation points\n- Reiterate your interest\n- Be patient and professional\n\n**Using AI Interview Simulators**\n\nTools like HORIZON's interview simulator provide:\n\n- Realistic interview practice\n- AI-powered feedback\n- Common question practice\n- Confidence building\n\n**Building Confidence**\n\nConfidence comes from preparation:\n\n- Practice regularly\n- Review your accomplishments\n- Prepare examples for common questions\n- Research thoroughly\n- Visualize success\n\n**The Final Checklist**\n\nBefore your interview:\n\n✓ Research complete\n✓ Questions prepared\n✓ Outfit ready\n✓ Portfolio/portfolio updated\n✓ References notified\n✓ Route/method of attendance confirmed\n✓ Questions for interviewer ready\n\nRemember, interviews are two-way conversations. While the company evaluates you, you should also assess whether it's the right fit for your career goals.",
      category: "Interview Tips",
      tags: ["Interview", "Preparation", "Success"],
      likes: 203,
      comments: 42,
      shares: 67,
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800"
    },
    {
      id: 4,
      title: "Building Your Career Roadmap: A 5-Year Plan",
      author: "David Kim",
      authorAvatar: "DK",
      date: "Dec 12, 2024",
      readTime: "8 min read",
      excerpt: "Create a strategic 5-year career roadmap that aligns with your goals and aspirations. Learn how to set milestones and track progress.",
      content: "A well-defined career roadmap is your blueprint for success. It provides direction, helps you make informed decisions, and keeps you focused on long-term goals.\n\n**Why a 5-Year Plan?**\n\nA 5-year career roadmap balances immediate goals with long-term vision. It's far enough ahead to see significant progress, but not so distant that it feels unattainable. This timeframe allows for:\n\n- Strategic skill development\n- Multiple career milestones\n- Industry trend adaptation\n- Work-life balance planning\n\n**Starting Your Roadmap**\n\n1. **Self-Assessment**: Understand your strengths, weaknesses, values, and interests\n2. **Goal Setting**: Define what success looks like in 5 years\n3. **Research**: Explore career paths, roles, and requirements\n4. **Skills Analysis**: Identify skills needed for your target role\n5. **Milestone Planning**: Break down the journey into achievable steps\n\n**Setting SMART Goals**\n\nEnsure your roadmap goals are:\n\n- **Specific**: Clear and well-defined\n- **Measurable**: Quantifiable success criteria\n- **Achievable**: Realistic given your circumstances\n- **Relevant**: Aligned with your values and interests\n- **Time-bound**: With clear deadlines\n\n**Year-by-Year Planning**\n\n**Year 1: Foundation**\n- Establish yourself in current role\n- Build core competencies\n- Expand professional network\n- Complete relevant certifications\n\n**Year 2: Growth**\n- Take on increased responsibilities\n- Develop leadership skills\n- Build industry reputation\n- Explore adjacent opportunities\n\n**Year 3: Specialization**\n- Become an expert in your area\n- Lead projects or initiatives\n- Mentor others\n- Consider advanced education\n\n**Year 4: Advancement**\n- Pursue promotion or new role\n- Build thought leadership\n- Expand influence\n- Consider entrepreneurship or consulting\n\n**Year 5: Mastery**\n- Achieve target role/position\n- Influence industry direction\n- Build legacy\n- Plan next phase\n\n**Skills Development Strategy**\n\nPlan skill acquisition systematically:\n\n- **Year 1-2**: Core technical and soft skills\n- **Year 2-3**: Specialized domain knowledge\n- **Year 3-4**: Leadership and strategic thinking\n- **Year 4-5**: Industry expertise and innovation\n\n**Building Your Network**\n\nNetworking is crucial for career advancement:\n\n- Attend industry events regularly\n- Join professional associations\n- Connect with mentors and peers\n- Engage on professional platforms\n- Build genuine relationships\n\n**Measuring Progress**\n\nTrack your roadmap progress:\n\n- **Quarterly Reviews**: Assess progress every 3 months\n- **Annual Assessments**: Comprehensive yearly evaluation\n- **Milestone Celebrations**: Acknowledge achievements\n- **Course Corrections**: Adjust as needed\n\n**Adapting to Change**\n\nCareer roadmaps should be flexible:\n\n- Review and update regularly\n- Adjust for industry changes\n- Incorporate new opportunities\n- Balance personal and professional goals\n\n**Using Technology**\n\nPlatforms like HORIZON offer:\n\n- Roadmap visualization tools\n- Progress tracking\n- Skill gap analysis\n- Learning recommendations\n- Industry trend insights\n\n**Common Roadmap Mistakes**\n\nAvoid these pitfalls:\n\n- Setting goals that are too vague\n- Ignoring work-life balance\n- Focusing only on promotions\n- Neglecting skill development\n- Inflexible planning\n\n**Balancing Ambition with Reality**\n\nWhile it's important to aim high:\n\n- Set achievable milestones\n- Celebrate small wins\n- Learn from setbacks\n- Maintain work-life balance\n- Adjust expectations when needed\n\n**The Role of Mentors**\n\nMentors provide:\n\n- Industry insights\n- Career guidance\n- Networking opportunities\n- Accountability\n- Perspective\n\n**Creating Your Roadmap**\n\nStart today:\n\n1. Reflect on your current position\n2. Envision your ideal future\n3. Research paths to get there\n4. Break it down into milestones\n5. Create an action plan\n6. Start executing\n7. Review and adjust regularly\n\nRemember, a career roadmap is a living document. Regular reviews ensure it remains relevant and achievable as you grow and industries evolve.",
      category: "Career Planning",
      tags: ["Roadmap", "Planning", "Goals"],
      likes: 156,
      comments: 35,
      shares: 51,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
    },
    {
      id: 5,
      title: "Resume Optimization for ATS Systems",
      author: "Lisa Zhang",
      authorAvatar: "LZ",
      date: "Dec 11, 2024",
      readTime: "6 min read",
      excerpt: "Learn how to optimize your resume to pass Applicant Tracking Systems and increase your chances of landing interviews.",
      content: "ATS systems scan thousands of resumes daily. Understanding how to optimize your resume for these systems is crucial for getting noticed.\n\n**What is an ATS?**\n\nApplicant Tracking Systems (ATS) are software applications that recruiters use to manage the hiring process. They parse resumes, rank candidates, and help recruiters identify the best matches for open positions.\n\n**Why ATS Optimization Matters**\n\nStudies show that up to 75% of resumes are rejected by ATS before a human ever sees them. If your resume doesn't pass the ATS, your qualifications don't matter—you won't get an interview.\n\n**How ATS Systems Work**\n\n1. **Resume Parsing**: The system extracts information from your resume\n2. **Keyword Matching**: Matches your skills and experience against job requirements\n3. **Ranking**: Scores your resume based on relevance\n4. **Filtering**: Separates qualified candidates from others\n\n**Key ATS Optimization Strategies**\n\n**1. Use Standard Formatting**\n\n- Use common fonts (Arial, Calibri, Times New Roman)\n- Avoid tables, graphics, and images\n- Use standard section headings\n- Save as .docx or .pdf (check preference)\n- Use consistent formatting throughout\n\n**2. Include Relevant Keywords**\n\n- Study the job description carefully\n- Use exact keywords from the job posting\n- Include industry-specific terminology\n- Mention tools, technologies, and certifications\n- Use variations of important terms\n\n**3. Optimize Section Headings**\n\nUse standard headings that ATS can recognize:\n\n- \"Work Experience\" or \"Professional Experience\"\n- \"Education\"\n- \"Skills\"\n- \"Certifications\"\n\nAvoid creative headings that ATS might not recognize.\n\n**4. File Format Considerations**\n\n- **.docx**: Generally well-supported by ATS\n- **.pdf**: Widely accepted, ensure it's text-readable\n- **.txt**: Universal compatibility but loses formatting\n\n**5. Keyword Placement**\n\n- Place important keywords early in your resume\n- Include in summary/objective\n- Mention in job descriptions\n- List in skills section\n\n**6. Quantify Achievements**\n\nATS and recruiters value specific metrics:\n\n- Increased revenue by 25%\n- Managed team of 10\n- Reduced costs by $50,000\n- Improved efficiency by 30%\n\n**7. Skills Section Optimization**\n\n- List technical skills prominently\n- Include both hard and soft skills\n- Match skills to job requirements\n- Use industry-standard terminology\n\n**Common ATS Mistakes**\n\n- Complex formatting and graphics\n- Uncommon fonts\n- Tables for layout\n- Headers and footers\n- Images and logos\n- Creative section names\n- Keyword stuffing\n- Spelling errors\n\n**Testing Your Resume**\n\nBefore submitting:\n\n1. Use ATS simulation tools\n2. Check keyword density\n3. Verify readability\n4. Test different file formats\n5. Get human feedback\n\n**ATS-Friendly Resume Structure**\n\n1. **Header**: Name, contact information\n2. **Summary**: Brief professional overview with keywords\n3. **Experience**: Reverse chronological with achievements\n4. **Education**: Degree, institution, graduation date\n5. **Skills**: Technical and soft skills\n6. **Certifications**: Relevant professional credentials\n\n**Industry-Specific Tips**\n\n**Technology Roles**: Emphasize programming languages, frameworks, tools\n\n**Sales**: Highlight metrics, quotas, achievements\n\n**Marketing**: Include campaigns, ROI, tools used\n\n**Healthcare**: List certifications, specialties, patient outcomes\n\n**Using HORIZON's ATS Scorer**\n\nHORIZON's ATS assessment tool provides:\n\n- Instant ATS compatibility score\n- Keyword analysis\n- Formatting recommendations\n- Job-specific optimization suggestions\n- Detailed improvement feedback\n\n**Balancing ATS and Human Appeal**\n\nWhile ATS optimization is crucial, your resume must also appeal to human recruiters:\n\n- Maintain professional appearance\n- Tell your story compellingly\n- Highlight unique achievements\n- Show personality where appropriate\n\n**Continuous Improvement**\n\nResume optimization is ongoing:\n\n- Update for each application\n- Tailor keywords per role\n- Incorporate new skills\n- Refine based on feedback\n- Track application success rates\n\nRemember, ATS optimization gets you in the door, but your actual qualifications and interview performance get you the job. Balance technical optimization with authentic representation of your skills and experience.",
      category: "Resume Tips",
      tags: ["Resume", "ATS", "Job Search"],
      likes: 187,
      comments: 41,
      shares: 73,
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800"
    },
    {
      id: 6,
      title: "The Future of Remote Work: Trends and Opportunities",
      author: "James Wilson",
      authorAvatar: "JW",
      date: "Dec 10, 2024",
      readTime: "9 min read",
      excerpt: "Explore the evolving landscape of remote work and discover new opportunities for career growth in a digital-first world.",
      content: "Remote work has transformed the professional landscape. What started as a necessity has become a permanent shift, creating new opportunities and challenges.\n\n**The Remote Work Revolution**\n\nRemote work is no longer a trend—it's the new normal. Companies worldwide have embraced flexible work arrangements, fundamentally changing how we think about careers and workplaces.\n\n**Current Remote Work Statistics**\n\n- Over 40% of the workforce works remotely at least part-time\n- Remote work opportunities have increased 150% since 2020\n- 73% of professionals want flexible work options\n- Companies report productivity increases with remote teams\n\n**Benefits of Remote Work**\n\n**For Employees:**\n\n- Improved work-life balance\n- Reduced commute time and costs\n- Greater flexibility\n- Access to global opportunities\n- Customized work environment\n\n**For Employers:**\n\n- Access to global talent pool\n- Reduced office costs\n- Higher employee satisfaction\n- Improved retention\n- Increased productivity\n\n**Remote Work Models**\n\n1. **Fully Remote**: Work from anywhere, no office requirement\n2. **Hybrid**: Combination of remote and office work\n3. **Flexible**: Choose work location based on needs\n4. **Remote-First**: Company designed around remote work\n\n**In-Demand Remote Skills**\n\nTo thrive in remote work:\n\n- **Communication**: Written and verbal clarity\n- **Time Management**: Self-discipline and organization\n- **Technical Proficiency**: Digital tools and platforms\n- **Collaboration**: Virtual teamwork\n- **Adaptability**: Flexibility and resilience\n\n**Remote-Friendly Industries**\n\nSome industries are naturally suited for remote work:\n\n- Technology and Software Development\n- Marketing and Digital Media\n- Customer Service\n- Consulting\n- Content Creation\n- Education and Training\n- Finance and Accounting\n\n**Building a Remote Career**\n\n1. **Develop Remote Skills**: Focus on communication and self-management\n2. **Create a Productive Workspace**: Designate a dedicated work area\n3. **Build Online Presence**: Professional profiles and portfolio\n4. **Network Virtually**: Join remote work communities\n5. **Demonstrate Results**: Focus on outcomes, not hours\n\n**Challenges and Solutions**\n\n**Isolation**:\n- Join virtual communities\n- Schedule regular social interactions\n- Participate in online events\n\n**Communication:**\n- Overcommunicate proactively\n- Use multiple communication channels\n- Schedule regular check-ins\n\n**Work-Life Balance:**\n- Set clear boundaries\n- Designate work hours\n- Create morning and evening routines\n\n**Career Growth:**\n- Seek remote mentorship\n- Request stretch assignments\n- Document achievements\n- Network intentionally\n\n**Remote Work Tools**\n\nEssential tools for remote professionals:\n\n- **Communication**: Slack, Microsoft Teams, Zoom\n- **Project Management**: Asana, Trello, Monday.com\n- **Collaboration**: Google Workspace, Notion\n- **Time Tracking**: Toggl, RescueTime\n- **Video Conferencing**: Zoom, Google Meet\n\n**Future Trends**\n\nLooking ahead:\n\n- **Digital Nomadism**: Working while traveling\n- **Virtual Reality Workspaces**: Immersive collaboration\n- **AI Integration**: Automated task management\n- **Global Talent Pools**: Borderless hiring\n- **Results-Based Culture**: Focus on outcomes\n\n**Preparing for Remote Opportunities**\n\n1. **Assess Remote Readiness**: Evaluate your suitability\n2. **Develop Relevant Skills**: Communication, technology\n3. **Build Remote Portfolio**: Showcase remote work capability\n4. **Network in Remote Communities**: Connect with remote professionals\n5. **Apply Strategically**: Target remote-friendly companies\n\n**Negotiating Remote Work**\n\nWhen seeking remote opportunities:\n\n- Research company remote policies\n- Highlight remote work experience\n- Propose trial period\n- Address concerns proactively\n- Emphasize productivity and results\n\n**The Hybrid Future**\n\nMany companies are adopting hybrid models:\n\n- Flexibility for employees\n- Office presence for collaboration\n- Best of both worlds\n- Requires new management approaches\n\n**Remote Work Best Practices**\n\n- Establish routines\n- Dress professionally for video calls\n- Invest in quality equipment\n- Maintain regular communication\n- Set boundaries with family/friends\n- Take regular breaks\n- Stay connected with team\n\n**Global Opportunities**\n\nRemote work opens global opportunities:\n\n- Work for international companies\n- Serve clients worldwide\n- Build diverse professional network\n- Experience different cultures\n- Access higher-paying markets\n\nRemote work isn't going away—it's evolving. Professionals who adapt to this new reality and develop remote-specific skills will have significant advantages in the future job market.",
      category: "Work Trends",
      tags: ["Remote Work", "Trends", "Opportunities"],
      likes: 124,
      comments: 27,
      shares: 38,
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800"
    }
  ];

  useEffect(() => {
    if (id) {
      const postId = parseInt(id);
      const post = allBlogPosts.find(p => p.id === postId);
      if (post) {
        setCurrentPost(post);
        setCurrentLikes(post.likes);
        
        // Find related posts (same category, different post)
        const related = allBlogPosts
          .filter(p => p.category === post.category && p.id !== post.id)
          .slice(0, 3);
        setRelatedPosts(related);
      }
    }
  }, [id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setCurrentLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    if (navigator.share && currentPost) {
      try {
        await navigator.share({
          title: currentPost.title,
          text: currentPost.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    }
  };

  const formatContent = (content: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, index) => {
      // Check if it's a heading (starts with **)
      if (para.startsWith('**') && para.endsWith('**')) {
        const headingText = para.slice(2, -2);
        return (
          <h3 key={index} className="text-2xl font-bold text-white mt-8 mb-4">
            {headingText}
          </h3>
        );
      }
      
      // Check if it starts with ** (bold)
      if (para.includes('**')) {
        const parts = para.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="text-white/90 leading-relaxed mb-4">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
              }
              return <span key={partIndex}>{part}</span>;
            })}
          </p>
        );
      }

      // Check if it's a list (starts with -)
      if (para.trim().startsWith('-')) {
        const items = para.split('\n').filter(item => item.trim().startsWith('-'));
        return (
          <ul key={index} className="list-disc list-inside text-white/90 mb-4 space-y-2 ml-4">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{item.trim().slice(1).trim()}</li>
            ))}
          </ul>
        );
      }

      return (
        <p key={index} className="text-white/90 leading-relaxed mb-4">
          {para}
        </p>
      );
    });
  };

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <Button onClick={() => navigate('/blog')} className="bg-purple-600 hover:bg-purple-700">
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-purple-900/30"
      >
        <div className="flex items-center justify-between w-full px-6 py-4">
          <motion.div 
            className="flex items-center gap-4 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
          >
            <HorizonLogo size="md" variant="light" />
          </motion.div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to='/' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
              HOME
            </Link>
            <Link to='/blog' className='text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
              BLOGS
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
              className="text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <ModeToggle />
          </div>
        </div>
      </motion.nav>

      {/* Hero Image */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={currentPost.image} 
          alt={currentPost.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.style.background = 'linear-gradient(to bottom right, #7c3aed, #ec4899)';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-purple-600/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
              {currentPost.category}
            </span>
            {currentPost.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {currentPost.title}
          </h1>

          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                {currentPost.authorAvatar}
              </div>
              <div>
                <p className="text-white font-semibold">{currentPost.author}</p>
                <div className="flex items-center gap-4 text-white/60 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{currentPost.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{currentPost.readTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isLiked
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-900/20 text-white/80 hover:bg-purple-900/30'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{currentLikes}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/20 text-white/80 hover:bg-purple-900/30 transition-all">
                <MessageCircle className="w-5 h-5" />
                <span>{currentPost.comments}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/20 text-white/80 hover:bg-purple-900/30 transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span>{currentPost.shares}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.article
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          <div className="text-lg leading-relaxed">
            {formatContent(currentPost.content)}
          </div>
        </motion.article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 pt-8 border-t border-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <motion.div
                  key={post.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="bg-purple-900/10 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative h-32 bg-gradient-to-br from-purple-600 to-pink-600">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-white/60 text-xs mb-2">{post.readTime}</p>
                    <p className="text-white/80 text-sm line-clamp-2">{post.excerpt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 px-6 border-t border-purple-900/30 mt-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Related Features */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm">Related Features</h3>
              <ul className="space-y-3">
                {currentPost && (currentPost.category === "Resume Tips" || currentPost.tags.some(tag => tag.toLowerCase().includes("resume") || tag.toLowerCase().includes("ats"))) ? (
                  <li>
                    <button
                      onClick={() => navigate('/resume')}
                      className="flex items-center gap-2 text-gray-400 hover:text-purple-400 text-sm transition-colors group"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Resume Builder & ATS Checker</span>
                    </button>
                  </li>
                ) : null}
                {currentPost && (currentPost.category === "Interview Tips" || currentPost.tags.some(tag => tag.toLowerCase().includes("interview"))) ? (
                  <li>
                    <button
                      onClick={() => navigate('/interview')}
                      className="flex items-center gap-2 text-gray-400 hover:text-purple-400 text-sm transition-colors group"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>AI Interview Practice</span>
                    </button>
                  </li>
                ) : null}
                {currentPost && (currentPost.category === "Career Planning" || currentPost.tags.some(tag => tag.toLowerCase().includes("roadmap"))) ? (
                  <li>
                    <button
                      onClick={() => navigate('/roadmap')}
                      className="flex items-center gap-2 text-gray-400 hover:text-purple-400 text-sm transition-colors group"
                    >
                      <Target className="w-4 h-4" />
                      <span>Career Roadmap Builder</span>
                    </button>
                  </li>
                ) : null}
                {currentPost && (currentPost.category === "Career Development" || currentPost.tags.some(tag => tag.toLowerCase().includes("skill"))) ? (
                  <li>
                    <button
                      onClick={() => navigate('/skill-graph')}
                      className="flex items-center gap-2 text-gray-400 hover:text-purple-400 text-sm transition-colors group"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Skill Graph Visualizer</span>
                    </button>
                  </li>
                ) : null}
                {currentPost && currentPost.category === "AI & Technology" ? (
                  <li>
                    <button
                      onClick={() => navigate('/agent-swarm')}
                      className="flex items-center gap-2 text-gray-400 hover:text-purple-400 text-sm transition-colors group"
                    >
                      <Users className="w-4 h-4" />
                      <span>AI Career Agent Swarm</span>
                    </button>
                  </li>
                ) : null}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm">Community</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => window.open('https://discord.gg/Bmrm67r6', '_blank')}
                    className="flex items-center gap-2 text-gray-400 hover:text-purple-400 text-sm transition-colors group"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Join Discord Community</span>
                  </button>
                </li>
                <li>
                  <Link to="/community" className="flex items-center gap-2 text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    <Users className="w-4 h-4" />
                    <span>Community Hub</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="flex items-center gap-2 text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    <BookOpen className="w-4 h-4" />
                    <span>All Blog Posts</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/insights" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    Career Insights
                  </Link>
                </li>
                <li>
                  <Link to="/job-listings" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    Job Listings
                  </Link>
                </li>
                <li>
                  <Link to="/ats-assessment" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    ATS Assessment
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    About HORIZON
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-purple-900/30 pt-8 mt-8">
            <p className="text-white text-center">© HORIZON 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogDetail;

