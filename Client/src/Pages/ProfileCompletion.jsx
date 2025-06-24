import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase, insertUserData } from '../services/supabaseClient';
import { motion } from 'framer-motion';

const ProfileCompletion = () => {
  const navigate = useNavigate();
  
  // State for role selection
  const [selectedRole, setSelectedRole] = useState(null);
  
  // State for security PIN (for HOD and Admin)
  const [securityPin, setSecurityPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setpinError] = useState('');
  
  // Common fields for all roles
  const [fullname, setFullname] = useState('');
  const [phonenumber, setPhonenumber] = useState(''); 
  const [gender, setGender] = useState('');
  
  // Student specific fields
  const [rollNo, setRollNo] = useState('');
  const [std, setStd] = useState('');
  const [dob, setDob] = useState('');
  const [parentsName, setParentsName] = useState('');
  const [parentsNum, setParentsNum] = useState('');
  const [address, setAddress] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [stream, setStream] = useState('');
  const [studentStatus, setStudentStatus] = useState('active'); // Default status for students
  
  // Teacher specific fields
  const [subjectExpertise, setSubjectExpertise] = useState('');
  const [experience, setExperience] = useState('');
  const [highestQualification, setHighestQualification] = useState('');
  const [teachingLevel, setTeachingLevel] = useState('');
  const [bio, setBio] = useState('');
  const [teacherStatus, setTeacherStatus] = useState('pending'); // Default status for teachers
  const [securityQuestions, setSecurityQuestions] = useState(null); // For security questions
  
  // HOD specific fields
  const [departmentExpertise, setDepartmentExpertise] = useState('');
  const [visionDepartment, setVisionDepartment] = useState('');
  const [hodStatus, setHodStatus] = useState('active'); // Default status for HOD
  
  // Admin specific fields
  const [adminAccessLevel, setAdminAccessLevel] = useState('');
  const [adminStatus, setAdminStatus] = useState('active'); // Default status for Admin
  const [adminSecurityQuestions, setAdminSecurityQuestions] = useState(null); // For security questions
  
  // Error and success messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data && data.user) {
        setUser(data.user);
        // Pre-fill name and email if available from OAuth
        if (data.user.user_metadata) {
          const { full_name, name } = data.user.user_metadata;
          setFullname(full_name || name || '');
        }
      } else {
        // Not authenticated, redirect to login
        navigate('/login');
      }
    };
    
    checkUser();
  }, [navigate]);
  
  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };
  
  // Verify security PIN for HOD and Admin
  const handleVerifyPin = async (e) => {
    e.preventDefault();
    
    if (!securityPin) {
      setpinError('Please enter the security PIN');
      return;
    }
    
    setLoading(true);
    
    try {
      // Get the correct security PIN from environment variables based on role
      const correctPin = selectedRole === 'hod' 
        ? import.meta.env.VITE_HOD_SECURITY_PIN 
        : import.meta.env.VITE_ADMIN_SECURITY_PIN;
      
      // Verify PIN
      const isPinValid = securityPin === correctPin;
      
      if (isPinValid) {
        setPinVerified(true);
        setpinError('');
      } else {
        setpinError('Invalid security PIN');
      }
      
      setLoading(false);
    } catch (err) {
      setpinError('Error verifying PIN. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!fullname || !phonenumber || !gender) {
      setError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Role-specific validation
    if (selectedRole === 'student') {
      if (!rollNo || !std || !dob || !parentsName || !parentsNum || !address || ((std === '11' || std === '12') && !stream)) {
        setError('Please fill in all required student fields');
        toast.error('Please fill in all required student fields');
        return;
      }
      // Stream is optional, so no validation needed
    } else if (selectedRole === 'teacher') {
      if (!subjectExpertise || !experience || !highestQualification || !teachingLevel) {
        setError('Please fill in all required teacher fields');
        toast.error('Please fill in all required teacher fields');
        return;
      }
    } else if (selectedRole === 'hod') {
      if (!departmentExpertise || !experience || !highestQualification || !visionDepartment) {
        setError('Please fill in all required HOD fields');
        toast.error('Please fill in all required HOD fields');
        return;
      }
    } else if (selectedRole === 'admin') {
      if (!adminAccessLevel) {
        setError('Please fill in all required admin fields');
        toast.error('Please fill in all required admin fields');
        return;
      }
    }
    
    // Clear any previous errors
    setError('');
    setLoading(true);
    
    try {
      if (!user) {
        const errorMsg = 'User not authenticated';
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      // Prepare user data based on role
      let userData = {
        id: user.id,
        fullname,
        phonenumber,
        gender,
      };
      
      // Add email field for tables other than teacher_approvals
      if (selectedRole !== 'teacher') {
        userData.email = user.email;
      }
      
      if (selectedRole === 'student') {
        userData = {
          ...userData,
          roll_no: rollNo,
          std,
          stream: stream, // Add stream to userData
          dob,
          parents_name: parentsName,
          parents_num: parentsNum,
          address,
          previous_school: previousSchool,
          stream,
          status: studentStatus,
          role: selectedRole,
        };
      } else if (selectedRole === 'teacher') {
        userData = {
          ...userData,
          email: user.email,
          subject_expertise: subjectExpertise,
          experience,
          highest_qualification: highestQualification,
          teaching_level: teachingLevel,
          bio,
          status: teacherStatus, // Teachers need HOD approval
          role: selectedRole,
          security_questions: securityQuestions,
        };
      } else if (selectedRole === 'hod') {
        userData = {
          ...userData,
          department_expertise: departmentExpertise,
          experience,
          highest_qualification: highestQualification,
          vision_department: visionDepartment,
          status: hodStatus,
          role: selectedRole,
        };
      } else if (selectedRole === 'admin') {
        userData = {
          ...userData,
          admin_access_level: adminAccessLevel,
          access_level: adminAccessLevel, // Set both fields as per schema
          status: adminStatus,
          role: selectedRole,
          security_questions: adminSecurityQuestions,
        };
      }
      
      // Insert user data into the appropriate table
      // For student, teacher, hod and admin, use the role name directly
      const tableName = selectedRole === 'student' ? 'student' : 
                       selectedRole === 'teacher' ? 'teacher' : 
                       selectedRole === 'hod' ? 'hod' : 
                       selectedRole === 'admin' ? 'admin' : selectedRole;
      const { error: insertError } = await insertUserData(tableName, userData);
      
      if (insertError) {
        const errorMsg = 'Error saving profile data: ' + insertError.message;
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      // Update user metadata with role
      await supabase.auth.updateUser({
        data: { role: selectedRole }
      });
      
      // Show success message
      const successMsg = selectedRole === 'teacher'
        ? 'Profile completed! Your account is pending approval from HOD.'
        : 'Profile completed! You can now access your dashboard.';
      
      setSuccess(successMsg);
      toast.success(successMsg);
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate(`/dashboard/${selectedRole}`);
      }, 3000);
      
    } catch (err) {
      const errorMsg = 'Profile completion failed: ' + (err.message || 'Please try again.');
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };
  
  // Render security PIN verification form for HOD and Admin
  const renderPinVerificationForm = () => {
    return (
      <form onSubmit={handleVerifyPin} className="space-y-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Security PIN is required for {selectedRole === 'hod' ? 'HOD' : 'Admin'} registration.
              </p>
            </div>
          </div>
        </div>
        
        {pinError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {pinError}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="securityPin" className="block text-gray-700 font-medium mb-2">
            Security PIN
          </label>
          <input
            type="password"
            id="securityPin"
            value={securityPin}
            onChange={(e) => setSecurityPin(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
            placeholder="Enter security PIN"
          />
        </div>
        
        <button
          type="submit"
          className="w-full btn bg-primary hover:bg-primary-dark text-white py-2"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify PIN'}
        </button>
        
        <button
          type="button"
          onClick={() => setSelectedRole(null)}
          className="w-full btn bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 mt-2"
        >
          Back to Role Selection
        </button>
      </form>
    );
  };
  
  // Render profile completion form based on selected role
  const renderProfileForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        {/* Common Fields for All Roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullname" className="block text-gray-700 font-medium mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="phonenumber" className="block text-gray-700 font-medium mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phonenumber"
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
              placeholder="Enter your phone number"
              required
            />
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-gray-700 font-medium mb-2">
              Gender *
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        {/* Role-Specific Fields */}
        {selectedRole === 'student' && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rollNo" className="block text-gray-700 font-medium mb-2">
                  Roll Number *
                </label>
                <input
                  type="number"
                  id="rollNo"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter roll number"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="std" className="block text-gray-700 font-medium mb-2">
                  Standard/Grade *
                </label>
                <select
                  id="std"
                  value={std}
                  onChange={(e) => {
                    setStd(e.target.value);
                    // Reset stream when grade changes
                    if (e.target.value !== '11' && e.target.value !== '12') {
                      setStream('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  required
                >
                  <option value="">Select Standard/Grade</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </div>
              
              {(std === '11' || std === '12') && (
                <div>
                  <label htmlFor="stream" className="block text-gray-700 font-medium mb-2">
                    Stream *
                  </label>
                  <select
                    id="stream"
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                    required
                  >
                    <option value="">Select Stream</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
              )}
              
              <div>
                <label htmlFor="dob" className="block text-gray-700 font-medium mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="parentsName" className="block text-gray-700 font-medium mb-2">
                  Parent's Name *
                </label>
                <input
                  type="text"
                  id="parentsName"
                  value={parentsName}
                  onChange={(e) => setParentsName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter parent's name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="parentsNum" className="block text-gray-700 font-medium mb-2">
                  Parent's Phone Number *
                </label>
                <input
                  type="tel"
                  id="parentsNum"
                  value={parentsNum}
                  onChange={(e) => setParentsNum(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter parent's phone number"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                  Address *
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter your address"
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="previousSchool" className="block text-gray-700 font-medium mb-2">
                  Previous School
                </label>
                <input
                  type="text"
                  id="previousSchool"
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter previous school name"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="stream" className="block text-gray-700 font-medium mb-2">
                  Stream
                </label>
                <select
                  id="stream"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                >
                  <option value="">Select Stream (Optional)</option>
                  <option value="science">Science</option>
                  <option value="commerce">Commerce</option>
                  <option value="arts">Arts</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {selectedRole === 'teacher' && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Teacher Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="subjectExpertise" className="block text-gray-700 font-medium mb-2">
                  Subject Expertise *
                </label>
                <input
                  type="text"
                  id="subjectExpertise"
                  value={subjectExpertise}
                  onChange={(e) => setSubjectExpertise(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter subject expertise"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="experience" className="block text-gray-700 font-medium mb-2">
                  Experience (years) *
                </label>
                <input
                  type="number"
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter years of experience"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="highestQualification" className="block text-gray-700 font-medium mb-2">
                  Highest Qualification *
                </label>
                <input
                  type="text"
                  id="highestQualification"
                  value={highestQualification}
                  onChange={(e) => setHighestQualification(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter highest qualification"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="teachingLevel" className="block text-gray-700 font-medium mb-2">
                  Teaching Level *
                </label>
                <select
                  id="teachingLevel"
                  value={teachingLevel}
                  onChange={(e) => setTeachingLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  required
                >
                  <option value="">Select Teaching Level</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="higher_secondary">Higher Secondary</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-gray-700 font-medium mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Tell us about yourself"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="securityQuestions" className="block text-gray-700 font-medium mb-2">
                  Security Questions
                </label>
                <textarea
                  id="securityQuestions"
                  value={securityQuestions || ''}
                  onChange={(e) => setSecurityQuestions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter security questions and answers (optional)"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        )}
        
        {selectedRole === 'hod' && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">HOD Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="departmentExpertise" className="block text-gray-700 font-medium mb-2">
                  Department Expertise *
                </label>
                <input
                  type="text"
                  id="departmentExpertise"
                  value={departmentExpertise}
                  onChange={(e) => setDepartmentExpertise(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter department expertise"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="experience" className="block text-gray-700 font-medium mb-2">
                  Experience (years) *
                </label>
                <input
                  type="number"
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter years of experience"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="highestQualification" className="block text-gray-700 font-medium mb-2">
                  Highest Qualification *
                </label>
                <input
                  type="text"
                  id="highestQualification"
                  value={highestQualification}
                  onChange={(e) => setHighestQualification(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter highest qualification"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="visionDepartment" className="block text-gray-700 font-medium mb-2">
                  Vision for Department *
                </label>
                <textarea
                  id="visionDepartment"
                  value={visionDepartment}
                  onChange={(e) => setVisionDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Describe your vision for the department"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
          </div>
        )}
        
        {selectedRole === 'admin' && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Admin Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="adminAccessLevel" className="block text-gray-700 font-medium mb-2">
                  Admin Access Level *
                </label>
                <select
                  id="adminAccessLevel"
                  value={adminAccessLevel}
                  onChange={(e) => setAdminAccessLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  required
                >
                  <option value="">Select Access Level</option>
                  <option value="level_1">Level 1 (Basic)</option>
                  <option value="level_2">Level 2 (Intermediate)</option>
                  <option value="level_3">Level 3 (Advanced)</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="adminSecurityQuestions" className="block text-gray-700 font-medium mb-2">
                  Security Questions
                </label>
                <textarea
                  id="adminSecurityQuestions"
                  value={adminSecurityQuestions || ''}
                  onChange={(e) => setAdminSecurityQuestions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  placeholder="Enter security questions and answers (optional)"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full btn bg-primary hover:bg-primary-dark text-white py-2"
            disabled={loading}
          >
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </button>
          
          <button
            type="button"
            onClick={() => setSelectedRole(null)}
            className="w-full btn bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 mt-4"
          >
            Back to Role Selection
          </button>
        </div>
      </form>
    );
  };
  
  // Render role selection with enhanced UI
  const renderRoleSelection = () => {
    // Define role cards with their details
    const roleCards = [
      {
        id: 'student',
        title: 'Student',
        description: 'Access learning materials, track progress, and communicate with teachers',
        icon: (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        ),
        color: 'from-blue-400 to-blue-600',
        hoverColor: 'from-blue-500 to-blue-700',
      },
      {
        id: 'teacher',
        title: 'Teacher',
        description: 'Create lesson plans, manage students, and track academic performance',
        icon: (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        ),
        color: 'from-green-400 to-green-600',
        hoverColor: 'from-green-500 to-green-700',
      },
      {
        id: 'hod',
        title: 'HOD',
        description: 'Oversee department activities, manage teachers, and analyze performance',
        icon: (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        ),
        color: 'from-purple-400 to-purple-600',
        hoverColor: 'from-purple-500 to-purple-700',
      },
      {
        id: 'admin',
        title: 'Admin',
        description: 'Manage the entire platform, users, and system settings',
        icon: (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        ),
        color: 'from-red-400 to-red-600',
        hoverColor: 'from-red-500 to-red-700',
      },
    ];

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Google account connected message */}
        <div className="flex items-center justify-center space-x-2 bg-gray-50 py-3 px-4 rounded-lg border border-gray-200">
          <svg className="w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-sm text-gray-600">Google account connected</span>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-800">Complete Your Profile</h3>
          <p className="text-gray-600">
            Please select your role to continue
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleCards.map((role, index) => (
            <div 
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br ${role.color} hover:${role.hoverColor}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="px-6 py-8 text-white flex flex-col items-center text-center h-full">
                <div className="mb-4 p-3 bg-white/20 rounded-full">
                  {role.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                <p className="text-white/80 text-sm">{role.description}</p>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10"></div>
              <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-white/10"></div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500 mt-6">
          <p>Select the role that best describes your position at the institution</p>
        </div>
      </div>
    );
  };
  
  // Determine what to render based on state
  const renderContent = () => {
    if (!selectedRole) {
      return renderRoleSelection();
    }
    
    // For HOD and Admin, require PIN verification first
    if ((selectedRole === 'hod' || selectedRole === 'admin') && !pinVerified) {
      return renderPinVerificationForm();
    }
    
    // Otherwise, show the profile completion form
    return renderProfileForm();
  };
  
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
