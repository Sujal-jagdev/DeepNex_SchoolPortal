import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import axios from 'axios'
import { supabase } from "../helper/supabaseClient";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [role, setrole] = useState("");
  const [operationLoading, setOperationLoading] = useState({
    delete: null,
    edit: null,
    add: false
  });

  const [formData, setFormData] = useState({
    fullname: "",
    course: "",
    yearlevel: "",
    phonenumber: "",
    email: ""
  });

  // Get Student's Data
  const fetchStudents = async () => {
    try {
      const response = await fetch("https://your-api-endpoint.com/api/students/getstudents");
      if (!response.ok) throw new Error("Failed to fetch students");

      const data = await response.json();
      setStudents(data.studentsData || data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Get All Data From Table And Compare With Auth ID
  const fetchAdmins = async (userID) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select()

      const matchedData = data.find(e => String(e.id) === String(userID));
      setrole(matchedData.role);

    } catch (error) {
      console.error("🚨 Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get Login Session From Supabase
  useEffect(() => {
    const fetchAuthID = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const userID = data?.session?.user?.id;
        if (!userID) {
          console.warn("❌ No authenticated user found.");
          return;
        }

        fetchAdmins(userID);
      } catch (err) {
        console.error("🚨 Error fetching auth ID:", err);
      }
    };

    fetchAuthID();
  }, []);

  const filteredStudents = students.filter(student =>
    student.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        setOperationLoading({ ...operationLoading, delete: studentId });
        const response = await axios.delete(`https://your-api-endpoint.com/api/students/deletestudent/${studentId}`);
        if (response.status === 200) {
          await fetchStudents();
        } else {
          throw new Error("Failed to delete student");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student");
      } finally {
        setOperationLoading({ ...operationLoading, delete: null });
      }
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormData({
      fullname: student.fullname,
      course: student.course,
      yearlevel: student.yearlevel,
      phonenumber: student.phonenumber,
      email: student.email
    });
    setIsModalOpen(true);
  };

  const handleViewProfile = (student) => {
    setViewingStudent(student);
    setIsProfileModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setOperationLoading({ ...operationLoading, edit: editingStudent?.id || 'add' });

      const url = editingStudent
        ? `https://your-api-endpoint.com/api/students/updatestudent/${editingStudent.id}`
        : 'https://your-api-endpoint.com/api/students/addstudent';

      const method = editingStudent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(editingStudent ? "Failed to update student" : "Failed to add student");

      await fetchStudents();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating/adding student:", error);
      alert(editingStudent ? "Failed to update student" : "Failed to add student");
    } finally {
      setOperationLoading({ ...operationLoading, edit: null, add: false });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Sidebar />
        <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 mb-8">
            <div className="absolute inset-0 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute inset-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-32 w-32 text-blue-600 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 7l9-5-9-5-9 5 9 5z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Loading Student Records
          </h2>
          <p className="text-gray-600 text-center max-w-md mb-8">
            Gathering student information from our database...
          </p>
          <div className="flex space-x-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-2 md:p-6 transition-all duration-300 mt-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Student <span className="text-blue-600">Records</span>
          </h1>
          
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search students..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 absolute right-3 top-2.5"
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
        </div>

        {/* Students Grid */}
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 relative"
              style={{ minWidth: '253px' }}>
                {operationLoading.delete === student.id && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/80 flex items-center justify-center z-10 rounded-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                
                <div className="relative h-40 md:h-48">
                  <img
                    className="w-full h-full object-cover"
                    src={student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullname)}&background=3B82F6&color=ffffff&size=96`}
                    alt={student.fullname}
                  />
                  <div className="absolute bottom-2 right-2 h-4 w-4 md:h-5 md:w-5 bg-green-500 rounded-full border-2 md:border-3 border-white shadow-sm"></div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{student.fullname}</h3>
                  <p className="text-blue-500 font-semibold text-sm mb-1 md:mb-2 truncate">{student.course}</p>
                  
                  <div className="flex items-center space-x-1 md:space-x-2 text-gray-600 text-xs md:text-sm mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Year {student.yearlevel}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 md:space-x-2 text-gray-600 text-xs md:text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="truncate">{student.phonenumber}</span>
                  </div>
                  
                  <div className="flex space-x-2 mt-3 md:mt-4">
                    <button
                      onClick={() => handleEditClick(student)}
                      className="flex-1 bg-blue-600 text-white font-semibold py-1 md:py-2 text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Edit
                    </button>
                    {role === "Admin" && (
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="flex-1 bg-red-600 text-white font-semibold py-1 md:py-2 text-xs md:text-sm rounded-lg hover:bg-red-700 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleViewProfile(student)}
                    className="mt-2 md:mt-3 w-full border border-blue-600 text-blue-600 font-semibold py-1 md:py-2 text-xs md:text-sm rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 md:py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 md:h-24 w-16 md:w-24 text-gray-400 mb-3 md:mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl md:text-2xl font-medium text-gray-700 mb-1 md:mb-2">No students found</h3>
            <p className="text-gray-500 mb-4 md:mb-6 text-sm md:text-base">Try adjusting your search criteria</p>
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 md:px-6 py-1 md:py-2 bg-blue-600 text-white text-sm md:text-base rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Edit/Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {editingStudent ? "Edit Student" : "Add New Student"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={operationLoading.edit || operationLoading.add}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3 md:mb-4">
                  <label className="block text-gray-700 mb-1 md:mb-2 text-sm md:text-base" htmlFor="fullname">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    required
                    disabled={operationLoading.edit || operationLoading.add}
                  />
                </div>

                <div className="mb-3 md:mb-4">
                  <label className="block text-gray-700 mb-1 md:mb-2 text-sm md:text-base" htmlFor="course">
                    Course
                  </label>
                  <input
                    type="text"
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    required
                    disabled={operationLoading.edit || operationLoading.add}
                  />
                </div>

                <div className="mb-3 md:mb-4">
                  <label className="block text-gray-700 mb-1 md:mb-2 text-sm md:text-base" htmlFor="yearlevel">
                    Year Level
                  </label>
                  <select
                    id="yearlevel"
                    name="yearlevel"
                    value={formData.yearlevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    required
                    disabled={operationLoading.edit || operationLoading.add}
                  >
                    <option value="">Select Year Level</option>
                    <option value="1">First Year</option>
                    <option value="2">Second Year</option>
                    <option value="3">Third Year</option>
                    <option value="4">Fourth Year</option>
                    <option value="5">Fifth Year</option>
                  </select>
                </div>

                <div className="mb-3 md:mb-4">
                  <label className="block text-gray-700 mb-1 md:mb-2 text-sm md:text-base" htmlFor="phonenumber">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phonenumber"
                    name="phonenumber"
                    value={formData.phonenumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    required
                    disabled={operationLoading.edit || operationLoading.add}
                  />
                </div>

                <div className="mb-4 md:mb-6">
                  <label className="block text-gray-700 mb-1 md:mb-2 text-sm md:text-base" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    required
                    disabled={operationLoading.edit || operationLoading.add}
                  />
                </div>

                <div className="flex justify-end space-x-2 md:space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 md:px-4 py-1 md:py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-sm md:text-base"
                    disabled={operationLoading.edit || operationLoading.add}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 md:px-4 py-1 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center min-w-20 md:min-w-32 text-sm md:text-base"
                    disabled={operationLoading.edit || operationLoading.add}
                  >
                    {operationLoading.edit || operationLoading.add ? (
                      <>
                        <div className="h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 md:mr-2"></div>
                        {editingStudent ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      editingStudent ? "Update" : "Add"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Profile View Modal */}
      {isProfileModalOpen && viewingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Student Profile</h2>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 w-32 md:h-48 md:w-48 rounded-full flex items-center justify-center">
                    <div className="relative bg-white p-1 rounded-full shadow-xl ring-2 md:ring-4 ring-blue-50">
                      {viewingStudent.avatar_url ? (
                        <img
                          src={viewingStudent.avatar_url}
                          alt={viewingStudent.fullname}
                          className="h-28 w-28 md:h-40 md:w-40 rounded-full object-cover border-2 md:border-4 border-white"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(viewingStudent.fullname)}&background=3B82F6&color=ffffff&size=96`;
                          }}
                        />
                      ) : (
                        <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl md:text-3xl">
                          {viewingStudent.fullname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 h-4 w-4 md:h-5 md:w-5 bg-green-500 rounded-full border-2 md:border-[3px] border-white shadow-sm"></div>
                    </div>
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">{viewingStudent.fullname}</h3>
                  <p className="text-blue-600 font-semibold mb-3 md:mb-6 text-sm md:text-base">{viewingStudent.course}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                      <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-1">YEAR LEVEL</h4>
                      <p className="text-base md:text-lg font-semibold text-gray-800">Year {viewingStudent.yearlevel}</p>
                    </div>

                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                      <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-1">CONTACT</h4>
                      <p className="text-base md:text-lg font-semibold text-gray-800">{viewingStudent.phonenumber}</p>
                    </div>

                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                      <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-1">EMAIL</h4>
                      <p className="text-base md:text-lg font-semibold text-gray-800 truncate">{viewingStudent.email}</p>
                    </div>

                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:col-span-2">
                      <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-1">ABOUT</h4>
                      <p className="text-gray-700 text-sm md:text-base">
                        {viewingStudent.fullname} is a {viewingStudent.course} student in Year {viewingStudent.yearlevel}.
                        Currently enrolled and active in the university.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6 flex space-x-2 md:space-x-4">
                    {role === "Admin" && (
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(false);
                          handleEditClick(viewingStudent);
                        }}
                        className="px-3 md:px-4 py-1 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                      >
                        Edit Profile
                      </button>
                    )}

                    <button
                      onClick={() => setIsProfileModalOpen(false)}
                      className="px-3 md:px-4 py-1 md:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;