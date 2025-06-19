import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaSearch, FaEdit, FaTrash, FaUserPlus, FaImage } from 'react-icons/fa';
import { userService } from '../../services/api';

const AdminUsers = () => {
  // State for users data
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student',
    department: '',
    status: 'active',
  });
  const [editingUser, setEditingUser] = useState(null);
  
  // Add loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Add state for departments
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Fetch all users data on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all types of users
        const [teachersResponse, studentsResponse, hodsResponse] = await Promise.all([
          userService.getAllTeachers(),
          userService.getAllStudents(),
          userService.getAllHODs()
        ]);
        
        // Format and combine all users
        const teachers = teachersResponse.teachersData.map(teacher => ({
          ...teacher,
          role: 'teacher'
        }));
        
        const students = studentsResponse.studentsData.map(student => ({
          ...student,
          role: 'student'
        }));
        
        const hods = hodsResponse.hodsData.map(hod => ({
          ...hod,
          role: 'hod'
        }));
        
        // Combine all users
        const allUsers = [...teachers, ...students, ...hods];
        setUsers(allUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllUsers();
  }, []);

  // Fetch departments when role filter changes to HOD
  useEffect(() => {
    const fetchDepartments = async () => {
      // Only fetch departments when HOD role is selected
      if (filterRole === 'hod') {
        try {
          setLoadingDepartments(true);
          const response = await userService.getAllDepartments();
          setDepartments(response.departments || []);
        } catch (err) {
          console.error('Failed to fetch departments:', err);
          setDepartments([]);
        } finally {
          setLoadingDepartments(false);
        }
      }
    };

    fetchDepartments();
  }, [filterRole]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.fullname && user.fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === '' || user.role === filterRole;
    const matchesStatus = filterStatus === '' || user.status === filterStatus;
    
    // Check department based on user role
    let matchesDepartment = filterDepartment === '';
    if (filterDepartment !== '') {
      if (user.role === 'hod') {
        matchesDepartment = user.department_expertise === filterDepartment;
      } else {
        matchesDepartment = user.department === filterDepartment;
      }
    }
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  // Handle adding a new user - this would need a backend endpoint
  const handleAddUser = () => {
    // This would need to be implemented with a proper API call
    toast.success('User added successfully!');
    setShowAddModal(false);
  };

  // Handle editing a user
  const handleEditUser = async () => {
    if (!editingUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Call the appropriate update function based on user role
      let response;
      
      if (editingUser.role === 'teacher') {
        response = await userService.updateTeacher(editingUser.id, editingUser);
      } else if (editingUser.role === 'student') {
        response = await userService.updateStudent(editingUser.id, editingUser);
      } else if (editingUser.role === 'hod') {
        response = await userService.updateHod(editingUser.id, editingUser);
      }
      
      // Update the local state with the updated user
      const updatedUsers = users.map(user => 
        user.id === editingUser.id ? { ...user, ...editingUser } : user
      );
      
      setUsers(updatedUsers);
      setEditingUser(null);
      toast.success('User updated successfully!');
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user. Please try again.');
      toast.error('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (id, role) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        setError(null);
        
        // Call the appropriate delete function based on user role
        let response;
        
        if (role === 'teacher') {
          response = await userService.deleteTeacher(id);
        } else if (role === 'student') {
          response = await userService.deleteStudent(id);
        } else if (role === 'hod') {
          response = await userService.deleteHod(id);
        }
        
        // Update the local state by removing the deleted user
        const updatedUsers = users.filter(user => user.id !== id);
        setUsers(updatedUsers);
        toast.success('User deleted successfully!');
      } catch (err) {
        console.error('Failed to delete user:', err);
        setError('Failed to delete user. Please try again.');
        toast.error('Failed to delete user. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('');
    setFilterStatus('');
    setFilterDepartment('');
  };

  // Handle role filter change
  const handleRoleFilterChange = (e) => {
    const role = e.target.value;
    setFilterRole(role);
    
    // Reset department filter if role is not HOD
    if (role !== 'hod') {
      setFilterDepartment('');
    }
  };

  // Render form fields based on user role
  const renderEditFormFields = () => {
    if (!editingUser) return null;

    switch (editingUser.role) {
      case 'hod':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.fullname || ''}
                onChange={(e) => setEditingUser({...editingUser, fullname: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.phonenumber || ''}
                onChange={(e) => setEditingUser({...editingUser, phonenumber: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.gender || ''}
                onChange={(e) => setEditingUser({...editingUser, gender: e.target.value})}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.highest_qualification || ''}
                onChange={(e) => setEditingUser({...editingUser, highest_qualification: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.experience || ''}
                onChange={(e) => setEditingUser({...editingUser, experience: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Expertise</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.department_expertise || ''}
                onChange={(e) => setEditingUser({...editingUser, department_expertise: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vision for Department</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
                value={editingUser.vision_department || ''}
                onChange={(e) => setEditingUser({...editingUser, vision_department: e.target.value})}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editingUser.avatar_url || ''}
                  onChange={(e) => setEditingUser({...editingUser, avatar_url: e.target.value})}
                />
                {editingUser.avatar_url && (
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={editingUser.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'student':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.fullname || ''}
                onChange={(e) => setEditingUser({...editingUser, fullname: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.gender || ''}
                onChange={(e) => setEditingUser({...editingUser, gender: e.target.value})}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.phonenumber || ''}
                onChange={(e) => setEditingUser({...editingUser, phonenumber: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class (STD)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.std || ''}
                onChange={(e) => setEditingUser({...editingUser, std: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.roll_no || ''}
                onChange={(e) => setEditingUser({...editingUser, roll_no: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.dob || ''}
                onChange={(e) => setEditingUser({...editingUser, dob: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent's Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.parents_name || ''}
                onChange={(e) => setEditingUser({...editingUser, parents_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent's Phone Number</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.parents_num || ''}
                onChange={(e) => setEditingUser({...editingUser, parents_num: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
                value={editingUser.address || ''}
                onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.previous_school || ''}
                onChange={(e) => setEditingUser({...editingUser, previous_school: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.stream || ''}
                onChange={(e) => setEditingUser({...editingUser, stream: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Count</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100"
                value={editingUser.message_count || 0}
                readOnly
              />
            </div>

           

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editingUser.avatar_url || ''}
                  onChange={(e) => setEditingUser({...editingUser, avatar_url: e.target.value})}
                />
                {editingUser.avatar_url && (
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={editingUser.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'teacher':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.fullname || ''}
                onChange={(e) => setEditingUser({...editingUser, fullname: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.phonenumber || ''}
                onChange={(e) => setEditingUser({...editingUser, phonenumber: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.gender || ''}
                onChange={(e) => setEditingUser({...editingUser, gender: e.target.value})}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.highest_qualification || ''}
                onChange={(e) => setEditingUser({...editingUser, highest_qualification: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.experience || ''}
                onChange={(e) => setEditingUser({...editingUser, experience: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Level</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.teaching_level || ''}
                onChange={(e) => setEditingUser({...editingUser, teaching_level: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Expertise</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.subject_expertise || ''}
                onChange={(e) => setEditingUser({...editingUser, subject_expertise: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
                value={editingUser.bio || ''}
                onChange={(e) => setEditingUser({...editingUser, bio: e.target.value})}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approved At</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100"
                value={editingUser.approved_at || ''}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100"
                value={editingUser.approved_by || ''}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Questions</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
                value={editingUser.security_questions || ''}
                onChange={(e) => setEditingUser({...editingUser, security_questions: e.target.value})}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approval Note</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows="2"
                value={editingUser.approval_note || ''}
                onChange={(e) => setEditingUser({...editingUser, approval_note: e.target.value})}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editingUser.avatar_url || ''}
                  onChange={(e) => setEditingUser({...editingUser, avatar_url: e.target.value})}
                />
                {editingUser.avatar_url && (
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={editingUser.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </>
        );

      default:
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.fullname || ''}
                onChange={(e) => setEditingUser({...editingUser, fullname: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
            </div>
            
          
          </>
        );
    }
  };

  // Render user details in table based on role
  const renderUserTableColumns = () => {
    return (
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department/Class</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
      </tr>
    );
  };

  // Render user row based on role
  const renderUserRow = (user) => {
    const getDepartmentOrClass = () => {
      if (user.role === 'student') {
        return `${user.std}th Standard` || 'N/A';
      } else if (user.role === 'teacher') {
        return user.subject_expertise || user.department || 'N/A';
      } else if (user.role === 'hod') {
        return user.department_expertise || user.department || 'N/A';
      }
      return user.department || 'N/A';
    };

    const getDetails = () => {
      if (user.role === 'student') {
        return user.roll_no ? `Roll No: ${user.roll_no}` : 'N/A';
      } else if (user.role === 'teacher') {
        return user.experience ? `Exp: ${user.experience} years` : 'N/A';
      } else if (user.role === 'hod') {
        return user.experience ? `Exp: ${user.experience} years` : 'N/A';
      }
      return 'N/A';
    };

    return (
      <tr key={user.id}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {user.avatar_url && (
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 mr-3">
                <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{user.email}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
            ${user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : ''}
            ${user.role === 'student' ? 'bg-green-100 text-green-800' : ''}
            ${user.role === 'hod' ? 'bg-yellow-100 text-yellow-800' : ''}
          `}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {getDepartmentOrClass()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          `}>
            {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'N/A'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {getDetails()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button 
              onClick={() => setEditingUser(user)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              <FaEdit />
            </button>
            <button 
              onClick={() => handleDeleteUser(user.id, user.role)}
              className="text-red-600 hover:text-red-900"
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">User Management</h1>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4 mx-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 mx-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-grow p-4 overflow-auto">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="hod">HOD</option>
              </select>
              
              {filterRole === 'hod' && (
                <select
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  disabled={loadingDepartments}
                >
                  <option value="">All Departments</option>
                  {loadingDepartments ? (
                    <option disabled>Loading...</option>
                  ) : departments.length > 0 ? (
                    departments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))
                  ) : (
                    <option disabled>No departments found</option>
                  )}
                </select>
              )}
              
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-200 text-black-700 rounded-lg hover:bg-gray-100 focus:outline-none"
              >
                Reset
              </button>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none"
            >
              <FaUserPlus />
              Add User
            </button>
          </div>
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-3">Loading...</span>
            </div>
          )}
          
          {/* Users table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {renderUserTableColumns()}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => renderUserRow(user))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found matching the criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination (simplified) */}
          {!loading && filteredUsers.length > 0 && (
            <div className="flex justify-between items-center mt-4 px-6 py-3 border-t">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1 border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="hod">HOD</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {newUser.role === 'hod' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    disabled={loadingDepartments}
                  >
                    <option value="">Select Department</option>
                    {loadingDepartments ? (
                      <option disabled>Loading...</option>
                    ) : departments.length > 0 ? (
                      departments.map((dept, index) => (
                        <option key={index} value={dept}>{dept}</option>
                      ))
                    ) : (
                      <option disabled>No departments found</option>
                    )}
                  </select>
                </div>
              )}
              
              {newUser.role !== 'hod' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  />
                </div>
              )}
              
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit {editingUser.role.charAt(0).toUpperCase() + editingUser.role.slice(1)}</h2>
            
            <div className="space-y-4">
              {renderEditFormFields()}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;