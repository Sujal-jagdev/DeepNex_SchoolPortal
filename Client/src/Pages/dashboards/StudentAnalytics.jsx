import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from 'recharts';
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaMale, FaFemale, FaBook, FaGraduationCap, FaChartLine } from 'react-icons/fa';
import { userService } from '../../services/api';

const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState('student'); // 'hod', 'teacher', 'student'
  
  // State for data
  const [loading, setLoading] = useState(true);
  const [hodData, setHodData] = useState([]);
  const [teacherData, setTeacherData] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  
  // Derived statistics
  const [hodStats, setHodStats] = useState({
    total: 0,
    totalDepartments: 0,
    maleHods: 0,
    femaleHods: 0
  });
  
  const [teacherStats, setTeacherStats] = useState({
    total: 0,
    maleTeachers: 0,
    femaleTeachers: 0
  });
  
  const [studentStats, setStudentStats] = useState({
    total: 0,
    maleStudents: 0,
    femaleStudents: 0
  });

  // Colors for charts
  const COLORS = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#3B5249', '#6B818C'];
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch HODs
        const hodsResponse = await userService.getAllHODs();
        if (hodsResponse && hodsResponse.hodsData) {
          setHodData(hodsResponse.hodsData);
          
          // Calculate HOD statistics
          const maleHods = hodsResponse.hodsData.filter(hod => hod.gender === 'male').length;
          const femaleHods = hodsResponse.hodsData.filter(hod => hod.gender === 'female').length;
          const departments = [...new Set(hodsResponse.hodsData.map(hod => hod.department_expertise))];
          
          setHodStats({
            total: hodsResponse.hodsData.length,
            totalDepartments: departments.length,
            maleHods,
            femaleHods
          });
        }
        
        // Fetch Teachers
        const teachersResponse = await userService.getAllTeachers();
        if (teachersResponse && teachersResponse.teachersData) {
          setTeacherData(teachersResponse.teachersData);
          
          // Calculate Teacher statistics
          const maleTeachers = teachersResponse.teachersData.filter(teacher => teacher.gender === 'male').length;
          const femaleTeachers = teachersResponse.teachersData.filter(teacher => teacher.gender === 'female').length;
          
          setTeacherStats({
            total: teachersResponse.teachersData.length,
            maleTeachers,
            femaleTeachers
          });
        }
        
        // Fetch Students
        const studentsResponse = await userService.getAllStudents();
        if (studentsResponse && studentsResponse.studentsData) {
          setStudentData(studentsResponse.studentsData);
          
          // Calculate Student statistics
          const maleStudents = studentsResponse.studentsData.filter(student => student.gender === 'male').length;
          const femaleStudents = studentsResponse.studentsData.filter(student => student.gender === 'female').length;
          
          setStudentStats({
            total: studentsResponse.studentsData.length,
            maleStudents,
            femaleStudents
          });
        }
        
        // Fetch Departments
        const departmentsResponse = await userService.getAllDepartments();
        if (departmentsResponse && departmentsResponse.data) {
          setDepartmentData(departmentsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Prepare chart data
  const getDepartmentHodDistribution = () => {
    const departmentCounts = {};
    
    hodData.forEach(hod => {
      const dept = hod.department_expertise || 'Unknown';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });
    
    return Object.keys(departmentCounts).map(dept => ({
      name: dept,
      value: departmentCounts[dept],
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
  };
  
  const getQualificationHodDistribution = () => {
    const qualificationCounts = {};
    
    hodData.forEach(hod => {
      const qualification = hod.highest_qualification || 'Unknown';
      qualificationCounts[qualification] = (qualificationCounts[qualification] || 0) + 1;
    });
    
    return Object.keys(qualificationCounts).map(qualification => ({
      name: qualification,
      count: qualificationCounts[qualification]
    }));
  };
  
  const getExperienceHodDistribution = () => {
    const experienceGroups = {
      '0-5 years': 0,
      '6-10 years': 0,
      '11-15 years': 0,
      '16+ years': 0
    };
    
    hodData.forEach(hod => {
      const experience = parseInt(hod.experience) || 0;
      
      if (experience <= 5) experienceGroups['0-5 years']++;
      else if (experience <= 10) experienceGroups['6-10 years']++;
      else if (experience <= 15) experienceGroups['11-15 years']++;
      else experienceGroups['16+ years']++;
    });
    
    return Object.keys(experienceGroups).map(group => ({
      name: group,
      count: experienceGroups[group],
      average: hodData.length > 0 ? (experienceGroups[group] / hodData.length * 100).toFixed(1) : 0
    }));
  };
  
  const getSubjectTeacherDistribution = () => {
    const subjectCounts = {};
    
    teacherData.forEach(teacher => {
      const subject = teacher.subject_expertise || 'Unknown';
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
    
    return Object.keys(subjectCounts).map(subject => ({
      name: subject,
      count: subjectCounts[subject]
    }));
  };
  
  const getQualificationTeacherDistribution = () => {
    const qualificationCounts = {};
    
    teacherData.forEach(teacher => {
      const qualification = teacher.qualification || 'Unknown';
      qualificationCounts[qualification] = (qualificationCounts[qualification] || 0) + 1;
    });
    
    return Object.keys(qualificationCounts).map(qualification => ({
      name: qualification,
      count: qualificationCounts[qualification]
    }));
  };
  
  const getExperienceTeacherDistribution = () => {
    const experienceGroups = {
      '0-5 years': 0,
      '6-10 years': 0,
      '11-15 years': 0,
      '16+ years': 0
    };
    
    teacherData.forEach(teacher => {
      const experience = parseInt(teacher.experience) || 0;
      
      if (experience <= 5) experienceGroups['0-5 years']++;
      else if (experience <= 10) experienceGroups['6-10 years']++;
      else if (experience <= 15) experienceGroups['11-15 years']++;
      else experienceGroups['16+ years']++;
    });
    
    return Object.keys(experienceGroups).map(group => ({
      name: group,
      count: experienceGroups[group],
      average: teacherData.length > 0 ? (experienceGroups[group] / teacherData.length * 100).toFixed(1) : 0
    }));
  };
  
  const getClassStudentDistribution = () => {
    const classCounts = {};
    
    // Only count students from 5th to 12th standard
    studentData.forEach(student => {
      const studentClass = student.std || 'Unknown';
      if (studentClass >= 5 && studentClass <= 12) {
        classCounts[`Class ${studentClass}`] = (classCounts[`Class ${studentClass}`] || 0) + 1;
      }
    });
    
    return Object.keys(classCounts).map(className => ({
      name: className,
      count: classCounts[className]
    }));
  };
  
  const getStreamStudentDistribution = () => {
    const streamCounts = {
      'Science': 0,
      'Commerce': 0,
      'Arts': 0,
      'General': 0
    };
    
    studentData.forEach(student => {
      const stream = student.stream || 'General';
      streamCounts[stream] = (streamCounts[stream] || 0) + 1;
    });
    
    return Object.keys(streamCounts).map(stream => ({
      name: stream,
      value: streamCounts[stream],
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
  };
  
  const getChatbotUsageByClass = () => {
    const classCounts = {};
    
    // Only count students from 5th to 12th standard
    studentData.forEach(student => {
      const studentClass = student.std || 'Unknown';
      if (studentClass >= 5 && studentClass <= 12) {
        classCounts[`Class ${studentClass}`] = (classCounts[`Class ${studentClass}`] || 0) + (student.message_count || 0);
      }
    });
    
    return Object.keys(classCounts).map(className => ({
      name: className,
      messages: classCounts[className]
    }));
  };
  
  const getChatbotLeaderboard = () => {
    return [...studentData]
      .sort((a, b) => (b.message_count || 0) - (a.message_count || 0))
      .slice(0, 10)
      .map(student => ({
        id: student.id,
        name: student.fullname || 'Unknown',
        class: student.std || 'Unknown',
        messages: student.message_count || 0
      }));
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">Teacher Analytics Dashboard</h1>
      </div>
      
      {/* Tab navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('student')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'student' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-primary'}`}
          >
            Student Analytics
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow p-4 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>  
              
              {/* Student Tab */}
              {activeTab === 'student' && (
                <div className="space-y-6">
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                      <div className="rounded-full bg-blue-100 p-3 mr-4">
                        <FaUserGraduate className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
                        <p className="text-3xl font-bold text-primary">{studentStats.total}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                      <div className="rounded-full bg-purple-100 p-3 mr-4">
                        <FaMale className="text-purple-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">Male Students</h3>
                        <p className="text-3xl font-bold text-purple-500">{studentStats.maleStudents}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                      <div className="rounded-full bg-yellow-100 p-3 mr-4">
                        <FaFemale className="text-yellow-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">Female Students</h3>
                        <p className="text-3xl font-bold text-yellow-500">{studentStats.femaleStudents}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Class-wise Student Count */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Class-wise Student Count (5th-12th)</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getClassStudentDistribution()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Students" fill="#2E86AB" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Stream-wise Student Distribution */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Stream-wise Student Distribution</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getStreamStudentDistribution()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {getStreamStudentDistribution().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* AI Chatbot Usage by Classes */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">AI Chatbot Usage by Classes</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getChatbotUsageByClass()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="messages" name="Messages" fill="#F18F01" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* AI Chatbot Usage Leaderboard */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">AI Chatbot Usage Leaderboard (Top 10)</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getChatbotLeaderboard().map((student, index) => (
                              <tr key={student.id || index}>
                                <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">Class {student.class}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{student.messages}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  {/* Student List */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Student List</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {studentData.map((student, index) => (
                            <tr key={student.id || index}>
                              <td className="px-6 py-4 whitespace-nowrap">{student.fullname || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">Class {student.std || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{student.gender || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{student.stream || 'General'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{student.message_count || 0}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{student.email || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;