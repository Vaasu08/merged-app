import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  UserPlus, 
  Target, 
  Brain, 
  Sparkles, 
  BookOpen
} from 'lucide-react';
import RotatingResume from './RotatingResume';

const HowItWorks = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const title = "How It Works";
  const steps = [
    {
      id: 1,
      title: "Sign Up & Create Profile",
      description: "Create your account and build a comprehensive profile with your background, education, and career interests.",
      icon: UserPlus,
      color: "from-pink-400 to-rose-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      shape: "rounded-2xl",
      delay: 0.2
    },
    {
      id: 2,
      title: "Input Skills & Goals",
      description: "Add your technical skills, soft skills, interests, and career goals to help our AI understand your profile better.",
      icon: Target,
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      shape: "rounded-3xl",
      delay: 0.4
    },
    {
      id: 3,
      title: "AI Analysis & Matching",
      description: "Our advanced AI analyzes your profile and matches you with the most suitable career paths based on market trends.",
      icon: Brain,
      color: "from-purple-400 to-violet-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      shape: "rounded-full",
      delay: 0.6
    },
    {
      id: 4,
      title: "Get Recommendations",
      description: "Receive personalized career recommendations with detailed roadmaps, salary insights, and growth opportunities.",
      icon: Sparkles,
      color: "from-emerald-400 to-teal-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      shape: "rounded-xl",
      delay: 0.8
    },
    {
      id: 5,
      title: "Explore Resources",
      description: "Access courses, job opportunities, networking events, and mentorship programs tailored to your career path.",
      icon: BookOpen,
      color: "from-orange-400 to-amber-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      shape: "rounded-2xl",
      delay: 1.0
    }
  ];

  // Typing effect for title
  useEffect(() => {
    if (isInView && isTyping) {
      let index = 0;
      const timer = setInterval(() => {
        if (index < title.length) {
          setDisplayedText(title.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isInView, isTyping, title]);

  return (
    <section ref={ref} className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black dark:from-slate-950 dark:via-purple-950 dark:to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        {/* Title Section with Typing Effect */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h2
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {displayedText}
            {isTyping && <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-4xl"
            >
              |
            </motion.span>}
          </motion.h2>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            Follow this simple 5-step process to discover your perfect career path with AI-powered guidance
          </motion.p>
        </motion.div>

        {/* Two Column Layout: Video + Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Video */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto rounded-2xl shadow-2xl"
              >
                <source src="/Video_Generation_of_Person_Studying.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {/* Video overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl pointer-events-none" />
            </div>
          </motion.div>

          {/* Right Side - Roadmap Structure */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* Roadmap Container */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-8 text-center">Implementation Roadmap</h3>
                
                {/* Roadmap Steps */}
                <div className="space-y-6">
                  {/* Phase 1 */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        01
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">Sign & Create Profile</h4>
                      <p className="text-sm text-white/80">Build your comprehensive profile with background and interests</p>
                    </div>
                    <div className="w-8 h-0.5 bg-red-500"></div>
                  </motion.div>

                  {/* Phase 2 */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        02
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">Input Skills & Goals</h4>
                      <p className="text-sm text-white/80">Add your technical and soft skills to the platform</p>
                    </div>
                    <div className="w-8 h-0.5 bg-orange-500"></div>
                  </motion.div>

                  {/* Phase 3 */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 1.0 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        03
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">AI Analysis & Matching</h4>
                      <p className="text-sm text-white/80">Our AI analyzes your profile and matches career paths</p>
                    </div>
                    <div className="w-8 h-0.5 bg-blue-500"></div>
                  </motion.div>

                  {/* Phase 4 */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        04
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">Get Recommendations</h4>
                      <p className="text-sm text-white/80">Receive personalized career recommendations and roadmaps</p>
                    </div>
                    <div className="w-8 h-0.5 bg-green-500"></div>
                  </motion.div>

                  {/* Phase 5 */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 1.4 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        05
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">Explore Resources</h4>
                      <p className="text-sm text-white/80">Access courses, opportunities, and mentorship programs</p>
                    </div>
                  </motion.div>
                </div>

                {/* Progress Indicator */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 2, delay: 1.6 }}
                  className="mt-8 bg-white/20 rounded-full h-2 overflow-hidden"
                >
                  <div className="h-full bg-gradient-to-r from-red-500 via-orange-500 via-blue-500 via-green-500 to-purple-500 rounded-full"></div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Personalized Resume & Job Matching Section */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Your Personalized Career Journey</h3>
            <p className="text-white/80 text-lg">See how your skills match with the best opportunities</p>
          </div>

          {/* Three Column Layout: Resume + Skills + Jobs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            
            {/* Left - Resume Preview */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20"
            >
              <h4 className="text-xl font-bold text-white mb-6 text-center">Your Resume</h4>
              <div className="relative w-full h-80 bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                  <div className="h-full overflow-y-auto text-xs">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        JD
                      </div>
                      <div className="flex-1">
                        <h1 className="text-sm font-bold text-gray-900 mb-1">JOHN DOE</h1>
                        <p className="text-xs text-blue-600 font-medium">Software Engineer</p>
                        <div className="text-xs text-gray-600 mt-1">
                          <p>john.doe@email.com</p>
                          <p>+1 (555) 123-4567</p>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-3">
                      <h2 className="text-xs font-bold text-gray-900 mb-1 uppercase tracking-wide">SUMMARY</h2>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Passionate software engineer with expertise in React, Node.js, and cloud technologies. 
                        Experienced in building scalable applications and leading development teams.
                      </p>
                    </div>

                    {/* Skills */}
                    <div className="mb-3">
                      <h2 className="text-xs font-bold text-gray-900 mb-1 uppercase tracking-wide">SKILLS</h2>
                      <div className="flex flex-wrap gap-1">
                        {["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"].map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Experience */}
                    <div>
                      <h2 className="text-xs font-bold text-gray-900 mb-1 uppercase tracking-wide">EXPERIENCE</h2>
                      <div className="space-y-1">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-xs">Senior Software Engineer</h3>
                          <p className="text-xs text-blue-600">TechCorp Inc. • 2021 - Present</p>
                          <p className="text-xs text-gray-700">Led development of microservices architecture</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Center - Skills Analysis */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 2.0 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20"
            >
              <h4 className="text-xl font-bold text-white mb-6 text-center">Your Skills Analysis</h4>
              <div className="space-y-4">
                {[
                  { skill: "JavaScript", percentage: 95, color: "bg-blue-400" },
                  { skill: "React", percentage: 90, color: "bg-green-400" },
                  { skill: "Node.js", percentage: 85, color: "bg-purple-400" },
                  { skill: "Python", percentage: 80, color: "bg-orange-400" },
                  { skill: "AWS", percentage: 75, color: "bg-pink-400" },
                  { skill: "Docker", percentage: 70, color: "bg-cyan-400" }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-white text-sm">
                      <span>{item.skill}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${item.percentage}%` } : {}}
                        transition={{ duration: 1, delay: 2.5 + index * 0.1 }}
                        className={`h-2 rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Skill Gap Analysis */}
              <div className="mt-6 bg-white/5 rounded-2xl p-4">
                <h5 className="text-sm font-semibold text-white mb-3">Recommended Skills to Learn</h5>
                <div className="space-y-2">
                  {["TypeScript", "GraphQL", "Kubernetes"].map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-white text-sm">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right - Job Matches */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 2.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20"
            >
              <h4 className="text-xl font-bold text-white mb-6 text-center">Best Job Matches</h4>
              <div className="space-y-4">
                {[
                  { 
                    title: "Senior React Developer", 
                    company: "TechStart Inc.",
                    match: "95%",
                    salary: "$120k - $150k",
                    color: "bg-blue-500",
                    skills: ["React", "JavaScript", "Node.js"]
                  },
                  { 
                    title: "Full Stack Engineer", 
                    company: "InnovateCorp",
                    match: "88%",
                    salary: "$110k - $140k",
                    color: "bg-green-500",
                    skills: ["React", "Python", "AWS"]
                  },
                  { 
                    title: "Software Engineer", 
                    company: "GrowthTech",
                    match: "82%",
                    salary: "$100k - $130k",
                    color: "bg-purple-500",
                    skills: ["JavaScript", "Node.js", "Docker"]
                  },
                  { 
                    title: "Frontend Developer", 
                    company: "DesignStudio",
                    match: "78%",
                    salary: "$90k - $120k",
                    color: "bg-orange-500",
                    skills: ["React", "JavaScript"]
                  }
                ].map((job, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 2.8 + index * 0.1 }}
                    className={`${job.color} rounded-xl p-4 text-white`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-sm">{job.title}</div>
                        <div className="text-xs opacity-90">{job.company}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold">{job.match} match</div>
                        <div className="text-xs opacity-90">{job.salary}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-2 py-1 bg-white/20 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 3.2 }}
            className="text-center mt-12"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 rounded-3xl" />
              <div className="relative z-10">
                <h4 className="text-2xl font-bold mb-4">Ready to Build Your Career?</h4>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  Create your personalized profile and discover the perfect career path with AI-powered matching
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-purple-600 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Your Journey →
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
