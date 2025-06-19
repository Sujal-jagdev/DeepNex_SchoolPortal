import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const Messages = () => {
  // State for messages
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'John Smith',
      avatar: 'https://via.placeholder.com/40?text=JS',
      lastMessage: 'Hello, how are you doing?',
      time: '10:30 AM',
      unread: 2,
    },
    {
      id: 2,
      name: 'Emily Johnson',
      avatar: 'https://via.placeholder.com/40?text=EJ',
      lastMessage: 'Can you help me with the assignment?',
      time: 'Yesterday',
      unread: 0,
    },
    {
      id: 3,
      name: 'Dr. Robert Johnson',
      avatar: 'https://via.placeholder.com/40?text=RJ',
      lastMessage: 'The class will be rescheduled to next week.',
      time: 'Yesterday',
      unread: 1,
    },
    {
      id: 4,
      name: 'Sarah Davis',
      avatar: 'https://via.placeholder.com/40?text=SD',
      lastMessage: 'Thanks for your help!',
      time: 'Monday',
      unread: 0,
    },
    {
      id: 5,
      name: 'Michael Brown',
      avatar: 'https://via.placeholder.com/40?text=MB',
      lastMessage: 'Did you submit the project?',
      time: 'Sunday',
      unread: 0,
    },
  ]);

  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Mock messages for each conversation
  const mockMessages = {
    1: [
      { id: 1, content: 'Hello, how are you doing?', sender: 'other', time: '10:30 AM' },
      { id: 2, content: 'I\'m good, thanks! How about you?', sender: 'user', time: '10:32 AM' },
      { id: 3, content: 'I\'m doing well. Just wanted to check in about the project.', sender: 'other', time: '10:33 AM' },
    ],
    2: [
      { id: 1, content: 'Can you help me with the assignment?', sender: 'other', time: 'Yesterday' },
      { id: 2, content: 'Sure, what do you need help with?', sender: 'user', time: 'Yesterday' },
    ],
    3: [
      { id: 1, content: 'The class will be rescheduled to next week.', sender: 'other', time: 'Yesterday' },
    ],
    4: [
      { id: 1, content: 'Thanks for your help!', sender: 'other', time: 'Monday' },
      { id: 2, content: 'You\'re welcome! Let me know if you need anything else.', sender: 'user', time: 'Monday' },
    ],
    5: [
      { id: 1, content: 'Did you submit the project?', sender: 'other', time: 'Sunday' },
      { id: 2, content: 'Yes, I submitted it yesterday.', sender: 'user', time: 'Sunday' },
    ],
  };

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      setMessages(mockMessages[activeConversation] || []);
      
      // Mark conversation as read
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === activeConversation ? { ...conv, unread: 0 } : conv
        )
      );
    }
  }, [activeConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation) return;
    
    const newMsg = {
      id: messages.length + 1,
      content: newMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Update last message in conversations list
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === activeConversation 
          ? { ...conv, lastMessage: newMessage, time: 'Just now' } 
          : conv
      )
    );
    
    toast.success('Message sent successfully');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">Messages</h1>
      </div>
      
      {/* Messages content */}
      <div className="flex-grow flex overflow-hidden">
        {/* Conversations list */}
        <div className="w-1/3 border-r bg-white overflow-y-auto">
          <div className="p-4">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="divide-y">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => setActiveConversation(conversation.id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${activeConversation === conversation.id ? 'bg-primary bg-opacity-10' : ''}`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="w-12 h-12 rounded-full"
                    />
                    {conversation.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900">{conversation.name}</h3>
                      <span className="text-xs text-gray-500">{conversation.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="w-2/3 flex flex-col bg-gray-50">
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div className="bg-white p-4 border-b flex items-center">
                <img
                  src={conversations.find(c => c.id === activeConversation)?.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
                <h2 className="ml-3 font-medium text-lg">
                  {conversations.find(c => c.id === activeConversation)?.name}
                </h2>
              </div>
              
              {/* Messages */}
              <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-gray-800'}`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Message input */}
              <div className="bg-white p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a conversation to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;