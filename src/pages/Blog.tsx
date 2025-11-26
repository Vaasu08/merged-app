import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';
import { HorizonLogo } from '@/components/HorizonLogo';
import { 
  Heart, MessageCircle, Share2, TrendingUp, Users, 
  Calendar, Filter, Search, ArrowLeft, Plus, BookOpen, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const Blog = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [displayedPosts, setDisplayedPosts] = useState(6);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const blogPosts = [
    {
      id: 1,
      title: "How AI is Transforming Career Guidance in 2025",
      author: "Sarah Chen",
      authorAvatar: "SC",
      date: "Dec 15, 2024",
      readTime: "5 min read",
      excerpt: "Discover how artificial intelligence is revolutionizing the way we approach career planning and job matching. Learn about the latest trends and how HORIZON is leading the charge.",
      content: "In 2025, AI-powered career guidance has become more sophisticated than ever...",
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
      content: "Skill gap analysis is crucial for career growth...",
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
      content: "Interview preparation is more than just rehearsing answers...",
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
      content: "A well-defined career roadmap is your blueprint for success...",
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
      content: "ATS systems scan thousands of resumes daily...",
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
      content: "Remote work has transformed the professional landscape...",
      category: "Work Trends",
      tags: ["Remote Work", "Trends", "Opportunities"],
      likes: 124,
      comments: 27,
      shares: 38,
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800"
    },
  ];

  const categories = [
    { id: 'all', label: 'All Posts', count: blogPosts.length },
    { id: 'AI & Technology', label: 'AI & Technology', count: blogPosts.filter(p => p.category === 'AI & Technology').length },
    { id: 'Career Development', label: 'Career Development', count: blogPosts.filter(p => p.category === 'Career Development').length },
    { id: 'Interview Tips', label: 'Interview Tips', count: blogPosts.filter(p => p.category === 'Interview Tips').length },
    { id: 'Career Planning', label: 'Career Planning', count: blogPosts.filter(p => p.category === 'Career Planning').length },
    { id: 'Resume Tips', label: 'Resume Tips', count: blogPosts.filter(p => p.category === 'Resume Tips').length }
  ];

  const filteredPosts = selectedFilter === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedFilter);

  const searchedPosts = searchQuery 
    ? filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : filteredPosts;

  const visiblePosts = searchedPosts.slice(0, displayedPosts);
  const hasMorePosts = searchedPosts.length > displayedPosts;

  const handleLoadMore = () => {
    const newDisplayedCount = displayedPosts + 6;
    setDisplayedPosts(newDisplayedCount);
    if (newDisplayedCount >= searchedPosts.length) {
      setShowLoadMore(false);
    }
  };

  useEffect(() => {
    setDisplayedPosts(6);
    setShowLoadMore(true);
  }, [selectedFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black dark:from-slate-950 dark:via-purple-950 dark:to-black">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-purple-900/30"
      >
        <div className="flex items-center justify-between w-full px-6 py-4">
          {/* Logo */}
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
              className="h-10 w-auto rounded-lg shadow-lg max-w-[150px]"
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
            <Link to='/blog' className='text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
              BLOGS
            </Link>
            <Link to='/insights' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
              INSIGHTS
            </Link>
            <Link to='/community' className='text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 uppercase tracking-wide font-inter'>
              COMMUNITY
            </Link>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-950 via-black to-black py-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-purple-400" />
              <p className="text-purple-400 text-xs uppercase tracking-widest font-inter">HORIZON BLOG</p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Insights & Guides for Your Career Journey
            </h1>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Discover expert tips, industry trends, and actionable advice to accelerate your career growth.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-12 py-4 text-white placeholder-white/60 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black border-b border-purple-900/30 py-8 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedFilter(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedFilter === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-900/20 text-white/80 hover:bg-purple-900/30 border border-purple-500/20'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="bg-black py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-purple-900/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer"
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-purple-600/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {post.authorAvatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{post.author}</p>
                      <div className="flex items-center gap-2 text-white/60 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-white/60 text-xs pt-4 border-t border-purple-500/20">
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
                Load More Articles
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 px-6 border-t border-purple-900/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm">For Individuals</h3>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-gray-400 hover:text-white text-sm">Blog</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Dashboard</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Logout</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Career Test</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm">Explore</h3>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-gray-400 hover:text-white text-sm">Career Collections</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white text-sm">Career Guides</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white text-sm">Industry Insights</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-gray-400 hover:text-white text-sm">Blog Articles</Link></li>
                <li><Link to="/community" className="text-gray-400 hover:text-white text-sm">Community</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-4 uppercase text-sm">© HORIZON 2025</p>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">About HORIZON</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Contact</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm">Terms & conditions</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;

