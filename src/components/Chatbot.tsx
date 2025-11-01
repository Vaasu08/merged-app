import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Minimize2,
  Maximize2,
  Sparkles,
  Zap,
  TrendingUp,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getChatbotService } from '@/lib/chatbotService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatbotProps {
  className?: string;
}

// Suggested quick actions for users
const QUICK_ACTIONS = [
  { icon: Target, label: "How do I start?", query: "How do I get started with Horizon?" },
  { icon: Sparkles, label: "Career assessment", query: "Tell me about the career assessment" },
  { icon: TrendingUp, label: "Career paths", query: "What career paths are available?" },
  { icon: Zap, label: "Features", query: "What are Horizon's main features?" }
];

export const Chatbot = ({ className }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there! 👋 I'm your Horizon AI Assistant, powered by Gemini! I can help you:\n\n🎯 Take the career assessment\n📊 Understand features & tools\n💼 Find your perfect career path\n🚀 Navigate the platform\n\nWhat would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleQuickAction = (query: string) => {
    setInputValue(query);
    setShowQuickActions(false);
    setTimeout(() => {
      handleSendMessage(query);
    }, 100);
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageText = customMessage || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const chatbotService = getChatbotService();
      if (!chatbotService) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, but the chatbot service is currently unavailable. Please check your configuration.",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        return;
      }
      const response = await chatbotService.processMessage(userMessage.text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      toast.error('Failed to get response. Please try again.');
      
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment!",
          sender: 'bot',
          timestamp: new Date()
        };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <Card className={`w-80 h-96 bg-gradient-card border-border/50 shadow-large ${isMinimized ? 'h-12' : ''}`}>
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-border/50 bg-primary/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Horizon Assistant</h3>
                    <p className="text-xs text-muted-foreground">Ask me anything about careers or Horizon</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMinimize}
                    className="h-6 w-6 p-0 hover:bg-primary/10"
                  >
                    {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChat}
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <CardContent className="p-0 h-64">
                    <ScrollArea className="h-full">
                      <div className="p-3 space-y-3">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {message.sender === 'bot' && (
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="h-3 w-3 text-primary" />
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                message.sender === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{message.text}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                            {message.sender === 'user' && (
                              <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="h-3 w-3 text-accent" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-2 justify-start"
                          >
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <Bot className="h-3 w-3 text-primary" />
                            </div>
                            <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Thinking...</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Quick Actions */}
                        {showQuickActions && messages.length === 1 && !isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-2 mt-3"
                          >
                            <p className="text-xs text-muted-foreground font-medium">Quick actions:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {QUICK_ACTIONS.map((action, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuickAction(action.query)}
                                  className="justify-start h-auto py-2 px-3 text-xs hover:bg-primary/5"
                                >
                                  <action.icon className="h-3 w-3 mr-2 flex-shrink-0" />
                                  <span className="text-left">{action.label}</span>
                                </Button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Input */}
                  <div className="p-3 border-t border-border/50">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about careers or Horizon..."
                        disabled={isLoading}
                        className="flex-1 text-sm"
                      />
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={!inputValue.trim() || isLoading}
                        size="sm"
                        className="px-3"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      <span>Powered by Gemini AI</span>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speech Bubble */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center mb-3"
      >
        <motion.div
          animate={{ 
            y: [0, -3, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          {/* Speech Bubble */}
          <div className="relative bg-white/95 backdrop-blur-sm border border-primary/20 rounded-2xl px-3 py-2 shadow-lg">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-xs text-gray-700 font-medium whitespace-nowrap"
            >
              Talk with Horizon AI
            </motion.p>
            
            {/* Speech Bubble Tail */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/95"></div>
          </div>
        </motion.div>
      </motion.div>

      {/* Chat Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={toggleChat}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-large"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
};
