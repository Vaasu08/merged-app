import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10"
      >
        <div className="flex items-center justify-between w-full px-6 py-4">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
          >
            <HorizonLogo size="md" variant="light" />
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
            <Link to='/' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
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

      {/* Header */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Community
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Connect with career-focused professionals, share your journey, and discover new opportunities
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { icon: Users, label: "Active Members", value: "12.5K", color: "from-blue-500 to-cyan-500" },
            { icon: TrendingUp, label: "Success Stories", value: "2.3K", color: "from-green-500 to-emerald-500" },
            { icon: MessageCircle, label: "Posts This Month", value: "847", color: "from-purple-500 to-pink-500" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
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
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedFilter === filter.id
                  ? 'bg-white text-gray-900'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </motion.div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                  <p className="text-white/80 text-sm leading-relaxed mb-4">{post.content}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-white/60 text-xs">
                <span>{post.date}</span>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </button>
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <Share2 className="w-4 h-4" />
                    {post.shares}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center mt-12"
        >
          <Button 
            size="lg"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/40 font-medium px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-inter"
          >
            Load More Posts
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Community;

