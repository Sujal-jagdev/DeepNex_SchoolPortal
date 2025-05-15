import React, { useState, useEffect } from 'react';
import { supabase } from '../helper/supabaseClient';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { FiHome, FiUsers, FiBarChart2, FiSearch, FiX, FiEdit, FiEye, FiMenu } from 'react-icons/fi';

const TeacherPortal = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageGrade: 0,
    topPerformer: null,
    gradeDistribution: []
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const results = students.filter(student => {
      const name = student?.name?.toLowerCase() ?? '';
      const email = student?.email?.toLowerCase() ?? '';
      const id = student?.id?.toString().toLowerCase() ?? '';
      
      const search = searchTerm.toLowerCase();
      
      return name.includes(search) || 
             email.includes(search) || 
             id.includes(search);
    });
    setFilteredStudents(results);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student')
        .select('*');
      
      if (error) throw error;
      
      setStudents(data || []);
      setFilteredStudents(data || []);
      calculateStats(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const calculateStats = (studentData) => {
    if (!studentData || studentData.length === 0) {
      setStats({
        totalStudents: 0,
        averageGrade: 0,
        topPerformer: null,
        gradeDistribution: []
      });
      return;
    }
    
    const total = studentData.length;
    const sum = studentData.reduce((acc, student) => acc + (student.grade || 0), 0);
    const average = total > 0 ? sum / total : 0;
    
    const topPerformer = studentData.reduce((max, student) => 
      (student.grade || 0) > (max.grade || 0) ? student : max, studentData[0]);
    
    const gradeDistribution = [
      { name: 'A (90-100)', value: studentData.filter(s => (s.grade || 0) >= 90).length },
      { name: 'B (80-89)', value: studentData.filter(s => (s.grade || 0) >= 80 && (s.grade || 0) < 90).length },
      { name: 'C (70-79)', value: studentData.filter(s => (s.grade || 0) >= 70 && (s.grade || 0) < 80).length },
      { name: 'D (60-69)', value: studentData.filter(s => (s.grade || 0) >= 60 && (s.grade || 0) < 70).length },
      { name: 'F (<60)', value: studentData.filter(s => (s.grade || 0) < 60).length },
    ];
    
    setStats({
      totalStudents: total,
      averageGrade: average.toFixed(2),
      topPerformer,
      gradeDistribution
    });
  };

  const openStudentProfile = (student) => {
    setSelectedStudent(student);
  };

  const closeStudentProfile = () => {
    setSelectedStudent(null);
  };

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B'];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-30 transition-transform duration-300 ease-in-out flex-shrink-0`}>
        <div className="w-64 bg-gradient-to-b from-indigo-700 to-indigo-800 text-white flex flex-col pt-6 pb-10 h-full">
          {/* Close button for mobile */}
          <div className="md:hidden absolute top-2 right-2">
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="text-white p-2 rounded-full hover:bg-white/10"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-4 flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FiHome className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">EduTrack</h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1">
            <button
              onClick={() => {
                setActiveTab('analytics');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'analytics' ? 'bg-white/10 text-white shadow-md' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
            >
              <FiBarChart2 className="h-5 w-5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('students');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'students' ? 'bg-white/10 text-white shadow-md' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
            >
              <FiUsers className="h-5 w-5" />
              <span>Student Data</span>
            </button>
          </nav>
          
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="font-medium">T</span>
              </div>
              <div>
                <p className="font-medium">Teacher</p>
                <p className="text-xs text-white/60">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-600"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">EduTrack</h1>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Students</p>
                          <h3 className="text-3xl font-bold mt-1 text-gray-800">{stats.totalStudents}</h3>
                        </div>
                        <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                          <FiUsers className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Average Grade</p>
                          <h3 className="text-3xl font-bold mt-1 text-gray-800">{stats.averageGrade}</h3>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 text-green-600">
                          <FiBarChart2 className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Top Performer</p>
                          <h3 className="text-xl font-bold mt-1 text-gray-800 truncate">
                            {stats.topPerformer ? `${stats.topPerformer.name} (${stats.topPerformer.grade || 'N/A'})` : 'N/A'}
                          </h3>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade Distribution</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.gradeDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {stats.gradeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                              }}
                            />
                            <Legend 
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                              wrapperStyle={{ paddingTop: '20px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Overview</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.gradeDistribution}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#6B7280' }}
                            />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#6B7280' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                              }}
                            />
                            <Bar 
                              dataKey="value" 
                              name="Students"
                              radius={[4, 4, 0, 0]}
                            >
                              {stats.gradeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'students' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Student Records</h2>
                    <div className="relative w-full sm:w-64">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                              <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <img 
                                        className="h-10 w-10 rounded-full object-cover" 
                                        src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || '')}&background=random`} 
                                        alt={student.name || 'Student'}
                                      />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{student.name || 'Unknown'}</div>
                                      <div className="text-sm text-gray-500">{student.email || 'No email'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${student.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {student.active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${(student.grade || 0) >= 90 ? 'bg-green-100 text-green-800' : 
                                      (student.grade || 0) >= 80 ? 'bg-blue-100 text-blue-800' :
                                      (student.grade || 0) >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'}`}>
                                    {student.grade || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <div className="w-16 mr-2">
                                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-indigo-600" 
                                          style={{ width: `${student.attendance || 0}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <span>{student.attendance || '0'}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => openStudentProfile(student)}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"
                                  >
                                    <FiEye className="mr-1" /> View
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                No students found matching your search criteria
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16">
                    <img 
                      className="h-16 w-16 rounded-full object-cover" 
                      src={selectedStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name || '')}&background=random`} 
                      alt={selectedStudent.name || 'Student'}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedStudent.name || 'Unknown Student'}</h3>
                    <p className="text-gray-600">{selectedStudent.email || 'No email'}</p>
                  </div>
                </div>
                <button
                  onClick={closeStudentProfile}
                  className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-sm text-gray-500">Student ID</span>
                        <span className="text-sm font-medium">{selectedStudent.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-sm text-gray-500">Phone</span>
                        <span className="text-sm font-medium">{selectedStudent.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-sm text-gray-500">Address</span>
                        <span className="text-sm font-medium">{selectedStudent.address || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Date of Birth</span>
                        <span className="text-sm font-medium">{selectedStudent.dob || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Academic Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full 
                          ${selectedStudent.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedStudent.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-sm text-gray-500">Enrollment Date</span>
                        <span className="text-sm font-medium">{selectedStudent.enrollment_date || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Last Active</span>
                        <span className="text-sm font-medium">{selectedStudent.last_active || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Performance Metrics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-sm text-gray-500">Current Grade</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full 
                          ${(selectedStudent.grade || 0) >= 90 ? 'bg-green-100 text-green-800' : 
                            (selectedStudent.grade || 0) >= 80 ? 'bg-blue-100 text-blue-800' :
                            (selectedStudent.grade || 0) >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                          {selectedStudent.grade || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-sm text-gray-500">Attendance</span>
                        <div className="flex items-center">
                          <div className="w-20 mr-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600" 
                                style={{ width: `${selectedStudent.attendance || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium">{selectedStudent.attendance || '0'}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Completed Assignments</span>
                        <span className="text-sm font-medium">24/30</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg h-64">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Grade Trend
                    </h4>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { name: 'Quiz 1', score: 85 },
                            { name: 'Midterm', score: 78 },
                            { name: 'Project', score: 92 },
                            { name: 'Quiz 2', score: 88 },
                            { name: 'Final', score: selectedStudent.grade || 0 },
                          ]}
                          margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '0.5rem',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#6366F1" 
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#6366F1' }}
                            activeDot={{ r: 6, stroke: '#6366F1', strokeWidth: 2, fill: '#fff' }}
                            name="Score" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={closeStudentProfile}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPortal;