import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../helper/supabaseClient';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  Key,
  Calendar,
  Award,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  ArrowRight,
  Save,
  Lock,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminOnboarding = () => {
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
    admin_role: '',
    experience_years: '',
    highest_qualification: '',
    bio: '',
    access_level: '',
    certifications: '',
    previous_institution: '',
    admin_id: '',
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

        // Check if user already has a completed admin profile
        const { data: existingProfile, error: profileError } = await supabase
          .from('admin')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (existingProfile && existingProfile.onboarding_completed) {
          // If onboarding is already completed, redirect to dashboard
          navigate('/dashboard');
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
      const requiredFields = ['fullname', 'phone', 'admin_role', 'access_level', 'admin_id'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Update or insert admin profile
      const { error } = await supabase
        .from('admin')
        .upsert({
          id: user.id,
          email: user.email,
          fullname: formData.fullname,
          phone: formData.phone,
          address: formData.address,
          admin_role: formData.admin_role,
          experience_years: formData.experience_years,
          highest_qualification: formData.highest_qualification,
          bio: formData.bio,
          access_level: formData.access_level,
          certifications: formData.certifications,
          previous_institution: formData.previous_institution,
          admin_id: formData.admin_id,
          avatar_url: formData.avatar_url || user.user_metadata?.avatar_url,
          status: 'active',
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Show success message
      setMessage({
        text: 'Profile completed successfully! Redirecting to dashboard...',
        type: 'success'
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => navigate('/dashboard'), 2000);
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
          <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-white" />
              <h1 className="text-xl font-bold text-white">Administrator Onboarding</h1>
            </div>
            <div className="flex items-center space-x-1 text-red-100">
              <span className={`font-medium ${currentStep >= 1 ? 'text-white' : ''}`}>Basic Info</span>
              <ArrowRight className="h-4 w-4" />
              <span className={`font-medium ${currentStep >= 2 ? 'text-white' : ''}`}>Admin Details</span>
              <ArrowRight className="h-4 w-4" />
              <span className={`font-medium ${currentStep >= 3 ? 'text-white' : ''}`}>Review</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-red-500 h-1 transition-all duration-300 ease-in-out" 
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
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <User className="mr-2 h-5 w-5 text-red-500" />
                Basic Information
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
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
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
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
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="highest_qualification" className="block text-sm font-medium text-gray-700 mb-1">
                    Highest Qualification
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Award className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="highest_qualification"
                      name="highest_qualification"
                      value={formData.highest_qualification}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select qualification</option>
                      <option value="Bachelor's">Bachelor's Degree</option>
                      <option value="Master's">Master's Degree</option>
                      <option value="PhD">PhD</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="experience_years"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                      min="0"
                      max="50"
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Admin Details */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Settings className="mr-2 h-5 w-5 text-red-500" />
                Administrative Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="admin_role" className="block text-sm font-medium text-gray-700 mb-1">
                    Administrative Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="admin_role"
                    name="admin_role"
                    value={formData.admin_role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Select role</option>
                    <option value="Principal">Principal</option>
                    <option value="Vice Principal">Vice Principal</option>
                    <option value="System Administrator">System Administrator</option>
                    <option value="IT Administrator">IT Administrator</option>
                    <option value="Finance Administrator">Finance Administrator</option>
                    <option value="Admissions Officer">Admissions Officer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="admin_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Administrator ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="admin_id"
                      name="admin_id"
                      value={formData.admin_id}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g. ADM-12345"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="access_level" className="block text-sm font-medium text-gray-700 mb-1">
                    Access Level <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="access_level"
                      name="access_level"
                      value={formData.access_level}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Select access level</option>
                      <option value="Level 1">Level 1 (Basic)</option>
                      <option value="Level 2">Level 2 (Intermediate)</option>
                      <option value="Level 3">Level 3 (Advanced)</option>
                      <option value="Level 4">Level 4 (Full Access)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="previous_institution" className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Institution
                  </label>
                  <input
                    type="text"
                    id="previous_institution"
                    name="previous_institution"
                    value={formData.previous_institution}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
                    Certifications
                  </label>
                  <input
                    type="text"
                    id="certifications"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g. Educational Leadership, Administration"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="Tell us about your professional background and administrative experience..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
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
                <FileText className="mr-2 h-5 w-5 text-red-500" />
                Review Your Information
              </h2>

              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-700 text-sm">
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
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{formData.address || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Highest Qualification</p>
                    <p className="font-medium">{formData.highest_qualification || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Years of Experience</p>
                    <p className="font-medium">{formData.experience_years || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Administrative Information</h3>
                  
                  <div>
                    <p className="text-sm text-gray-500">Administrative Role</p>
                    <p className="font-medium">{formData.admin_role || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Administrator ID</p>
                    <p className="font-medium">{formData.admin_id || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Access Level</p>
                    <p className="font-medium">{formData.access_level || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Previous Institution</p>
                    <p className="font-medium">{formData.previous_institution || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Certifications</p>
                    <p className="font-medium">{formData.certifications || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Additional Information</h3>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Professional Bio</p>
                    <p className="font-medium">{formData.bio || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
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

export default AdminOnboarding;