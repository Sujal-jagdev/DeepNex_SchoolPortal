import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { userService } from '../../services/api';

const AdminDashboard = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');

  // State for users data
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // State for user statistics
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalHODs: 0,
    totalAdmins: 0,
    userRoleData: [],
    userActivityData: [],
  });

  // State for system logs
  const [systemLogs, setSystemLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState(null);

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Fetch users data when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUsersError(null);
      try {
        // Fetch all types of users
        const studentsPromise = userService.getAllStudents();
        const teachersPromise = userService.getAllTeachers();
        const hodsPromise = userService.getAllHODs();
        // const adminsPromise = userService.getAdmins();

        const [studentsRes, teachersRes, hodsRes, adminsRes] = await Promise.allSettled([
          studentsPromise,
          teachersPromise,
          hodsPromise,
          // adminsPromise
        ]);

        // Extract data or use empty arrays if request failed
        const students = studentsRes.status === 'fulfilled' && studentsRes.value?.studentsData ? studentsRes.value.studentsData : [];
        const teachers = teachersRes.status === 'fulfilled' && teachersRes.value?.teachersData ? teachersRes.value.teachersData : [];
        const hods = hodsRes.status === 'fulfilled' && hodsRes.value?.hodsData ? hodsRes.value.hodsData : [];
        // const admins = adminsRes.status === 'fulfilled' && adminsRes.value?.data ? adminsRes.value.data : [];

        // Combine all users
        const allUsers = [
          ...students.map(s => ({ ...s, role: 'student' })),
          ...teachers.map(t => ({ ...t, role: 'teacher' })),
          ...hods.map(h => ({ ...h, role: 'hod' })),
          // ...admins.map(a => ({ ...a, role: 'admin' }))
        ];
        console.log(allUsers)
        if (allUsers.length > 0) {

          setUsers(allUsers);

          // Calculate user statistics

          const totalStudents = students.length;
          const totalTeachers = teachers.length;
          const totalHODs = hods.length;
          // const totalAdmins = admins.length;
          const totalUsers = totalStudents + totalTeachers + totalHODs;


          // Create data for role distribution chart
          const userRoleData = [
            { name: 'Students', value: totalStudents },
            { name: 'Teachers', value: totalTeachers }
            // { name: 'Admins', value: totalAdmins },
          ];

          // Process student data to create class-wise AI usage data
          const classWiseAIUsage = [];

          // Initialize data structure for classes 5-10
          for (let i = 5; i <= 10; i++) {
            classWiseAIUsage.push({
              class: `Class ${i}`,
              messageCount: 0,
              studentCount: 0
            });
          }

          // Process student data to calculate message counts by class
          students.forEach(student => {
            // Only process students from classes 5-10
            const studentClass = parseInt(student.std);
            if (studentClass >= 5 && studentClass <= 10) {
              const classIndex = studentClass - 5;
              classWiseAIUsage[classIndex].messageCount += (student.message_count || 0);
              classWiseAIUsage[classIndex].studentCount += 1;
            }
          });

          setUserStats({
            totalUsers,
            totalStudents,
            totalTeachers,
            totalHODs,
            // totalAdmins,
            userRoleData,
            classWiseAIUsage,
          });
        } else {
          // Fallback to mock data if no users were fetched
          setUsers([
            { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'student', status: 'active', lastActive: '2023-06-15T10:30:00Z' },
            { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'teacher', status: 'active', lastActive: '2023-06-15T09:45:00Z' },
            { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com', role: 'hod', status: 'active', lastActive: '2023-06-14T16:20:00Z' },
            // { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', role: 'admin', status: 'active', lastActive: '2023-06-15T11:10:00Z' },
            { id: 5, name: 'Michael Brown', email: 'michael.brown@example.com', role: 'student', status: 'inactive', lastActive: '2023-06-10T14:30:00Z' },
          ]);

          setUserStats({
            totalUsers: 5,
            totalStudents: 2,
            totalTeachers: 1,
            totalHODs: 1,
            // totalAdmins: 1,
            userRoleData: [
              { name: 'Students', value: 2 },
              { name: 'Teachers', value: 1 },
              { name: 'HODs', value: 1 },
              // { name: 'Admins', value: 1 },
            ],
            classWiseAIUsage: [
              { class: 'Class 5', messageCount: 120, studentCount: 25 },
              { class: 'Class 6', messageCount: 150, studentCount: 30 },
              { class: 'Class 7', messageCount: 200, studentCount: 35 },
              { class: 'Class 8', messageCount: 180, studentCount: 32 },
              { class: 'Class 9', messageCount: 250, studentCount: 40 },
              { class: 'Class 10', messageCount: 220, studentCount: 38 },
            ],
          });
        }
      } catch (err) {
        console.error('Error fetching users data:', err);
        setUsersError('Failed to load users data. Using sample data instead.');

        // Fallback to mock data
        setUsers([
          { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'student', status: 'active', lastActive: '2023-06-15T10:30:00Z' },
          { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'teacher', status: 'active', lastActive: '2023-06-15T09:45:00Z' },
          { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com', role: 'hod', status: 'active', lastActive: '2023-06-14T16:20:00Z' },
          { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', role: 'admin', status: 'active', lastActive: '2023-06-15T11:10:00Z' },
          { id: 5, name: 'Michael Brown', email: 'michael.brown@example.com', role: 'student', status: 'inactive', lastActive: '2023-06-10T14:30:00Z' },
        ]);

        setUserStats({
          totalUsers: 5,
          totalStudents: 2,
          totalTeachers: 1,
          totalHODs: 1,
          // totalAdmins: 1,
          userRoleData: [
            { name: 'Students', value: 2 },
            { name: 'Teachers', value: 1 },
            { name: 'HODs', value: 1 },
            // { name: 'Admins', value: 1 },
          ],
          classWiseAIUsage: [
            { class: 'Class 5', messageCount: 120, studentCount: 25 },
            { class: 'Class 6', messageCount: 150, studentCount: 30 },
            { class: 'Class 7', messageCount: 200, studentCount: 35 },
            { class: 'Class 8', messageCount: 180, studentCount: 32 },
            { class: 'Class 9', messageCount: 250, studentCount: 40 },
            { class: 'Class 10', messageCount: 220, studentCount: 38 },
          ],
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    // Fetch system logs (mock data for now)
    const fetchSystemLogs = async () => {
      setLoadingLogs(true);
      setLogsError(null);
      try {
        // In a real app, you would fetch logs from an API
        // const response = await logsService.getSystemLogs();
        // setSystemLogs(response.data);

        // Using mock data for now
        setSystemLogs([
          { id: 1, type: 'login', user: 'Emily Davis', timestamp: '2023-06-15T11:10:00Z', details: 'Admin login successful' },
          { id: 2, type: 'update', user: 'Emily Davis', timestamp: '2023-06-15T11:15:00Z', details: 'Updated system settings' },
          { id: 3, type: 'create', user: 'Emily Davis', timestamp: '2023-06-15T11:20:00Z', details: 'Created new teacher account' },
          { id: 4, type: 'login', user: 'Jane Smith', timestamp: '2023-06-15T09:45:00Z', details: 'Teacher login successful' },
          { id: 5, type: 'error', user: 'System', timestamp: '2023-06-15T08:30:00Z', details: 'Database backup failed' },
        ]);
      } catch (err) {
        console.error('Error fetching system logs:', err);
        setLogsError('Failed to load system logs. Using sample data instead.');

        // Fallback to mock data
        setSystemLogs([
          { id: 1, type: 'login', user: 'Emily Davis', timestamp: '2023-06-15T11:10:00Z', details: 'Admin login successful' },
          { id: 2, type: 'update', user: 'Emily Davis', timestamp: '2023-06-15T11:15:00Z', details: 'Updated system settings' },
          { id: 3, type: 'create', user: 'Emily Davis', timestamp: '2023-06-15T11:20:00Z', details: 'Created new teacher account' },
          { id: 4, type: 'login', user: 'Jane Smith', timestamp: '2023-06-15T09:45:00Z', details: 'Teacher login successful' },
          { id: 5, type: 'error', user: 'System', timestamp: '2023-06-15T08:30:00Z', details: 'Database backup failed' },
        ]);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchUsers();
    fetchSystemLogs();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    if (status === 'inactive') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Get log type color
  const getLogTypeColor = (type) => {
    if (type === 'login') return 'bg-blue-100 text-blue-800';
    if (type === 'update') return 'bg-yellow-100 text-yellow-800';
    if (type === 'create') return 'bg-green-100 text-green-800';
    if (type === 'error') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Dashboard header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">HOD Dashboard</h1>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-primary'}`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'logs'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-primary'}`}
          >
            System Logs
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow p-4 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">Students</h3>
                  <p className="mt-2 text-3xl font-bold text-blue-600">{userStats.totalStudents}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <span>Registered students</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">Teachers</h3>
                  <p className="mt-2 text-3xl font-bold text-green-600">{userStats.totalTeachers}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <span>Registered teachers</span>
                  </div>
                </div>

              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Role Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">User Role Distribution</h3>
                  <div className="h-64">
                    {loadingUsers ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">Loading chart data...</p>
                      </div>
                    ) : usersError ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-yellow-600">{usersError}</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userStats.userRoleData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {userStats.userRoleData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Class-wise AI Usage */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Class-wise AI Usage (Classes 5-10)</h3>
                  <div className="h-64">
                    {loadingUsers ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">Loading chart data...</p>
                      </div>
                    ) : usersError ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-yellow-600">{usersError}</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={userStats.classWiseAIUsage}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          barSize={30}
                          animationDuration={1000}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="class" />
                          <YAxis label={{ value: 'Message Count', angle: -90, position: 'insideLeft' }} />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === 'messageCount') {
                                return [`${value} messages`, 'AI Usage'];
                              }
                              return [value, name];
                            }}
                            labelFormatter={(label) => `${label}`}
                          />
                          <Legend />
                          <Bar
                            dataKey="messageCount"
                            fill="#8884d8"
                            name="AI Usage"
                            radius={[5, 5, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent System Logs */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-700">Recent System Logs</h3>
                </div>

                <div className="overflow-x-auto">
                  {loadingLogs ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">Loading system logs...</p>
                    </div>
                  ) : logsError ? (
                    <div className="p-8 text-center">
                      <p className="text-yellow-600">{logsError}</p>
                    </div>
                  ) : systemLogs.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No system logs found.</p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {systemLogs.slice(0, 5).map((log) => (
                          <tr key={log.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLogTypeColor(log.type)}`}>
                                {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{log.user}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(log.timestamp)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{log.details}</div>
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

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* System Logs */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-700">System Logs</h3>
                </div>

                <div className="overflow-x-auto">
                  {loadingLogs ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">Loading system logs...</p>
                    </div>
                  ) : logsError ? (
                    <div className="p-8 text-center">
                      <p className="text-yellow-600">{logsError}</p>
                    </div>
                  ) : systemLogs.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No system logs found.</p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {systemLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLogTypeColor(log.type)}`}>
                                {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{log.user}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(log.timestamp)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{log.details}</div>
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;