import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';
import { SkillInput } from '@/components/SkillInput';
import { CareerRecommendations } from '@/components/CareerRecommendations';
import { getCareerRecommendations } from '@/data/careerData';
import { CareerPath } from '@/types/career';
import { useAuth } from '@/components/AuthProvider';
import { getUserSkills, saveUserSkills } from '@/lib/profile';
import { 
  Brain, Target, TrendingUp, Users, ArrowRight, Sparkles, 
  Zap, Star, Award, Globe, Code, BarChart3, Rocket, 
  CheckCircle, Play, Pause, Volume2, VolumeX, Maximize2, User
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, useScroll, useTransform, useInView, useAnimation } from 'framer-motion';
import { useInView as useIntersectionObserver } from 'react-intersection-observer';
import careerHeroImage from '@/assets/career-hero.jpg';

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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -25, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-accent/20 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, 25, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-2xl"
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-white/30 rounded-full pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Navigation */}
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-2 sm:top-4 left-2 right-2 sm:right-4 z-50 pointer-events-auto"
        >
          <div className="flex items-center justify-between w-full">
            {/* Mobile Menu - Show only essential links */}
            <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto scrollbar-hide">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/insights" className="text-white/80 hover:text-white text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap">
                  <span className="hidden sm:inline">Insights</span>
                  <span className="sm:hidden">Insights</span>
                </Link>
              </motion.div>
            </div>
            
            {/* Right side - Auth & Theme */}
            <div className="flex items-center gap-1 sm:gap-4">
              {user ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/profile" className="text-white/80 hover:text-white text-xs sm:text-sm font-medium transition-colors duration-300 flex items-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/login" className="text-white/80 hover:text-white text-xs sm:text-sm font-medium transition-colors duration-300">
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/signup" className="px-2 sm:px-4 py-1 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium border border-white/20 hover:bg-white/20 transition-all duration-300">
                      Sign up
                    </Link>
                  </motion.div>
                </>
              )}
              <ModeToggle />
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <div className="relative z-10">
          <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20 min-h-screen flex items-center">
            <div className="text-center space-y-6 sm:space-y-8 lg:space-y-10 xl:space-y-12 max-w-6xl mx-auto w-full">
              {/* Badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-xs sm:text-sm font-medium border border-white/20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                </motion.div>
                <span className="iron-font iron-font-white whitespace-nowrap" data-text="HORIZON">HORIZON</span> - AI Career Discovery
              </motion.div>
              
              {/* Main Heading */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-3 sm:space-y-4 lg:space-y-6"
              >
                <h1 className="font-bold text-white leading-[0.9] sm:leading-[0.95] lg:leading-tight">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="block iron-font iron-font-hero text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
                    data-text="HORIZON"
                  >
                    HORIZON
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="block text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl"
                  >
                Discover Your
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="block bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl"
                  >
                    Perfect Career
                  </motion.span>
              </h1>
              </motion.div>
              
              {/* Description */}
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/80 leading-relaxed max-w-4xl mx-auto font-light px-3 sm:px-4"
              >
                Your AI-powered career discovery platform. Map your skills, explore opportunities, 
                and get personalized recommendations to navigate your professional journey with confidence.
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="flex flex-col gap-3 sm:gap-4 justify-center items-center pt-4 sm:pt-6 lg:pt-8 px-3 sm:px-4 max-w-sm sm:max-w-md lg:max-w-none mx-auto"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                <Button 
                  size="lg"
                  onClick={() => {
                    if (user) {
                      navigate('/profile');
                    } else {
                      setCurrentStep('skills');
                    }
                  }}
                  className="bg-white text-gray-900 hover:bg-gray-50 font-bold px-4 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 lg:py-6 rounded-xl lg:rounded-2xl shadow-2xl text-sm sm:text-base lg:text-lg xl:text-xl group transition-all duration-300 border-2 border-white/20 hover:border-white/40 w-full sm:w-auto min-h-[44px] sm:min-h-[48px]"
                >
                    <Rocket className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />
                    <span className="truncate">{user ? 'Go to Profile' : 'Start Your Journey'}</span>
                    <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/interview')}
                    className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 rounded-xl lg:rounded-2xl text-sm sm:text-base lg:text-lg backdrop-blur-sm transition-all duration-300 shadow-lg [text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)] w-full sm:w-auto min-h-[44px] sm:min-h-[48px]"
                  >
                    <Brain className="mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                    <span className="truncate">AI Interview Practice</span>
                </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 rounded-xl lg:rounded-2xl text-sm sm:text-base lg:text-lg backdrop-blur-sm transition-all duration-300 shadow-lg [text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)] w-full sm:w-auto min-h-[44px] sm:min-h-[48px]"
                  >
                    <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                    <span className="truncate">Watch Demo</span>
                </Button>
                </motion.div>
              </motion.div>
              

            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-4 h-6 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-0.5 h-2 sm:w-1 sm:h-3 bg-white/70 rounded-full mt-1 sm:mt-2"
            />
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <div className="relative z-10 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
                How It Works
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                Three simple steps to unlock your career potential and discover your perfect path
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
              {[
                {
                  icon: Brain,
                  title: "Map Your Skills",
                  description: "Input your current skills and expertise. Our AI system recognizes both technical and soft skills with advanced pattern matching.",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Target,
                  title: "Get Recommendations",
                  description: "Receive personalized career paths based on your skills with match percentages, growth potential, and market demand analysis.",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  icon: TrendingUp,
                  title: "Plan Your Growth",
                  description: "Get actionable next steps, resources, and track your progress toward your career goals with detailed roadmaps.",
                  color: "from-green-500 to-emerald-500"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <div className="text-center space-y-4 sm:space-y-6 p-6 sm:p-8 rounded-3xl bg-gradient-card shadow-soft hover:shadow-large transition-all duration-500 border border-border/50">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mx-auto shadow-lg`}
                    >
                      <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))
            }
            </div>
          </div>
        </div>

        {/* Our Mission and About Us Section */}
        <div className="relative bg-background py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
                Our Mission
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4">
                Our mission is to help confused students find clarity, confidence, and direction in their career journey. Instead of running to multiple websites, counselors, and chatbots, we provide a one-stop AI-powered advisor that delivers everything in one place—career roadmaps, job trends, skill mapping, resume and LinkedIn support, higher studies guidance, and soft skills training.

We aim to bridge the gap between students and the evolving job market by offering personalized, actionable, and future-ready guidance.
              </p>
            </motion.div>
            
            {/* About Us Section */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Meet Our Team
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Built by passionate students from Maharaja Agrasen Institute of Technology
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8 max-w-7xl mx-auto px-4">
              {[
                {
                  name: "Divyaansh",
                  role: "Frontend Developer",
                  education: "B.Tech at Maharaja Agrasen Institute of Technology",
                  description: "Passionate about creating beautiful, intuitive user interfaces that make career discovery seamless and engaging.",
                  initials: "D"
                },
                {
                  name: "Vaasu",
                  role: "Fullstack Developer",
                  education: "B.Tech at Maharaja Agrasen Institute of Technology",
                  description: "Bridges frontend and backend to create cohesive experiences, ensuring smooth data flow and optimal performance.",
                  initials: "V"
                },
                {
                  name: "Mannat",
                  role: "Backend Developer",
                  education: "B.Tech at Maharaja Agrasen Institute of Technology",
                  description: "Architect of robust systems and AI algorithms that power intelligent career recommendations and data analysis.",
                  initials: "M"
                },
                {
                  name: "Harshita Behl",
                  role: "ML Developer",
                  education: "Currently pursuing B.Tech at Maharaja Agrasen Institute of Technology",
                  description: "Specializes in machine learning algorithms and AI model development, creating intelligent systems that enhance career matching and recommendation engines.",
                  initials: "H"
                },
                {
                  name: "Apoorva Gupta",
                  role: "UI/UX Designer",
                  education: "Currently pursuing B.Tech at Maharaja Agrasen Institute of Technology",
                  description: "Crafts exceptional user experiences through thoughtful design, ensuring every interaction is intuitive and visually appealing for career discovery.",
                  initials: "A"
                }
              ].map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div className="bg-gradient-card rounded-3xl p-6 sm:p-8 shadow-soft hover:shadow-medium transition-all duration-300 border border-border/50 h-full">
                    <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl sm:text-2xl">
                          {member.initials}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold text-foreground mb-1">{member.name}</h4>
                        <p className="text-primary font-semibold mb-2 text-sm sm:text-base">{member.role}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{member.education}</p>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                        {member.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-hero py-16 sm:py-20 lg:py-24 overflow-hidden">
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-10 left-10 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-60 h-60 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl"
              animate={{
                x: [0, -50, 0],
                y: [0, 30, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
                Ready to Transform Your Career?
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 sm:mb-12 leading-relaxed px-4">
                Join thousands of professionals who have discovered their perfect career path. 
                Start your journey today and unlock your potential.
              </p>
              
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex justify-center items-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Button 
                    size="lg"
                    onClick={() => setCurrentStep('skills')}
                    className="bg-white text-gray-900 hover:bg-gray-50 font-bold px-8 sm:px-12 py-4 sm:py-6 rounded-2xl shadow-2xl text-lg sm:text-xl group transition-all duration-300 w-full sm:w-auto"
                  >
                    <Rocket className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform duration-300" />
                    Get Started Now
                    <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
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
    </div>
  );
};

export default Index;