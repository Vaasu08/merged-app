import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatbotProvider } from "@/components/ChatbotProvider";
import { Chatbot } from "@/components/Chatbot";
import { InterviewProvider } from "@/contexts/InterviewContext";
import { RoadmapProvider } from "@/contexts/RoadmapContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AppDebugger } from "@/components/AppDebugger";
import { AuthProvider } from "@/components/AuthProvider";
import AuthGuard from "@/components/AuthGuard";
import { performanceMonitor } from "@/lib/performance";
import { resourceHints } from "@/lib/resourceHints";

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Lazy load all route components for better code splitting
const IndexWrapper = lazy(() => import("./components/IndexWrapper"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Insights = lazy(() => import("./pages/Insights"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const InterviewHome = lazy(() => import("./pages/InterviewHome"));
const InterviewWelcome = lazy(() => import("./pages/InterviewWelcome"));
const InterviewPrep = lazy(() => import("./pages/InterviewPrep"));
const InterviewSession = lazy(() => import("./pages/InterviewSession"));
const InterviewFeedback = lazy(() => import("./pages/InterviewFeedback"));
const Community = lazy(() => import("./pages/Community"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const RoadmapOnboarding = lazy(() => import("@/components/RoadmapOnboarding"));
const RoadmapView = lazy(() => import("./pages/RoadmapView"));
const ATSAssessment = lazy(() => import("./pages/ATSAssessment"));
const ATSResults = lazy(() => import("./pages/ATSResults"));
const JobListings = lazy(() => import("./pages/JobListings"));
const SkillGraph = lazy(() => import("./pages/SkillGraph"));
const AgentSwarm = lazy(() => import("./pages/AgentSwarm"));
const ATSScorerTest = lazy(() => import("@/components/ATSScorerTest"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnMount: false,
      refetchOnReconnect: 'always',
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

const App = () => {
  // Initialize performance monitoring
  useEffect(() => {
    // Prefetch critical external resources
    resourceHints.preconnect('https://fonts.googleapis.com');
    resourceHints.preconnect('https://fonts.gstatic.com', true);
    
    // DNS prefetch for API endpoints
    resourceHints.dnsPrefetch('https://api.groq.com');
    resourceHints.dnsPrefetch('https://generativelanguage.googleapis.com');
    
    // Prefetch likely next routes on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        resourceHints.prefetchRouteChunks([
          '/profile',
          '/resume',
          '/interview',
          '/roadmap'
        ]);
      });
    }
    
    // Send metrics to analytics after page load
    const timer = setTimeout(() => {
      performanceMonitor.sendToAnalytics();
      if (import.meta.env.DEV) {
        const grade = performanceMonitor.getPerformanceGrade();
        console.log(`⚡ Performance Grade: ${grade}`);
      }
    }, 10000); // Wait 10 seconds for all metrics to be captured

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <AppDebugger />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <ChatbotProvider>
                <InterviewProvider>
                  <RoadmapProvider>
                    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          {/* Home and Info */}
                          <Route path="/" element={<IndexWrapper />} />
                          <Route path="/insights" element={<Insights />} />
                          <Route path="/community" element={<Community />} />
                          <Route path="/blog" element={<Blog />} />
                          <Route path="/blog/:id" element={<BlogDetail />} />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="/privacy" element={<Privacy />} />

                          {/* ATS Resume Assessment */}
                          <Route path="/ats-assessment" element={<ATSAssessment />} />
                          <Route path="/ats-results" element={<ATSResults />} />
                          <Route path="/ats-test" element={<ATSScorerTest />} />

                          {/* Job Listings */}
                          <Route path="/job-listings" element={<JobListings />} />

                          {/* Skill Graph Visualizer */}
                          <Route path="/skill-graph" element={<SkillGraph />} />

                          {/* AI Career Agent Swarm */}
                          <Route path="/agent-swarm" element={
                            <AuthGuard>
                              <AgentSwarm />
                            </AuthGuard>
                          } />

                          {/* Protected Profile/Resume */}
                          <Route path="/profile" element={
                            <AuthGuard>
                              <Profile />
                            </AuthGuard>
                          } />
                          <Route path="/resume" element={
                            <AuthGuard>
                              <ResumeBuilder />
                            </AuthGuard>
                          } />

                          {/* Interview Simulator */}
                          <Route path="/interview" element={<InterviewHome />} />
                          <Route path="/interview-home" element={<InterviewHome />} />
                          <Route path="/interview-welcome" element={<InterviewWelcome />} />
                          <Route path="/interview-prep" element={<InterviewPrep />} />
                          <Route path="/interview-session" element={<InterviewSession />} />
                          <Route path="/interview-feedback" element={<InterviewFeedback />} />

                          {/* Learning Roadmap Builder */}
                          <Route path="/roadmap" element={<RoadmapOnboarding />} />
                          <Route path="/roadmap/view" element={
                            <AuthGuard>
                              <RoadmapView />
                            </AuthGuard>
                          } />

                          {/* 404 Fallback */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                      <Chatbot />
                    </BrowserRouter>
                  </RoadmapProvider>
                </InterviewProvider>
              </ChatbotProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;