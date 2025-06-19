import { useState } from 'react';

const TeacherStudents = () => {
  // Mock student data
  const studentsData = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      course: 'Computer Science',
      attendance: '92%',
      performance: 'Excellent',
      avatar: 'https://via.placeholder.com/40?text=JS',
    },
    {
      id: 2,
      name: 'Emily Johnson',
      email: 'emily.j@example.com',
      course: 'Mathematics',
      attendance: '88%',
      performance: 'Good',
      avatar: 'https://via.placeholder.com/40?text=EJ',
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      course: 'Physics',
      attendance: '95%',
      performance: 'Excellent',
      avatar: 'https://via.placeholder.com/40?text=MB',
    },
    {
      id: 4,
      name: 'Sarah Davis',
      email: 'sarah.d@example.com',
      course: 'English',
      attendance: '78%',
      performance: 'Average',
      avatar: 'https://via.placeholder.com/40?text=SD',
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.w@example.com',
      course: 'Chemistry',
      attendance: '85%',
      performance: 'Good',
      avatar: 'https://via.placeholder.com/40?text=DW',
    },
    {
      id: 6,
      name: 'Jennifer Lee',
      email: 'jennifer.l@example.com',
      course: 'Biology',
      attendance: '91%',
      performance: 'Excellent',
      avatar: 'https://via.placeholder.com/40?text=JL',
    },
    {
      id: 7,
      name: 'Robert Miller',
      email: 'robert.m@example.com',
      course: 'Computer Science',
      attendance: '82%',
      performance: 'Good',
      avatar: 'https://via.placeholder.com/40?text=RM',
    },
    {
      id: 8,
      name: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      course: 'Mathematics',
      attendance: '75%',
      performance: 'Average',
      avatar: 'https://via.placeholder.com/40?text=LA',
    },
  ];

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState('all');

  // Get unique courses for filter
  const courses = ['all', ...new Set(studentsData.map(student => student.course))];
  
  // Get unique performance levels for filter
  const performanceLevels = ['all', ...new Set(studentsData.map(student => student.performance))];

  // Filter students based on search and filters
  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = courseFilter === 'all' || student.course === courseFilter;
    
    const matchesPerformance = performanceFilter === 'all' || student.performance === performanceFilter;
    
    return matchesSearch && matchesCourse && matchesPerformance;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">Students</h1>
      </div>
      
      {/* Main content */}
      <div className="flex-grow p-4 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Filters and search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  id="course"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {courses.map(course => (
                    <option key={course} value={course}>
                      {course === 'all' ? 'All Courses' : course}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="performance" className="block text-sm font-medium text-gray-700 mb-1">Performance</label>
                <select
                  id="performance"
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {performanceLevels.map(level => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Students table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src={student.avatar} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.course}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.attendance}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.performance === 'Excellent' ? 'bg-green-100 text-green-800' : student.performance === 'Good' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {student.performance}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary hover:text-primary-dark mr-3">View</button>
                        <button className="text-primary hover:text-primary-dark">Message</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudents;