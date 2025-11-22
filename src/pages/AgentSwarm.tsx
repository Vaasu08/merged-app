import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, User, Briefcase, Target, MessageSquare, FileText, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { getUserProfile, getUserSkills } from '@/lib/profile';
import { searchJobs } from '@/lib/adzunaService';
import { extractTextFromFile } from '@/lib/fileParser';

// ============================================================================
// AGENT DEFINITIONS
// ============================================================================

const AGENTS = {
  planner: {
    id: 'planner',
    name: 'Planner',
    role: 'Strategic Career Planner',
    icon: Target,
    color: 'bg-blue-600',
    borderColor: 'border-blue-600',
    description: 'Designs weekly goals and targets for user as per their profile',
    welcomeMessage: "Hi! I'm your Career Planner. I can help you design a weekly schedule, set career goals, and outline the steps to reach your target role. What should we focus on this week?"
  },
  recruiter: {
    id: 'recruiter',
    name: 'Recruiter',
    role: 'Job Search Specialist',
    icon: Briefcase,
    color: 'bg-green-600',
    borderColor: 'border-green-600',
    description: 'Finds relevant job opportunities for user as per their job profile',
    welcomeMessage: "Hello! I'm your Recruiter. I can find the best job opportunities that match your skills and experience. Shall I search for some roles for you?"
  },
  coach: {
    id: 'coach',
    name: 'Coach',
    role: 'Career & Mindset Coach',
    icon: MessageSquare,
    color: 'bg-purple-600',
    borderColor: 'border-purple-600',
    description: 'Motivates user, giving mental support',
    welcomeMessage: "Hey there! I'm your Coach. Job hunting can be tough, but I'm here to keep you motivated, help with interview nerves, and ensure you stay on track. How are you feeling today?"
  },
  analyzer: {
    id: 'analyzer',
    name: 'Resume Analyzer',
    role: 'Resume Expert',
    icon: FileText,
    color: 'bg-orange-600',
    borderColor: 'border-orange-600',
    description: "Analyse user's resume and scores it, also provides insights about where he should go and where the user should apply",
    welcomeMessage: "Greetings. I'm the Resume Analyzer. Upload your resume or let me analyze your current profile to give you a score and specific improvement tips."
  }
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'job-list' | 'plan' | 'analysis';
  data?: any;
}

interface AgentConversation {
  [agentId: string]: Message[];
}

export default function AgentSwarm() {
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string>('planner');
  const [conversations, setConversations] = useState<AgentConversation>({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user profile on mount
  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user]);

  // Initialize conversations with welcome messages
  useEffect(() => {
    const initialConvos: AgentConversation = {};
    Object.values(AGENTS).forEach(agent => {
      initialConvos[agent.id] = [{
        role: 'assistant',
        content: agent.welcomeMessage,
        timestamp: new Date()
      }];
    });
    setConversations(prev => ({ ...initialConvos, ...prev }));
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, selectedAgent, isLoading]);

  const loadUserProfile = async () => {
    try {
      const [profile, skills] = await Promise.all([
        getUserProfile(user!.id),
        getUserSkills(user!.id)
      ]);
      setUserProfile({ ...profile, skills });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(`Reading ${file.name}...`);

    try {
      const text = await extractTextFromFile(file);
      toast.success(`Successfully read ${file.name}`, { id: toastId });

      if (selectedAgent === 'analyzer') {
        handleSendMessage(`I've uploaded my resume (${file.name}). Please analyze it based on this content:\n\n${text}`);
      } else {
        handleSendMessage(`I've uploaded a file (${file.name}) with this content:\n\n${text}`);
      }
    } catch (error: any) {
      console.error('File parsing error:', error);
      toast.error(`Failed to read file: ${error.message}`, { id: toastId });
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageContent = customMessage || input;
    if (!messageContent.trim() || !user) return;

    const currentAgentId = selectedAgent;

    // Don't show the full resume text in the chat UI if it's too long
    const displayContent = messageContent.length > 500 && messageContent.includes("I've uploaded")
      ? messageContent.substring(0, messageContent.indexOf('\n\n')) + " [Resume Content Hidden]"
      : messageContent;

    const userMessage: Message = {
      role: 'user',
      content: displayContent,
      timestamp: new Date()
    };

    // Update conversation immediately
    setConversations(prev => ({
      ...prev,
      [currentAgentId]: [...(prev[currentAgentId] || []), userMessage]
    }));

    setInput('');
    setIsLoading(true);

    try {
      // 1. Prepare Context
      const profileContext = userProfile ? `
USER PROFILE:
- Name: ${userProfile.full_name}
- Role: ${userProfile.current_position}
- Skills: ${userProfile.skills?.join(', ')}
- Experience: ${userProfile.experience?.map((e: any) => `${e.position} at ${e.company}`).join(', ')}
- Location: ${userProfile.location}
      ` : 'User profile not fully loaded.';

      let responseContent = '';
      let messageType: Message['type'] = 'text';
      let messageData: any = null;

      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error('Groq API key missing');

      // --- RECRUITER LOGIC ---
      if (currentAgentId === 'recruiter' && (messageContent.toLowerCase().includes('job') || messageContent.toLowerCase().includes('search') || messageContent.toLowerCase().includes('find') || messageContent.toLowerCase().includes('looking'))) {
        toast.info('Recruiter is analyzing your request...');

        // STEP 1: Extract Search Params
        const queryExtractionResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are an expert Job Search Query Generator. 
                Extract the best "search_query" and "location" from the user's message and profile.
                
                USER PROFILE:
                - Role: ${userProfile?.current_position}
                - Skills: ${userProfile?.skills?.join(', ')}
                - Location: ${userProfile?.location}

                Return ONLY valid JSON:
                {
                  "search_query": "string (e.g. 'Senior React Developer')",
                  "location": "string (e.g. 'San Francisco' or 'Remote')"
                }`
              },
              { role: 'user', content: messageContent }
            ],
            temperature: 0.1
          })
        });

        const queryData = await queryExtractionResponse.json();
        let searchParams = { search_query: userProfile?.current_position || 'Software Engineer', location: userProfile?.location || '' };

        try {
          const content = queryData.choices[0].message.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          searchParams = JSON.parse(content);
        } catch (e) {
          console.error('Failed to parse query extraction', e);
        }

        toast.info(`Searching for: ${searchParams.search_query} in ${searchParams.location || 'any location'}...`);

        // STEP 2: Perform Search
        try {
          const jobs = await searchJobs({ what: searchParams.search_query, where: searchParams.location });

          if (jobs && jobs.results && jobs.results.length > 0) {
            // STEP 3: Analyze Results with Llama
            const analysisResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                  {
                    role: 'system',
                    content: `You are a Senior Technical Recruiter. I will provide a list of job results.
                    Your task is to:
                    1. Select the top 3 most relevant jobs for the user based on their profile.
                    2. Write a brief, encouraging summary explaining WHY these are good matches.
                    3. Mention specific skills from the user's profile that match these jobs.
                    
                    USER PROFILE:
                    - Skills: ${userProfile?.skills?.join(', ')}
                    
                    JOB RESULTS:
                    ${JSON.stringify(jobs.results.slice(0, 5).map((j: any) => ({ title: j.title, company: j.company?.display_name, description: j.description?.substring(0, 200) })))}
                    
                    Keep the response conversational and professional.`
                  }
                ],
                temperature: 0.7
              })
            });

            const analysisData = await analysisResponse.json();
            responseContent = analysisData.choices[0]?.message?.content || `I found ${jobs.results.length} jobs matching your criteria.`;
            messageType = 'job-list';
            messageData = jobs.results.slice(0, 5);
          } else {
            responseContent = `I searched for "${searchParams.search_query}" in "${searchParams.location}" but couldn't find any exact matches right now. \n\nTry broadening your search or checking a different location.`;
          }
        } catch (err) {
          console.error('Search error:', err);
          responseContent = "I encountered an error while connecting to the job board. Please try again in a moment.";
        }
      }

      // --- PLANNER LOGIC ---
      else if (currentAgentId === 'planner' && (messageContent.toLowerCase().includes('plan') || messageContent.toLowerCase().includes('goal'))) {
        responseContent = "Based on your profile, I've designed a weekly plan for you:\n\n**Week 1 Goals:**\n1. Apply to 5 senior roles\n2. Network with 3 industry peers\n3. Complete 1 system design mock interview\n\nShall I break this down into daily tasks?";
        messageType = 'plan';
      }

      // --- ANALYZER LOGIC (REAL PARSING) ---
      else if (currentAgentId === 'analyzer' && (messageContent.toLowerCase().includes('analyze') || messageContent.toLowerCase().includes('resume') || messageContent.toLowerCase().includes('score'))) {

        // If message contains "I've uploaded", it has the real resume text
        const isFileUpload = messageContent.includes("I've uploaded");

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are an expert Resume Analyzer and Career Coach.
                Analyze the user's resume content provided in the message.
                
                Output a structured analysis in this format:
                
                **Resume Score: [Score]/100**
                
                **Strengths:**
                - [Strength 1]
                - [Strength 2]
                
                **Areas for Improvement:**
                - [Weakness 1]
                - [Weakness 2]
                
                **Recommended Target Roles:**
                - [Role 1]
                - [Role 2]
                
                **Specific Advice:**
                [One paragraph of actionable advice]
                
                Be critical but encouraging. If the input is just a profile summary, analyze that.`
              },
              { role: 'user', content: messageContent }
            ],
            temperature: 0.7
          })
        });

        const data = await response.json();
        responseContent = data.choices[0]?.message?.content || "I couldn't analyze the resume at this moment.";
        messageType = 'analysis';
      }

      // --- DEFAULT LLM LOGIC ---
      else {
        const agent = AGENTS[currentAgentId as keyof typeof AGENTS];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are the ${agent.name} (${agent.role}). ${agent.description}.
                
                ${profileContext}
                
                Your tone should be professional, helpful, and specific to your role.
                Keep responses concise and actionable.`
              },
              ...(conversations[currentAgentId] || []).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: messageContent }
            ],
            temperature: 0.7,
            max_tokens: 1024
          })
        });

        const data = await response.json();
        responseContent = data.choices[0]?.message?.content || "I'm having trouble thinking right now.";
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        type: messageType,
        data: messageData
      };

      setConversations(prev => ({
        ...prev,
        [currentAgentId]: [...(prev[currentAgentId] || []), userMessage, assistantMessage]
      }));

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const currentAgent = AGENTS[selectedAgent as keyof typeof AGENTS];
  const currentMessages = conversations[selectedAgent] || [];

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block border border-gray-700 rounded-full px-4 py-1 text-sm text-gray-400 mb-4">
            Career Copilot
          </div>
        </div>

        {/* Main Interface Box */}
        <div className="border border-gray-800 rounded-3xl bg-[#0a0a0a] overflow-hidden shadow-2xl h-[80vh] flex flex-col relative">

          {/* Agent Selector (Top Bar) */}
          <div className="flex justify-center gap-4 p-6 border-b border-gray-800 bg-[#0a0a0a]/50 backdrop-blur-sm z-10">
            {Object.values(AGENTS).map((agent) => {
              const isSelected = selectedAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`
                    relative group flex flex-col items-center justify-center w-32 h-24 rounded-xl border transition-all duration-300
                    ${isSelected
                      ? `${agent.borderColor} bg-gray-900 text-white shadow-lg shadow-${agent.color}/20`
                      : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                    }
                  `}
                >
                  <div className={`mb-2 p-2 rounded-lg ${isSelected ? agent.color : 'bg-gray-800'} transition-colors`}>
                    <agent.icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <span className="text-sm font-medium">{agent.name}</span>

                  {/* Tooltip for description */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-48 bg-gray-800 text-xs text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center border border-gray-700">
                    {agent.description}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-hidden relative">
            {/* Background Hints/Figures */}
            <div className="absolute top-10 left-10 opacity-20 pointer-events-none hidden lg:block">
              <div className="border border-gray-600 p-2 rounded text-xs text-gray-400 max-w-[150px]">
                Figure 1: Designs weekly goals and targets
              </div>
              <div className="w-px h-20 bg-gray-600 mx-auto"></div>
            </div>

            <ScrollArea className="h-full p-6" ref={scrollRef}>
              <div className="space-y-6 max-w-3xl mx-auto pb-20">
                {currentMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                    {msg.role === 'assistant' && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${currentAgent.color}`}>
                        <currentAgent.icon className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className={`max-w-[80%] space-y-2`}>
                      <div className={`p-4 rounded-2xl ${msg.role === 'user'
                        ? 'bg-white text-black rounded-tr-none'
                        : 'bg-gray-900 text-gray-200 border border-gray-800 rounded-tl-none'
                        }`}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      </div>

                      {/* Render Job List */}
                      {msg.type === 'job-list' && msg.data && (
                        <div className="grid gap-2 mt-2">
                          {msg.data.map((job: any, j: number) => (
                            <div key={j} className="bg-gray-900 border border-gray-800 p-3 rounded-xl hover:border-gray-600 transition-colors cursor-pointer group">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{job.title}</h4>
                                  <p className="text-xs text-gray-400">{job.company.display_name} • {job.location.display_name}</p>
                                </div>
                                <a href={job.redirect_url} target="_blank" rel="noreferrer" className="text-xs bg-white text-black px-2 py-1 rounded hover:bg-gray-200">
                                  Apply
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <p className={`text-[10px] text-gray-600 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentAgent.color}`}>
                      <currentAgent.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-xs text-gray-500">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="p-6 bg-[#0a0a0a] border-t border-gray-800 z-20">
            <div className="max-w-3xl mx-auto relative">
              {/* Floating Prompt Hints */}
              {currentMessages.length <= 1 && (
                <div className="absolute -top-12 left-0 flex gap-2 overflow-x-auto w-full pb-2 no-scrollbar">
                  {selectedAgent === 'planner' && (
                    <button onClick={() => handleSendMessage("Create a weekly plan for me")} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 whitespace-nowrap transition-colors">
                      📅 Create weekly plan
                    </button>
                  )}
                  {selectedAgent === 'recruiter' && (
                    <button onClick={() => handleSendMessage("Find React Developer jobs in San Francisco")} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 whitespace-nowrap transition-colors">
                      🔍 Find jobs
                    </button>
                  )}
                  {selectedAgent === 'coach' && (
                    <button onClick={() => handleSendMessage("I'm feeling demotivated today")} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 whitespace-nowrap transition-colors">
                      💪 I need motivation
                    </button>
                  )}
                </div>
              )}

              <div className="relative flex items-center bg-gray-900 border border-gray-700 rounded-xl focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 transition-all">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type the message..."
                  className="flex-1 bg-transparent border-none text-white placeholder:text-gray-500 h-14 px-4 focus-visible:ring-0"
                />

                <div className="flex items-center gap-2 pr-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                    title="Upload your resume here"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() && !isLoading}
                    className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Upload hint arrow (visual only, matches design) */}
              <div className="absolute -top-16 right-12 hidden md:block opacity-50 pointer-events-none">
                <div className="text-[10px] text-gray-400 mb-1 text-center">upload your resume here</div>
                <div className="w-px h-8 bg-gray-600 mx-auto"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
