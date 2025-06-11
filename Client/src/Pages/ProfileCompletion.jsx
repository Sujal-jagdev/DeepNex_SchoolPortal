import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, ChevronDown, Stethoscope, Building2, Users, GraduationCap, UserCog } from "lucide-react";
import { supabase } from "../helper/supabaseClient";
import { validateForm, addTeacherApproval, verifyRegistrationPin, signOutUser, getRedirectPathForRole } from "../helper/authUtils";

const ProfileCompletion = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    gender: "male",
    role: "Student",
    roll_no: "",
    std: "",
    stream: "",
    dob: "",
    parents_name: "",
    parents_num: "",
    address: "",
    previous_school: "",
    subject_expertise: "",
    experience: "",
    highest_qualification: "",
    department_expertise: "",
    vision_department: "",
    teaching_level: "",
    admin_access_level: "",
    bio: ""
  });
  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [user, setUser] = useState(null);
  const [showStreamField, setShowStreamField] = useState(false);
  const navigate = useNavigate();

  // Standard options (1st to 12th)
  const standardOptions = [
    "1st Standard",
    "2nd Standard",
    "3rd Standard",
    "4th Standard",
    "5th Standard",
    "6th Standard",
    "7th Standard",
    "8th Standard",
    "9th Standard",
    "10th Standard",
    "11th Standard",
    "12th Standard",
  ];

  // Stream options for higher secondary (11th-12th)
  const streamOptions = [
    "Science",
    "Commerce",
    "Arts/Humanities",
    "Vocational",
  ];

  // Teacher qualification options
  const qualificationOptions = [
    "B.Ed (Bachelor of Education)",
    "M.Ed (Master of Education)",
    "D.El.Ed (Diploma in Elementary Education)",
    "NTT (Nursery Teacher Training)",
    "Montessori Training",
    "Other Teaching Certification",
  ];

  // Teacher teaching level options
  const teachingLevelOptions = [
    "Pre-Primary (Nursery, KG)",
    "Primary (1st-5th)",
    "Middle School (6th-8th)",
    "Secondary (9th-10th)",
    "Higher Secondary (11th-12th)",
  ];

  // Admin access levels
  const adminAccessLevels = [
    "Principal",
    "Vice Principal",
    "Administrative Head",
    "Exam Coordinator",
    "Admission Incharge",
    "Accountant",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Show stream field only if standard is 11th or 12th
    if (name === "std") {
      setShowStreamField(
        value === "11th Standard" || value === "12th Standard"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Validate form data
      if (!validateForm(formData, (errorMsg) => setMessage({ text: errorMsg, type: "error" }))) {
        setLoading(false);
        return;
      }

      // Verify PIN for HOD and Admin roles
      if (formData.role === "HOD" || formData.role === "Admin") {
        const pinType = formData.role === "HOD" ? "HOD" : "ADMIN";
        const isPinValid = verifyRegistrationPin(pin, pinType);
        
        if (!isPinValid) {
          setMessage({ text: "Invalid PIN. Please enter the correct PIN.", type: "error" });
          setLoading(false);
          return;
        }
      }

      // Prepare the data to be inserted
      const profileData = {
        id: user.id,
        fullname: formData.fullName,
        email: user.email,
        phonenumber: formData.phoneNumber,
        gender: formData.gender,
        role: formData.role,
        created_at: new Date().toISOString(),
        status: formData.role === "Teacher" ? "pending" : "active"
      };

      // Add role-specific fields
      switch (formData.role) {
        case "Student":
          profileData.roll_no = formData.roll_no;
          profileData.std = formData.std;
          profileData.stream = formData.stream || null;
          profileData.dob = formData.dob;
          profileData.parents_name = formData.parents_name;
          profileData.parents_num = formData.parents_num;
          profileData.address = formData.address;
          profileData.previous_school = formData.previous_school || null;
          profileData.status = "active";
          break;

        case "Teacher":
          profileData.subject_expertise = formData.subject_expertise;
          profileData.experience = formData.experience;
          profileData.highest_qualification = formData.highest_qualification;
          profileData.teaching_level = formData.teaching_level;
          profileData.bio = formData.bio || null;
          profileData.status = "pending";
          profileData.approved_by = null;
          profileData.approved_at = null;

          // Add teacher approval record
          await addTeacherApproval({
            teacher_id: user.id,
            teacher_name: formData.fullName,
            subject: formData.subject_expertise,
            status: "pending",
            requested_at: new Date().toISOString(),
            teacher_email: user.email
          });
          break;

        case "HOD":
          profileData.department_expertise = formData.department_expertise;
          profileData.experience = formData.experience;
          profileData.highest_qualification = formData.highest_qualification;
          profileData.vision_department = formData.vision_department || null;
          profileData.status = "active";
          break;

        case "Admin":
          profileData.admin_access_level = formData.admin_access_level;
          profileData.status = "active";
          break;
      }

      // Determine the table name based on role
      const tableName = formData.role.toLowerCase();

      // Insert data into the appropriate table
      const { error } = await supabase
        .from(tableName)
        .insert([profileData]);

      if (error) throw error;

      // For teachers, log out and redirect to login
      if (formData.role === "Teacher") {
        setMessage({
          text: "Profile submitted for approval! You'll be logged out shortly.",
          type: "success"
        });

        // Log out and redirect after 2 seconds
        setTimeout(async () => {
          await signOutUser();
          navigate("/login", {
            state: {
              message: "Your account is pending approval. Please wait for admin approval."
            }
          });
        }, 2000);
      } else {
        setMessage({ text: "Profile completed successfully!", type: "success" });

        // Redirect other roles after delay
        setTimeout(() => {
          const redirectPath = getRedirectPathForRole(formData.role.toLowerCase());
          navigate(redirectPath);
        }, 1500);
      }

    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ text: error.message || "Failed to save profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    {
      role: "Student",
      icon: <GraduationCap className="w-5 h-5" />,
      color: "blue",
    },
    {
      role: "Teacher",
      icon: <Stethoscope className="w-5 h-5" />,
      color: "green",
    },
    {
      role: "HOD",
      icon: <Building2 className="w-5 h-5" />,
      color: "purple",
    },
    {
      role: "Admin",
      icon: <UserCog className="w-5 h-5" />,
      color: "orange",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-3xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg border ${message.type === "error"
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-green-50 border-green-200 text-green-600"
              }`}>
              <p>{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="+1 234 567 890"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <div className="relative">
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="block w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {roleCards.map(({ role, icon, color }) => (
                  <label
                    key={role}
                    className={`flex flex-col items-center justify-center gap-2 cursor-pointer rounded-lg px-4 py-3 text-center font-medium text-sm border-2 ${formData.role === role
                      ? `bg-${color}-600 text-white border-${color}-600 shadow-lg`
                      : `bg-white text-gray-600 border-gray-200 hover:bg-gray-50`
                      } transition-all duration-200`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className={`p-2 rounded-full bg-${color}-100`}>
                      {icon}
                    </div>
                    <span>{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Fields Based on Role */}
            {formData.role === "Student" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      name="roll_no"
                      value={formData.roll_no}
                      placeholder="e.g., 2023001"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Standard/Class
                    </label>
                    <select
                      name="std"
                      value={formData.std}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Standard</option>
                      {standardOptions.map((std, index) => (
                        <option key={index} value={std}>
                          {std}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showStreamField && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stream
                      </label>
                      <select
                        name="stream"
                        value={formData.stream}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Stream</option>
                        {streamOptions.map((stream, index) => (
                          <option key={index} value={stream}>
                            {stream}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent's Name
                    </label>
                    <input
                      type="text"
                      name="parents_name"
                      value={formData.parents_name}
                      placeholder="Parent's full name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent's Phone Number
                    </label>
                    <input
                      type="tel"
                      name="parents_num"
                      value={formData.parents_num}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      placeholder="Full residential address"
                      rows="3"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous School (if any)
                    </label>
                    <input
                      type="text"
                      name="previous_school"
                      value={formData.previous_school}
                      placeholder="Name of previous school"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.role === "Teacher" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                  Teacher Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Expertise
                    </label>
                    <input
                      type="text"
                      name="subject_expertise"
                      value={formData.subject_expertise}
                      placeholder="e.g., Mathematics, Physics"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      placeholder="e.g., 5"
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Highest Qualification
                    </label>
                    <select
                      name="highest_qualification"
                      value={formData.highest_qualification}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Qualification</option>
                      {qualificationOptions.map((qual, index) => (
                        <option key={index} value={qual}>
                          {qual}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teaching Level
                    </label>
                    <select
                      name="teaching_level"
                      value={formData.teaching_level}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Level</option>
                      {teachingLevelOptions.map((level, index) => (
                        <option key={index} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio/Introduction
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      placeholder="Brief introduction about yourself"
                      rows="3"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {formData.role === "HOD" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                  HOD Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Expertise
                    </label>
                    <input
                      type="text"
                      name="department_expertise"
                      value={formData.department_expertise}
                      placeholder="e.g., Science Department"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                      Security PIN
                    </label>
                    <div className="relative">
                      <input
                        id="pin"
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        placeholder="Enter system-provided PIN"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      placeholder="e.g., 8"
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Highest Qualification
                    </label>
                    <select
                      name="highest_qualification"
                      value={formData.highest_qualification}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Qualification</option>
                      {qualificationOptions.map((qual, index) => (
                        <option key={index} value={qual}>
                          {qual}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vision for Department
                    </label>
                    <textarea
                      name="vision_department"
                      value={formData.vision_department}
                      placeholder="Brief description of your vision for the department"
                      rows="3"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {formData.role === "Admin" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                  Admin Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Role
                  </label>
                  <select
                    name="admin_access_level"
                    value={formData.admin_access_level}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Admin Role</option>
                    {adminAccessLevels.map((level, index) => (
                      <option key={index} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                    Security PIN
                  </label>
                  <div className="relative">
                    <input
                      id="pin"
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Enter system-provided PIN"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold text-white ${loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                } transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Complete Profile"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;