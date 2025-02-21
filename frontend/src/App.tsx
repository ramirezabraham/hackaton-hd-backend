import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { marked } from 'marked';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thread, setThread] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Add user message immediately for better UX
      const userMessage = { role: 'user' as const, content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-800">AI Assistant</h1>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`p-2 rounded-full ${
                message.role === 'assistant' ? 'bg-blue-100' : 'bg-gray-200'
              }`}>
                {message.role === 'assistant' ? (
                  <Bot className="w-5 h-5 text-blue-600" />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div
                className={`flex-1 rounded-lg px-4 py-2 max-w-xl ${
                  message.role === 'assistant'
                    ? 'bg-white shadow-sm'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="text-sm" dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="p-2 rounded-full bg-blue-100">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 rounded-lg px-4 py-2 max-w-xl bg-white shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t bg-white px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`text-white rounded-lg px-4 py-2 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;