import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { signUp, insertUserData, verifySecurityPin, checkEmailExists } from '../services/supabaseClient';

const Signup = () => {
  const navigate = useNavigate();
  
  // State for role selection
  const [selectedRole, setSelectedRole] = useState(null);
  
  // State for security PIN (for HOD and Admin)
  const [securityPin, setSecurityPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setpinError] = useState('');
  
  // Common fields for all roles
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [gender, setGender] = useState('');
  
  // Student specific fields
  const [rollNo, setRollNo] = useState('');
  const [std, setStd] = useState('');
  const [stream, setStream] = useState(''); // Add stream state
  const [dob, setDob] = useState('');
  const [parentsName, setParentsName] = useState('');
  const [parentsNum, setParentsNum] = useState('');
  const [address, setAddress] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  
  // Teacher specific fields
  const [subjectExpertise, setSubjectExpertise] = useState('');
  const [experience, setExperience] = useState('');
  const [highestQualification, setHighestQualification] = useState('');
  const [teachingLevel, setTeachingLevel] = useState('');
  const [bio, setBio] = useState('');
  
  // HOD specific fields
  const [departmentExpertise, setDepartmentExpertise] = useState('');
  const [visionDepartment, setVisionDepartment] = useState('');
  
  // Admin specific fields
  const [adminAccessLevel, setAdminAccessLevel] = useState('');
  
  // Error and success messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  
  // Animation effect
  useEffect(() => {
    setAnimateForm(true);
  }, []);
  
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
    
    try {
      // Verify PIN with Supabase RPC function
      const { data, error } = await verifySecurityPin(selectedRole, securityPin);
      
      if (error) {
        setpinError('Error verifying PIN: ' + error.message);
        return;
      }
      
      if (data && data.verified) {
        setPinVerified(true);
        setpinError('');
      } else {
        setpinError('Invalid security PIN');
      }
    } catch (err) {
      setpinError('Error verifying PIN. Please try again.');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set loading state to true
    setLoading(true);
    
    // Basic validation
    if (!fullname || !email || !password || !confirmPassword || !phonenumber || !gender) {
      setError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // Role-specific validation
    if (selectedRole === 'student') {
      if (!rollNo || !std || !dob || !parentsName || !parentsNum || !address) {
        setError('Please fill in all required student fields');
        toast.error('Please fill in all required student fields');
        setLoading(false);
        return;
      }
    } else if (selectedRole === 'teacher') {
      if (!subjectExpertise || !experience || !highestQualification || !teachingLevel) {
        setError('Please fill in all required teacher fields');
        toast.error('Please fill in all required teacher fields');
        setLoading(false);
        return;
      }
    } else if (selectedRole === 'hod') {
      if (!departmentExpertise || !experience || !highestQualification || !visionDepartment) {
        setError('Please fill in all required HOD fields');
        toast.error('Please fill in all required HOD fields');
        setLoading(false);
        return;
      }
    } else if (selectedRole === 'admin') {
      if (!adminAccessLevel) {
        setError('Please fill in all required admin fields');
        toast.error('Please fill in all required admin fields');
        setLoading(false);
        return;
      }
    }
    
    // Clear any previous errors
    setError('');
    
    try {
      // Check if email already exists in any role table
      const { exists, role } = await checkEmailExists(email);
      
      if (exists) {
        const errorMsg = `Your email is already registered with the ${role} role. You can only sign up with one email in one role.`;
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await signUp(email, password);
      
      if (authError) {
        const errorMsg = 'Registration failed: ' + authError.message;
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      // Get the user ID from the auth response
      const userId = authData.user.id;
      
      // Prepare user data based on role
      let userData = {
        id: userId,
        fullname,
        email,
        phonenumber,
        gender,
        role: selectedRole === 'hod' ? 'HOD' : selectedRole, // Store 'HOD' instead of 'hod' for HOD role
      };
      
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
        };

      } else if (selectedRole === 'teacher') {
        userData = {
          ...userData,
          subject_expertise: subjectExpertise,
          experience,
          highest_qualification: highestQualification,
          teaching_level: teachingLevel,
          bio,
          status: 'pending', // Teachers need HOD approval
        };
      } else if (selectedRole === 'hod') {
        userData = {
          ...userData,
          department_expertise: departmentExpertise,
          experience,
          highest_qualification: highestQualification,
          vision_department: visionDepartment,
        };
      } else if (selectedRole === 'admin') {
        userData = {
          ...userData,
          admin_access_level: adminAccessLevel,
        };
      }
      
      // Insert user data into the appropriate table based on role
      let tableName;
      if (selectedRole === 'student') {
        tableName = 'student';
      } else if (selectedRole === 'teacher') {
        tableName = 'teacher';
      } else if (selectedRole === 'hod') {
        tableName = 'hod';
      } else if (selectedRole === 'admin') {
        tableName = 'admin';
      }
      
      const { data: insertData, error: insertError } = await insertUserData(tableName, userData);
      
      if (insertError) {
        console.error('Insert error details:', insertError);
        // Fix the error message to properly display the error details
        // The current implementation shows an empty object when insertError.message is undefined
        const errorMsg = 'Error saving profile data: ' + (insertError.message || JSON.stringify(insertError.details || insertError));
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      
      // Show success message
      const successMsg = selectedRole === 'teacher'
        ? 'Registration successful! Your account is pending approval from HOD.'
        : 'Registration successful! Please check your email to verify your account.';
      
      setSuccess(successMsg);
      toast.success(successMsg);
      
      // Redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      const errorMsg = 'Registration failed: ' + (err.message || 'Please try again.');
      setError(errorMsg);
      toast.error(errorMsg);
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
        >
          Verify PIN
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
  
  // Render registration form based on selected role
  const renderRegistrationForm = () => {
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
              placeholder="Enter your full name"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <div className="relative">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
                placeholder="Enter your email"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password *
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
                placeholder="Create a password"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
                placeholder="Confirm your password"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <label htmlFor="phonenumber" className="block text-gray-700 font-medium mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phonenumber"
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
                placeholder="Enter your phone number"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-gray-700 font-medium mb-2">
                Gender *
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        {selectedRole === 'student' && (
          <div className="mt-8 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="rollNumber" className="block text-gray-700 font-medium mb-2">
                  Roll Number *
                </label>
                <input
                  type="number"
                  id="rollNumber"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
              
              {/* Show stream selection only for 11th and 12th grade */}
              {(std === '11' || std === '12') && (
                <div>
                  <label htmlFor="stream" className="block text-gray-700 font-medium mb-2">
                    Stream *
                  </label>
                  <select
                    id="stream"
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
                  placeholder="Enter previous school name"
                />
              </div>
            </div>
          </div>
        )}
        
        {selectedRole === 'teacher' && (
          <div className="mt-8 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Teacher Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="subjectExpertise" className="block text-gray-700 font-medium mb-2">
                  Subject Expertise *
                </label>
                <input
                  type="text"
                  id="subjectExpertise"
                  value={subjectExpertise}
                  onChange={(e) => setSubjectExpertise(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
                  placeholder="Tell us about yourself"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        )}
        
        {selectedRole === 'hod' && (
          <div className="mt-8 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">HOD Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="departmentExpertise" className="block text-gray-700 font-medium mb-2">
                  Department Expertise *
                </label>
                <input
                  type="text"
                  id="departmentExpertise"
                  value={departmentExpertise}
                  onChange={(e) => setDepartmentExpertise(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
                  placeholder="Describe your vision for the department"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
          </div>
        )}
        
        {selectedRole === 'admin' && (
          <div className="mt-8 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Admin Information</h3>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label htmlFor="adminAccessLevel" className="block text-gray-700 font-medium mb-2">
                  Admin Access Level *
                </label>
                <select
                  id="adminAccessLevel"
                  value={adminAccessLevel}
                  onChange={(e) => setAdminAccessLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm text-black"
                  required
                >
                  <option value="">Select Access Level</option>
                  <option value="level_1">Level 1 (Basic)</option>
                  <option value="level_2">Level 2 (Intermediate)</option>
                  <option value="level_3">Level 3 (Advanced)</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 flex flex-col space-y-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : 'Register'}
          </button>
          
          <button
            type="button"
            onClick={() => setSelectedRole(null)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Role Selection
          </button>
        </div>
      </form>
    );
  };
  
  // Render role selection
  const renderRoleSelection = () => {
    return (
      <div className="space-y-6 transform transition-all duration-500 ease-in-out scale-100 opacity-100">
        <p className="text-gray-600 mb-4 text-center">
          Please select your role to continue registration
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleRoleSelect('student')}
            className="group bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2 border-blue-500 text-blue-600 hover:text-blue-700 font-medium py-6 px-4 rounded-xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition-all duration-300">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <span className="text-lg font-semibold">Student</span>
              <span className="text-sm text-gray-500 mt-1">Join as a student</span>
            </div>
          </button>
          
          <button
            onClick={() => handleRoleSelect('teacher')}
            className="group bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 border-2 border-green-500 text-green-600 hover:text-green-700 font-medium py-6 px-4 rounded-xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="bg-green-100 p-3 rounded-full mb-3 group-hover:bg-green-200 transition-all duration-300">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <span className="text-lg font-semibold">Teacher</span>
              <span className="text-sm text-gray-500 mt-1">Join as a teacher</span>
            </div>
          </button>
          
          <button
            onClick={() => handleRoleSelect('hod')}
            className="group bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 border-2 border-purple-500 text-purple-600 hover:text-purple-700 font-medium py-6 px-4 rounded-xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="bg-purple-100 p-3 rounded-full mb-3 group-hover:bg-purple-200 transition-all duration-300">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <span className="text-lg font-semibold">HOD</span>
              <span className="text-sm text-gray-500 mt-1">Join as a head of department</span>
            </div>
          </button>
          
          <button
            onClick={() => handleRoleSelect('admin')}
            className="group bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 border-2 border-red-500 text-red-600 hover:text-red-700 font-medium py-6 px-4 rounded-xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="bg-red-100 p-3 rounded-full mb-3 group-hover:bg-red-200 transition-all duration-300">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <span className="text-lg font-semibold">Admin</span>
              <span className="text-sm text-gray-500 mt-1">Join as an administrator</span>
            </div>
          </button>
        </div>
      </div>
    );
  };
  
  // Determine what to render based on state
  const renderContent = () => {
    if (!selectedRole) {
      return renderRoleSelection();
    }
    
    if ((selectedRole === 'hod' || selectedRole === 'admin') && !pinVerified) {
      return renderPinVerificationForm();
    }
    
    return renderRegistrationForm();
  };
  
  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-200 opacity-20 rounded-full w-96 h-96 -mt-24 -mr-24 filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-purple-200 opacity-20 rounded-full w-96 h-96 -mb-24 -ml-24 filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 left-1/4 bg-gradient-to-tr from-pink-200 opacity-20 rounded-full w-72 h-72 filter blur-xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-2xl mx-auto bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 ease-in-out ${animateForm ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-6">
            <div className="flex flex-col items-center justify-center">
              <img src="/src/assets/logo2.png" alt="EduNex Logo" className="h-16 w-auto mb-4" />
              <h2 className="text-2xl font-bold text-center text-white font-display">
                {!selectedRole ? 'Sign Up for ' : `Register as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} on `}
                <span className="text-bright-green">EduNex</span>
              </h2>
            </div>
          </div>
          
          <div className="p-8">
            {renderContent()}
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-all duration-300">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;