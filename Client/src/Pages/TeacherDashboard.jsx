import { supabase } from '../helper/supabaseClient';
import {
  User,
  Edit3,
  Save,
  X,
  Upload,
  Phone,
  Book,
  Calendar,
  Briefcase,
  Award,
  Home,
  Lock,
  Mail,
  BarChart2,
  Users,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  PieChart
} from 'react-feather';
import { GraduationCap, School, BookOpen, ClipboardList, Bookmark, BookmarkCheck, FileSpreadsheet, NotebookPen, CalendarCheck, Presentation, MessagesSquare, FileStack } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [teacherStats, setTeacherStats] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeCourseFilter, setActiveCourseFilter] = useState('all');

  // For scroll animations
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate fetching data from API
        const stats = {
          totalStudents: 85,
          courses: 4,
          assignmentsDue: 3,
          attendanceRate: 92.5,
          gradingProgress: 65
        };

        const classes = [
          { id: 1, course: 'Advanced Calculus', time: '08:00 AM', room: 'B-204', date: 'Today' },
          { id: 2, course: 'Linear Algebra', time: '10:30 AM', room: 'A-102', date: 'Today' },
          { id: 3, course: 'Discrete Mathematics', time: '02:00 PM', room: 'C-301', date: 'Tomorrow' },
          { id: 4, course: 'Probability Theory', time: '09:15 AM', room: 'D-105', date: 'Tomorrow' }
        ];

        const performance = [
          { name: 'Calculus - Section A', average: 78, improvement: 5.2 },
          { name: 'Algebra - Section B', average: 85, improvement: 2.4 },
          { name: 'Statistics - Section C', average: 72, improvement: 7.8 },
          { name: 'Geometry - Section A', average: 88, improvement: 1.5 }
        ];

        const assignments = [
          { id: 1, title: 'Linear Equations Homework', course: 'Algebra', due: 'Due tomorrow', submitted: 24, total: 30 },
          { id: 2, title: 'Probability Quiz', course: 'Statistics', due: 'Due in 3 days', submitted: 18, total: 30 },
          { id: 3, title: 'Calculus Midterm Project', course: 'Calculus', due: 'Due next week', submitted: 5, total: 30 }
        ];

        const notifs = [
          { id: 1, message: 'New assignment submission from John Doe', time: '30 mins ago', read: false },
          { id: 2, message: 'Department meeting scheduled', time: '2 hours ago', read: true },
          { id: 3, message: 'Your course evaluation is ready', time: '1 day ago', read: true }
        ];

        setTeacherStats(stats);
        setUpcomingClasses(classes);
        setStudentPerformance(performance);
        setRecentAssignments(assignments);
        setNotifications(notifs);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGradeAssignment = (id) => {
    setRecentAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id ? { ...assignment, submitted: assignment.submitted + 1 } : assignment
      )
    );
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const performanceChartData = {
    labels: studentPerformance.map(course => course.name),
    datasets: [
      {
        label: 'Class Average',
        data: studentPerformance.map(course => course.average),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: 'Improvement (%)',
        data: studentPerformance.map(course => course.improvement),
        backgroundColor: 'rgba(236, 72, 153, 0.6)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  const gradingProgressData = {
    labels: recentAssignments.map(assignment => assignment.title),
    datasets: [
      {
        label: 'Grading Progress',
        data: recentAssignments.map(assignment => (assignment.submitted / assignment.total) * 100),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(16, 185, 129, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };

  const attendanceDistributionData = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [
      {
        data: [85, 7, 8],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-pulse flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="h-32 w-32 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full mb-4"
          ></motion.div>
          <div className="h-6 w-64 bg-gradient-to-r from-indigo-200 to-purple-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gradient-to-r from-indigo-200 to-purple-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden"
    >
      {/* Floating bubbles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.3 + 0.1
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="absolute rounded-full bg-indigo-200"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(20px)'
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-indigo-900 text-white shadow-xl z-30 transform transition-all duration-300 ease-in-out">
        <div className="p-6 flex items-center justify-between border-b border-indigo-700">
          <div className="flex items-center space-x-3">
            <School size={28} className="text-indigo-300" />
            <h1 className="text-xl font-bold">EduTeach</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4 mb-8">
            <div className="relative">
              <img
                src="https://randomuser.me/api/portraits/men/45.jpg"
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-indigo-300"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-indigo-900"></div>
            </div>
            <div>
              <h2 className="font-semibold">Prof. Michael Chen</h2>
              <p className="text-sm text-indigo-300">Mathematics Department</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <Home size={18} className="mr-3" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('classes')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${activeTab === 'classes' ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <Presentation size={18} className="mr-3" />
              My Classes
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${activeTab === 'assignments' ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <FileStack size={18} className="mr-3" />
              Assignments
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${activeTab === 'attendance' ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <ClipboardList size={18} className="mr-3" />
              Attendance
            </button>

            <button
              onClick={() => setActiveTab('grades')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${activeTab === 'grades' ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <BookmarkCheck size={18} className="mr-3" />
              Gradebook
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${activeTab === 'messages' ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
            >
              <MessagesSquare size={18} className="mr-3" />
              Messages
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-indigo-700">
          <button className="flex items-center w-full px-4 py-3 rounded-lg text-indigo-200 hover:bg-indigo-800 transition-all">
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen transition-all duration-300">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'Teaching Dashboard'}
              {activeTab === 'classes' && 'My Classes'}
              {activeTab === 'assignments' && 'Assignments'}
              {activeTab === 'attendance' && 'Attendance'}
              {activeTab === 'grades' && 'Gradebook'}
              {activeTab === 'messages' && 'Messages'}
            </h1>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 relative"
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                    >
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-indigo-50' : ''}`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <p className="text-sm text-gray-800">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No new notifications
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-200 text-center">
                        <button className="text-sm text-indigo-600 hover:text-indigo-800">
                          View All
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src="https://randomuser.me/api/portraits/men/45.jpg"
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-indigo-200"
                  />
                  <span className="hidden md:inline text-gray-700 font-medium">Prof. Chen</span>
                  {isProfileOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                  >
                    <div className="py-1">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Your Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Settings</a>
                      <div className="border-t border-gray-100"></div>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Sign out</a>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<GraduationCap size={24} className="text-indigo-500" />}
                  title="Students"
                  value={teacherStats.totalStudents}
                  change="+5 this term"
                  color="indigo"
                />

                <StatCard
                  icon={<BookOpen size={24} className="text-green-500" />}
                  title="Courses"
                  value={teacherStats.courses}
                  change="1 new course"
                  color="green"
                />

                <StatCard
                  icon={<NotebookPen size={24} className="text-blue-500" />}
                  title="Assignments Due"
                  value={teacherStats.assignmentsDue}
                  change="2 to grade"
                  color="blue"
                />

                <StatCard
                  icon={<CheckCircle size={24} className="text-purple-500" />}
                  title="Attendance Rate"
                  value={`${teacherStats.attendanceRate}%`}
                  change="+1.5% from last month"
                  color="purple"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Class Performance</h2>
                    <div className="flex items-center space-x-2">
                      <button
                        className={`text-xs px-3 py-1 rounded-full ${activeCourseFilter === 'all' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveCourseFilter('all')}
                      >
                        All
                      </button>
                      <button
                        className={`text-xs px-3 py-1 rounded-full ${activeCourseFilter === 'calculus' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveCourseFilter('calculus')}
                      >
                        Calculus
                      </button>
                      <button
                        className={`text-xs px-3 py-1 rounded-full ${activeCourseFilter === 'algebra' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveCourseFilter('algebra')}
                      >
                        Algebra
                      </button>
                    </div>
                  </div>
                  <div className="h-64">
                    <Bar
                      data={performanceChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              stepSize: 20
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Grading Progress</h2>
                  <div className="h-64">
                    <Doughnut
                      data={gradingProgressData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                        },
                        cutout: '70%'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Upcoming Classes</h2>
                  <div className="space-y-4">
                    {upcomingClasses.map(classItem => (
                      <div key={classItem.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">{classItem.course}</h3>
                            <p className="text-sm text-gray-500">{classItem.date} • {classItem.time}</p>
                          </div>
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            {classItem.room}
                          </span>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors">
                            Take Attendance
                          </button>
                          <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100 transition-colors">
                            Materials
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center">
                    <Plus size={14} className="mr-1" />
                    Add Class Reminder
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Recent Assignments</h2>
                  <div className="space-y-4">
                    {recentAssignments.map(assignment => (
                      <div key={assignment.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">{assignment.title}</h3>
                            <p className="text-sm text-gray-500">{assignment.course} • {assignment.due}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {assignment.submitted}/{assignment.total} submitted
                          </span>
                        </div>
                        <div className="flex items-center mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="h-2.5 rounded-full bg-blue-600"
                              style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{(assignment.submitted / assignment.total) * 100}%</span>
                        </div>
                        <button
                          onClick={() => handleGradeAssignment(assignment.id)}
                          className="mt-3 w-full px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                        >
                          Grade Assignments
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center">
                    <Plus size={14} className="mr-1" />
                    Create New Assignment
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Attendance Overview</h2>
                  <div className="h-48 mb-4">
                    <Doughnut
                      data={attendanceDistributionData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                        },
                        cutout: '70%'
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-green-800 font-medium">Present</p>
                      <p className="text-lg font-semibold text-green-900">85%</p>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-yellow-800 font-medium">Late</p>
                      <p className="text-lg font-semibold text-yellow-900">7%</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-red-800 font-medium">Absent</p>
                      <p className="text-lg font-semibold text-red-900">8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">My Courses</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                  <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Plus size={16} className="mr-2" />
                    Add Course
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentPerformance.map((course, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                      <h3 className="font-bold text-lg">{course.name}</h3>
                      <p className="text-indigo-100">Mathematics Department</p>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Class Average</p>
                          <p className="text-2xl font-bold">{course.average}%</p>
                        </div>
                        <div className="bg-indigo-100 p-3 rounded-lg">
                          <BookOpen size={20} className="text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-gray-500">Students</p>
                          <p className="font-medium">30</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Improvement</p>
                          <p className="font-medium text-green-600">+{course.improvement}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sessions</p>
                          <p className="font-medium">24</p>
                        </div>
                      </div>
                      <button className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        View Class
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Assignment Management</h2>
                <p>Assignment management content goes here...</p>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Attendance Tracking</h2>
                <p>Attendance tracking content goes here...</p>
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Gradebook</h2>
                <p>Gradebook content goes here...</p>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Messages</h2>
                <p>Messages content goes here...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Reusable Components
const StatCard = ({ icon, title, value, change, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600'
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${colorClasses[color]} p-6 rounded-xl shadow-sm border border-transparent hover:border-${color}-300 transition-all`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-3 rounded-lg bg-white bg-opacity-50">
          {icon}
        </div>
      </div>
      <p className="text-xs mt-3 opacity-80">{change}</p>
    </motion.div>
  );
};

export default TeacherDashboard;