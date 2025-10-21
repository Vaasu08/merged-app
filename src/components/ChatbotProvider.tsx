import { createContext, useContext, ReactNode } from 'react';

interface ChatbotContextType {
  isEnabled: boolean;
  toggleEnabled: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }
  return context;
};

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider = ({ children }: ChatbotProviderProps) => {
  // For now, chatbot is always enabled
  // In the future, this could be controlled by user preferences or admin settings
  const isEnabled = true;

  const toggleEnabled = () => {
    // Future implementation for enabling/disabling chatbot
    console.log('Toggle chatbot enabled');
  };

  return (
    <ChatbotContext.Provider value={{ isEnabled, toggleEnabled }}>
      {children}
    </ChatbotContext.Provider>
  );
};
