import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatbotProvider } from "@/components/ChatbotProvider";
import { Chatbot } from "@/components/Chatbot";
import { InterviewProvider } from "@/contexts/InterviewContext";
import { RoadmapProvider } from "@/contexts/RoadmapContext"; // NEW
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Insights from "./pages/Insights";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { AuthProvider } from "@/components/AuthProvider";
import AuthGuard from "@/components/AuthGuard";
import Profile from "@/pages/Profile";
import ResumeBuilder from "@/pages/ResumeBuilder";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import InterviewHome from "./pages/InterviewHome";
import InterviewWelcome from "./pages/InterviewWelcome";
import InterviewPrep from "./pages/InterviewPrep";
import InterviewSession from "./pages/InterviewSession";
import InterviewFeedback from "./pages/InterviewFeedback";
import Community from "./pages/Community";
import RoadmapOnboarding from "@/components/RoadmapOnboarding"; // NEW
import RoadmapView from "@/pages/RoadmapView"; // NEW

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <ChatbotProvider>
            <InterviewProvider>
              <RoadmapProvider> {/* NEW: Wrap everything with RoadmapProvider */}
                <BrowserRouter>
                  <Routes>
                    {/* Existing Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    
                    {/* Protected Routes */}
                    <Route
                      path="/profile"
                      element={
                        <AuthGuard>
                          <Profile />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/resume"
                      element={
                        <AuthGuard>
                          <ResumeBuilder />
                        </AuthGuard>
                      }
                    />
                    
                    {/* Interview Simulator Routes */}
                    <Route path="/interview" element={<InterviewHome />} />
                    <Route path="/interview-home" element={<InterviewHome />} />
                    <Route path="/interview-welcome" element={<InterviewWelcome />} />
                    <Route path="/interview-prep" element={<InterviewPrep />} />
                    <Route path="/interview-session" element={<InterviewSession />} />
                    <Route path="/interview-feedback" element={<InterviewFeedback />} />
                    
                    {/* NEW: Roadmap Builder Routes */}
                    <Route path="/roadmap" element={<RoadmapOnboarding />} />
                    <Route 
                      path="/roadmap/view" 
                      element={
                        <AuthGuard>
                          <RoadmapView />
                        </AuthGuard>
                      } 
                    />
                    
                    {/* Catch-all 404 route - MUST BE LAST */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Chatbot />
                </BrowserRouter>
              </RoadmapProvider>
            </InterviewProvider>
          </ChatbotProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
