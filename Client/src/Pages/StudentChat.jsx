import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSend, FiImage, FiMenu, FiX } from 'react-icons/fi';
import { BsRobot, BsPerson, BsLightbulb, BsThreeDots } from 'react-icons/bs';

function StudentChat() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Load chat history when component mounts
    const loadChatHistory = async () => {
      try {
        const res = await axios.get('https://student-webmind.onrender.com/history');
        // Only set chat history if there is data available
        if (res.data.history && res.data.history.length > 0) {
          setChatHistory(res.data.history);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    
    loadChatHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const sendMessage = async () => {
    if (!message.trim() && !image) return;

    // Add user message to chat immediately for better UX
    const userMessage = {
      role: 'user',
      content: message,
      image: image ? URL.createObjectURL(image) : null
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setIsSending(true);
    setIsTyping(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('message', message);
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await axios.post('https://student-webmind.onrender.com/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setChatHistory(res.data.history);
      setImage(null);
    } catch (err) {
      console.error('Error sending message:', err);
      // Show error in chat
      setChatHistory(prev => [...prev.slice(0, -1), {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      }]);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const clearChat = async () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      try {
        setIsSending(true);
        // Clear chat history on server
        await axios.post('https://student-webmind.onrender.com/clear-history');
        // Clear chat history on client
        setChatHistory([]);
      } catch (err) {
        console.error('Error clearing chat history:', err);
        alert('Failed to clear chat history. Please try again.');
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <div className={`chat-app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Student WebMind</h3>
          <button className="close-sidebar" onClick={toggleSidebar}>
            <FiX />
          </button>
        </div>
        
        <div className="sidebar-content">
          <button className="new-chat" onClick={clearChat}>
            <span>+ New chat</span>
          </button>
          
          <div className="chat-history-list">
            <div className="history-date">Today</div>
            <div className="history-item active">
              <BsLightbulb />
              <span>Current Chat</span>
            </div>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="menu-button" onClick={toggleSidebar}>
            <FiMenu />
          </button>
          <h2>Student WebMind</h2>
        </div>
        
        {/* Chat Messages */}
        <div className="chat-messages">
          {chatHistory.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <BsRobot />
              </div>
              <h1>Student WebMind AI</h1>
              <p>Your AI assistant for learning and image analysis</p>
              <div className="example-prompts">
                <div className="example-prompt">
                  <BsLightbulb />
                  <span>"Explain the concept of photosynthesis"</span>
                </div>
                <div className="example-prompt">
                  <BsLightbulb />
                  <span>"Help me solve this math problem"</span>
                </div>
                <div className="example-prompt">
                  <BsLightbulb />
                  <span>"Upload an image for analysis"</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                  <div className="message-avatar">
                    {msg.role === 'user' ? (
                      <div className="user-avatar">
                        <BsPerson />
                      </div>
                    ) : (
                      <div className="assistant-avatar">
                        <BsRobot />
                      </div>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}</strong>
                    </div>
                    <div className="message-body">
                      {msg.content.split('\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                      {msg.image && (
                        <div className="image-section">
                          <div className="image-preview">
                            <img src={msg.image} alt="uploaded content" />
                          </div>
                          {msg.imageAnalysis && (
                            <div className="image-analysis">
                              <h4>Image Analysis:</h4>
                              <p>{msg.imageAnalysis}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="message assistant-message">
                  <div className="message-avatar">
                    <div className="assistant-avatar">
                      <BsRobot />
                    </div>
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <strong>AI Assistant</strong>
                    </div>
                    <div className="message-body">
                      <div className="typing-indicator">
                        <BsThreeDots />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="chat-input-container">
          {image && (
            <div className="image-preview-input">
              <img src={URL.createObjectURL(image)} alt="preview" />
              <button onClick={() => setImage(null)} className="remove-image">
                <FiX />
              </button>
            </div>
          )}
          
          <div className="input-group">
            <button 
              className="attach-button"
              onClick={handleImageClick}
              title="Attach image"
            >
              <FiImage />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Student WebMind..."
              rows="1"
            />
            
            <button 
              onClick={sendMessage} 
              disabled={isSending || (!message.trim() && !image)}
              className="send-button"
            >
              {isSending ? (
                <div className="spinner"></div>
              ) : (
                <FiSend />
              )}
            </button>
          </div>
          <div className="input-footer">
            <p>Student WebMind can make mistakes. Consider checking important information.</p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </div>
  );
}

export default StudentChat;

// CSS (ChatGPT-like styles)
const styles = `
.chat-app {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Theme Modes */
.light-mode {
  --bg-primary: #ffffff;
  --bg-secondary: #f7f7f8;
  --bg-tertiary: #ececf1;
  --text-primary: #343541;
  --text-secondary: #6e6e80;
  --border-color: #e5e5e5;
  --user-bubble: #e9f2ff;
  --user-text: #1a73e8;
  --assistant-bubble: #f7f7f8;
  --assistant-text: #343541;
  --hover-color: #f0f0f0;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --button-primary: #1a73e8;
  --button-hover: #1765cc;
  --button-text: white;
  --sidebar-bg: #f7f7f8;
  --sidebar-text: #343541;
  --sidebar-item-hover: #ececf1;
  --sidebar-item-active: #e1e1e1;
}

.dark-mode {
  --bg-primary: #343541;
  --bg-secondary: #444654;
  --bg-tertiary: #202123;
  --text-primary: #ececf1;
  --text-secondary: #c5c5d2;
  --border-color: #4d4d4f;
  --user-bubble: #1a73e8;
  --user-text: white;
  --assistant-bubble: #444654;
  --assistant-text: #ececf1;
  --hover-color: #40414f;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --button-primary: #1a73e8;
  --button-hover: #1765cc;
  --button-text: white;
  --sidebar-bg: #202123;
  --sidebar-text: #ececf1;
  --sidebar-item-hover: #2a2b32;
  --sidebar-item-active: #343541;
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid var(--border-color);
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-sidebar {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 20px;
  display: none;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.new-chat {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: none;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  transition: background-color 0.2s;
}

.new-chat:hover {
  background-color: var(--sidebar-item-hover);
}

.chat-history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-date {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  padding-left: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: var(--sidebar-item-hover);
}

.history-item.active {
  background-color: var(--sidebar-item-active);
}

.history-item svg {
  font-size: 16px;
  color: var(--text-secondary);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.theme-toggle {
  width: 100%;
  padding: 10px;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--sidebar-item-hover);
}

/* Main Chat Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
  position: relative;
}

.mobile-header {
  display: none;
  padding: 16px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  align-items: center;
}

.mobile-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.menu-button {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  margin-right: 16px;
}

/* Chat Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 24px;
  text-align: center;
  color: var(--text-primary);
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 24px;
  color: var(--button-primary);
  background-color: var(--bg-secondary);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-screen h1 {
  font-size: 32px;
  margin-bottom: 16px;
  font-weight: 600;
}

.welcome-screen p {
  font-size: 16px;
  margin-bottom: 32px;
  color: var(--text-secondary);
}

.example-prompts {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 600px;
}

.example-prompt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.example-prompt:hover {
  background-color: var(--hover-color);
}

.example-prompt svg {
  font-size: 18px;
  color: var(--text-secondary);
}

.message {
  display: flex;
  padding: 24px 16px;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
}

.message:hover {
  background-color: var(--hover-color);
}

.user-message {
  background-color: var(--bg-primary);
}

.assistant-message {
  background-color: var(--bg-secondary);
}

.message-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar {
  background-color: var(--user-bubble);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assistant-avatar {
  background-color: var(--button-primary);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 50px);
}

.message-header {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-primary);
}

.message-body {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
}

.message-body p {
  margin: 0 0 12px 0;
}

.message-body p:last-child {
  margin-bottom: 0;
}

.typing-indicator {
  display: flex;
  align-items: center;
  font-size: 24px;
  color: var(--text-secondary);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.image-section {
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview {
  margin-bottom: 16px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.image-analysis {
  background-color: var(--bg-tertiary);
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  border-left: 3px solid var(--button-primary);
}

.image-analysis h4 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-weight: 600;
}

/* Chat Input */
.chat-input-container {
  padding: 16px;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}

.image-preview-input {
  position: relative;
  margin-bottom: 16px;
}

.image-preview-input img {
  max-width: 100%;
  max-height: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.input-group {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 6px var(--shadow-color);
}

.attach-button {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attach-button:hover {
  color: var(--button-primary);
  background-color: var(--hover-color);
}

textarea {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: none;
  resize: none;
  font-family: inherit;
  font-size: 15px;
  color: var(--text-primary);
  min-height: 24px;
  max-height: 120px;
  outline: none;
}

textarea::placeholder {
  color: var(--text-secondary);
}

.send-button {
  background-color: var(--button-primary);
  color: var(--button-text);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.send-button:disabled {
  background-color: var(--bg-tertiary);
  cursor: not-allowed;
  opacity: 0.7;
}

.send-button:hover:not(:disabled) {
  background-color: var(--button-hover);
  transform: scale(1.05);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.input-footer {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
}

/* Overlay for mobile */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 20;
    transform: translateX(-100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .close-sidebar {
    display: block;
  }
  
  .mobile-header {
    display: flex;
  }
  
  .sidebar-overlay {
    display: block;
  }
  
  .chat-messages {
    padding: 16px 0;
  }
  
  .message {
    padding: 16px 12px;
  }
  
  .welcome-screen h1 {
    font-size: 24px;
  }
  
  .example-prompts {
    max-width: 100%;
  }
}
`;

// Add styles to the document
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);
