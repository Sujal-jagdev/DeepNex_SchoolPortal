import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AIAssistant = () => {
  // State for messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // State for chat sessions
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Fetch chat sessions when component mounts
  useEffect(() => {
    fetchChatSessions();
  }, []);
  
  // Fetch chat sessions from the server
  const fetchChatSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.warn('No userId found in localStorage');
        setIsLoadingSessions(false);
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/chat/student/history?userId=${userId}`);
      
      if (response.data.success && response.data.sessions) {
        setChatSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };
  
  // Load chat history for a specific session
  const loadChatHistory = async (sessionId) => {
    try {
      setIsTyping(true);
      const response = await axios.get(`http://localhost:5000/api/chat/student/history?sessionId=${sessionId}`);
      
      if (response.data.success && response.data.history) {
        // Convert the chat history to our message format
        const formattedMessages = response.data.history.map((msg, index) => ({
          id: index + 1,
          content: msg.content,
          sender: msg.sender_role === 'user' ? 'user' : 'ai',
          timestamp: new Date(msg.created_at),
        }));
        
        setMessages(formattedMessages);
        setCurrentSessionId(sessionId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage('');
    
    // Show AI typing indicator
    setIsTyping(true);
    
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      
      // Call backend API with userId and sessionId if available
      const response = await axios.post('http://localhost:5000/api/chat/student', {
        message: newMessage,
        userId: userId,
        sessionId: currentSessionId
      });
      
      // Add AI response from backend
      const aiMessage = {
        id: messages.length + 2,
        content: response.data.reply,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
      // Update current session ID if this is a new conversation
      if (!currentSessionId && response.data.sessionId) {
        setCurrentSessionId(response.data.sessionId);
        // Refresh the chat sessions list
        fetchChatSessions();
      } else {
        // Also refresh chat sessions for existing conversations to update timestamps
        fetchChatSessions();
      }
      
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        content: 'Sorry, I encountered an error. Please try again later.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      toast.error('Failed to get AI response. Please try again later.');
    } finally {
      setIsTyping(false);
    }
  };
  
  // Start a new chat session
  const startNewChat = () => {
    setMessages([
      {
        id: 1,
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
    setCurrentSessionId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 bg-opacity-95 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0v2.8a2.25 2.25 0 01-1.5 2.25m0 0a4.5 4.5 0 01-1.5.25m-4.5-9.5a4.5 4.5 0 001.423-.25m4.5 9.5a4.5 4.5 0 001.423-.25m0-9.5a4.5 4.5 0 00-1.423-.25m0 0a4.5 4.5 0 01-4.5 0m0 0a4.5 4.5 0 00-1.423.25m0 0a4.5 4.5 0 01-4.5 0" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Learning Assistant</h1>
              <p className="text-sm text-white text-opacity-80">Your personal academic companion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area with two columns */}
      <div className="flex-grow flex overflow-hidden">
        {/* Sidebar with chat history */}
        <div className="w-80 min-w-[320px] p-4 border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          <div className="space-y-4">
            {/* New Chat button */}
            <button 
              onClick={startNewChat}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Chat
            </button>
            
            {/* Chat history list */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Chat History</h3>
              
              {isLoadingSessions ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading sessions...</p>
                </div>
              ) : chatSessions.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No previous chats found
                </div>
              ) : (
                <div className="space-y-2">
                  {chatSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => loadChatHistory(session.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${currentSessionId === session.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium text-gray-800 truncate">
                            {session.session_title || 'Chat Session'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(session.created_at).toLocaleDateString()} at {new Date(session.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* AI Assistant info card */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-6">
              <h3 className="font-medium text-gray-800 mb-3">About AI Assistant</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Your AI Learning Assistant is designed to help with:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Homework assistance</li>
                  <li>Concept explanations</li>
                  <li>Study guidance</li>
                  <li>Research help</li>
                  <li>Practice problems</li>
                </ul>
                <p className="text-xs text-gray-500 mt-4">This AI is continuously learning to provide better assistance.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main chat area */}
        <div className="flex-grow flex flex-col overflow-hidden p-4">
          <div className="flex-grow bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 flex flex-col">
            {/* Chat messages */}
            <div className="flex-grow overflow-y-auto p-6 bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8 rounded-lg bg-white shadow-sm border border-gray-200 max-w-md">
                    <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Start a Conversation</h3>
                    <p className="text-gray-600">Ask me anything about your studies, homework, or academic concepts you'd like to understand better.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    >
                      {message.sender === 'ai' && (
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                          <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0v2.8a2.25 2.25 0 01-1.5 2.25m0 0a4.5 4.5 0 01-1.5.25m-4.5-9.5a4.5 4.5 0 001.423-.25m4.5 9.5a4.5 4.5 0 001.423-.25m0-9.5a4.5 4.5 0 00-1.423-.25m0 0a4.5 4.5 0 01-4.5 0m0 0a4.5 4.5 0 00-1.423.25m0 0a4.5 4.5 0 01-4.5 0" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="max-w-[75%] overflow-hidden break-words">
                        <div 
                          className={`p-4 rounded-2xl shadow-sm ${message.sender === 'user' 
                            ? `bg-blue-600 text-white` 
                            : 'bg-white border border-gray-200'}`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 px-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {message.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0v2.8a2.25 2.25 0 01-1.5 2.25m0 0a4.5 4.5 0 01-1.5.25m-4.5-9.5a4.5 4.5 0 001.423-.25m4.5 9.5a4.5 4.5 0 001.423-.25m0-9.5a4.5 4.5 0 00-1.423-.25m0 0a4.5 4.5 0 01-4.5 0m0 0a4.5 4.5 0 00-1.423.25m0 0a4.5 4.5 0 01-4.5 0" />
                          </svg>
                        </div>
                      </div>
                      <div className="max-w-[75%] overflow-hidden break-words">
                        <div className="p-4 rounded-2xl shadow-sm bg-white border border-gray-200">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <div className="relative flex-grow">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask me anything about your studies..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all resize-none min-h-[50px] max-h-[120px] overflow-auto"
                    rows="1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-all duration-200 flex items-center justify-center shadow-md"
                  disabled={!newMessage.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
              
              {/* Quick suggestions */}
              <div className="mt-4">
                <h3 className="text-xs font-medium text-gray-500 mb-2">Quick suggestions:</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setNewMessage("Help me understand photosynthesis")} 
                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-full text-sm transition-all duration-200 hover:shadow-md"
                  >
                    Help me understand photosynthesis
                  </button>
                  <button 
                    onClick={() => setNewMessage("How do I solve quadratic equations?")} 
                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-full text-sm transition-all duration-200 hover:shadow-md"
                  >
                    How do I solve quadratic equations?
                  </button>
                  <button 
                    onClick={() => setNewMessage("Explain the causes of World War II")} 
                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-full text-sm transition-all duration-200 hover:shadow-md"
                  >
                    Explain the causes of World War II
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;