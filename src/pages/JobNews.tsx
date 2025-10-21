import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ModeToggle } from '@/components/mode-toggle';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import { RefreshCw, ExternalLink, Newspaper, Calendar, Clock, TrendingUp, Users, Briefcase, Globe, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

type NewsItem = {
  id: string;
  title: string;
  link: string;
  pubDate?: Date;
  source: string;
  description?: string;
  content?: string;
};

const RSS_SOURCES: { name: string; url: string; category: string }[] = [
  // Remote Job Boards
  { name: 'RemoteOK', url: 'https://remoteok.com/remote-jobs.rss', category: 'Remote' },
  { name: 'We Work Remotely', url: 'https://weworkremotely.com/remote-jobs.rss', category: 'Remote' },
  { name: 'Remote.co', url: 'https://remote.co/remote-jobs.rss', category: 'Remote' },
  { name: 'FlexJobs', url: 'https://www.flexjobs.com/rss/jobs.rss', category: 'Remote' },
  
  // Tech Job Boards
  { name: 'AngelList Jobs', url: 'https://angel.co/jobs.rss', category: 'Tech' },
  { name: 'Stack Overflow Jobs', url: 'https://stackoverflow.com/jobs/feed', category: 'Tech' },
  { name: 'GitHub Jobs', url: 'https://jobs.github.com/positions.atom', category: 'Tech' },
  { name: 'Dice Jobs', url: 'https://www.dice.com/jobs/rss', category: 'Tech' },
  { name: 'Indeed Tech Jobs', url: 'https://www.indeed.com/rss?q=software+developer&l=', category: 'Tech' },
  
  // General Job Boards
  { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/search/rss/?keywords=software+developer', category: 'General' },
  { name: 'Glassdoor Jobs', url: 'https://www.glassdoor.com/Job/rss.htm', category: 'General' },
  { name: 'Monster Jobs', url: 'https://rss.monster.com/rss.ashx?q=software+developer', category: 'General' },
  { name: 'ZipRecruiter', url: 'https://www.ziprecruiter.com/jobs-rss', category: 'General' },
  
  // Industry News & Trends
  { name: 'Hacker News (Who is hiring?)', url: 'https://hnrss.org/newest?q=Who%20is%20hiring', category: 'Community' },
  { name: 'TechCrunch Jobs', url: 'https://techcrunch.com/category/jobs/feed/', category: 'News' },
  { name: 'VentureBeat Jobs', url: 'https://venturebeat.com/category/jobs/feed/', category: 'News' },
  { name: 'The Information Jobs', url: 'https://www.theinformation.com/feed', category: 'News' },
  
  // Startup & Startup Jobs
  { name: 'Y Combinator Jobs', url: 'https://www.ycombinator.com/jobs.rss', category: 'Startup' },
  { name: 'Startup Jobs', url: 'https://startup.jobs/rss', category: 'Startup' },
  { name: 'Crunchbase Jobs', url: 'https://www.crunchbase.com/jobs.rss', category: 'Startup' },
  
  // Specialized Tech
  { name: 'Dev.to Jobs', url: 'https://dev.to/feed', category: 'Developer' },
  { name: 'Reddit r/forhire', url: 'https://www.reddit.com/r/forhire.rss', category: 'Community' },
  { name: 'Reddit r/jobs', url: 'https://www.reddit.com/r/jobs.rss', category: 'Community' },
  { name: 'Reddit r/cscareerquestions', url: 'https://www.reddit.com/r/cscareerquestions.rss', category: 'Community' },
  
  // International
  { name: 'EU Startups Jobs', url: 'https://www.eu-startups.com/jobs/feed/', category: 'International' },
  { name: 'Silicon Valley Jobs', url: 'https://www.siliconvalley.com/jobs.rss', category: 'International' },
  
  // Additional Reliable Sources
  { name: 'Product Hunt Jobs', url: 'https://www.producthunt.com/jobs.rss', category: 'Startup' },
  { name: 'Remote Work Hub', url: 'https://remoteworkhub.com/feed/', category: 'Remote' },
  { name: 'Jobspresso', url: 'https://jobspresso.co/feed/', category: 'Remote' },
  { name: 'Working Nomads', url: 'https://www.workingnomads.com/jobs.rss', category: 'Remote' },
  { name: 'Toptal Jobs', url: 'https://www.toptal.com/careers.rss', category: 'Tech' },
  { name: 'Upwork Jobs', url: 'https://www.upwork.com/jobs.rss', category: 'Freelance' },
  { name: 'Freelancer Jobs', url: 'https://www.freelancer.com/jobs.rss', category: 'Freelance' },
];

const ALL_ORIGINS = 'https://api.allorigins.win/raw?url=';

const fetchRss = async (sourceName: string, rssUrl: string): Promise<NewsItem[]> => {
  try {
  const res = await fetch(`${ALL_ORIGINS}${encodeURIComponent(rssUrl)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load ${sourceName}`);
    
  const xmlText = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parseError = xml.querySelector('parsererror');
    if (parseError) {
      throw new Error(`XML parsing error for ${sourceName}`);
    }
    
    // Handle both RSS and Atom feeds
    let items = Array.from(xml.querySelectorAll('item'));
    if (items.length === 0) {
      // Try Atom format
      items = Array.from(xml.querySelectorAll('entry'));
    }
    
    const fallbackTitle = xml.querySelector('title')?.textContent || 
                         xml.querySelector('feed > title')?.textContent || 
                         sourceName;
    
  return items.slice(0, 25).map((item, idx) => {
    const title = item.querySelector('title')?.textContent || 'Untitled';
      const link = item.querySelector('link')?.textContent || 
                   item.querySelector('link')?.getAttribute('href') || 
                   '#';
      const description = item.querySelector('description')?.textContent || 
                         item.querySelector('summary')?.textContent || 
                         item.querySelector('content')?.textContent || '';
      const content = item.querySelector('content\\:encoded')?.textContent || 
                     item.querySelector('content')?.textContent || '';
      const pubDateStr = item.querySelector('pubDate')?.textContent || 
                        item.querySelector('dc\:date')?.textContent || 
                        item.querySelector('published')?.textContent || 
                        item.querySelector('updated')?.textContent || 
                        undefined;
    const pubDate = pubDateStr ? new Date(pubDateStr) : undefined;
      
    return {
        id: `${sourceName}-${idx}-${title}`.replace(/[^a-zA-Z0-9-_]/g, '-'),
        title: title.trim(),
        link: link.trim(),
      pubDate: pubDate && isFinite(pubDate.getTime()) ? pubDate : undefined,
        source: fallbackTitle.trim(),
        description: description.replace(/<[^>]*>/g, '').trim().substring(0, 500), // Strip HTML and limit length
        content: content.replace(/<[^>]*>/g, '').trim().substring(0, 1000), // Strip HTML and limit length
    };
  });
  } catch (error) {
    console.error(`Error fetching ${sourceName}:`, error);
    throw error;
  }
};

const JobNews = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [failedSources, setFailedSources] = useState<string[]>([]);

  const loadAll = async () => {
    setLoading(true);
    setFailedSources([]);
    try {
      const results = await Promise.allSettled(
        RSS_SOURCES.map(s => fetchRss(s.name, s.url))
      );
      const merged: NewsItem[] = [];
      const failed: string[] = [];
      
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          merged.push(...r.value);
        } else {
          failed.push(RSS_SOURCES[i].name);
          console.warn(`Failed to load ${RSS_SOURCES[i].name}:`, r.reason);
        }
      });
      
      setFailedSources(failed);
      
      if (failed.length > 0) {
        toast.warning(`Failed to load ${failed.length} source${failed.length > 1 ? 's' : ''}. Some content may be missing.`);
      }
      // Sort by freshness: newest first, items without dates go to bottom
      merged.sort((a, b) => {
        const aTime = a.pubDate?.getTime() || 0;
        const bTime = b.pubDate?.getTime() || 0;
        
        // If both have dates, sort by newest first
        if (aTime > 0 && bTime > 0) {
          return bTime - aTime;
        }
        
        // If only one has a date, prioritize it
        if (aTime > 0 && bTime === 0) return -1;
        if (bTime > 0 && aTime === 0) return 1;
        
        // If neither has a date, maintain original order
        return 0;
      });
      setItems(merged);
    } catch (e) {
      toast.error('Failed to load job news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const sources = useMemo(() => {
    const s = Array.from(new Set(items.map(i => i.source))).sort();
    return s;
  }, [items]);

  const categories = useMemo(() => {
    const c = Array.from(new Set(RSS_SOURCES.map(s => s.category))).sort();
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filteredItems = items.filter(i => {
      const matchQuery = !q || i.title.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q));
      const matchSource = sourceFilter === 'all' || i.source === sourceFilter;
      
      // Find the category for this source
      const sourceCategory = RSS_SOURCES.find(s => s.name === i.source)?.category;
      const matchCategory = categoryFilter === 'all' || sourceCategory === categoryFilter;
      
      return matchQuery && matchSource && matchCategory;
    });
    
    // Re-sort filtered results by freshness
    return filteredItems.sort((a, b) => {
      const aTime = a.pubDate?.getTime() || 0;
      const bTime = b.pubDate?.getTime() || 0;
      
      if (aTime > 0 && bTime > 0) {
        return bTime - aTime;
      }
      
      if (aTime > 0 && bTime === 0) return -1;
      if (bTime > 0 && aTime === 0) return 1;
      
      return 0;
    });
  }, [items, query, sourceFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Animated Icons */}
            <div className="flex justify-center items-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
              <div className="animate-bounce delay-0">
                <Newspaper className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary" />
              </div>
              <div className="animate-bounce delay-100">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-accent" />
              </div>
              <div className="animate-bounce delay-200">
                <Briefcase className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary" />
              </div>
              <div className="animate-bounce delay-300">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-accent" />
              </div>
              <div className="animate-bounce delay-500">
                <Globe className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary" />
              </div>
        </div>

            {/* Main Heading */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in-up leading-tight">
                Job News & Hiring Updates
          </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto animate-fade-in-up delay-200 px-4">
                Stay ahead of the job market with real-time updates from {RSS_SOURCES.length}+ trusted sources
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto animate-fade-in-up delay-300 px-4">
              <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform duration-200">
                <div className="text-xl sm:text-2xl font-bold text-primary">{RSS_SOURCES.length}+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">News Sources</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform duration-200">
                <div className="text-xl sm:text-2xl font-bold text-accent">{categories.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform duration-200">
                <div className="text-xl sm:text-2xl font-bold text-primary">{items.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Articles</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform duration-200">
                <div className="text-xl sm:text-2xl font-bold text-accent">24/7</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Updates</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in-up delay-400 px-4">
              <Button 
                onClick={loadAll} 
                disabled={loading} 
                size="lg" 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh News'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-primary/20 hover:border-primary/40 transition-all duration-200"
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                  searchInput?.focus();
                }}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Search Jobs
              </Button>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </section>

      <div className="w-full max-w-7xl mx-auto space-y-6 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">

        <Card className="bg-gradient-card border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up delay-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Filter & Search</CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base">
              Search by keyword and filter by source or category. 
              {failedSources.length > 0 && (
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  {' '}Note: {failedSources.length} source{failedSources.length > 1 ? 's' : ''} failed to load.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                  placeholder="Search titles and descriptions (e.g., frontend, remote, internship, Python, React)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 focus:border-primary transition-all duration-200"
                />
              </div>
              
              {/* Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                    Filter by Source
                  </label>
              <select
                    className="w-full border-2 rounded-lg px-3 py-2 bg-background focus:border-primary transition-all duration-200 hover:border-primary/50 text-sm"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                    <option value="all">All sources ({sources.length})</option>
                {sources.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    Filter by Category
                  </label>
                  <select
                    className="w-full border-2 rounded-lg px-3 py-2 bg-background focus:border-primary transition-all duration-200 hover:border-primary/50 text-sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All categories ({categories.length})</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Results Summary */}
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border-l-4 border-primary">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Showing {filtered.length}</span> of {items.length} articles
                  {query && (
                    <span className="inline-flex items-center gap-1 ml-1 sm:ml-2">
                      matching <span className="font-medium text-primary">"{query}"</span>
                    </span>
                  )}
                  {sourceFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 ml-1 sm:ml-2">
                      from <span className="font-medium text-accent">{sourceFilter}</span>
                    </span>
                  )}
                  {categoryFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 ml-1 sm:ml-2">
                      in <span className="font-medium text-accent">{categoryFilter}</span>
                    </span>
                  )}
                </div>
                {failedSources.length > 0 && (
                  <div className="mt-2 text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">
                    <span className="font-medium">Failed sources:</span> {failedSources.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="relative inline-block">
              <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-6 text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Loading Job News</h3>
            <p className="text-muted-foreground mb-4">
              Fetching latest updates from {RSS_SOURCES.length} trusted sources...
            </p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:gap-6">
          {!loading && filtered.map((n, index) => (
            <Dialog key={n.id}>
              <DialogTrigger asChild>
                <Card 
                  className="bg-gradient-card border-border/50 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="space-y-3 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <CardTitle className="text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 flex-1">
                        {n.title}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-col gap-2 items-start sm:items-end flex-shrink-0">
                        <Badge 
                          variant="secondary" 
                          className="whitespace-nowrap bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs"
                        >
                          {n.source}
                        </Badge>
                        {(() => {
                          const sourceCategory = RSS_SOURCES.find(s => s.name === n.source)?.category;
                          return sourceCategory ? (
                            <Badge 
                              variant="outline" 
                              className="text-xs border-accent/30 text-accent hover:bg-accent/10 transition-colors"
                            >
                              {sourceCategory}
                            </Badge>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">{n.pubDate ? n.pubDate.toLocaleString() : 'Unknown date'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">
                          {n.pubDate ? `${Math.floor((Date.now() - n.pubDate.getTime()) / (1000 * 60 * 60 * 24))} days ago` : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    {n.description && (
                      <CardDescription className="line-clamp-2 sm:line-clamp-3 text-sm sm:text-base leading-relaxed">
                        {n.description.length > 200 ? `${n.description.substring(0, 200)}...` : n.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Click to view full details
                    </div>
                      <Button 
                        asChild 
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:w-auto inline-flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200" 
                        onClick={(e) => e.stopPropagation()}
                      >
                      <a href={n.link} target="_blank" rel="noopener noreferrer">
                          Open source <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                      </a>
                    </Button>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto mx-4 sm:mx-0">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl lg:text-2xl">{n.title}</DialogTitle>
                  <DialogDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Badge variant="secondary" className="w-fit">{n.source}</Badge>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      {n.pubDate ? n.pubDate.toLocaleString() : 'Unknown date'}
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {n.description && (
                    <div>
                      <h3 className="font-semibold mb-2 text-sm sm:text-base">Description</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{n.description}</p>
                    </div>
                  )}
                  {n.content && n.content !== n.description && (
                    <div>
                      <h3 className="font-semibold mb-2 text-sm sm:text-base">Content</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{n.content}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button asChild className="flex-1 w-full sm:w-auto">
                      <a href={n.link} target="_blank" rel="noopener noreferrer">
                        View Original <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 sm:py-16 animate-fade-in-up px-4">
              <div className="relative mb-6 sm:mb-8">
                <Newspaper className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/50 animate-pulse-slow" />
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                No articles found
              </h3>
              <p className="text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base lg:text-lg">
                {items.length === 0 
                  ? "Failed to load articles. Please try refreshing or check your connection."
                  : "No articles match your current filters. Try adjusting your search or filters."
                }
              </p>
              {items.length === 0 ? (
                <Button 
                  onClick={loadAll} 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Try Again
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <Button 
                    onClick={() => setQuery('')} 
                    variant="outline"
                    className="w-full sm:w-auto hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                  >
                    Clear Search
                  </Button>
                  <Button 
                    onClick={() => {
                      setSourceFilter('all');
                      setCategoryFilter('all');
                    }} 
                    variant="outline"
                    className="w-full sm:w-auto hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobNews;


