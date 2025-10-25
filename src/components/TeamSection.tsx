import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const TeamSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const teamMembers = [
    {
      name: "Divyaansh",
      role: "Frontend Developer",
      description: "Passionate about creating beautiful, intuitive user interfaces that make career discovery seamless and engaging.",
      initials: "D",
      color: "text-blue-500",
      triangleColor: "border-blue-500",
      position: "below"
    },
    {
      name: "Vaasu",
      role: "Fullstack Developer", 
      description: "Bridges frontend and backend to create cohesive experiences, ensuring smooth data flow and optimal performance.",
      initials: "V",
      color: "text-green-500",
      triangleColor: "border-green-500",
      position: "above"
    },
    {
      name: "Mannat",
      role: "Backend Developer",
      description: "Architect of robust systems and AI algorithms that power intelligent career recommendations and data analysis.",
      initials: "M",
      color: "text-orange-500",
      triangleColor: "border-orange-500",
      position: "below"
    },
    {
      name: "Harshita Behl",
      role: "ML Developer",
      description: "Specializes in machine learning algorithms and AI model development, creating intelligent systems that enhance career matching.",
      initials: "H",
      color: "text-red-500",
      triangleColor: "border-red-500",
      position: "above"
    },
    {
      name: "Apoorva Gupta",
      role: "UI/UX Designer",
      description: "Crafts exceptional user experiences through thoughtful design, ensuring every interaction is intuitive and visually appealing.",
      initials: "A",
      color: "text-purple-500",
      triangleColor: "border-purple-500",
      position: "below"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-black dark:from-slate-950 dark:via-purple-950 dark:to-black relative overflow-hidden">
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
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white">
            Our Team
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Meet the passionate students from Maharaja Agrasen Institute of Technology who built HORIZON
          </p>
        </motion.div>

        {/* Hexagonal Team Layout */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4 lg:space-x-8">
            {/* OUR TEAM Hexagon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-lg shadow-2xl flex items-center justify-center transform rotate-45">
                <div className="transform -rotate-45 text-center">
                  <div className="text-black font-bold text-sm lg:text-lg">OUR</div>
                  <div className="text-black font-bold text-sm lg:text-lg">TEAM</div>
                </div>
              </div>
              
              {/* Profile Photo Placeholder */}
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 lg:w-20 lg:h-20 bg-gray-300 rounded-lg shadow-lg flex items-center justify-center"
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SC</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Team Members */}
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ x: 100, opacity: 0 }}
                animate={isInView ? { x: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.2 }}
                className="relative flex flex-col items-center"
              >
                {/* Triangle */}
                <motion.div
                  className={`w-0 h-0 border-l-4 border-r-4 border-l-transparent border-r-transparent ${
                    member.position === 'above' 
                      ? `border-b-8 ${member.triangleColor}` 
                      : `border-t-8 ${member.triangleColor}`
                  }`}
                  animate={{
                    y: member.position === 'above' ? [0, -5, 0] : [0, 5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3
                  }}
                />

                {/* Member Info */}
                <motion.div
                  className={`${member.position === 'above' ? 'mb-4' : 'mt-4'} text-center max-w-48`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`font-bold text-lg ${member.color}`}>
                    {member.name.toUpperCase()}
                  </div>
                  <div className={`font-semibold text-sm ${member.color} mb-2`}>
                    {member.role.toUpperCase()}
                  </div>
                  <div className="text-white/70 text-xs leading-relaxed">
                    {member.description}
                  </div>
                </motion.div>

                {/* Hexagon */}
                <motion.div
                  className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-lg shadow-lg flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{member.initials}</span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Info Sections */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {/* Left Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              We're passionate students building the future of career guidance. Our mission is to help confused students find clarity, confidence, and direction in their career journey through AI-powered insights and personalized recommendations.
            </p>
          </div>

          {/* Right Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Our Vision</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              To become the go-to platform for career discovery, providing students with comprehensive tools for skill mapping, career matching, and professional development in one unified experience.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
