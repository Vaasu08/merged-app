import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';
import { SkillInput } from '@/components/SkillInput';
import { CareerRecommendations } from '@/components/CareerRecommendations';
import { CareerAssessmentModal } from '@/components/CareerAssessmentModal';
import { CareerRecommendationResults } from '@/components/CareerRecommendationResults';
import { getCareerRecommendations } from '@/data/careerData';
import { CareerPath } from '@/types/career';
import { useAuth } from '@/components/AuthProvider';
import { getUserSkills, saveUserSkills } from '@/lib/profile';
import { HorizonLogo } from '@/components/HorizonLogo';
import { analyzeAssessmentAnswersWithGemini, JobRecommendation } from '@/lib/geminiCareerRecommendation';
import { 
  Brain, Target, TrendingUp, Users, ArrowRight, Sparkles, 
  Zap, Star, Award, Globe, Code, BarChart3, Rocket, 
  CheckCircle, Play, Pause, Volume2, VolumeX, Maximize2, User,
  Menu, X
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, useScroll, useTransform, useInView, useAnimation } from 'framer-motion';
import { useInView as useIntersectionObserver } from 'react-intersection-observer';
import careerHeroImage from '@/assets/career-hero.jpg';
import GlitchText from '@/components/GlitchText'
import HowItWorks from '@/components/HowItWorks'


const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'skills' | 'recommendations'>('welcome');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerPath>();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const skillsLoadedRef = useRef(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Load user's saved skills when they log in
  useEffect(() => {
    const loadSkills = async () => {
      if (!user?.id) {
        setInitialLoadComplete(true);
        return;
      }
      try {
        const skills = await getUserSkills(user.id);
        setSelectedSkills(skills);
        
        // Check if we're coming from Profile page with specific intent to show recommendations
        const navigationState = location.state as { showRecommendations?: boolean; skills?: string[]; fromProfile?: boolean } | null;
        if (navigationState?.showRecommendations) {
          const skillsToUse = navigationState.skills || skills;
          console.log('Navigation from profile detected, showing recommendations for skills:', skillsToUse);
          
          if (skillsToUse.length >= 3) {
            setSelectedSkills(skillsToUse); // Ensure skills are set
            const recommendations = getCareerRecommendations(skillsToUse);
            if (recommendations.length > 0) {
              setCareerPaths(recommendations);
              setCurrentStep('recommendations');
              toast.success(`Analysis complete! Found ${recommendations.length} career matches for your ${skillsToUse.length} skills.`, {
                duration: 4000
              });
              // Clear the navigation state
              navigate(location.pathname, { replace: true, state: {} });
              setInitialLoadComplete(true);
              return;
            }
          } else {
            toast.error('Please add at least 3 skills to get career recommendations.');
            setCurrentStep('skills');
            setInitialLoadComplete(true);
            return;
          }
        }
        
        // Auto-determine the correct step based on existing skills
        if (skills.length >= 3) {
          // User has enough skills, show recommendations automatically
          const recommendations = getCareerRecommendations(skills);
          if (recommendations.length > 0) {
            setCareerPaths(recommendations);
            setCurrentStep('recommendations');
            toast.success(`Welcome back! Found ${recommendations.length} career matches based on your ${skills.length} skills.`, {
              duration: 4000
            });
          } else {
            setCurrentStep('skills');
          }
        } else if (skills.length > 0) {
          // User has some skills but not enough for recommendations
          setCurrentStep('skills');
          toast.info(`Welcome back! Add ${3 - skills.length} more skills to see career recommendations.`);
        }
        // If no skills, stay on welcome screen
      } catch (e) {
        console.warn('Failed to load user skills', e);
      } finally {
        skillsLoadedRef.current = true;
        setInitialLoadComplete(true);
      }
    };
    loadSkills();
    // Reset flag when user changes
    return () => {
      skillsLoadedRef.current = false;
      setInitialLoadComplete(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, location.state]);

  // Enhanced skill persistence - backup sync in case SkillInput component fails
  useEffect(() => {
    const backupSync = async () => {
      if (!user?.id) return;
      if (!skillsLoadedRef.current) return; // wait until initial load is done
      
      try {
        console.log(`Backup syncing ${selectedSkills.length} skills for user ${user.id}`);
        await saveUserSkills(user.id, selectedSkills);
        console.log('Backup sync successful');
      } catch (e) {
        console.warn('Failed to backup sync user skills:', e);
        // Don't show toast for backup sync failures to avoid spam
      }
    };
    
    // Only do backup sync with slight delay to avoid conflicts with immediate saves
    const timeoutId = setTimeout(backupSync, 1000);
    return () => clearTimeout(timeoutId);
  }, [selectedSkills, user?.id]);

  const handleAnalyze = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill to get recommendations.');
      return;
    }

    try {
      const recommendations = getCareerRecommendations(selectedSkills);
      console.log('Generated recommendations:', recommendations.length);
      
      if (recommendations.length === 0) {
        toast.error('No career matches found. Try adding more skills or different skill types.');
        return;
      }

      // Set the recommendations and navigate to recommendations view
      setCareerPaths(recommendations);
      setCurrentStep('recommendations');
      
      // Show success message with career count
      const topMatch = recommendations[0];
      toast.success(`Analysis complete! Found ${recommendations.length} career matches. Top match: ${topMatch.title} (${topMatch.matchPercentage}% match)`, {
        duration: 5000
      });
      
      console.log('Analysis complete, now showing recommendations screen');
      
    } catch (error) {
      console.error('Error during analysis:', error);
      toast.error('Failed to complete analysis. Please try again.');
    }
  };

  const handleSelectCareer = (career: CareerPath) => {
    setSelectedCareer(career);
  };

  const handleToggleStep = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const handleAddSkills = async (skills: string[]) => {
    const newSkills = [...new Set([...selectedSkills, ...skills])];
    setSelectedSkills(newSkills);
    
    // Save to profile if user is logged in
    if (user?.id) {
      try {
        await saveUserSkills(user.id, newSkills);
        toast.success(`Added ${skills.length} skill${skills.length > 1 ? 's' : ''} to your profile!`);
      } catch (error) {
        console.error('Failed to save skills to profile:', error);
        toast.error('Failed to save skills to your profile. Please try again.');
      }
    }
  };

  const handleStartOver = () => {
    setCurrentStep('welcome');
    setSelectedSkills([]);
    setCareerPaths([]);
    setSelectedCareer(undefined);
    setCompletedSteps([]);
  };

  // Show loading while initial data is being loaded
  if (!initialLoadComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-semibold text-foreground">Loading your profile...</h3>
          <p className="text-sm text-muted-foreground">Setting up your personalized experience</p>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black dark:from-slate-950 dark:via-purple-950 dark:to-black relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Navigation */}
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 left-0 right-0 z-50 pointer-events-auto"
        >
          <div className="flex items-center justify-between w-full px-6 py-6">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <HorizonLogo size="md" variant="light" />
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link to='/' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
                HOME
              </Link>
              <button onClick={scrollToFeatures} className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
                FEATURES
              </button>
              <Link to='/' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
                BLOGS
              </Link>
              <Link to='/insights' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
                INSIGHTS
              </Link>
              <Link to='/community' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
                COMMUNITY
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white/80 hover:text-white transition-colors duration-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Right side - Auth & Theme */}
            <div className="flex items-center gap-4">
              {user ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/profile" className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 flex items-center gap-2 font-inter">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/login" className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 font-inter">
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/signup" className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20 hover:bg-white/20 transition-all duration-300 font-inter">
                      Sign up
                    </Link>
                  </motion.div>
                </>
              )}
              <ModeToggle />
            </div>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
              <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10"
            >
              <div className="px-6 py-4 space-y-4">
                <Link to='/' className='block text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
                  HOME
                </Link>
                <button onClick={() => { scrollToFeatures(); setMobileMenuOpen(false); }} className='block text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
                  FEATURES
                </button>
                <Link to='/' className='block text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
                  BLOGS
                </Link>
                <Link to='/insights' className='block text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
                  INSIGHTS
                </Link>
                <Link to='/community' className='block text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
                  COMMUNITY
                </Link>
              </div>
                </motion.div>
          )}
        </motion.nav>

        {/* Hero Section */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-left space-y-6 sm:space-y-8"
              >
              {/* Main Heading */}
                <div className="space-y-4">
                  {/* HORIZON Title with Gradient Effects */}
              <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mb-8 relative"
                  >
                    <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-none relative z-10">
                  <motion.span
                        className="bg-gradient-to-r from-cyan-400 via-purple-500 to-red-500 bg-clip-text text-transparent"
                        animate={{
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        style={{
                          backgroundSize: "200% 200%"
                        }}
                  >
                    HORIZON
                  </motion.span>
              </h1>
                    
                    {/* Multiple animated gradient background effects */}
                    <motion.div
                      className="absolute -z-10 w-full h-32 bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-red-500/30 blur-3xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.8, 0.4],
                        x: [-20, 20, -20],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="absolute -z-20 w-full h-40 bg-gradient-to-r from-pink-400/20 via-blue-500/20 to-green-400/20 blur-2xl"
                      animate={{
                        scale: [1.1, 0.9, 1.1],
                        opacity: [0.2, 0.6, 0.2],
                        x: [20, -20, 20],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    />
                    
                    {/* Floating particles around HORIZON */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/40 rounded-full"
                        style={{
                          left: `${10 + Math.random() * 80}%`,
                          top: `${10 + Math.random() * 80}%`,
                        }}
                        animate={{
                          y: [0, -30, 0],
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
              </motion.div>
                  
                  <motion.h2
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight font-inter"
                  >
                    <span className="block text-white/70 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-2 font-light">
                      The Gateway to
                    </span>
                    <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold">
                       Discover Perfect
                    </span>
                    <span className="block text-white/70 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mt-2 font-light">
                      Career Decisions
                    </span>
                  </motion.h2>
                </div>
              
              {/* Description */}
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl font-inter font-light"
              >
                  Map your skills, explore opportunities, and unlock your professional journey with confidence.
              </motion.p>
              
                {/* CTA Button */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="pt-4"
              >
                  {/* Test button for modal */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        console.log('TEST: Opening modal, current state:', isAssessmentOpen);
                        setIsAssessmentOpen(true);
                        console.log('TEST: After setState');
                      }}
                      className="bg-purple-600 text-white hover:bg-purple-700 font-medium px-8 py-4 rounded-2xl transition-all duration-300"
                    >
                      Test Career Assessment
                    </Button>
                  </motion.div>

                </motion.div>
              </motion.div>
                
              {/* Right Content - 3D Resume Illustration */}
                <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative order-first lg:order-last"
              >
                <div className="relative w-full h-64 sm:h-80 lg:h-[500px] flex items-center justify-center">
                  {/* 3D Resume */}
                <motion.div
                    className="relative w-80 h-96 sm:w-96 sm:h-[28rem] lg:w-[28rem] lg:h-[36rem]"
                    animate={{
                      rotateY: [0, 360],
                      rotateX: [0, 15, 0],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                  >
                    {/* Resume Container */}
                    <div 
                      className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden resume-container-shadow"
                    >
                      {/* Resume Content */}
                      <div className="p-4 h-full overflow-y-auto text-xs">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            SR
                          </div>
                          <div className="flex-1">
                            <h1 className="text-lg font-bold text-gray-900 mb-1">STACEY E. RODRIGUEZ</h1>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div>
                                <p><strong>Address:</strong> 515 Roosevelt Wilson Lane, Plato, CA 92876</p>
                                <p><strong>Phone:</strong> 133-456-7890</p>
                              </div>
                              <div>
                                <p><strong>Email:</strong> hello@gmail.com</p>
                                <p><strong>Website:</strong> linkedin.com/in/myname</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="mb-3">
                          <h2 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">SUMMARY</h2>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            Innovative problem-solver and Six Sigma Black Belt adept at spearheading digital and business transformation. 
                            Proven visionary catalyst, credited with exceeding $150M in sales pipeline, compliance, and cyber security.
                          </p>
                        </div>

                        {/* Work Experience */}
                        <div className="mb-3">
                          <h2 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">WORK EXPERIENCE</h2>
                          <div className="space-y-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-xs">CHIEF INFORMATION OFFICER, Boretech Technica</h3>
                              <p className="text-xs text-gray-600">Jan 2023 - Present</p>
                              <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                                <li>• Made a dynamic network of collaborators across diverse domains such as NexTech, AutoFashion, TechSphere, CognitiveWorks, ComplianceFirst, and SecureNet</li>
                                <li>• Drove transformative growth by clinching a groundbreaking $40M tech solutions contract, spanning key industry sectors like finance, and education</li>
                                <li>• Coordinated the expansion of a substantial $200M sales pipeline through strategic partnerships with Accenture, PwC, McKinsey, and other leading consultancy firms</li>
                              </ul>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-xs">CHIEF OPERATING OFFICER, DocInc</h3>
                              <p className="text-xs text-gray-600">Feb 2001 - Dec 2002</p>
                              <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                                <li>• Led strategic management of a dynamic $120M pipeline while nurturing and expanding partnerships with industry giants such as Apple, Oracle, VMware, SAP, Cisco, HP, and others</li>
                                <li>• Spearheaded significant expansion within key sectors, including HHS, DOD, SEO, State Agencies, DOE, and private enterprises</li>
                                <li>• Collaborated closely with the executive board to facilitate underprivileged students' access to vital scholarships, empowering them to pursue their career aspirations</li>
                                <li>• Pioneered the establishment of an innovative overseas Center of Excellence focused on IoT/Smart Cities technology, catering specifically to the American market</li>
                                <li>• Served as a thought leader in the industry, providing invaluable insights and training through the development of the company's third-party advisor portal, aimed at preparing stakeholders for future ISO compliance</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Education */}
                        <div className="mb-3">
                          <h2 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">EDUCATION</h2>
                          <div className="space-y-1">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-xs">M.S. Electrical & Computer Engineering</h3>
                              <p className="text-xs text-gray-600">Boston University (Aug 2010 - Oct 2010)</p>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-xs">B.S. Computer Science</h3>
                              <p className="text-xs text-gray-600">Georgia Institute of Technology (May 2014 - May 2016)</p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div>
                          <h2 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">ADDITIONAL INFORMATION</h2>
                          <div className="text-xs text-gray-700 space-y-1">
                            <p><strong>Technical Skills:</strong> Change Management, Transition Management, IT Strategy & Service Product, Road-Mapping, Project Management, Revenue Management, Market Evaluation, Risk Management, DevOps, Agile, & Principal Vendor Management</p>
                            <p><strong>Certifications:</strong> Professional Engineer (PE) License, Project Management Professional (PMP)</p>
                          </div>
                        </div>
                      </div>
                    </div>
              </motion.div>
              
                  {/* Floating particles around resume */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white/30 rounded-full"
                      style={{
                        left: `${15 + Math.random() * 70}%`,
                        top: `${15 + Math.random() * 70}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 4 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                      }}
                    />
                  ))}
                  
                  {/* Glow effect behind resume */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="relative z-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Community
              </h2>
              <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto px-4">
                Join our vibrant community of career-focused professionals sharing insights, opportunities, and success stories
              </p>
            </motion.div>
            
            {/* Community Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {[
                {
                  user: "Ruchi Bhat",
                  handle: "@ruchibhatt",
                  avatar: "SC",
                  content: "Just discovered my perfect career path through HORIZON! The AI recommendations were spot-on. From marketing to data science - what a journey! 🚀 #CareerDiscovery #DataScience",
                  date: "Dec 15",
                  likes: 24,
                  retweets: 8
                },
                {
                  user: "Yatin Kumar",
                  handle: "@YatinKumarr",
                  avatar: "MR",
                  content: "The skill gap analysis feature is incredible. It showed me exactly what I needed to learn to transition into product management. Already enrolled in 3 courses! 💪 #ProductManagement #Learning",
                  date: "Dec 14",
                  likes: 18,
                  retweets: 12
                },
                {
                  user: "Kim Kadarshian",
                  handle: "@Kim23",
                  avatar: "AK",
                  content: "HORIZON's interview simulator helped me land my dream job at Google! The AI feedback was so detailed and helpful. Can't recommend it enough! 🎉 #InterviewPrep #Google #Success",
                  date: "Dec 13",
                  likes: 42,
                  retweets: 19
                },
                {
                  user: "Emma Watson",
                  handle: "@emmawatson",
                  avatar: "EW",
                  content: "The career roadmap feature is a game-changer. I can see exactly where I'll be in 5 years and what steps to take. Finally, clarity in my career journey! 📈 #CareerPlanning #Roadmap",
                  date: "Dec 12",
                  likes: 31,
                  retweets: 15
                },
                {
                  user: "Khushi Sharma",
                  handle: "@khushisharma",
                  avatar: "DP",
                  content: "Love how HORIZON connects skills to real job opportunities. Found 3 perfect matches I never would have considered. The AI really understands the market! 🤖 #JobSearch #AI",
                  date: "Dec 11",
                  likes: 27,
                  retweets: 9
                },
                {
                  user: "Lisa",
                  handle: "@lisazhang",
                  avatar: "LZ",
                  content: "The community insights are amazing. Seeing what skills are trending and what companies are hiring for helps me stay ahead of the curve. 📊 #MarketInsights #Trends",
                  date: "Dec 10",
                  likes: 35,
                  retweets: 22
                }
              ].map((post, index) => (
          <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group cursor-pointer"
                  onClick={() => navigate('/community')}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white text-sm">{post.user}</h3>
                          <span className="text-white/60 text-sm">{post.handle}</span>
                          <div className="ml-auto">
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">🐦</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">{post.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-white/60 text-xs">
                      <span>{post.date}</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <span>❤️</span> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>🔄</span> {post.retweets}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* View More Button */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/community')}
                className="inline-block cursor-pointer"
              >
                <Button 
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/40 font-medium px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-inter"
                >
                  View Full Community →
                </Button>
          </motion.div>
        </motion.div>
          </div>
        </div>

        {/* How It Works Flowchart Section */}
        <HowItWorks />

        {/* Dynamic Features Showcase */}
        <div id="features" className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
                Features
              </h2>
              <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto px-4">
                Explore our comprehensive suite of AI-powered tools designed to accelerate your career journey
              </p>
            </motion.div>

            {/* Interactive Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {[
                {
                  title: "AI Career Matching",
                  description: "Advanced algorithms analyze your skills and match you with perfect career opportunities",
                  icon: Brain,
                  color: "from-blue-500 to-cyan-500",
                  features: ["Skill Analysis", "Job Matching", "Career Scoring", "Market Trends"],
                  status: "Live",
                  onClick: () => {
                    if (user) {
                      navigate('/profile');
                    } else {
                      setCurrentStep('skills');
                    }
                  }
                },
                {
                  title: "Interview Simulator",
                  description: "Practice with AI-powered interview sessions and get detailed feedback",
                  icon: Users,
                  color: "from-purple-500 to-pink-500",
                  features: ["AI Questions", "Real-time Feedback", "Performance Analytics", "Mock Interviews"],
                  status: "Live",
                  onClick: () => navigate('/interview')
                },
                {
                  title: "Skill Gap Analysis",
                  description: "Identify missing skills and get personalized learning recommendations",
                  icon: Target,
                  color: "from-green-500 to-emerald-500",
                  features: ["Gap Detection", "Learning Paths", "Progress Tracking", "Certifications"],
                  status: "Live",
                  onClick: () => {
                    if (user) {
                      navigate('/profile');
                    } else {
                      setCurrentStep('skills');
                    }
                  }
                },
                {
                  title: "Resume Builder",
                  description: "Create professional resumes with AI-powered optimization and ATS compatibility",
                  icon: Code,
                  color: "from-orange-500 to-red-500",
                  features: ["ATS Optimization", "Template Library", "AI Suggestions", "Export Options"],
                  status: "Live",
                  onClick: () => {
                    if (user) {
                      navigate('/resume');
                    } else {
                      navigate('/login');
                    }
                  }
                },
                {
                  title: "Career Roadmap",
                  description: "Get personalized 5-year career plans with actionable milestones",
                  icon: TrendingUp,
                  color: "from-indigo-500 to-purple-500",
                  features: ["5-Year Planning", "Milestone Tracking", "Goal Setting", "Progress Monitoring"],
                  status: "Live",
                  onClick: () => {
                    if (user) {
                      navigate('/roadmap');
                    } else {
                      navigate('/login');
                    }
                  }
                },
                {
                  title: "Community Network",
                  description: "Connect with professionals, mentors, and industry experts",
                  icon: Globe,
                  color: "from-pink-500 to-rose-500",
                  features: ["Professional Network", "Mentorship", "Industry Events", "Knowledge Sharing"],
                  status: "Live",
                  onClick: () => navigate('/community')
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group cursor-pointer"
                  onClick={feature.onClick}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-xs font-medium">{feature.status}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-white/80 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      {/* Feature List */}
                      <div className="space-y-2">
                        {feature.features.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 + idx * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                            <span className="text-white/70 text-sm">{item}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Interactive Elements */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.1 + 0.5 }}
                        viewport={{ once: true }}
                        className="pt-4 border-t border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Try it now</span>
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="text-white/80 hover:text-white transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats Section */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { label: "Active Users", value: "50K+", icon: Users },
                { label: "Career Matches", value: "2M+", icon: Target },
                { label: "Success Stories", value: "15K+", icon: Star },
                { label: "Skills Mapped", value: "500K+", icon: Brain }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                >
                  <stat.icon className="w-8 h-8 text-white/80 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Our Mission and About Us Section */}
        <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-black dark:from-slate-950 dark:via-purple-950 dark:to-black py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
                Our Mission
              </h2>
              <p className="text-lg sm:text-xl text-white/80 max-w-4xl mx-auto leading-relaxed px-4">
                Our mission is to help confused students find clarity, confidence, and direction in their career journey. Instead of running to multiple websites, counselors, and chatbots, we provide a one-stop AI-powered advisor that delivers everything in one place—career roadmaps, job trends, skill mapping, resume and LinkedIn support, higher studies guidance, and soft skills training.

We aim to bridge the gap between students and the evolving job market by offering personalized, actionable, and future-ready guidance.
              </p>
            </motion.div>
            
            {/* Mission Section in Geometric Format */}
            <div className="max-w-6xl mx-auto mb-16">
              <div className="relative">
                {/* Triangle at top - Mission Statement */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="relative mb-0"
                >
                  <div className="w-0 h-0 border-l-[300px] border-r-[300px] border-b-[180px] border-l-transparent border-r-transparent border-b-red-500 mx-auto">
                    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-white font-bold text-center px-8 w-96">
                      <div className="font-bold text-lg">OUR MISSION</div>
                      <div className="text-sm mt-2 opacity-90">Empowering Students' Career Journeys</div>
                    </div>
                  </div>
                </motion.div>

                {/* Orange Rectangle - Core Mission */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-orange-500 h-32 flex items-center justify-center text-white font-bold text-lg mb-0 px-8"
                >
                  <div className="text-center">
                    <div className="font-bold text-xl">One-Stop AI Career Advisor</div>
                    <div className="text-sm mt-2 opacity-90">Career roadmaps, job trends, skill mapping, resume support</div>
                  </div>
                </motion.div>

                {/* Asymmetric Blue and Green Rectangles */}
                <div className="flex mb-0">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-blue-500 h-40 w-1/2 flex items-center justify-center text-white font-bold px-4"
                  >
                    <div className="text-center">
                      <div className="font-bold text-lg">Student Support</div>
                      <div className="text-sm mt-2 opacity-90">Higher studies guidance, soft skills training</div>
                      <div className="text-xs mt-1 opacity-75">Personalized • Actionable • Future-ready</div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-green-500 h-48 w-1/2 flex items-center justify-center text-white font-bold px-4"
                  >
                    <div className="text-center">
                      <div className="font-bold text-lg">Market Bridge</div>
                      <div className="text-sm mt-2 opacity-90">Connecting students with evolving job market</div>
                      <div className="text-xs mt-1 opacity-75">AI-powered • Comprehensive • Accessible</div>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Grey Rectangle - Vision */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  viewport={{ once: true }}
                  className="bg-gray-500 h-28 w-1/2 flex items-center justify-center text-white font-bold px-4"
                >
                  <div className="text-center">
                    <div className="font-bold text-lg">Vision: Career Clarity for All</div>
                    <div className="text-sm mt-1 opacity-90">No more confusion, just clear direction</div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* About Us Section */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Meet the Dreamers
              </h3>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto px-4">
                Built by passionate students from Maharaja Agrasen Institute of Technology, each bringing unique skills and expertise to create the perfect career guidance platform
              </p>
            </motion.div>
            
            {/* Team Members Spotlight Section */}
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
                {/* Team Member 1 - Divyaansh */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center group"
                >
                  {/* Spotlight Effect */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300">
                      D
                    </div>
                    {/* Enhanced Spotlight cone effect */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-40 h-24 bg-gradient-to-b from-blue-400/30 via-blue-500/20 to-transparent rounded-t-full blur-sm"></div>
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-gradient-to-b from-purple-400/25 via-purple-500/15 to-transparent rounded-t-full blur-sm"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-gradient-to-b from-white/20 to-transparent rounded-t-full blur-sm"></div>
                  </div>
                  
                  {/* Member Info */}
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-bold text-white">Divyaansh</h4>
                    <p className="text-sm text-blue-300 font-medium">Frontend Developer</p>
                    <div className="text-xs text-white/70 leading-relaxed">
                      <div>React • TypeScript • Next.js</div>
                      <div>Tailwind CSS • UI/UX Design</div>
                    </div>
                  </div>
                </motion.div>

                {/* Team Member 2 - Vaasu */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center group"
                >
                  {/* Spotlight Effect */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl group-hover:shadow-green-500/25 transition-all duration-300">
                      V
                    </div>
                    {/* Enhanced Spotlight cone effect */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-40 h-24 bg-gradient-to-b from-green-400/30 via-green-500/20 to-transparent rounded-t-full blur-sm"></div>
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-gradient-to-b from-teal-400/25 via-teal-500/15 to-transparent rounded-t-full blur-sm"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-gradient-to-b from-white/20 to-transparent rounded-t-full blur-sm"></div>
                  </div>
                  
                  {/* Member Info */}
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-bold text-white">Vaasu</h4>
                    <p className="text-sm text-green-300 font-medium">Full-Stack Developer</p>
                    <div className="text-xs text-white/70 leading-relaxed">
                      <div>Node.js • Express • MongoDB</div>
                      <div>PostgreSQL • Python • Django</div>
                      <div>FastAPI • AWS • System</div>
                      <div>REST APIs</div>
                    </div>
                      </div>
                </motion.div>

                {/* Team Member 3 - Mannat */}
                  <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                  className="flex flex-col items-center group"
                >
                  {/* Spotlight Effect */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-300">
                      M
                    </div>
                    {/* Enhanced Spotlight cone effect */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-40 h-24 bg-gradient-to-b from-purple-400/30 via-purple-500/20 to-transparent rounded-t-full blur-sm"></div>
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-gradient-to-b from-pink-400/25 via-pink-500/15 to-transparent rounded-t-full blur-sm"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-gradient-to-b from-white/20 to-transparent rounded-t-full blur-sm"></div>
                  </div>
                  
                  {/* Member Info */}
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-bold text-white">Mannat</h4>
                    <p className="text-sm text-purple-300 font-medium">Backend Developer</p>
                    <div className="text-xs text-white/70 leading-relaxed">
                      <div>Python • Django • FastAPI</div>
                      <div>AWS • System Architecture</div>
                    </div>
                      </div>
                  </motion.div>
                  
                {/* Team Member 4 - Harshita */}
                  <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                    viewport={{ once: true }}
                  className="flex flex-col items-center group"
                >
                  {/* Spotlight Effect */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl group-hover:shadow-orange-500/25 transition-all duration-300">
                      H
                    </div>
                    {/* Enhanced Spotlight cone effect */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-40 h-24 bg-gradient-to-b from-orange-400/30 via-orange-500/20 to-transparent rounded-t-full blur-sm"></div>
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-gradient-to-b from-red-400/25 via-red-500/15 to-transparent rounded-t-full blur-sm"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-gradient-to-b from-white/20 to-transparent rounded-t-full blur-sm"></div>
                </div>

                  {/* Member Info */}
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-bold text-white">Harshita</h4>
                    <p className="text-sm text-orange-300 font-medium">ML Developer</p>
                    <div className="text-xs text-white/70 leading-relaxed">
                      <div>Machine Learning • TensorFlow</div>
                      <div>PyTorch • Data Science • AI</div>
                    </div>
                  </div>
                </motion.div>

                {/* Team Member 5 - Apoorva */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center group"
                >
                  {/* Spotlight Effect */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl group-hover:shadow-cyan-500/25 transition-all duration-300">
                      A
                    </div>
                    {/* Enhanced Spotlight cone effect */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-40 h-24 bg-gradient-to-b from-cyan-400/30 via-cyan-500/20 to-transparent rounded-t-full blur-sm"></div>
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-gradient-to-b from-blue-400/25 via-blue-500/15 to-transparent rounded-t-full blur-sm"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-gradient-to-b from-white/20 to-transparent rounded-t-full blur-sm"></div>
                  </div>
                  
                  {/* Member Info */}
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-bold text-white">Apoorva</h4>
                    <p className="text-sm text-cyan-300 font-medium">UI/UX Designer</p>
                    <div className="text-xs text-white/70 leading-relaxed">
                      <div>Figma • Adobe Creative Suite</div>
                      <div>User Research • Prototyping</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* University Info */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-2">Maharaja Agrasen Institute of Technology</h3>
                  <p className="text-white/80 text-sm">B.Tech Students • Computer Science & Engineering</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto px-4">
                Everything you need to know about HORIZON and how it can help accelerate your career journey
              </p>
            </motion.div>

            {/* FAQ Grid */}
            <div className="max-w-4xl mx-auto space-y-4">
              {[
                {
                  question: "How does HORIZON's AI career matching work?",
                  answer: "Our AI analyzes your skills, experience, and preferences to match you with the most suitable career paths. The algorithm considers market demand, salary potential, skill requirements, and growth opportunities to provide personalized recommendations."
                },
                {
                  question: "Is HORIZON free to use?",
                  answer: "Yes! HORIZON offers a comprehensive free tier that includes basic career matching, skill analysis, and community access. We also offer premium features for advanced analytics, personalized coaching, and exclusive content."
                },
                {
                  question: "How accurate are the career recommendations?",
                  answer: "Our AI achieves 85%+ accuracy in career matching based on user feedback and success stories. The recommendations are continuously improved through machine learning and real-world outcome data from our community."
                },
                {
                  question: "Can I use HORIZON if I'm a student or recent graduate?",
                  answer: "Absolutely! HORIZON is designed for all career stages. Students can explore potential career paths, identify skill gaps, and create learning roadmaps. Recent graduates can get guidance on entry-level opportunities and career progression."
                },
                {
                  question: "What makes HORIZON different from other career platforms?",
                  answer: "HORIZON combines AI-powered matching with real community insights, interview simulation, and comprehensive skill development. Unlike traditional job boards, we focus on long-term career growth and provide actionable roadmaps."
                },
                {
                  question: "How does the interview simulator work?",
                  answer: "Our AI-powered interview simulator provides realistic practice sessions with industry-specific questions. You'll receive detailed feedback on your answers, body language, and communication skills to help you improve."
                },
                {
                  question: "Is my data secure on HORIZON?",
                  answer: "Yes, we take data security seriously. All user data is encrypted, and we comply with GDPR and other privacy regulations. Your personal information is never shared with third parties without your explicit consent."
                },
                {
                  question: "How often are career recommendations updated?",
                  answer: "Our career database is updated weekly with the latest job market trends, salary data, and skill requirements. Your personal recommendations are refreshed whenever you update your profile or add new skills."
                }
              ].map((faq, index) => (
              <motion.div
                  key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300"
                >
                  <details className="group">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <h3 className="text-lg font-semibold text-white pr-4 group-hover:text-blue-300 transition-colors">
                        {faq.question}
                      </h3>
                      <motion.div
                        className="flex-shrink-0 w-6 h-6 text-white/80 group-hover:text-white transition-colors"
                        animate={{ rotate: 0 }}
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-white/80 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                </motion.div>
              ))}
            </div>

            {/* Still Have Questions CTA */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
                <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                  Join our Discord community to get answers from our team and connect with other users who are on similar career journeys.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl transition-all duration-300"
                  >
                    Join Discord Community
                  </Button>
                </motion.div>
              </div>
              </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative bg-background">
          {/* Community CTA Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left Side - Discord Icon & Text */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Connect with the community</h3>
                    <p className="text-white/90 text-sm">Feel free to ask questions, report issues, and meet new people.</p>
                  </div>
                </div>

                {/* Right Side - Join Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg transition-all duration-300"
                  >
                    Join the HORIZON Discord!
                  </Button>
            </motion.div>
          </div>
        </div>
          </div>

          {/* Main Footer Links */}
          <div className="bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {/* General */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">General</h4>
                  <div className="space-y-2">
                    <Link to="/" className="block text-gray-600 hover:text-gray-900 transition-colors">
                      Explore
                    </Link>
                    <Link to="/insights" className="block text-gray-600 hover:text-gray-900 transition-colors">
                      Insights
                    </Link>
                    <Link to="/community" className="block text-gray-600 hover:text-gray-900 transition-colors">
                      Community
                    </Link>
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">Company</h4>
                  <div className="space-y-2">
                    <Link to="/" className="block text-gray-600 hover:text-gray-900 transition-colors">
                      Brand
                    </Link>
                    <Link to="/" className="block text-gray-600 hover:text-gray-900 transition-colors">
                      About Us
                    </Link>
                    <Link to="/" className="block text-gray-600 hover:text-gray-900 transition-colors">
                      Careers
                    </Link>
                  </div>
                </div>

                {/* Socials */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">Socials</h4>
                  <div className="space-y-2">
                    <a 
                      href="https://github.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                    <a 
                      href="https://linkedin.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                    <a 
                      href="https://twitter.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      Twitter
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Copyright */}
              <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                <p className="text-gray-500 text-sm">
                  © 2024 HORIZON. All rights reserved. Built with ❤️ by students at MAIT.
                </p>
              </div>
            </div>
          </div>
        </footer>

        <CareerAssessmentModal
          isOpen={isAssessmentOpen}
          onClose={() => setIsAssessmentOpen(false)}
          onComplete={async (answers) => {
            console.log('Assessment completed:', answers);
            
            try {
              toast.loading('Analyzing your responses with AI...', { id: 'gemini-analysis' });
              
              // Analyze answers and get job recommendations from Gemini
              const recommendations = await analyzeAssessmentAnswersWithGemini(answers);
              setJobRecommendations(recommendations);
              
              // Close modal and show results
              setIsAssessmentOpen(false);
              setShowRecommendations(true);
              
              toast.success('Assessment completed! Here are your personalized career recommendations.', { id: 'gemini-analysis' });
            } catch (error) {
              console.error('Error generating recommendations:', error);
              toast.error('Failed to generate recommendations. Please try again.', { id: 'gemini-analysis' });
            }
          }}
        />

        {/* Career Recommendations Results */}
        {showRecommendations && jobRecommendations.length > 0 && (
          <CareerRecommendationResults
            recommendations={jobRecommendations}
            onClose={() => {
              setShowRecommendations(false);
              // Optionally navigate to skills input
              setCurrentStep('skills');
            }}
          />
        )}
      </div>
    );
  }

  // Skills Input Screen
  if (currentStep === 'skills') {
    return (
      <div className="min-h-screen bg-background py-4 sm:py-8 px-2 sm:px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                onClick={handleStartOver}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm p-2 sm:p-3"
              >
                ← Back to Home
              </Button>
              <div className="flex items-center gap-2 sm:gap-4 text-xs overflow-x-auto">
                <Link to="/insights" className="text-muted-foreground hover:text-foreground whitespace-nowrap">
                  Insights
                </Link>
                {user && (
                  <>
                    <span className="text-muted-foreground hidden sm:inline">•</span>
                    <Link to="/profile" className="text-muted-foreground hover:text-foreground whitespace-nowrap">
                      Profile
                    </Link>
                  </>
                )}
                <ModeToggle />
              </div>
            </div>
          </div>
          
          <SkillInput
            selectedSkills={selectedSkills}
            onSkillsChange={setSelectedSkills}
            onAnalyze={handleAnalyze}
          />
        </div>

        <CareerAssessmentModal
          isOpen={isAssessmentOpen}
          onClose={() => setIsAssessmentOpen(false)}
          onComplete={async (answers) => {
            console.log('Assessment completed:', answers);
            
            try {
              toast.loading('Analyzing your responses with AI...', { id: 'gemini-analysis-skills' });
              
              // Analyze answers and get job recommendations from Gemini
              const recommendations = await analyzeAssessmentAnswersWithGemini(answers);
              setJobRecommendations(recommendations);
              
              // Close modal and show results
              setIsAssessmentOpen(false);
              setShowRecommendations(true);
              
              toast.success('Assessment completed! Here are your personalized career recommendations.', { id: 'gemini-analysis-skills' });
            } catch (error) {
              console.error('Error generating recommendations:', error);
              toast.error('Failed to generate recommendations. Please try again.', { id: 'gemini-analysis-skills' });
            }
          }}
        />
        
        {/* Career Recommendations Results */}
        {showRecommendations && jobRecommendations.length > 0 && (
          <CareerRecommendationResults
            recommendations={jobRecommendations}
            onClose={() => {
              setShowRecommendations(false);
            }}
          />
        )}
      </div>
    );
  }

  // Recommendations Screen
  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-2 sm:px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 sm:gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep('skills')}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm p-2"
              >
                ← Edit Skills
              </Button>
              <Button 
                variant="outline" 
                onClick={handleStartOver}
                className="text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
              >
                Start Over
              </Button>
            </div>
            <div className="flex items-center gap-1 sm:gap-4 text-xs overflow-x-auto">
              <Link to="/insights" className="text-muted-foreground hover:text-foreground whitespace-nowrap">
                Insights
              </Link>
              {user && (
                <Link to="/profile" className="text-muted-foreground hover:text-foreground whitespace-nowrap">
                  Profile
                </Link>
              )}
              <ModeToggle />
            </div>
          </div>
        </div>

        <CareerRecommendations
          careerPaths={careerPaths}
          onSelectCareer={handleSelectCareer}
          selectedCareer={selectedCareer}
          completedSteps={completedSteps}
          onToggleStep={handleToggleStep}
          userSkills={selectedSkills}
          onAddSkills={handleAddSkills}
        />
      </div>

      <CareerAssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onComplete={async (answers) => {
          console.log('Assessment completed:', answers);
          
          try {
            toast.loading('Analyzing your responses with AI...', { id: 'gemini-analysis-recs' });
            
            // Analyze answers and get job recommendations from Gemini
            const recommendations = await analyzeAssessmentAnswersWithGemini(answers);
            setJobRecommendations(recommendations);
            
            // Close modal and show results
            setIsAssessmentOpen(false);
            setShowRecommendations(true);
            
            toast.success('Assessment completed! Here are your personalized career recommendations.', { id: 'gemini-analysis-recs' });
          } catch (error) {
            console.error('Error generating recommendations:', error);
            toast.error('Failed to generate recommendations. Please try again.', { id: 'gemini-analysis-recs' });
          }
        }}
      />
      
      {/* Career Recommendations Results */}
      {showRecommendations && jobRecommendations.length > 0 && (
        <CareerRecommendationResults
          recommendations={jobRecommendations}
          onClose={() => {
            setShowRecommendations(false);
          }}
        />
      )}
    </div>
  );
};

export default Index;