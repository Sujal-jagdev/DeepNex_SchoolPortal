import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { chatService, userService } from "../../services/api";
import { toast } from "react-hot-toast";

const TeacherDashboard = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");
  
  // State for mobile view
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // State for student detail modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");

  // State for chat messages
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  // State for student data
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState(null);

  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState({
    classWiseStudentCount: [],
    aiChatbotUsage: [],
    subjectPerformance: [],
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Filter students based on search criteria
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = student.name?.toLowerCase().includes(query) || query === "";
    const rollNoMatch = student.roll_no?.toString().toLowerCase().includes(query) || query === "";
    return nameMatch || rollNoMatch;
  });

  // Fetch chat history when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      setLoadingMessages(true);
      setMessagesError(null);
      try {
        const response = await chatService.getChatHistory();
        if (response && response.data) {
          setMessages(response.data);
        } else {
          // Fallback to mock data if API returns empty
          setMessages([
            {
              id: 1,
              sender: "AI Assistant",
              content: "Hello! How can I help you today?",
              timestamp: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 2,
              sender: "Teacher",
              content: "I need help creating a lesson plan for tomorrow.",
              timestamp: new Date(Date.now() - 85400000).toISOString(),
            },
            {
              id: 3,
              sender: "AI Assistant",
              content: "Sure! What subject and grade level are you teaching?",
              timestamp: new Date(Date.now() - 84400000).toISOString(),
            },
            {
              id: 4,
              sender: "Teacher",
              content: "Science for 8th grade. The topic is photosynthesis.",
              timestamp: new Date(Date.now() - 83400000).toISOString(),
            },
            {
              id: 5,
              sender: "AI Assistant",
              content:
                "Great! Here's a suggested lesson plan for photosynthesis...",
              timestamp: new Date(Date.now() - 82400000).toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
        setMessagesError(
          "Failed to load chat history. Using sample data instead."
        );

        // Fallback to mock data
        setMessages([
          {
            id: 1,
            sender: "AI Assistant",
            content: "Hello! How can I help you today?",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 2,
            sender: "Teacher",
            content: "I need help creating a lesson plan for tomorrow.",
            timestamp: new Date(Date.now() - 85400000).toISOString(),
          },
          {
            id: 3,
            sender: "AI Assistant",
            content: "Sure! What subject and grade level are you teaching?",
            timestamp: new Date(Date.now() - 84400000).toISOString(),
          },
          {
            id: 4,
            sender: "Teacher",
            content: "Science for 8th grade. The topic is photosynthesis.",
            timestamp: new Date(Date.now() - 83400000).toISOString(),
          },
          {
            id: 5,
            sender: "AI Assistant",
            content:
              "Great! Here's a suggested lesson plan for photosynthesis...",
            timestamp: new Date(Date.now() - 82400000).toISOString(),
          },
        ]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchChatHistory();
  }, []);

  // Fetch students data when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      setStudentsError(null);
      try {
        // Use getAllStudents method which fetches from the Supabase database
        const response = await userService.getAllStudents();
        if (
          response &&
          response.studentsData &&
          response.studentsData.length > 0
        ) {
          // Transform the data to match our component's expected format
          const formattedStudents = response.studentsData.map((student) => ({
            id: student.id,
            name: student.fullname || "Unknown",
            email: student.email || "No email",
            grade: student.std || "N/A",
            roll_no: student.roll_no || "N/A",
            gender: student.gender || "N/A",
            attendance: Math.floor(Math.random() * 20) + 80, // Random between 80-100 for demo
            performance: Math.floor(Math.random() * 30) + 70, // Random between 70-100 for demo
            lastActive: student.created_at || new Date().toISOString(),
            stream: student.stream || "N/A",
            avatar:
              student.avatar_url ||
              `https://via.placeholder.com/40?text=${
                student.fullname?.charAt(0) || ""
              }`,
            parents_name: student.parents_name || "N/A",
            parents_num: student.parents_num || "N/A",
            address: student.address || "N/A",
            dob: student.dob || "N/A",
            status: student.status,
            message_count: student.message_count || 0,
            std: student.std || 0,
          }));
          setStudents(formattedStudents);
        } else {
          // Fallback to mock data if API returns empty
          setStudents([
            {
              id: 1,
              name: "John Doe",
              grade: "8th",
              attendance: 92,
              performance: 85,
              lastActive: "2023-06-15T10:30:00Z",
            },
            {
              id: 2,
              name: "Jane Smith",
              grade: "8th",
              attendance: 88,
              performance: 92,
              lastActive: "2023-06-14T09:45:00Z",
            },
            {
              id: 3,
              name: "Robert Johnson",
              grade: "8th",
              attendance: 95,
              performance: 78,
              lastActive: "2023-06-15T11:20:00Z",
            },
            {
              id: 4,
              name: "Emily Davis",
              grade: "8th",
              attendance: 90,
              performance: 88,
              lastActive: "2023-06-13T14:10:00Z",
            },
            {
              id: 5,
              name: "Michael Brown",
              grade: "8th",
              attendance: 85,
              performance: 80,
              lastActive: "2023-06-12T15:30:00Z",
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching students data:", err);
        setStudentsError(
          "Failed to load students data. Using sample data instead."
        );

        // Fallback to mock data
        setStudents([
          {
            id: 1,
            name: "John Doe",
            grade: "8th",
            attendance: 92,
            performance: 85,
            lastActive: "2023-06-15T10:30:00Z",
          },
          {
            id: 2,
            name: "Jane Smith",
            grade: "8th",
            attendance: 88,
            performance: 92,
            lastActive: "2023-06-14T09:45:00Z",
          },
          {
            id: 3,
            name: "Robert Johnson",
            grade: "8th",
            attendance: 95,
            performance: 78,
            lastActive: "2023-06-15T11:20:00Z",
          },
          {
            id: 4,
            name: "Emily Davis",
            grade: "8th",
            attendance: 90,
            performance: 88,
            lastActive: "2023-06-13T14:10:00Z",
          },
          {
            id: 5,
            name: "Michael Brown",
            grade: "8th",
            attendance: 85,
            performance: 80,
            lastActive: "2023-06-12T15:30:00Z",
          },
        ]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  // Fetch analytics data when component mounts
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      try {
        // In a real app, you would fetch analytics data from an API
        // const response = await analyticsService.getTeacherAnalytics(); 
        // setAnalyticsData(response.data);

        // Using mock data for now
        // This would be replaced with actual API calls in a production environment

        // Prepare class-wise student count data
        // Group students by grade and count them
        const gradeMap = {};
        const chatbotUsageByClass = {};
        
        students.forEach(student => {
          const grade = `${student.grade}th` || 'N/A';
          gradeMap[grade] = (gradeMap[grade] || 0) + 1;
          
          // Track chatbot usage by class
          if (student.grade) {
            const className = `${student.grade}th`;
            chatbotUsageByClass[className] = (chatbotUsageByClass[className] || 0) + (student.message_count || 0);
          }
        });

        // Convert to array format for chart
        const classWiseStudentCountData = Object.entries(gradeMap)
          .map(([grade, count]) => ({
            name: grade,
            count: count
          }))
          .sort((a, b) => {
            // Sort grades in ascending order (5th, 6th, 7th, etc.)
            const gradeA = parseInt(a.name.replace(/[^0-9]/g, '')) || 0;
            const gradeB = parseInt(b.name.replace(/[^0-9]/g, '')) || 0;
            return gradeA - gradeB;
          });

        // Prepare AI chatbot usage data
        const aiChatbotUsageData = Object.entries(chatbotUsageByClass)
          .map(([className, messageCount]) => ({
            name: className,
            messages: messageCount
          }))
          .sort((a, b) => {
            const gradeA = parseInt(a.name.replace(/[^0-9]/g, '')) || 0;
            const gradeB = parseInt(b.name.replace(/[^0-9]/g, '')) || 0;
            return gradeA - gradeB;
          });

        // Prepare subject performance data
        const subjectPerformanceData = [
          { name: "Science", score: 82 },
          { name: "Math", score: 78 },
          { name: "English", score: 85 },
          { name: "History", score: 80 },
          { name: "Art", score: 88 },
        ];

        setAnalyticsData({
          classWiseStudentCount: classWiseStudentCountData,
          aiChatbotUsage: aiChatbotUsageData,
          subjectPerformance: subjectPerformanceData,
        });
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setAnalyticsError(
          "Failed to load analytics data. Using sample data instead."
        );

        // Fallback to mock data
        setAnalyticsData({
          classWiseStudentCount: [
            { name: "5th", count: 15 },
            { name: "6th", count: 18 },
            { name: "7th", count: 22 },
            { name: "8th", count: 20 },
            { name: "9th", count: 25 },
            { name: "10th", count: 23 },
            { name: "11th", count: 19 },
            { name: "12th", count: 17 },
          ],
          aiChatbotUsage: [
            { name: "5th", messages: 25 },
            { name: "6th", messages: 30 },
            { name: "7th", messages: 45 },
            { name: "8th", messages: 38 },
            { name: "9th", messages: 42 },
            { name: "10th", messages: 50 },
            { name: "11th", messages: 35 },
            { name: "12th", messages: 28 },
          ],
          subjectPerformance: [
            { name: "Science", score: 82 },
            { name: "Math", score: 78 },
            { name: "English", score: 85 },
            { name: "History", score: 80 },
            { name: "Art", score: 88 },
          ],
        });
      } finally {
        setLoadingAnalytics(false);
      }
    };

    // Only fetch analytics if we have students data
    if (students.length > 0) {
      fetchAnalyticsData();
    }
  }, [students]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMessage = {
      id: Date.now(),
      sender: "Teacher",
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    // Add message to UI immediately
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      // In a real app, you would send the message to an API
      // const response = await chatService.sendMessage(newMessage);
      // Add AI response after a delay to simulate processing
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          sender: "AI Assistant",
          content: "I'm processing your request. I'll get back to you shortly.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
      
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Handle viewing student details
  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
    toast.success(`Viewing details for ${student.name || 'student'}`); 
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Dashboard header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">Teacher Dashboard</h1>
      </div>

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Student Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                {/* Student Avatar */}
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-3">
                    {selectedStudent.name ? selectedStudent.name.charAt(0) : "?"}
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {selectedStudent.name || "Unknown"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedStudent.status || "Active"}
                    </p>
                  </div>
                </div>

                {/* Student Information */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Email</h5>
                    <p className="text-gray-800">{selectedStudent.email || "N/A"}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Phone Number</h5>
                    <p className="text-gray-800">{selectedStudent.parents_num || "N/A"}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Standard</h5>
                    <p className="text-gray-800">{selectedStudent.std || "N/A"}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Roll Number</h5>
                    <p className="text-gray-800">{selectedStudent.roll_no || "N/A"}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Parent's Name</h5>
                    <p className="text-gray-800">{selectedStudent.parents_name || "N/A"}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Gender</h5>
                    <p className="text-gray-800">{selectedStudent.gender || "N/A"}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Date of Birth</h5>
                    <p className="text-gray-800">{selectedStudent.dob || "N/A"}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Stream</h5>
                    <p className="text-gray-800">{selectedStudent.stream || "N/A"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h5 className="text-sm font-medium text-gray-500">Address</h5>
                    <p className="text-gray-800">{selectedStudent.address || "N/A"}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Last Active</h5>
                    <p className="text-gray-800">{formatDate(selectedStudent.lastActive)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap ${
              activeTab === "overview"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-primary"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap ${
              activeTab === "students"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-primary"
            }`}
          >
            Students
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow p-2 sm:p-4 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">
                    Total Students
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-primary">
                    {students.length}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <span>Assigned to your classes</span>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Student Performance */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Class-wise Student Count
                  </h3>
                  <div className="h-64 w-full">
                    {loadingAnalytics ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">Loading chart data...</p>
                      </div>
                    ) : analyticsError ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-yellow-600">{analyticsError}</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.classWiseStudentCount}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="count"
                            fill="#0088FE"
                            name="Number of Students"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Student Engagement */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    AI Chatbot Usage by Classes
                  </h3>
                  <div className="h-64 w-full">
                    {loadingAnalytics ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">Loading chart data...</p>
                      </div>
                    ) : analyticsError ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-yellow-600">{analyticsError}</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.aiChatbotUsage}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="messages"
                            fill="#F18F01"
                            name="Messages"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Recent Student Activity
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  {loadingStudents ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">
                        Loading student activity...
                      </p>
                    </div>
                  ) : studentsError ? (
                    <div className="p-8 text-center">
                      <p className="text-yellow-600">{studentsError}</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">
                        No student activity found.
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200 table-auto w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attendance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Active
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.slice(0, 5).map((student) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                  {student.name ? student.name.charAt(0) : "?"}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.name || "Unknown"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.email || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.parents_num || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.std || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.roll_no || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewStudentDetails(student)}
                                className="text-primary hover:text-primary-dark px-3 py-1 border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="space-y-6">
              {/* Search and filters */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-grow">
                    <input
                      type="text"
                      placeholder="Search by name or roll number..."
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Students list */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Your Students
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  {loadingStudents ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">Loading students data...</p>
                    </div>
                  ) : studentsError ? (
                    <div className="p-8 text-center">
                      <p className="text-yellow-600">{studentsError}</p>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No students found matching your search criteria.</p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200 table-auto w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Standard
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Roll Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parent's Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                  {student.name ? student.name.charAt(0) : "?"}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.name || "Unknown"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.email || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.parents_num || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.std || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.roll_no || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.parents_name || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewStudentDetails(student)}
                                className="text-primary hover:text-primary-dark px-3 py-1 border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Student Performance */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Class-wise Student Count
                </h3>
                <div className="h-80 w-full">
                  {loadingAnalytics ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">Loading chart data...</p>
                    </div>
                  ) : analyticsError ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-yellow-600">{analyticsError}</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.classWiseStudentCount}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="count"
                          fill="#0088FE"
                          name="Number of Students"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Subject Performance */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Subject Performance
                </h3>
                <div className="h-80 w-full">
                  {loadingAnalytics ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">Loading chart data...</p>
                    </div>
                  ) : analyticsError ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-yellow-600">{analyticsError}</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.subjectPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="score"
                          fill="#00C49F"
                          name="Average Score"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Student Engagement */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  AI Chatbot Usage by Classes
                </h3>
                <div className="h-80 w-full">
                  {loadingAnalytics ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">Loading chart data...</p>
                    </div>
                  ) : analyticsError ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-yellow-600">{analyticsError}</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.aiChatbotUsage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="messages"
                          fill="#F18F01"
                          name="Messages"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-700">
                  AI Assistant
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Ask for help with lesson planning, grading, or any teaching
                  task.
                </p>
              </div>

              <div className="flex flex-col h-[400px] sm:h-[600px]">
                {/* Chat messages */}
                <div className="flex-grow p-4 overflow-y-auto">
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">Loading chat history...</p>
                    </div>
                  ) : messagesError ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-yellow-600">{messagesError}</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">
                        No messages yet. Start a conversation with the AI
                        Assistant.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === "Teacher"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-3/4 rounded-lg p-3 ${
                              message.sender === "Teacher"
                                ? "bg-primary text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {formatDate(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message here..."
                      className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
