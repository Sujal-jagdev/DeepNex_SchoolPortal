import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FiSend,
  FiMenu,
  FiX,
  FiMoon,
  FiSun,
  FiBook,
  FiCheckCircle,
  FiClock,
  FiZap,
  FiStar,
} from "react-icons/fi";
import {
  BsRobot,
  BsPerson,
  BsLightbulb,
  BsThreeDots,
  BsCardChecklist,
  BsJournalBookmark,
  BsStars,
  BsChatSquareQuote,
} from "react-icons/bs";
import { 
  RiPlantLine, 
  RiFunctions, // Changed from RiMathSymbol
  RiMentalHealthLine, 
  RiPresentationLine,
  RiMagicLine,
  RiSparklingLine,
} from 'react-icons/ri';

// Add custom styles for animations
import './TeacherChatBot.css';

function TeacherChatBot() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showLessonPlanner, setShowLessonPlanner] = useState(false);
  const [lessonTopic, setLessonTopic] = useState("");
  const [lessonGrade, setLessonGrade] = useState("");
  const [lessonDuration, setLessonDuration] = useState("30");
  const [plannedLessons, setPlannedLessons] = useState([]);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'planner'
  const [savedChats, setSavedChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatNameInput, setShowChatNameInput] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [messageReactions, setMessageReactions] = useState({});
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const lessonTopicRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sample reactions for messages
  const reactionEmojis = ["👍", "👎", "❤️", "🎯", "👀", "🤔"];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  // Load chat history and saved chats when component mounts
  useEffect(() => {
    const loadSavedChats = () => {
      const savedChatsData = localStorage.getItem("teacherSavedChats");
      if (savedChatsData) {
        try {
          const parsedChats = JSON.parse(savedChatsData);
          setSavedChats(parsedChats);

          const currentId = localStorage.getItem("teacherCurrentChatId");
          if (currentId) {
            setCurrentChatId(currentId);
            const currentChat = parsedChats.find(
              (chat) => chat.id === currentId
            );
            if (currentChat && currentChat.messages) {
              setChatHistory(currentChat.messages);
            }
          }
        } catch (error) {
          console.error("Error parsing saved chats:", error);
        }
      }
    };

    const loadChatHistory = async () => {
      try {
        const res = await axios.get("http://localhost:3001/teacher-history");
        if (res.data.history && res.data.history.length > 0) {
          setChatHistory(res.data.history);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadSavedChats();
    // loadChatHistory();
  }, []);

  // Save current chat to localStorage whenever chatHistory changes
  useEffect(() => {
    if (chatHistory.length > 0 && !currentChatId) {
      createNewChat();
    } else if (currentChatId && chatHistory.length > 0) {
      updateCurrentChat();
    }
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setIsSending(true);
    setIsTyping(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:3001/teacher-chat", {
        message: message,
      });

      setChatHistory(res.data.history);
    } catch (err) {
      console.error("Error sending message:", err);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Create a new chat and save it to localStorage
  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      name: `Chat ${savedChats.length + 1}`,
      date: new Date().toLocaleDateString(),
      messages: chatHistory,
      lastUpdated: new Date().toISOString(),
    };

    const updatedChats = [newChat, ...savedChats];
    setSavedChats(updatedChats);
    setCurrentChatId(newChatId);

    localStorage.setItem("teacherSavedChats", JSON.stringify(updatedChats));
    localStorage.setItem("teacherCurrentChatId", newChatId);
  };

  // Update the current chat in localStorage
  const updateCurrentChat = () => {
    if (!currentChatId) return;

    const updatedChats = savedChats.map((chat) => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: chatHistory,
          lastUpdated: new Date().toISOString(),
        };
      }
      return chat;
    });

    setSavedChats(updatedChats);
    localStorage.setItem("teacherSavedChats", JSON.stringify(updatedChats));
  };

  // Start a new chat
  const startNewChat = () => {
    if (window.confirm("Do you want to start a new chat?")) {
      setChatHistory([]);
      setCurrentChatId(null);
      localStorage.removeItem("teacherCurrentChatId");
    }
  };

  // Load a saved chat
  const loadChat = (chatId) => {
    const chatToLoad = savedChats.find((chat) => chat.id === chatId);
    if (chatToLoad) {
      setChatHistory(chatToLoad.messages || []);
      setCurrentChatId(chatId);
      localStorage.setItem("teacherCurrentChatId", chatId);
      setSidebarOpen(false);
    }
  };

  // Delete a saved chat
  const deleteChat = (chatId, event) => {
    event.stopPropagation();

    if (window.confirm("Are you sure you want to delete this chat?")) {
      const updatedChats = savedChats.filter((chat) => chat.id !== chatId);
      setSavedChats(updatedChats);
      localStorage.setItem("teacherSavedChats", JSON.stringify(updatedChats));

      if (currentChatId === chatId) {
        setChatHistory([]);
        setCurrentChatId(null);
        localStorage.removeItem("teacherCurrentChatId");
      }
    }
  };

  // Rename the current chat
  const renameCurrentChat = () => {
    if (!newChatName.trim() || !currentChatId) {
      setShowChatNameInput(false);
      setNewChatName("");
      return;
    }

    const updatedChats = savedChats.map((chat) => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          name: newChatName.trim(),
        };
      }
      return chat;
    });

    setSavedChats(updatedChats);
    localStorage.setItem("teacherSavedChats", JSON.stringify(updatedChats));
    setShowChatNameInput(false);
    setNewChatName("");
  };

  // Filter chats based on search query
  const filteredChats = searchQuery.trim()
    ? savedChats.filter(
        (chat) =>
          chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (chat.messages &&
            chat.messages.some(
              (msg) =>
                msg.content &&
                msg.content.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      )
    : savedChats;

  // Clear the current chat
  const clearChat = async () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      try {
        setIsSending(true);
        // await axios.post('http://localhost:3001/clear-teacher-history');
        setChatHistory([]);

        if (currentChatId) {
          const updatedChats = savedChats.map((chat) => {
            if (chat.id === currentChatId) {
              return {
                ...chat,
                messages: [],
                lastUpdated: new Date().toISOString(),
              };
            }
            return chat;
          });

          setSavedChats(updatedChats);
          localStorage.setItem(
            "teacherSavedChats",
            JSON.stringify(updatedChats)
          );
        }
      } catch (err) {
        console.error("Error clearing chat history:", err);
        alert("Failed to clear chat history. Please try again.");
      } finally {
        setIsSending(false);
      }
    }
  };

  // Add reaction to a message
  const addReaction = (messageId, emoji) => {
    setMessageReactions((prev) => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), emoji],
    }));
  };

  const toggleLessonPlanner = () => {
    setShowLessonPlanner(!showLessonPlanner);
    if (!showLessonPlanner && lessonTopicRef.current) {
      setTimeout(() => lessonTopicRef.current.focus(), 100);
    }
  };

  const handleLessonSubmit = () => {
    if (!lessonTopic.trim()) {
      alert("Please enter a lesson topic");
      return;
    }

    const newLesson = {
      id: Date.now(),
      topic: lessonTopic,
      grade: lessonGrade,
      duration: lessonDuration,
      date: new Date().toLocaleDateString(),
      lastUpdated: new Date().toISOString(),
    };

    setPlannedLessons([...plannedLessons, newLesson]);
    const prompt = `I'm planning to teach a lesson on ${lessonTopic}${
      lessonGrade ? ` for grade ${lessonGrade} students` : ""
    }${
      lessonDuration ? ` for ${lessonDuration} minutes` : ""
    }. Please provide a detailed lesson plan with objectives, activities, and assessment strategies.`;

    setMessage(prompt);
    setShowLessonPlanner(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
      textareaRef.current.focus();
    }
  };

  const deletePlannedLesson = (id) => {
    setPlannedLessons(plannedLessons.filter((lesson) => lesson.id !== id));
  };

  const loadPlannedLesson = (lesson) => {
    const prompt = `I'm planning to teach a lesson on ${lesson.topic}${
      lesson.grade ? ` for grade ${lesson.grade} students` : ""
    }${
      lesson.duration ? ` for ${lesson.duration} minutes` : ""
    }. Please provide a detailed lesson plan with objectives, activities, and assessment strategies.`;
    setMessage(prompt);

    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
      textareaRef.current.focus();
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ease-in-out ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out ${
          darkMode ? "bg-gradient-to-b from-gray-800 to-gray-900" : "bg-gradient-to-b from-indigo-700 to-indigo-800"
        } text-white shadow-2xl rounded-r-xl overflow-hidden sidebar-animation`}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <BsStars className="h-5 w-5 text-yellow-300" />
              </div>
              <h3 className="text-xl font-bold">Teacher Assistant</h3>
            </div>
            <button
              className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:rotate-90 transform"
              onClick={toggleSidebar}
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex mb-4 border-b border-white/10 transition-all duration-200">
            <button
              className={`flex-1 py-3 px-2 text-center ${
                activeTab === "chat"
                  ? "border-b-2 border-indigo-400 font-medium"
                  : "text-white/70 hover:text-white"
              }`}
              onClick={() => setActiveTab("chat")}
            >
              <div className="flex items-center justify-center">
                <BsRobot className="mr-2" />
                <span>Chat</span>
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-2 text-center ${
                activeTab === "planner"
                  ? "border-b-2 border-indigo-400 font-medium"
                  : "text-white/70 hover:text-white"
              }`}
              onClick={() => setActiveTab("planner")}
            >
              <div className="flex items-center justify-center">
                <BsJournalBookmark className="mr-2" />
                <span>Lessons</span>
              </div>
            </button>
          </div>

          {activeTab === "chat" ? (
            <>
              <button
                className="w-full flex items-center justify-center space-x-2 p-3 mb-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/15 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-black/5 hover:shadow-xl"
                onClick={startNewChat}
              >
                <FiZap className="h-4 w-4 text-yellow-300" />
                <span>+ New Chat</span>
              </button>

              <div className="mb-4">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chats..."
                    className="w-full p-2 pl-8 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="absolute left-2 top-2.5 text-white/50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  {searchQuery && (
                    <button
                      className="absolute right-2 top-2.5 text-white/50 hover:text-white"
                      onClick={() => setSearchQuery("")}
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-thin scrollbar-track-transparent">
                {filteredChats.length > 0 ? (
                  <>
                    <div className="text-sm text-gray-400 px-2 py-1">
                      Saved Chats
                    </div>
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200 hover:translate-x-0.5 ${
                          currentChatId === chat.id ? "bg-white/10" : ""
                        }`}
                        onClick={() => loadChat(chat.id)}
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <BsLightbulb className="text-yellow-300 flex-shrink-0" />
                          <div className="overflow-hidden">
                            <div className="font-medium truncate">
                              {chat.name}
                            </div>
                            <div className="text-xs text-white/60 truncate">
                              {chat.messages && chat.messages.length > 0
                                ? chat.messages[
                                    chat.messages.length - 1
                                  ].content.substring(0, 30) +
                                  (chat.messages[chat.messages.length - 1]
                                    .content.length > 30
                                    ? "..."
                                    : "")
                                : "Empty chat"}
                            </div>
                          </div>
                        </div>
                        <button
                          className="p-1.5 rounded-full hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                          onClick={(e) => deleteChat(chat.id, e)}
                          title="Delete chat"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </>
                ) : searchQuery ? (
                  <div className="text-center text-white/60 py-4">
                    <p>No results found</p>
                  </div>
                ) : (
                  <div className="text-center text-white/60 py-8 px-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 shadow-inner">
                    <RiMagicLine className="mx-auto text-2xl text-indigo-400 mb-2" />
                    <p>No saved chats</p>
                    <p className="text-xs mt-1">Start your first chat!</p>
                  </div>
                </div>
                )}
              </div>

              {currentChatId && (
                <div className="mt-4">
                  {showChatNameInput ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                        placeholder="Chat name..."
                        className="flex-1 p-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            renameCurrentChat();
                          } else if (e.key === "Escape") {
                            setShowChatNameInput(false);
                            setNewChatName("");
                          }
                        }}
                        autoFocus
                      />
                      <button
                        className="p-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        onClick={renameCurrentChat}
                      >
                        Save
                      </button>
                      <button
                        className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                        onClick={() => {
                          setShowChatNameInput(false);
                          setNewChatName("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                      onClick={() => {
                        const currentChat = savedChats.find(
                          (chat) => chat.id === currentChatId
                        );
                        if (currentChat) {
                          setNewChatName(currentChat.name);
                          setShowChatNameInput(true);
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      <span>Rename current chat</span>
                    </button>
                  )}
                </div>
              )}

              {chatHistory.length > 0 && (
                <button
                  className="w-full flex items-center justify-center space-x-2 p-2 mt-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-red-400 hover:text-red-300"
                  onClick={clearChat}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Clear current chat</span>
                </button>
              )}
            </>
          ) : (
            <div className="lesson-planner-sidebar">
              <button
                className="new-lesson w-full flex items-center justify-center space-x-2 p-3 mb-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/15 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-black/5 hover:shadow-xl"
                onClick={toggleLessonPlanner}
              >
                <FiStar className="h-4 w-4 text-yellow-300" />
                <span>+ New lesson plan</span>
              </button>

              <div className="planned-lessons space-y-2">
                <div className="text-sm text-gray-400 px-2 py-1">
                  Your Planned Lessons
                </div>
                {plannedLessons.length === 0 ? (
                  <div className="text-center text-white/60 py-4">
                    <BsCardChecklist className="mx-auto mb-2 text-xl" />
                    <p className="text-sm">No lessons planned yet</p>
                  </div>
                ) : (
                  plannedLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="planned-lesson flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <FiBook className="text-indigo-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {lesson.topic}
                        </div>
                        <div className="text-xs text-white/60 flex items-center mt-1">
                          {lesson.grade && (
                            <span className="mr-2">Grade: {lesson.grade}</span>
                          )}
                          {lesson.duration && (
                            <span className="flex items-center">
                              <FiClock className="mr-1 text-xs" />
                              {lesson.duration} min
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex space-x-1">
                        <button
                          onClick={() => loadPlannedLesson(lesson)}
                          className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                          title="Load this lesson"
                        >
                          <FiCheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deletePlannedLesson(lesson.id)}
                          className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                          title="Delete this lesson"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/10">
          <button
            className="flex items-center justify-center w-full p-3 rounded-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <>
                <FiSun className="mr-2 text-yellow-300" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <FiMoon className="mr-2 text-indigo-300" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden fade-in"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-col h-screen">
        <div
          className={`p-4 shadow-sm flex items-center justify-between md:hidden ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}
        >
          <div className="flex items-center">
            <button
              className={`p-2 rounded-full ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
              onClick={toggleSidebar}
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold ml-4">Teacher Assistant</h2>
          </div>
          <button
            className={`p-2 rounded-full ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <FiSun className="h-5 w-5" />
            ) : (
              <FiMoon className="h-5 w-5" />
            )}
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-4 ${
            darkMode ? "bg-gray-900" : "bg-white/80"
          } relative scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent`}
        >
          {/* Current chat title */}
          {currentChatId &&
            savedChats.find((chat) => chat.id === currentChatId) && (
              <div
                className={`current-chat-title mb-4 p-2 rounded-lg ${
                  darkMode ? "bg-gray-800" : "bg-indigo-50"
                } flex items-center justify-between`}
              >
                <div className="flex items-center space-x-2">
                  <BsLightbulb
                    className={`${
                      darkMode ? "text-yellow-300" : "text-indigo-500"
                    }`}
                  />
                  <span className="font-medium">
                    {savedChats.find((chat) => chat.id === currentChatId).name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className={`p-1.5 rounded-full ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                        : "hover:bg-indigo-100 text-gray-500 hover:text-indigo-700"
                    }`}
                    onClick={() => {
                      const currentChat = savedChats.find(
                        (chat) => chat.id === currentChatId
                      );
                      if (currentChat) {
                        setNewChatName(currentChat.name);
                        setShowChatNameInput(true);
                        setSidebarOpen(true);
                      }
                    }}
                    title="Rename chat"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          {/* Lesson Planner Modal */}
          {showLessonPlanner && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={toggleLessonPlanner}
              ></div>
              <div
                className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <button
                  className={`absolute top-4 right-4 p-1 rounded-full ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={toggleLessonPlanner}
                >
                  <FiX className="h-5 w-5" />
                </button>

                <h3
                  className={`text-xl font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Plan Your Lesson
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Lesson Topic *
                    </label>
                    <input
                      ref={lessonTopicRef}
                      type="text"
                      value={lessonTopic}
                      onChange={(e) => setLessonTopic(e.target.value)}
                      placeholder="e.g. Photosynthesis, Fractions, World War II"
                      className={`w-full p-2 rounded-md border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Grade Level (optional)
                    </label>
                    <select
                      value={lessonGrade}
                      onChange={(e) => setLessonGrade(e.target.value)}
                      className={`w-full p-2 rounded-md border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="">Select grade level</option>
                      <option value="K">Kindergarten</option>
                      <option value="1">1st Grade</option>
                      <option value="2">2nd Grade</option>
                      <option value="3">3rd Grade</option>
                      <option value="4">4th Grade</option>
                      <option value="5">5th Grade</option>
                      <option value="6">6th Grade</option>
                      <option value="7">7th Grade</option>
                      <option value="8">8th Grade</option>
                      <option value="9">9th Grade</option>
                      <option value="10">10th Grade</option>
                      <option value="11">11th Grade</option>
                      <option value="12">12th Grade</option>
                      <option value="college">College</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Lesson Duration (minutes)
                    </label>
                    <select
                      value={lessonDuration}
                      onChange={(e) => setLessonDuration(e.target.value)}
                      className={`w-full p-2 rounded-md border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleLessonSubmit}
                      className={`w-full py-2 px-4 rounded-md font-medium ${
                        darkMode
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      } text-white transition-colors`}
                    >
                      Create Lesson Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 fade-in">
              <div
                className={`h-24 w-24 rounded-full flex items-center justify-center ${
                  darkMode ? "bg-indigo-600/20" : "bg-indigo-100"
                } mb-6 shadow-lg pulse-animation`}
              >
                <BsRobot
                  className={`text-6xl ${
                    darkMode ? "text-blue-400" : "text-indigo-500"
                  }`}
                />
              </div>
              <h1
                className={`text-3xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                } mb-2 tracking-tight`}
              >
                Teacher Assistant AI
              </h1>
              <div className="flex items-center justify-center mb-2">
                <div className="h-1 w-10 bg-indigo-500 rounded-full mr-2"></div>
                <RiSparklingLine className="text-yellow-400 text-lg" />
                <div className="h-1 w-10 bg-indigo-500 rounded-full ml-2"></div>
              </div>
              <p
                className={`${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } max-w-md mb-8 leading-relaxed`}
              >
                Your intelligent teaching and education assistant
              </p>

              <button
                onClick={toggleLessonPlanner}
                className={`mb-8 py-3 px-6 rounded-lg flex items-center justify-center space-x-2 ${
                  darkMode
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                } text-white shadow-lg transition-all hover:scale-105 transform duration-300 hover:shadow-indigo-500/25 hover:shadow-xl`}
              >
                <FiBook className="h-5 w-5" />
                <span>Create New Lesson Plan</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <div
                  className={`p-4 rounded-xl cursor-pointer ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:bg-gray-50"
                  } transition-all duration-200 hover:-translate-y-0.5 shadow-md border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                  onClick={() => {
                    setMessage(
                      "Create a lesson plan for teaching photosynthesis"
                    );
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "24px";
                      textareaRef.current.style.height = `${Math.min(
                        textareaRef.current.scrollHeight,
                        120
                      )}px`;
                    }
                  }}
                >
                  <RiPlantLine className="text-green-500 mb-2 text-xl" />
                  <span className="font-medium">
                    "Create a lesson plan for teaching photosynthesis"
                  </span>
                </div>
                <div
                  className={`p-4 rounded-xl cursor-pointer ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:bg-gray-50"
                  } transition-all duration-200 hover:-translate-y-0.5 shadow-md border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                  onClick={() => {
                    setMessage(
                      "Suggest activities for a math class on fractions"
                    );
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "24px";
                      textareaRef.current.style.height = `${Math.min(
                        textareaRef.current.scrollHeight,
                        120
                      )}px`;
                    }
                  }}
                >
                  <RiFunctions className="text-blue-500 mb-2 text-xl" />
                  <span className="font-medium">
                    "Suggest activities for a math class on fractions"
                  </span>
                </div>
                <div
                  className={`p-4 rounded-xl cursor-pointer ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:bg-gray-50"
                  } transition-all duration-200 hover:-translate-y-0.5 shadow-md border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                  onClick={() => {
                    setMessage(
                      "How can I help students with learning disabilities in my classroom?"
                    );
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "24px";
                      textareaRef.current.style.height = `${Math.min(
                        textareaRef.current.scrollHeight,
                        120
                      )}px`;
                    }
                  }}
                >
                  <RiMentalHealthLine className="text-purple-500 mb-2 text-xl" />
                  <span className="font-medium">
                    "How can I help students with learning disabilities?"
                  </span>
                </div>
                <div
                  className={`p-4 rounded-xl cursor-pointer ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:bg-gray-50"
                  } transition-all duration-200 hover:-translate-y-0.5 shadow-md border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                  onClick={() => {
                    setMessage(
                      "Give me presentation tips for my professional development workshop"
                    );
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "24px";
                      textareaRef.current.style.height = `${Math.min(
                        textareaRef.current.scrollHeight,
                        120
                      )}px`;
                    }
                  }}
                >
                  <RiPresentationLine className="text-orange-500 mb-2 text-xl" />
                  <span className="font-medium">
                    "Presentation tips for professional development"
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-24">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  } message-animation`}
                >
                  <div
                    className={`max-w-[90%] md:max-w-[80%] lg:max-w-[70%] rounded-2xl p-4 shadow-md ${
                      msg.role === "user"
                        ? darkMode
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                          : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                        : darkMode
                        ? "bg-gray-800/80 text-white border border-gray-700 backdrop-blur-sm"
                        : "bg-white text-gray-800 border border-gray-200"
                    } ${msg.role === "user" ? "user-message" : "assistant-message"}`}
                  >
                    <div className="flex items-start space-x-2">
                      {msg.role === "assistant" && (
                        <div
                          className={`flex-shrink-0 mt-1 ${
                            darkMode ? "text-blue-400" : "text-indigo-500"
                          }`}
                        >
                          <BsRobot className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </div>
                        {msg.timestamp && (
                          <div
                            className={`text-xs mt-2 ${
                              msg.role === "user"
                                ? "text-white/70"
                                : darkMode
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div
                          className={`flex-shrink-0 mt-1 ${
                            darkMode ? "text-indigo-300" : "text-white"
                          }`}
                        >
                          <BsPerson className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    {/* Message reactions */}
                    {messageReactions[index] &&
                      messageReactions[index].length > 0 && (
                        <div
                          className={`flex flex-wrap gap-1 mt-2 ${
                            msg.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {[...new Set(messageReactions[index])].map(
                            (emoji, i) => (
                              <span key={i} className="text-sm">
                                {emoji}
                              </span>
                            )
                          )}
                        </div>
                      )}

                    {/* Reaction buttons for assistant messages */}
                    {msg.role === "assistant" && (
                      <div className="flex items-center justify-end mt-2 space-x-1">
                        {reactionEmojis.map((emoji, i) => (
                          <button
                            key={i}
                            className={`p-1 rounded-full text-sm hover:scale-125 transform transition-all ${
                              darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => addReaction(index, emoji)}
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start message-animation">
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                      darkMode
                        ? "bg-gray-800/80 text-white backdrop-blur-sm"
                        : "bg-white text-gray-800"
                    } border ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`flex-shrink-0 ${
                          darkMode ? "text-blue-400" : "text-indigo-500"
                        }`}
                      >
                        <BsRobot className="h-5 w-5" />
                      </div>
                      <div className="typing-indicator flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-typing"></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-typing"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-typing"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          className={`p-4 border-t ${
            darkMode
              ? "border-gray-700 bg-gray-800/90 backdrop-blur-sm"
              : "border-gray-200 bg-white/90 backdrop-blur-sm"
          } sticky bottom-0 z-10`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about teaching, lesson plans, classroom management..."
                  className={`w-full max-h-32 min-h-[40px] p-3 pr-10 rounded-xl resize-none shadow-inner ${
                    darkMode
                      ? "bg-gray-700/80 text-white placeholder-gray-400 border-gray-600"
                      : "bg-gray-50/90 text-gray-900 placeholder-gray-500 border-gray-300"
                  } border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200`}
                  rows="1"
                  disabled={isSending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || isSending}
                  className={`absolute right-2 bottom-2 p-2 rounded-full ${
                    !message.trim() || isSending
                      ? darkMode
                        ? "text-gray-500"
                        : "text-gray-400"
                      : darkMode
                      ? "text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md"
                      : "text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md"
                  } transition-all duration-200 hover:scale-110 transform`}
                >
                  <FiSend className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={toggleLessonPlanner}
                className={`p-3 rounded-xl ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition-all duration-200 hover:scale-110 transform shadow-md`}
                title="Lesson Planner"
              >
                <FiBook
                  className={`h-5 w-5 ${
                    darkMode ? "text-indigo-400" : "text-indigo-600"
                  }`}
                />
              </button>
            </div>

            <div
              className={`text-xs mt-2 text-center ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Teacher Assistant can make mistakes. Consider checking important
              information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherChatBot;