import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';

// Import your SVG files
import { ReactComponent as HomeIconComponent } from './assets/icons/Home.svg';
import { ReactComponent as SocialIconComponent } from './assets/icons/People alt.svg';
import { ReactComponent as RideIconComponent } from './assets/icons/Location on.svg';
import { ReactComponent as StatsIconComponent } from './assets/icons/Trophy.svg';
import { ReactComponent as AIIconComponent } from './assets/icons/Hd icon.svg';
import { ReactComponent as SettingsIconComponent } from './assets/icons/settings.svg'
import { ReactComponent as SendIconComponent } from './assets/icons/send.svg'
import { ReactComponent as ArrowIconComponent } from './assets/icons/Arrow.svg'
import { ReactComponent as TitleIconComponent } from './assets/icons/AI Module.svg'

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

const navItems = [
  { icon: HomeIconComponent, text: 'HOME' },
  { icon: SocialIconComponent, text: 'SOCIAL' },
  { icon: RideIconComponent, text: 'RIDE' },
  { icon: StatsIconComponent, text: 'STATS' },
  { icon: AIIconComponent, text: 'AI' },
];

function App() {
  const initialMessage = "Hello! I'm your Harley-Davidson AI assistant. How can I help you today?";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thread, setThread] = useState("");
  const [typingText, setTypingText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      clearInterval(typingInterval);
      setTypingText('');
      setMessages([{ role: 'assistant', content: initialMessage }]);
    }, 10);

    return () => clearInterval(typingInterval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);

      const userMessage = { role: 'user' as const, content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Send message to API
      const response = await fetch('http://localhost:8000/sendquery/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Allow-Control-Allow-Origin': '*',
          'accept': 'application/json',
        },
        body: JSON.stringify({ "message": input, thread_id: thread }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const data = await response.json();

      // Add assistant's response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.data[0].content[0].text.value
      }]);
      setThread(data.data[0].thread_id);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your request. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100vh]">
      <div className="flex flex-col h-[calc(100dvh)] bg-black text-white safe-area-inset-padding">
        <header className="bg-black px-4 py-3 flex items-center justify-between">
          <ArrowIconComponent className="w-6 h-6 stroke-2" />
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <TitleIconComponent />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white">Harley-Davidson AI</h1>
            </div>
          </div>
          <SettingsIconComponent className="w-6 h-6 text-white stroke-2" />
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          <div className="space-y-4">
            {typingText ? (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 max-w-[80%] bg-gray-800">
                  <p className="text-sm">{typingText}</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'assistant' ? 'bg-gray-800 appear' : 'bg-gray-700'
                      }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="text-sm" dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 max-w-[80%] bg-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message"
              className="w-full rounded-full bg-gray-800 px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
              rows={1}
              disabled={isLoading}
              style={{ height: 'auto', overflow: 'hidden' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500 rounded-full p-2 focus:outline-none"
            >
              <SendIconComponent className="w-5 h-5" />
            </button>
          </form>
        </div>

        <nav className="FranklinGothic bg-black border-t border-gray-800 px-4 py-2 flex-shrink-0">
          <div className="flex justify-between items-center">
            {navItems.map((item) => (
              <button key={item.text} className={`text-${item.text === 'AI' ? 'orange-500 text-bold' : 'gray-500'} flex flex-col items-center`}>
                <item.icon className="w-6 h-6 mb-1 stroke-[1.5]" stroke={`${item.text === 'AI' ? '#FA6600' : 'gray-500'}`} />
                <span className="text-xs">{item.text}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;