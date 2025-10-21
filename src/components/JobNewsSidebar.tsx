import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X, 
  ExternalLink, 
  Calendar, 
  Building2, 
  MapPin,
  Clock,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface JobNewsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onMarkAsRead: () => void;
}

interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  isNew: boolean;
  isRead: boolean;
  category: string;
  url: string;
}

export const JobNewsSidebar = ({ isOpen, onClose, unreadCount, onMarkAsRead }: JobNewsSidebarProps) => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [filter, setFilter] = useState<'all' | 'latest' | 'unread'>('all');

  // Mock job data - replace with actual API call
  useEffect(() => {
    const mockJobs: JobPost[] = [
      {
        id: '1',
        title: 'Senior Full Stack Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        date: '2 hours ago',
        isNew: true,
        isRead: false,
        category: 'Tech',
        url: '/news'
      },
      {
        id: '2',
        title: 'Data Scientist - Machine Learning',
        company: 'AI Solutions Ltd.',
        location: 'Remote',
        date: '4 hours ago',
        isNew: true,
        isRead: false,
        category: 'Data Science',
        url: '/news'
      },
      {
        id: '3',
        title: 'DevOps Engineer',
        company: 'CloudTech',
        location: 'New York, NY',
        date: '6 hours ago',
        isNew: false,
        isRead: true,
        category: 'DevOps',
        url: '/news'
      },
      {
        id: '4',
        title: 'Frontend Developer - React',
        company: 'StartupXYZ',
        location: 'Austin, TX',
        date: '8 hours ago',
        isNew: false,
        isRead: false,
        category: 'Frontend',
        url: '/news'
      },
      {
        id: '5',
        title: 'Product Manager',
        company: 'InnovateCorp',
        location: 'Seattle, WA',
        date: '1 day ago',
        isNew: false,
        isRead: true,
        category: 'Product',
        url: '/news'
      }
    ];
    setJobs(mockJobs);
  }, []);

  const handleJobClick = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, isRead: true } : job
    ));
    onMarkAsRead();
  };

  const filteredJobs = jobs.filter(job => {
    switch (filter) {
      case 'latest':
        return job.isNew;
      case 'unread':
        return !job.isRead;
      default:
        return true;
    }
  });

  const getTimeAgo = (date: string) => {
    return date;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Job Updates</h2>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'latest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('latest')}
                >
                  Latest
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                >
                  Unread
                </Button>
              </div>
            </div>

            {/* Job List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No jobs found</p>
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          !job.isRead ? 'border-primary/20 bg-primary/5' : ''
                        }`}
                        onClick={() => handleJobClick(job.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
                                {job.title}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Building2 className="h-3 w-3" />
                                <span>{job.company}</span>
                                <MapPin className="h-3 w-3 ml-2" />
                                <span>{job.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {job.isNew && (
                                <Badge variant="destructive" className="text-xs">
                                  New
                                </Badge>
                              )}
                              {!job.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{getTimeAgo(job.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {job.category}
                              </Badge>
                              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t">
              <Button asChild className="w-full" size="lg">
                <Link to="/news" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View All Jobs
                </Link>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
