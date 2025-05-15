import { supabase } from '../helper/supabaseClient';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Upload, 
  Phone, 
  Book, 
  Calendar, 
  Briefcase,
  Award, 
  Home, 
  Lock, 
  Mail
} from 'react-feather';
import { GraduationCap, School } from 'lucide-react'; // Moved GraduationCap here
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';

const TeacherProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tempProfileImage, setTempProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phonenumber: "",
    role: "teacher",
    gender: "",
    bio: "",
    subject_expertise: "",
    experience: "",
    highest_qualification: "",
    teaching_level: "",
  });
  const [tempFormData, setTempFormData] = useState({});
  
  // For scroll animations
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('teacher')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          if (data) {
            setFormData({
              fullname: data.fullname || '',
              email: data.email || '',
              phonenumber: data.phonenumber || '',
              role: data.role || 'teacher',
              gender: data.gender || '',
              bio: data.bio || '',
              subject_expertise: data.subject_expertise || '',
              experience: data.experience || '',
              highest_qualification: data.highest_qualification || '',
              teaching_level: data.teaching_level || '',
            });
            setProfileImage(data.avatar_url);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditStart = () => {
    setTempFormData({...formData});
    setTempProfileImage(profileImage);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempProfileImage(null);
  };

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
  
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }
  
      // Store the file temporarily
      const objectUrl = URL.createObjectURL(file);
      setTempProfileImage(objectUrl);
  
    } catch (error) {
      console.error('Error uploading image:', error.message);
      alert('Error selecting image. Please try again.');
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');
  
      // Prepare the data to be saved
      const dataToSave = {
        ...tempFormData,
        // Convert empty strings to null for numeric fields
        experience: tempFormData.experience === '' ? null : Number(tempFormData.experience),
        // Add other numeric fields here if needed
      };
  
      let newProfileImage = profileImage;
  
      // Only process image if a new one was selected
      if (tempProfileImage && tempProfileImage !== profileImage) {
        const fileInput = document.querySelector('input[type="file"]');
        const file = fileInput?.files?.[0];
        
        if (file) {
          // 1. Delete old image if exists
          if (profileImage && profileImage.includes('schoolimages')) {
            try {
              const oldImagePath = profileImage.split('schoolimages/')[1];
              if (oldImagePath) {
                const { error: deleteError } = await supabase.storage
                  .from('schoolimages')
                  .remove([oldImagePath]);
                
                if (deleteError) console.warn('Error deleting old image:', deleteError);
              }
            } catch (deleteError) {
              console.error('Error deleting old image:', deleteError);
            }
          }
  
          // 2. Upload new image
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `schoolimages/${fileName}`;
  
          const { error: uploadError } = await supabase.storage
            .from('schoolimages')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type
            });
  
          if (uploadError) throw uploadError;
  
          // 3. Get public URL
          const { data: { publicUrl } } = await supabase.storage
            .from('schoolimages')
            .getPublicUrl(filePath);
  
          newProfileImage = publicUrl;
        }
      }
  
      // 4. Update profile in database
      const { error: updateError } = await supabase
        .from('teacher')
        .update({ 
          ...dataToSave,
          avatar_url: newProfileImage 
        })
        .eq('id', user.id);
  
      if (updateError) throw updateError;
  
      // 5. Update state
      setFormData(prev => ({ ...prev, ...dataToSave }));
      setProfileImage(newProfileImage);
      setIsEditing(false);
      setTempProfileImage(null);
  
    } catch (error) {
      console.error('Error updating profile:', error.message);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-pulse flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="h-32 w-32 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full mb-4"
          ></motion.div>
          <div className="h-6 w-64 bg-gradient-to-r from-indigo-200 to-purple-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gradient-to-r from-indigo-200 to-purple-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Floating bubbles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.3 + 0.1
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="absolute rounded-full bg-indigo-200"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(20px)'
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white/20 transition-all duration-300 hover:shadow-2xl"
        >
          {/* Header with gradient background */}
          <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isEditing ? handleCancelEdit : handleEditStart}
              className={`absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl ${
                isEditing ? 'bg-red-500 hover:bg-red-600' : 'bg-white text-indigo-600 hover:bg-indigo-50'
              } transition-all shadow-lg font-medium text-sm sm:text-base`}
            >
              {isEditing ? (
                <>
                  <X size={16} className="sm:w-4 sm:h-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Edit3 size={16} className="sm:w-4 sm:h-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Profile content */}
          <div className="px-4 sm:px-6 md:px-8 pb-8 md:pb-10">
            {/* Profile picture and basic info */}
            <div className="flex flex-col md:flex-row items-center md:items-start -mt-16 sm:-mt-20 md:-mt-24">
              <motion.div 
                whileHover={isEditing ? { scale: 1.05 } : {}}
                className="relative group"
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-r from-indigo-100 to-purple-100">
                  <img
                    src={isEditing && tempProfileImage ? tempProfileImage : profileImage || 'https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png';
                    }}
                  />
                </div>
                {isEditing && (
                  <motion.label 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  >
                    <div className="text-white text-center p-2">
                      <Upload size={20} className="mx-auto" />
                      <span className="text-xs mt-1 block">Change Photo</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </motion.label>
                )}
              </motion.div>

              <div className="mt-4 md:mt-0 md:ml-6 lg:ml-8 text-center md:text-left w-full md:w-auto relative h-40 sm:h-48 md:h-32">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-3xl font-bold text-gray-900 sm:text-gray-900 md:text-gray-100 absolute top-0 left-0 right-0 md:left-auto md:right-auto md:relative md:top-auto"
                >
                  {formData.fullname || 'Teacher Name'}
                </motion.h1>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center px-3 py-1 bg-indigo-900 bg-opacity-10 rounded-full text-indigo-300 text-xs sm:text-sm font-medium absolute top-10 sm:top-12 md:top-5 left-0 right-0 md:left-auto md:right-auto md:relative"
                >
                  <Book size={14} className="mr-1 sm:mr-2" />
                  {formData.subject_expertise || 'Subject Teacher'}
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                  className="inline-flex items-center px-3 py-1 bg-indigo-900 bg-opacity-10 rounded-full text-indigo-300 text-xs sm:text-sm font-medium absolute top-20 sm:top-24 md:top-12 left-0 right-0 md:left-auto md:right-auto md:relative mt-2"
                >
                  <Award size={14} className="mr-1 sm:mr-2" />
                  {formData.highest_qualification || 'Qualification not specified'}
                </motion.div>
              </div>
            </div>

            {/* Profile sections */}
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div 
                  key="view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
                >
                  {/* Professional Information */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
                  >
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200 flex items-center gap-2">
                      <Briefcase size={18} className="text-indigo-500" />
                      <span>Professional Information</span>
                    </h2>
                    <div className="space-y-3 sm:space-y-4">
                      <ProfileInfoItem 
                        icon={<Book size={16} className="text-indigo-500" />}
                        label="Subject Expertise" 
                        value={formData.subject_expertise || 'Not specified'} 
                      />
                      <ProfileInfoItem 
                        icon={<Briefcase size={16} className="text-indigo-500" />}
                        label="Experience" 
                        value={formData.experience ? `${formData.experience} years` : 'Not specified'} 
                      />
                      <ProfileInfoItem 
                        icon={<GraduationCap size={16} className="text-indigo-500" />}
                        label="Highest Qualification" 
                        value={formData.highest_qualification || 'Not specified'} 
                      />
                      <ProfileInfoItem 
                        icon={<School size={16} className="text-indigo-500" />}
                        label="Teaching Level" 
                        value={formData.teaching_level || 'Not specified'} 
                      />
                    </div>
                  </motion.div>

                  {/* Personal Information */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
                  >
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200 flex items-center gap-2">
                      <User size={18} className="text-indigo-500" />
                      <span>Personal Information</span>
                    </h2>
                    <div className="space-y-3 sm:space-y-4">
                      <ProfileInfoItem 
                        icon={<User size={16} className="text-indigo-500" />}
                        label="Gender" 
                        value={formData.gender || 'Not specified'} 
                      />
                      <ProfileInfoItem 
                        icon={<Mail size={16} className="text-indigo-500" />}
                        label="Email" 
                        value={formData.email || 'Not specified'} 
                      />
                      <ProfileInfoItem 
                        icon={<Phone size={16} className="text-indigo-500" />}
                        label="Phone" 
                        value={formData.phonenumber || 'Not specified'} 
                      />
                    </div>
                  </motion.div>

                  {/* Bio */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md md:col-span-2"
                  >
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200 flex items-center gap-2">
                      <User size={18} className="text-indigo-500" />
                      <span>About Me</span>
                    </h2>
                    <div className="text-gray-700">
                      {formData.bio || 'No bio provided yet.'}
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.form 
                  key="edit"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit} 
                  className="mt-8 md:mt-12 space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <InputField
                      label="Full Name"
                      name="fullname"
                      value={tempFormData.fullname || ''}
                      onChange={handleInputChange}
                      icon={<User size={16} className="text-indigo-500" />}
                      required
                    />
                    <InputField
                      label="Email"
                      name="email"
                      value={tempFormData.email || ''}
                      onChange={handleInputChange}
                      icon={<Mail size={16} className="text-indigo-500" />}
                      type="email"
                      required
                    />
                    <InputField
                      label="Phone Number"
                      name="phonenumber"
                      value={tempFormData.phonenumber || ''}
                      onChange={handleInputChange}
                      icon={<Phone size={16} className="text-indigo-500" />}
                      type="tel"
                    />
                    <SelectField
                      label="Gender"
                      name="gender"
                      value={tempFormData.gender || ''}
                      onChange={handleInputChange}
                      options={[
                        { value: '', label: 'Select Gender' },
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Other', label: 'Other' },
                        { value: 'Prefer not to say', label: 'Prefer not to say' },
                      ]}
                      icon={<User size={16} className="text-indigo-500" />}
                    />
                    <InputField
                      label="Subject Expertise"
                      name="subject_expertise"
                      value={tempFormData.subject_expertise || ''}
                      onChange={handleInputChange}
                      icon={<Book size={16} className="text-indigo-500" />}
                    />
                    {/* <InputField
                      label="Experience (years)"
                      name="experience"
                      type="number"
                      value={tempFormData.experience || ''}
                      onChange={handleInputChange}
                      icon={<Briefcase size={16} className="text-indigo-500" />}
                    /> */}
                    <InputField
                      label="Highest Qualification"
                      name="highest_qualification"
                      value={tempFormData.highest_qualification || ''}
                      onChange={handleInputChange}
                      icon={<GraduationCap size={16} className="text-indigo-500" />}
                    />
                    <SelectField
                      label="Teaching Level"
                      name="teaching_level"
                      value={tempFormData.teaching_level || ''}
                      onChange={handleInputChange}
                      options={[
                        { value: '', label: 'Select Teaching Level' },
                        { value: 'Primary', label: 'Primary' },
                        { value: 'Secondary', label: 'Secondary' },
                        { value: 'Higher Secondary', label: 'Higher Secondary' },
                        { value: 'College', label: 'College' },
                      ]}
                      icon={<School size={16} className="text-indigo-500" />}
                    />
                  </div>

                  <div>
                    <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <User size={16} className="text-indigo-500" />
                      <span>Bio</span>
                    </label>
                    <textarea
                      name="bio"
                      value={tempFormData.bio || ''}
                      onChange={handleInputChange}
                      rows="4"
                      className="block w-full rounded-xl bg-gray-50 border border-gray-300 text-gray-700 shadow-sm text-base sm:text-lg p-3 sm:p-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all placeholder-gray-400"
                      placeholder="Tell us about yourself, your teaching philosophy, etc..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <InputField
                      label="Password"
                      name="password"
                      type="password"
                      value={tempFormData.password || ''}
                      onChange={handleInputChange}
                      icon={<Lock size={16} className="text-indigo-500" />}
                      placeholder="Leave blank to keep current"
                    />
                    <InputField
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={tempFormData.confirmPassword || ''}
                      onChange={handleInputChange}
                      icon={<Lock size={16} className="text-indigo-500" />}
                      placeholder="Leave blank to keep current"
                    />
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.05 }}
                      whileTap={{ scale: isLoading ? 1 : 0.95 }}
                      className="flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl text-base sm:text-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <motion.span
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          Saving...
                        </motion.span>
                      ) : (
                        <>
                          <Save size={16} className="sm:w-4 sm:h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Reusable components
const ProfileInfoItem = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 mr-3 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-xs sm:text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm sm:text-base text-gray-800">{value}</p>
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, icon, type = "text", placeholder = "", required = false }) => (
  <div>
    <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2 flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={(e) => {
        if (type === "number") {
          // Only allow numbers or empty string
          const val = e.target.value === '' ? '' : Number(e.target.value);
          if (!isNaN(val) || e.target.value === '') {
            onChange({
              ...e,
              target: {
                ...e.target,
                value: e.target.value === '' ? '' : val.toString()
              }
            });
          }
        } else {
          onChange(e);
        }
      }}
      required={required}
      placeholder={placeholder}
      className="block w-full rounded-xl bg-gray-50 border border-gray-300 text-gray-700 shadow-sm text-base sm:text-lg p-3 sm:p-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, icon }) => (
  <div>
    <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2 flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="block w-full rounded-xl bg-gray-50 border border-gray-300 text-gray-700 shadow-sm text-base sm:text-lg p-3 sm:p-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default TeacherProfile;