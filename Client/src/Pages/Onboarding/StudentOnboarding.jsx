import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../helper/supabaseClient';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Calendar,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  ArrowRight,
  Save,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const StudentOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: '',
    roll_no: '',
    grade: '',
    section: '',
    dob: '',
    parents_name: '',
    parents_phone: '',
    previous_school: '',
    interests: '',
    avatar_url: ''
  });

  // Check if user is authenticated and get their data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          // Redirect to login if not authenticated
          navigate('/login');
          return;
        }

        // Check if user already has a completed student profile
        const { data: existingProfile, error: profileError } = await supabase
          .from('student')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (existingProfile && existingProfile.onboarding_completed) {
          // If onboarding is already completed, redirect to student profile
          navigate('/student-profile');
          return;
        }

        // Set user data
        setUser(session.user);
        
        // Pre-fill form with any existing data
        if (existingProfile) {
          setFormData(prev => ({
            ...prev,
            ...existingProfile,
            fullname: existingProfile.fullname || session.user.user_metadata?.full_name || '',
            email: existingProfile.email || session.user.email,
            avatar_url: existingProfile.avatar_url || session.user.user_metadata?.avatar_url || ''
          }));
        } else {
          // Pre-fill with auth data if available
          setFormData(prev => ({
            ...prev,
            fullname: session.user.user_metadata?.full_name || '',
            email: session.user.email,
            avatar_url: session.user.user_metadata?.avatar_url || ''
          }));
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setMessage({
          text: 'Authentication error. Please sign in again.',
          type: 'error'
        });
        // Redirect to login after a short delay
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      // Validate required fields
      const requiredFields = ['fullname', 'phone', 'grade', 'roll_no', 'dob'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Update or insert student profile
      const { error } = await supabase
        .from('student')
        .upsert({
          id: user.id,
          email: user.email,
          fullname: formData.fullname,
          phone: formData.phone,
          address: formData.address,
          roll_no: formData.roll_no,
          grade: formData.grade,
          section: formData.section,
          dob: formData.dob,
          parents_name: formData.parents_name,
          parents_phone: formData.parents_phone,
          previous_school: formData.previous_school,
          interests: formData.interests,
          avatar_url: formData.avatar_url || user.user_metadata?.avatar_url,
          status: 'active',
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Show success message
      setMessage({
        text: 'Profile completed successfully! Redirecting to your profile...',
        type: 'success'
      });

      // Redirect to student profile after a short delay
      setTimeout(() => navigate('/student-profile'), 2000);
    } catch (error) {
      console.error('Submission error:', error);
      setMessage({
        text: error.message || 'An error occurred while saving your profile.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle step navigation
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-white" />
              <h1 className="text-xl font-bold text-white">Student Onboarding</h1>
            </div>
            <div className="flex items-center space-x-1 text-indigo-100">
              <span className={`font-medium ${currentStep >= 1 ? 'text-white' : ''}`}>Personal</span>
              <ArrowRight className="h-4 w-4" />
              <span className={`font-medium ${currentStep >= 2 ? 'text-white' : ''}`}>Academic</span>
              <ArrowRight className="h-4 w-4" />
              <span className={`font-medium ${currentStep >= 3 ? 'text-white' : ''}`}>Review</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-indigo-500 h-1 transition-all duration-300 ease-in-out" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>

        {/* Message display */}
        {message.text && (
          <div className={`p-4 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            <div className="flex items-center space-x-2">
              {message.type === 'error' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <p>{message.text}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <User className="mr-2 h-5 w-5 text-indigo-500" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-md font-medium text-gray-800 mb-3">Parent/Guardian Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="parents_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Guardian Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="parents_name"
                          name="parents_name"
                          value={formData.parents_name}
                          onChange={handleChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="parents_phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Guardian Phone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="parents_phone"
                          name="parents_phone"
                          value={formData.parents_phone}
                          onChange={handleChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Academic Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-indigo-500" />
                Academic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="roll_no" className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="roll_no"
                    name="roll_no"
                    value={formData.roll_no}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                    Grade/Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select grade</option>
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
                    <option value="6">Grade 6</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <select
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="previous_school" className="block text-sm font-medium text-gray-700 mb-1">
                    Previous School
                  </label>
                  <input
                    type="text"
                    id="previous_school"
                    name="previous_school"
                    value={formData.previous_school}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Interests & Extracurricular Activities
                  </label>
                  <textarea
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Tell us about your favorite subjects, hobbies, sports, or other activities..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center"
                >
                  Review <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-indigo-500" />
                Review Your Information
              </h2>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-indigo-700 text-sm">
                  Please review your information before submitting. You can go back to make changes if needed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                  
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{formData.fullname || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{formData.phone || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{formData.dob || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{formData.address || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Parent/Guardian Name</p>
                    <p className="font-medium">{formData.parents_name || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Parent/Guardian Phone</p>
                    <p className="font-medium">{formData.parents_phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Academic Information</h3>
                  
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="font-medium">{formData.roll_no || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Grade/Class</p>
                    <p className="font-medium">{formData.grade ? `Grade ${formData.grade}` : 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Section</p>
                    <p className="font-medium">{formData.section ? `Section ${formData.section}` : 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Previous School</p>
                    <p className="font-medium">{formData.previous_school || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Interests & Activities</p>
                    <p className="font-medium">{formData.interests || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Complete Profile
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentOnboarding;