import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

const HODTeachers = () => {
  // State for teachers data
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [processingApproval, setProcessingApproval] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState('');
  const [approvalError, setApprovalError] = useState('');

  // Fetch teachers data
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('teacher')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setTeachers(data || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments for filter dropdown
  const departments = ['all', ...new Set(teachers.map(teacher => teacher.department_expertise || 'Unknown'))];

  // Filter teachers based on search term and filters
  const filteredTeachers = teachers.filter(teacher => {
    // Search filter (name or email)
    const matchesSearch = 
      (teacher.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    // Department filter
    const matchesDepartment = 
      departmentFilter === 'all' || 
      teacher.department_expertise === departmentFilter;
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && teacher.status === 'pending') ||
      (statusFilter === 'approved' && teacher.status === 'approved') ||
      (statusFilter === 'rejected' && teacher.status === 'rejected');
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Open approval modal
  const handleApprovalClick = (teacher) => {
    setSelectedTeacher(teacher);
    setApprovalStatus('');
    setApprovalNote('');
    setApprovalError('');
    setApprovalSuccess('');
    setShowApprovalModal(true);
  };

  // Close approval modal
  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setSelectedTeacher(null);
  };

  // Handle teacher approval/rejection
  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    
    if (!approvalStatus) {
      setApprovalError('Please select an approval status');
      return;
    }
    
    try {
      setProcessingApproval(true);
      setApprovalError('');
      
      // Update teacher status in the database
      const { data, error } = await supabase
        .from('teacher')
        .update({ 
          status: approvalStatus,
          approval_note: approvalNote || null
        })
        .eq('id', selectedTeacher.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setTeachers(teachers.map(t => 
        t.id === selectedTeacher.id 
          ? { ...t, status: approvalStatus, approval_note: approvalNote || null }
          : t
      ));
      
      setApprovalSuccess(`Teacher has been ${approvalStatus === 'approved' ? 'approved' : 'rejected'} successfully.`);
      
      // Close modal after a short delay
      setTimeout(() => {
        handleCloseModal();
        fetchTeachers(); // Refresh the list
      }, 2000);
      
    } catch (err) {
      console.error('Error updating teacher status:', err);
      setApprovalError('Failed to update teacher status. Please try again.');
    } finally {
      setProcessingApproval(false);
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Teacher Management</h2>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        /* Teachers Table */
        <div className="overflow-x-auto">
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No teachers found matching your filters.
            </div>
          ) : (
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Teacher</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Department</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Qualification</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Experience</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTeachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {teacher.fullname ? teacher.fullname.charAt(0) : '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{teacher.fullname || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{teacher.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{teacher.department_expertise || 'Not specified'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{teacher.highest_qualification || 'Not specified'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{teacher.experience || 'Not specified'}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(teacher.status)}`}>
                        {teacher.status ? teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {teacher.status === 'pending' ? (
                        <button 
                          onClick={() => handleApprovalClick(teacher)}
                          className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                        >
                          Review
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleApprovalClick(teacher)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Approval Modal */}
      {showApprovalModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">
              {selectedTeacher.status === 'pending' 
                ? 'Teacher Approval' 
                : 'Teacher Details'}
            </h3>
            
            <div className="mb-4">
              <p><span className="font-semibold">Name:</span> {selectedTeacher.fullname}</p>
              <p><span className="font-semibold">Email:</span> {selectedTeacher.email}</p>
              <p><span className="font-semibold">Department:</span> {selectedTeacher.department_expertise || 'Not specified'}</p>
              <p><span className="font-semibold">Qualification:</span> {selectedTeacher.highest_qualification || 'Not specified'}</p>
              <p><span className="font-semibold">Experience:</span> {selectedTeacher.experience || 'Not specified'}</p>
              <p><span className="font-semibold">Current Status:</span> 
                <span className={`px-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedTeacher.status)}`}>
                  {selectedTeacher.status ? selectedTeacher.status.charAt(0).toUpperCase() + selectedTeacher.status.slice(1) : 'Unknown'}
                </span>
              </p>
              {selectedTeacher.approval_note && (
                <p><span className="font-semibold">Note:</span> {selectedTeacher.approval_note}</p>
              )}
            </div>
            
            {selectedTeacher.status === 'pending' ? (
              <form onSubmit={handleApprovalSubmit}>
                {/* Approval Status */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Approval Decision</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="approvalStatus" 
                        value="approved" 
                        checked={approvalStatus === 'approved'}
                        onChange={() => setApprovalStatus('approved')}
                        className="form-radio h-5 w-5 text-primary"
                      />
                      <span className="ml-2 text-gray-700">Approve</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="approvalStatus" 
                        value="rejected" 
                        checked={approvalStatus === 'rejected'}
                        onChange={() => setApprovalStatus('rejected')}
                        className="form-radio h-5 w-5 text-red-600"
                      />
                      <span className="ml-2 text-gray-700">Reject</span>
                    </label>
                  </div>
                </div>
                
                {/* Note */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Note (Optional)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="3"
                    placeholder="Add a note about your decision"
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                  ></textarea>
                </div>
                
                {/* Error Message */}
                {approvalError && (
                  <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
                    <p>{approvalError}</p>
                  </div>
                )}
                
                {/* Success Message */}
                {approvalSuccess && (
                  <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 text-sm">
                    <p>{approvalSuccess}</p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={processingApproval}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                    disabled={processingApproval}
                  >
                    {processingApproval ? 'Processing...' : 'Submit'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HODTeachers;