import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RotatingResume = () => {
  const [currentResume, setCurrentResume] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const resumes = [
    {
      name: "HARPER RUSSO",
      title: "Certified Public Accountant",
      email: "harper.russo@email.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      summary: "Highly organized and meticulous CPA with expertise in financial analysis, tax preparation, and business consulting. Proven track record of helping businesses optimize their financial performance.",
      experience: [
        {
          role: "Senior Accountant",
          company: "Keithston & Partners",
          period: "June 2029 - Present",
          description: "Led financial analysis and tax preparation for corporate clients"
        },
        {
          role: "Junior Accountant",
          company: "Timmerman Industries",
          period: "February 2028 - February 2029",
          description: "Managed bookkeeping and financial reporting for small businesses"
        }
      ],
      skills: ["Bookkeeping", "Tax Filing", "Data Analysis", "Cost Reduction", "Public Accounting", "Business Budgeting"],
      highlightedSkills: ["Bookkeeping", "Tax Filing", "Data Analysis"],
      education: "B.S. Accountancy - Really Great University (2023-2027)"
    },
    {
      name: "RICHARD KEVIN",
      title: "Demonstration Specialist",
      email: "richard.kevin@email.com",
      phone: "+1 (202) 555-0120",
      location: "Chicago, Illinois",
      summary: "Highly organized and meticulous demonstration specialist with excellent communication skills. Consistent performer seeking to achieve organizational and personal goals through effective product demonstrations.",
      experience: [
        {
          role: "Demonstration Specialist",
          company: "Ample Retail Pvt Ltd",
          period: "Feb 2020 - Present",
          description: "Achieved sales targets, managed cash inventory, and handled day-to-day operations"
        },
        {
          role: "Demonstration Specialist",
          company: "Bose Corporation India Pvt Ltd",
          period: "Jun 2018 - Jan 2020",
          description: "Maximized sales through effective product demonstrations and customer engagement"
        }
      ],
      skills: ["Customer Support", "Sales", "Instructor", "Customer Satisfaction", "Operations", "Communication"],
      highlightedSkills: ["Customer Support", "Sales", "Operations"],
      education: "BBA Finance - San Jose State University (2015-2018)"
    },
    {
      name: "ALEX CHEN",
      title: "Senior Software Engineer",
      email: "alex.chen@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      summary: "Passionate full-stack developer with 5+ years of experience building scalable web applications. Expert in React, Node.js, and cloud technologies with a focus on user experience.",
      experience: [
        {
          role: "Senior Software Engineer",
          company: "TechCorp Inc.",
          period: "2021 - Present",
          description: "Led development of microservices architecture serving 1M+ users"
        },
        {
          role: "Full Stack Developer",
          company: "StartupXYZ",
          period: "2019 - 2021",
          description: "Built responsive web applications using React and Node.js"
        }
      ],
      skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"],
      highlightedSkills: ["JavaScript", "React", "Node.js"],
      education: "B.S. Computer Science - Stanford University (2019)"
    },
    {
      name: "EMMA WILSON",
      title: "UX Designer",
      email: "emma.wilson@email.com",
      phone: "+1 (555) 321-0987",
      location: "Seattle, WA",
      summary: "Creative UX designer with a focus on user-centered design and accessibility. Experienced in creating intuitive interfaces for web and mobile applications with a passion for inclusive design.",
      experience: [
        {
          role: "Lead UX Designer",
          company: "DesignStudio",
          period: "2020 - Present",
          description: "Led design system implementation across 10+ products"
        },
        {
          role: "UX Designer",
          company: "CreativeAgency",
          period: "2018 - 2020",
          description: "Designed user interfaces for e-commerce platforms"
        }
      ],
      skills: ["User Research", "Figma", "Prototyping", "Design Systems", "Accessibility", "Wireframing"],
      highlightedSkills: ["User Research", "Figma", "Prototyping"],
      education: "B.F.A. Graphic Design - Art Institute (2018)"
    }
  ];

  // Auto-rotate resumes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentResume((prev) => (prev + 1) % resumes.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, resumes.length]);

  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      <motion.div
        className="relative w-80 h-96"
        style={{ perspective: '1000px' }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.div
          className="relative w-full h-full"
          animate={{
            rotateY: isHovered ? 0 : 360,
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{
            rotateY: {
              duration: isHovered ? 0.3 : 20,
              repeat: isHovered ? 0 : Infinity,
              ease: "linear"
            },
            scale: {
              duration: 0.3,
              ease: "easeOut"
            }
          }}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Resume Card */}
          <motion.div
            className="absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.1))'
            }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Resume Content */}
            <motion.div 
              className="p-6 h-full overflow-y-auto text-xs"
              key={currentResume}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {resumes[currentResume].name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-gray-900 mb-1">{resumes[currentResume].name}</h1>
                  <p className="text-sm font-semibold text-blue-600 mb-2">{resumes[currentResume].title}</p>
                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                    <p><strong>Email:</strong> {resumes[currentResume].email}</p>
                    <p><strong>Phone:</strong> {resumes[currentResume].phone}</p>
                    <p><strong>Location:</strong> {resumes[currentResume].location}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">SUMMARY</h2>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {resumes[currentResume].summary}
                </p>
              </div>

              {/* Experience */}
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">EXPERIENCE</h2>
                <div className="space-y-3">
                  {resumes[currentResume].experience.map((exp, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-gray-900 text-xs">{exp.role}</h3>
                      <p className="text-xs text-blue-600 font-medium">{exp.company} • {exp.period}</p>
                      <p className="text-xs text-gray-700 mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">SKILLS</h2>
                <div className="flex flex-wrap gap-1">
                  {resumes[currentResume].skills.map((skill, index) => (
                    <motion.span
                      key={index}
                      className={`px-2 py-1 text-xs rounded-full transition-all duration-300 ${
                        resumes[currentResume].highlightedSkills.includes(skill)
                          ? 'bg-yellow-200 text-yellow-800 border-2 border-yellow-400 shadow-md'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                      animate={
                        resumes[currentResume].highlightedSkills.includes(skill)
                          ? { scale: [1, 1.05, 1], y: [0, -2, 0] }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">EDUCATION</h2>
                <p className="text-xs text-gray-700">{resumes[currentResume].education}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Glow effect behind resume */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-3xl -z-10" />
        </motion.div>

        {/* Resume indicator dots */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {resumes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentResume(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentResume ? 'bg-blue-500 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RotatingResume;
