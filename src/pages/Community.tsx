import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';
import { HorizonLogo } from '@/components/HorizonLogo';
import { 
  Heart, MessageCircle, Share2, TrendingUp, Users, 
  Calendar, Filter, Search, ArrowLeft, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const Community = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [displayedPosts, setDisplayedPosts] = useState(6);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const communityPosts = [
    {
      id: 1,
      user: "Ruchi Bhat",
      handle: "@ruchibhatt",
      avatar: "SC",
      content: "Just discovered my perfect career path through HORIZON! The AI recommendations were spot-on. From marketing to data science - what a journey! 🚀 #CareerDiscovery #DataScience",
      date: "Dec 15",
      likes: 24,
      comments: 8,
      shares: 5,
      category: "success"
    },
    {
      id: 2,
      user: "Yatin Kumar",
      handle: "@yatinkumarr",
      avatar: "MR",
      content: "The skill gap analysis feature is incredible. It showed me exactly what I needed to learn to transition into product management. Already enrolled in 3 courses! 💪 #ProductManagement #Learning",
      date: "Dec 14",
      likes: 18,
      comments: 12,
      shares: 3,
      category: "learning"
    },
    {
      id: 3,
      user: "Kim kadarshian",
      handle: "@kim23",
      avatar: "AK",
      content: "HORIZON's interview simulator helped me land my dream job at Google! The AI feedback was so detailed and helpful. Can't recommend it enough! 🎉 #InterviewPrep #Google #Success",
      date: "Dec 13",
      likes: 42,
      comments: 19,
      shares: 8,
      category: "success"
    },
    {
      id: 4,
      user: "Emma Watson",
      handle: "@emmawatson",
      avatar: "EW",
      content: "The career roadmap feature is a game-changer. I can see exactly where I'll be in 5 years and what steps to take. Finally, clarity in my career journey! 📈 #CareerPlanning #Roadmap",
      date: "Dec 12",
      likes: 31,
      comments: 15,
      shares: 7,
      category: "planning"
    },
    {
      id: 5,
      user: "Khushi Sharma",
      handle: "@khushisharma",
      avatar: "DP",
      content: "Love how HORIZON connects skills to real job opportunities. Found 3 perfect matches I never would have considered. The AI really understands the market! 🤖 #JobSearch #AI",
      date: "Dec 11",
      likes: 27,
      comments: 9,
      shares: 4,
      category: "opportunities"
    },
    {
      id: 6,
      user: "Lisa",
      handle: "@lisazhang",
      avatar: "LZ",
      content: "The community insights are amazing. Seeing what skills are trending and what companies are hiring for helps me stay ahead of the curve. 📊 #MarketInsights #Trends",
      date: "Dec 10",
      likes: 35,
      comments: 22,
      shares: 11,
      category: "insights"
    },
    {
      id: 7,
      user: "Varun dhawan",
      handle: "@varun45",
      avatar: "JW",
      content: "Just completed my first AI interview practice session. The feedback was incredibly detailed - it even caught my body language! This is the future of interview prep. 🤖 #AI #InterviewPrep",
      date: "Dec 9",
      likes: 28,
      comments: 14,
      shares: 6,
      category: "learning"
    },
    {
      id: 8,
      user: "Maria 20",
      handle: "@mariagarcia",
      avatar: "MG",
      content: "The networking feature connected me with 5 professionals in my target industry. Already have 3 coffee chats scheduled! Networking has never been this easy. ☕ #Networking #CareerGrowth",
      date: "Dec 8",
      likes: 22,
      comments: 16,
      shares: 9,
      category: "networking"
    },
    {
      id: 9,
      user: "Ashneer Grover",
      handle: "@BharatPay",
      avatar: "TS",
      content: "We're hiring! Looking for a Senior Product Manager with 5+ years experience. HORIZON helped us find the perfect candidate match. DM for details! 🚀 #Hiring #ProductManagement",
      date: "Dec 7",
      likes: 45,
      comments: 28,
      shares: 15,
      category: "opportunities"
    }
  ];

  const filters = [
    { id: 'all', label: 'All Posts', count: communityPosts.length },
    { id: 'success', label: 'Success Stories', count: communityPosts.filter(p => p.category === 'success').length },
    { id: 'learning', label: 'Learning', count: communityPosts.filter(p => p.category === 'learning').length },
    { id: 'opportunities', label: 'Opportunities', count: communityPosts.filter(p => p.category === 'opportunities').length },
    { id: 'insights', label: 'Insights', count: communityPosts.filter(p => p.category === 'insights').length }
  ];

  const filteredPosts = selectedFilter === 'all' 
    ? communityPosts 
    : communityPosts.filter(post => post.category === selectedFilter);

  const visiblePosts = filteredPosts.slice(0, displayedPosts);
  const hasMorePosts = filteredPosts.length > displayedPosts;

  const handleLoadMore = () => {
    const newDisplayedCount = displayedPosts + 6;
    setDisplayedPosts(newDisplayedCount);
    if (newDisplayedCount >= filteredPosts.length) {
      setShowLoadMore(false);
    }
  };

  // Reset displayed posts when filter changes
  useEffect(() => {
    setDisplayedPosts(6);
    setShowLoadMore(true);
  }, [selectedFilter]);

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-gray-900 border-b border-purple-900/30"
      >
        <div className="flex items-center justify-between w-full px-6 py-4">
          {/* Logo with Duck Video */}
          <motion.div 
            className="flex items-center gap-4 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
          >
            <HorizonLogo size="md" variant="light" />
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-10 w-auto rounded-lg shadow-lg"
              style={{ maxWidth: '150px' }}
            >
              <source src="/Duck_s_Resume_for_Career_Guidance.mp4" type="video/mp4" />
            </video>
          </motion.div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to='/' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
              HOME
            </Link>
            <Link to='/' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
              FEATURES
            </Link>
            <Link to='/' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
              DASHBOARD
            </Link>
            <Link to='/blog' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
              BLOGS
            </Link>
            <Link to='/' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
              INSIGHTS
            </Link>
            <Link to='/community' className='text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
              COMMUNITY
            </Link>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </motion.nav>

      {/* Discord Community Section */}
      <div className="bg-gradient-to-br from-purple-950 via-black to-black py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Side - Text Content */}
        <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="text-purple-400 text-xs uppercase tracking-widest mb-4 font-inter">DISCORD COMMUNITY</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Find your people in the CareerExplorer Discord community
              </h1>
              <p className="text-lg text-white/90 mb-8 max-w-xl">
                Join our network and connect with career-focused individuals, just like you.
              </p>
            <Button
                className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-base font-medium mb-4"
                onClick={() => window.open('https://discord.gg/Bmrm67r6', '_blank')}
              >
                Join the community
              </Button>
              <p className="text-gray-400 text-sm">• 9769 members</p>
            </motion.div>

            {/* Right Side - Visual with Hashtags and Profiles */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              {/* Purple Blob Shape */}
              <div className="relative bg-purple-900/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-purple-600/10 rounded-3xl blur-xl"></div>
                
                {/* Hashtags */}
                <div className="space-y-3 mb-6 relative z-10">
                  <div className="text-gray-300 text-sm">#career-questions</div>
                  <div className="text-gray-300 text-sm">#career-planning</div>
                  <div className="text-gray-300 text-sm">#changing-careers</div>
                  <div className="text-gray-300 text-sm">#helpful-resources</div>
                  <div className="text-gray-300 text-sm">#question-of-the-day</div>
                </div>
                
                {/* Typing indicator */}
                <div className="text-purple-400 text-xs mb-6 relative z-10">several people are typing...</div>
                
                {/* Profile Pictures */}
                <div className="flex -space-x-3 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-black flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-black flex items-center justify-center text-white font-bold">
                    B
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-black flex items-center justify-center text-white font-bold">
                    C
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-black flex items-center justify-center text-white font-bold">
                    D
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* What is Discord Section */}
      <div className="bg-gray-50 py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <div className="relative">
                {/* Abstract shapes in background */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                  <div className="absolute top-10 left-10 w-64 h-64 bg-purple-300 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-400 rounded-full blur-3xl"></div>
                </div>
                
                {/* Discord Mockup */}
                <div className="relative bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Channel List */}
                  <div className="flex">
                    <div className="w-48 bg-gray-900 p-4 border-r border-gray-700">
                      <div className="space-y-1">
                        {['# ask-a-career-question', '# career-launcher', '# helpful-resources', '# watercooler'].map((channel, i) => (
                          <div key={i} className={`px-3 py-2 rounded ${i === 1 ? 'bg-purple-600' : 'hover:bg-gray-800'}`}>
                            <p className="text-white text-sm">{channel}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Chat Window */}
                    <div className="flex-1">
                      <div className="p-4 border-b border-gray-700">
                        <p className="text-white font-semibold"># career-launcher</p>
                      </div>
                      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">M</div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-semibold">Metric</span>
                              <span className="text-gray-400 text-xs">Today at 9:22am</span>
                            </div>
                            <p className="text-white/90">I plan to look more into bioinformatics and computer & informations before I return to college. I have an AS in Mathematics currently and left college on great terms.</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">C</div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-semibold">ccmo42</span>
                              <span className="text-gray-400 text-xs">Today at 10:10am</span>
                            </div>
                            <p className="text-white/90">Hey @Metric, I've been working as a data scientist for almost two years now - I'd be happy to chat if you have any interest in data science or a related track!</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">M</div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-semibold">Metric</span>
                              <span className="text-gray-400 text-xs">Today at 10:23am</span>
                            </div>
                            <p className="text-white/90">Great! Thank you~</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">What is Discord?</h3>
                <p className="text-lg text-gray-600 mb-4">(Great question!)</p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Discord is an online social networking platform featuring thousands of servers focused on different areas of interest. Our CareerExplorer Discord server is focused on (you guessed it) careers. It's a place where you can connect with like-minded professionals, ask questions, share experiences, and get personalized career advice in real-time conversations.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How to Get In Section */}
      <div className="bg-white py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-2">How can I get in?</h2>
            <p className="text-gray-600">(Great news, it's free for now.)</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Sign up for Discord using this link.",
                description: "(Helpful tip: It is easiest to download and use the Discord desktop application.)",
                icon: "💬"
              },
              {
                step: 2,
                title: "Get verified by clicking the blue dot emoji to access all of our channels.",
                description: "",
                icon: "✅"
              },
              {
                step: 3,
                title: "Introduce yourself using the #introductions channel.",
                description: "",
                icon: "👋"
              },
              {
                step: 4,
                title: "Meet great people focused on finding a career path they love.",
                description: "",
                icon: "🎯"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <p className="text-sm font-semibold text-gray-900 mb-2">STEP {item.step}</p>
                <p className="text-gray-700 mb-2">{item.title}</p>
                {item.description && (
                  <p className="text-gray-500 text-sm">({item.description})</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
          </div>
          
      {/* How to Use Section */}
      <div className="bg-gray-50 py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h2 className="text-3xl font-bold text-gray-900">Have a burning career question?</h2>
              </div>
              <p className="text-lg text-gray-700">
                Use the #ask-a-career-question channel and we will do our best to answer it using our resources and network.
          </p>
        </motion.div>

            {/* Discord Chat Mockup */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-700">
                <p className="text-white font-semibold"># ask-a-career-question</p>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">Space</span>
                      <span className="text-gray-400 text-sm">Today at 11:45am</span>
                    </div>
                    <p className="text-white/90 mb-3">
                      I'm debating whether i want to switch majors from computer engineering to maybe civil engineering. Here are my results from the test.
                    </p>
                    <div className="bg-gray-700 rounded-lg p-4 mb-2">
                      <p className="text-white font-semibold mb-3">Your top careers</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['Industrial Engineer', 'Wind Energy Engineer', 'Locomotive Engineer', 'Mechanical Engineer', 'Solution Architect', 'Aerospace Engineer'].map((career, i) => (
                          <div key={i} className="bg-gray-800 rounded p-2 text-center">
                            <div className="text-white text-xs">⭐</div>
                            <div className="text-white text-xs mt-1">{career}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-white/90">
                      Im just looking for advice on whether I should make a major switch, and any other help.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* How to Get In Section */}
      <div className="bg-white py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
          </motion.div>

         
        </div>
      </div>

      {/* Want to Become Next Elon Musk Section */}
      <div className="bg-white py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Discord Chat Mockup */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-700">
                <p className="text-white font-semibold"># internships-opportunities</p>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    A
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">Alex_Innovator</span>
                      <span className="text-gray-400 text-sm">Today at 2:30pm</span>
                    </div>
                    <p className="text-white/90 mb-3">
                      Looking for summer internships in AI/ML space. Just completed skill-upgrade module on neural networks! Any recommendations?
                    </p>
                    <div className="bg-gray-700 rounded-lg p-3 mb-2">
                      <p className="text-purple-300 text-sm font-semibold mb-2">🚀 Available Opportunities:</p>
                      <div className="space-y-2 text-sm">
                        <div className="text-white">• Google AI Research Internship (2025)</div>
                        <div className="text-white">• Meta AI Software Engineering Internship</div>
                        <div className="text-white">• OpenAI Research Intern</div>
                      </div>
                    </div>
                    <p className="text-white/90">
                      Applied for 3 positions using skill-upgrade credentials. Fingers crossed! 🤞
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h2 className="text-3xl font-bold text-gray-900">Want to become next Elon Musk?</h2>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                Use our skill-upgrade platform to build expertise, then explore internship opportunities aligned with your career goals. Access exclusive listings from top companies.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <span className="text-purple-600">✓</span>
                  <span>AI-powered skill assessment and personalized learning paths</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-600">✓</span>
                  <span>Exclusive internship opportunities from Fortune 500 companies</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-600">✓</span>
                  <span>Real-time application tracking and interview prep</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* IIT Professionals Guidance Section */}
      <div className="bg-gray-50 py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h2 className="text-3xl font-bold text-gray-900">Guidance corner by top IIT professionals</h2>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                Get personalized mentorship and resume reviews from IIT alumni and industry experts. Connect with professionals who've walked the path you want to take.
              </p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-center gap-3">
                  <span className="text-purple-600">✓</span>
                  <span>Expert resume reviews by IIT professionals</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-600">✓</span>
                  <span>1-on-1 mentorship sessions</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-600">✓</span>
                  <span>Career planning workshops and webinars</span>
                </li>
              </ul>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
                onClick={() => window.open('https://discord.gg/Bmrm67r6', '_blank')}
              >
                Connect with an IIT Mentor
              </Button>
            </motion.div>

            {/* Discord Chat Mockup */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-700">
                <p className="text-white font-semibold"># resume-review</p>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    R
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">Ravi_Engineer</span>
                      <span className="text-gray-400 text-sm">Today at 3:15pm</span>
                    </div>
                    <p className="text-white/90 mb-3">
                      Just got my resume reviewed by Prof. Singh from IIT Delhi! Got amazing feedback on my project descriptions. Huge improvement! 🙏
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">Prof_Singh_IITDelhi</span>
                      <span className="text-gray-400 text-sm">Today at 3:25pm</span>
                    </div>
                    <p className="text-white/90">
                      Glad I could help! Remember to quantify your achievements. Looking forward to seeing where you land! 🎯
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    P
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">Priya_Tech</span>
                      <span className="text-gray-400 text-sm">Today at 3:40pm</span>
                    </div>
                    <p className="text-white/90">
                      Need resume review too! How do I book a session? @Prof_Singh_IITDelhi
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-black py-12 px-6">
        <div className="container mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
              { icon: Users, label: "Active Members", value: "12.5K", color: "from-purple-500 to-purple-700" },
              { icon: TrendingUp, label: "Success Stories", value: "2.3K", color: "from-purple-400 to-purple-600" },
              { icon: MessageCircle, label: "Posts This Month", value: "847", color: "from-purple-600 to-purple-800" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="bg-purple-900/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 text-center"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-white/80">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedFilter === filter.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-900/20 text-white/80 hover:bg-purple-900/30 border border-purple-500/20'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </motion.div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
                className="bg-purple-900/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {post.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-sm">{post.user}</h3>
                    <span className="text-white/60 text-sm">{post.handle}</span>
                    <div className="ml-auto">
                        <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🐦</span>
                        </div>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed mb-4">{post.content}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-white/60 text-xs">
                <span>{post.date}</span>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </button>
                    <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </button>
                    <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                    {post.shares}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
          {showLoadMore && hasMorePosts && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center mt-12"
        >
          <Button 
            size="lg"
                onClick={handleLoadMore}
                className="bg-purple-900/20 backdrop-blur-sm border border-purple-500/20 text-white hover:bg-purple-900/30 hover:border-purple-400/40 font-medium px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 font-inter"
          >
            Load More Posts
          </Button>
        </motion.div>
          )}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="bg-black border-t border-purple-900/30 py-3">
        <div className="text-center">
          <p className="text-white text-sm font-medium">FREE FOR A LIMITED TIME</p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-gray-900 py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {[
                { 
                  question: "What is Discord?",
                  answer: "Discord is an online social networking platform featuring thousands of servers focused on different areas of interest. Our CareerExplorer Discord server is focused on careers, providing a space where you can connect with like-minded professionals, ask questions, share experiences, and get personalized career advice in real-time conversations."
                },
                { 
                  question: "Is joining the CareerExplorer Discord community free?",
                  answer: "Yes! Joining our Discord community is completely free. We believe in making career guidance accessible to everyone. There are no hidden fees, subscriptions, or premium tiers required to participate in our community discussions and get support."
                },
                { 
                  question: "How is this different from LinkedIn or other social networks?",
                  answer: "Unlike LinkedIn's broadcast-style networking, our Discord community offers real-time, interactive conversations in dedicated channels. We focus on peer-to-peer learning, Q&A sessions, and building genuine connections through active discussions. It's more personal, immediate, and collaborative than traditional professional networking platforms."
                },
                { 
                  question: "What topics can I discuss in the community?",
                  answer: "Our community covers a wide range of career-related topics including career transitions, skill development, interview preparation, industry insights, educational paths, job searching strategies, salary negotiations, and much more. We have dedicated channels for different types of questions and discussions."
                },
                { 
                  question: "Can I get personalized career advice?",
                  answer: "Absolutely! Our community is designed for peer-to-peer support. You can ask specific questions about your career situation, share your career test results for feedback, get advice on major decisions, and learn from others who have been in similar situations. The community is very supportive and responsive."
                },
                { 
                  question: "How active is the community?",
                  answer: "Our community is highly active with thousands of members online at various times throughout the day. You'll typically get responses to your questions within hours, and there are always engaging conversations happening in the channels. We also host regular events and Q&A sessions."
                },
                { 
                  question: "Is there moderation to ensure a safe environment?",
                  answer: "Yes, we have active moderation to ensure a respectful, inclusive, and safe environment for everyone. Our community guidelines promote constructive discussions, discourage spam or self-promotion, and maintain a supportive atmosphere. All members are expected to be respectful and helpful to one another."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors"
                >
                  <div 
                    className="p-6 flex items-center justify-between cursor-pointer"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  >
                    <p className="text-white font-medium pr-4">{faq.question}</p>
                    <span className={`text-white text-xl transition-transform ${openFaqIndex === index ? 'rotate-90' : ''}`}>→</span>
                  </div>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm">For Individuals</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Blog</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Dashboard</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Logout</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">The CareerExplorer Career Test</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm">Explore</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Career Collections</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">What Career Is Right For Me?</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Careers in Finance</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Careers in Medicine</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Careers in Psychology</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Careers in Travel</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm">For Organizations</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">CareerExplorer for Organizations</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-4 uppercase text-sm">© SOKANU INTERACTIVE INC. 2025</p>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">About CareerExplorer</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Contact</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">FAQ Knowledge Base</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Terms & conditions</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Privacy</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Accessibility</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Do Not Sell My Personal Information</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Community;