import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const TeacherAnalytics = () => {
  const [activeTab, setActiveTab] = useState('performance'); // 'performance', 'attendance', 'engagement'
  
  // Mock performance data
  const performanceData = [
    { subject: 'Mathematics', average: 72 },
    { subject: 'Science', average: 68 },
    { subject: 'English', average: 75 },
    { subject: 'History', average: 70 },
    { subject: 'Computer Science', average: 73 },
  ];
  
  // Mock attendance data
  const attendanceData = [
    { month: 'Jan', attendance: 95 },
    { month: 'Feb', attendance: 98 },
    { month: 'Mar', attendance: 92 },
    { month: 'Apr', attendance: 96 },
    { month: 'May', attendance: 90 },
    { month: 'Jun', attendance: 94 },
  ];
  
  // Mock engagement data
  const engagementData = [
    { name: 'Assignments Submitted', value: 85 },
    { name: 'Class Participation', value: 70 },
    { name: 'Discussion Forums', value: 55 },
    { name: 'Resource Access', value: 90 },
  ];
  
  // Mock student performance comparison
  const studentComparisonData = [
    { name: 'John', score: 85 },
    { name: 'Emily', score: 78 },
    { name: 'Michael', score: 92 },
    { name: 'Sarah', score: 65 },
    { name: 'David', score: 88 },
  ];
  
  const COLORS = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D'];
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">Teacher Analytics</h1>
      </div>
      
      {/* Tab navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'performance' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-primary'}`}
          >
            Class Performance
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'attendance' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-primary'}`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'engagement' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-primary'}`}
          >
            Student Engagement
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow p-4 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Class Score</h3>
                  <p className="text-3xl font-bold text-primary">72%</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Highest Performing Subject</h3>
                  <p className="text-3xl font-bold text-green-500">English</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Lowest Performing Subject</h3>
                  <p className="text-3xl font-bold text-red-500">Science</p>
                </div>
              </div>
              
              {/* Subject performance chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Subject Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="average" name="Average Score (%)" fill="#2E86AB" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Student comparison */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Performing Students</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={studentComparisonData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" name="Score (%)" fill="#A23B72" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Attendance</h3>
                  <p className="text-3xl font-bold text-primary">94%</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Highest Attendance Month</h3>
                  <p className="text-3xl font-bold text-green-500">February</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Lowest Attendance Month</h3>
                  <p className="text-3xl font-bold text-yellow-500">May</p>
                </div>
              </div>
              
              {/* Attendance trend chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Attendance Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={attendanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="attendance" name="Attendance (%)" stroke="#2E86AB" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Attendance by day of week */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Attendance by Day of Week</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { day: 'Monday', attendance: 92 },
                        { day: 'Tuesday', attendance: 95 },
                        { day: 'Wednesday', attendance: 88 },
                        { day: 'Thursday', attendance: 90 },
                        { day: 'Friday', attendance: 85 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="attendance" name="Attendance (%)" fill="#F18F01" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {/* Engagement Tab */}
          {activeTab === 'engagement' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Engagement</h3>
                  <p className="text-3xl font-bold text-primary">75%</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Most Engaged Area</h3>
                  <p className="text-3xl font-bold text-green-500">Resource Access</p>
                </div>
              </div>
              
              {/* Engagement pie chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Engagement Breakdown</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Engagement trend */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Engagement Trend (Last 6 Months)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: 'Jan', engagement: 65 },
                        { month: 'Feb', engagement: 68 },
                        { month: 'Mar', engagement: 72 },
                        { month: 'Apr', engagement: 75 },
                        { month: 'May', engagement: 80 },
                        { month: 'Jun', engagement: 85 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="engagement" name="Engagement (%)" stroke="#C73E1D" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalytics;