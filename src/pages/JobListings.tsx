import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, MapPin, DollarSign, Calendar, Building2, 
  ExternalLink, ArrowLeft, Search, Filter, TrendingUp,
  Clock, AlertCircle, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  searchJobs, 
  JobListing, 
  getCareerKeywords, 
  formatSalary, 
  getDaysAgo 
} from '@/lib/adzunaService';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';

const JobListings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const careerTitle = location.state?.careerTitle || 'Software Engineer';
  
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(getCareerKeywords(careerTitle));
  const [locationQuery, setLocationQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'salary'>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [averageSalary, setAverageSalary] = useState(0);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultsPerPage = 20;

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    console.log('🚀 JobListings - Starting job fetch');
    console.log('Search params:', { searchQuery, locationQuery, currentPage, sortBy });
    
    try {
      const response = await searchJobs({
        what: searchQuery,
        where: locationQuery,
        page: currentPage,
        results_per_page: resultsPerPage,
        sort_by: sortBy,
        max_days_old: 30,
        country: 'us'
      });

      console.log('✅ JobListings - Jobs fetched successfully:', response);
      
      setJobs(response.results);
      setTotalCount(response.count);
      setAverageSalary(response.mean);
      
      if (response.results.length === 0) {
        toast.info('No jobs found. Try adjusting your search criteria.');
      }
    } catch (err) {
      console.error('❌ JobListings - Error fetching jobs:', err);
      setError('Failed to fetch job listings. Please try again later.');
      toast.error('Failed to load job listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const truncateDescription = (description: string, maxLength: number = 200) => {
    const plainText = description.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const totalPages = Math.ceil(totalCount / resultsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4">
            <BackButton to="/" label="Back to Home" className="hover:bg-muted" />
          </div>

          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Job Opportunities
            </h1>
          </div>
          
          <p className="text-muted-foreground text-lg">
            Explore {totalCount > 0 ? `${totalCount.toLocaleString()}+` : ''} job openings for <span className="font-semibold text-foreground">{careerTitle}</span>
          </p>

          {averageSalary > 0 && (
            <div className="flex items-center gap-2 mt-3 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">
                Average salary: <span className="font-semibold text-foreground">{formatSalary(averageSalary)}</span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 border-2">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Job Title or Keywords</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="e.g. Full Stack Developer"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="City or State"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={(value: 'relevance' | 'date' | 'salary') => setSortBy(value)}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Most Relevant</SelectItem>
                        <SelectItem value="date">Most Recent</SelectItem>
                        <SelectItem value="salary">Highest Salary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    Search Jobs
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading job opportunities...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Error Loading Jobs</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button onClick={fetchJobs} variant="outline" size="sm" className="mt-3">
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Listings */}
        {!loading && !error && jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * resultsPerPage) + 1} - {Math.min(currentPage * resultsPerPage, totalCount)} of {totalCount.toLocaleString()} jobs
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
              </div>
            </div>

            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 hover:text-primary transition-colors">
                          {job.title}
                        </CardTitle>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span>{job.company}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location.display_name}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{getDaysAgo(job.created)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.contract_type && (
                            <Badge variant="secondary">{job.contract_type}</Badge>
                          )}
                          {job.contract_time && (
                            <Badge variant="outline">{job.contract_time}</Badge>
                          )}
                          {job.category && (
                            <Badge variant="outline">{job.category.label}</Badge>
                          )}
                        </div>

                        {(job.salary_min || job.salary_max) && (
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              {formatSalary(job.salary_min, job.salary_max, job.salary_is_predicted)}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        asChild
                        className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                      >
                        <a 
                          href={job.redirect_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Apply Now
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed mb-3">
                      {expandedJobId === job.id 
                        ? <div dangerouslySetInnerHTML={{ __html: job.description }} />
                        : truncateDescription(job.description)
                      }
                    </CardDescription>

                    {job.description.length > 200 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleJobExpansion(job.id)}
                        className="text-primary hover:text-primary/80"
                      >
                        {expandedJobId === job.id ? (
                          <>
                            Show Less <ChevronUp className="h-4 w-4 ml-1" />
                          </>
                        ) : (
                          <>
                            Show More <ChevronDown className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && jobs.length === 0 && (
          <Card className="border-2">
            <CardContent className="pt-12 pb-12 text-center">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any jobs matching your criteria. Try adjusting your search terms or location.
              </p>
              <Button onClick={() => {
                setSearchQuery(getCareerKeywords(careerTitle));
                setLocationQuery('');
                setCurrentPage(1);
                fetchJobs();
              }}>
                Reset Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobListings;
