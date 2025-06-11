import React, { useState } from "react";
import {
  UserPlus,
  BookOpen,
  GraduationCap,
  UserCog,
  ChevronDown,
  Building2,
  ChevronRight,
  CheckCircle,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../helper/supabaseClient";
// Import the new auth utilities
import { validateForm, signUpUser, verifyRegistrationPin } from "../helper/authUtils";

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phonenumber: "",
    role: "",
    gender: "",
    bio: "",
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
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showStreamField, setShowStreamField] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Security states
  const [hodPin, setHodPin] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [pinAttempts, setPinAttempts] = useState(0);
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  // Role selection with security checks
  const selectRole = (role) => {
    if (role === "HOD" || role === "Admin") {
      setSelectedRole(role);
      setFormData((prev) => ({ ...prev, role }));
      setShowPinVerification(true);
      return;
    }

    if (role === "Teacher") {
      setSelectedRole(role);
      setFormData((prev) => ({ ...prev, role }));
      setCurrentStep(2);
      setPendingApproval(true); // Teachers require approval
      return;
    }

    // For students, no special security needed
    setSelectedRole(role);
    setFormData((prev) => ({ ...prev, role }));
    setCurrentStep(2);
  };

  // PIN Verification Component
  const PinVerificationModal = ({
    role,
    onVerify,
    onCancel,
    pinAttempts,
    maxAttempts = 5,
  }) => {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!pin) {
        setError("Please enter the registration PIN");
        return;
      }
      if (pin.length !== 8) {
        setError("PIN must be 8 digits");
        return;
      }

      setIsLoading(true);
      try {
        // Use the centralized PIN verification function
        await onVerify(pin);
      } finally {
        setIsLoading(false);
      }
    };

    const attemptsLeft = maxAttempts - pinAttempts;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`p-2 rounded-lg ${role === "HOD" ? "bg-purple-100" : "bg-red-100"
                }`}
            >
              {role === "HOD" ? (
                <Building2 className="w-6 h-6 text-purple-600" />
              ) : (
                <Shield className="w-6 h-6 text-red-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {role} Registration PIN
            </h2>
          </div>

          {attemptsLeft > 0 ? (
            <>
              <p className="text-gray-600 mb-4">
                To register as {role}, please enter the 8-digit registration PIN
                provided by the school administration.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {role} Registration PIN{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, "")); // Only allow numbers
                      setError("");
                    }}
                    placeholder="Enter 8-digit PIN"
                    maxLength="8"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    required
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Attempts left: {attemptsLeft}/{maxAttempts}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-lg font-medium text-white ${role === "HOD"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-red-600 hover:bg-red-700"
                        } transition-all flex items-center gap-2`}
                    >
                      {isLoading ? (
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : null}
                      Verify PIN
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Maximum Attempts Reached
              </h3>
              <p className="text-gray-600 mb-4">
                You've exceeded the maximum number of PIN attempts. Please
                contact the school administration for assistance.
              </p>
              <button
                onClick={onCancel}
                className="w-full py-2 px-4 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-all"
              >
                Return to Registration
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Verify PIN for HOD/Admin using the centralized function
  const verifyPin = async (enteredPin) => {
    try {
      const pinType = selectedRole === 'HOD' ? 'HOD' : 'ADMIN';
      const isValid = verifyRegistrationPin(enteredPin, pinType);
      
      if (isValid) {
        setPinVerified(true);
        setShowPinVerification(false);
        setCurrentStep(2);
        setPinAttempts(0);
        toast.success("PIN verified successfully");
        return true;
      } else {
        const attemptsLeft = 5 - pinAttempts - 1;
        setPinAttempts(pinAttempts + 1);
        setError(
          `Invalid PIN. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""
          } left.`
        );

        if (pinAttempts >= 4) {
          setShowPinVerification(false);
          setSelectedRole(null);
          setPinAttempts(0);
          toast.error(
            "Maximum PIN attempts reached. Please contact administration."
          );
        }
        return false;
      }
    } catch (error) {
      console.error("PIN verification error:", error);
      toast.error("An error occurred during PIN verification");
      return false;
    }
  };

  const cancelPinVerification = () => {
    setShowPinVerification(false);
    setSelectedRole(null);
    setPinAttempts(0);
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Show stream field only if standard is 11th or 12th
    if (name === "std") {
      setShowStreamField(
        value === "11th Standard" || value === "12th Standard"
      );
    }
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Use the centralized validation function
    if (!validateForm(formData, (errorMsg) => setError(errorMsg))) {
      setLoading(false);
      return;
    }

    try {
      // Set the redirect URL for email confirmation
      const redirectUrl = `${window.location.origin}/confirm-registration`;
      
      // Use the centralized signup function with redirect URL
      const { data, error } = await signUpUser(formData, { redirectUrl });

      if (error) {
        throw error;
      }
      
      // Check if email confirmation is required
      if (data?.user && !data.user.email_confirmed_at) {
        setEmailSent(true);
        console.log('Verification email sent to:', formData.email);
      }

      if (formData.role === "Teacher") {
        setSuccess(
          "Registration submitted for approval! You'll receive an email once your account is approved."
        );
        toast.success(
          "Registration submitted for HOD approval. You'll be notified once approved."
        );
      } else {
        setSuccess(
          "Registration successful! Please check your email to verify your account."
        );
        toast.success(
          "Registration successful! Please check your email to verify your account."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);

      // Handle specific Supabase errors
      if (err.message?.includes("User already registered")) {
        setError(
          "This email is already registered. Please use a different email or login."
        );
      } else if (err.message?.includes("password should be at least")) {
        setError("Password must be at least 6 characters long.");
      } else if (
        err.message?.includes("duplicate key value violates unique constraint")
      ) {
        setError(
          "This email or phone number is already registered. Please use different credentials."
        );
      } else {
        setError("Registration failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Notify HODs about pending approval (in production, implement this)
  const notifyHodForApproval = async (userId, teacherName, subject, email) => {
    // This would be implemented with a server-side notification system
    console.log(
      `Teacher approval request: ${teacherName} (${email}) - ${subject}`
    );
    // In a real implementation, this would send emails or notifications to HODs
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Join Our School Portal
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Create your account to access our digital learning environment
          </p>
        </div>

        {/* Registration Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-500"
                }`}
            >
              1
            </div>
            <div
              className={`h-1 w-16 ${currentStep >= 2 ? "bg-purple-600" : "bg-gray-200"}`}
            ></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-500"
                }`}
            >
              2
            </div>
            <div
              className={`h-1 w-16 ${currentStep >= 3 ? "bg-purple-600" : "bg-gray-200"}`}
            ></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-500"
                }`}
            >
              3
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm font-medium text-gray-500">
              {currentStep === 1
                ? "Select Role"
                : currentStep === 2
                  ? "Basic Information"
                  : "Role-Specific Details"}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Step 1: Role Selection */}
          {currentStep === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Select Your Role
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Student Card */}
                <div
                  onClick={() => selectRole("Student")}
                  className={`border rounded-xl p-6 cursor-pointer transition-all ${selectedRole === "Student"
                    ? "border-purple-500 bg-purple-50 shadow-md"
                    : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <GraduationCap className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Student
                    </h3>
                    <p className="text-sm text-gray-500">
                      Access learning materials, submit assignments, and track your
                      progress
                    </p>
                  </div>
                </div>

                {/* Teacher Card */}
                <div
                  onClick={() => selectRole("Teacher")}
                  className={`border rounded-xl p-6 cursor-pointer transition-all ${selectedRole === "Teacher"
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Teacher
                    </h3>
                    <p className="text-sm text-gray-500">
                      Manage classes, create assignments, and communicate with
                      students
                    </p>
                    {pendingApproval && selectedRole === "Teacher" && (
                      <div className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                        Requires HOD approval
                      </div>
                    )}
                  </div>
                </div>

                {/* HOD Card */}
                <div
                  onClick={() => selectRole("HOD")}
                  className={`border rounded-xl p-6 cursor-pointer transition-all ${selectedRole === "HOD"
                    ? "border-green-500 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Building2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      HOD
                    </h3>
                    <p className="text-sm text-gray-500">
                      Oversee department activities, approve teachers, and manage
                      curriculum
                    </p>
                    <div className="mt-3 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Requires PIN verification
                    </div>
                  </div>
                </div>

                {/* Admin Card */}
                <div
                  onClick={() => selectRole("Admin")}
                  className={`border rounded-xl p-6 cursor-pointer transition-all ${selectedRole === "Admin"
                    ? "border-red-500 bg-red-50 shadow-md"
                    : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                    }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <UserCog className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Admin
                    </h3>
                    <p className="text-sm text-gray-500">
                      Manage school operations, user accounts, and system settings
                    </p>
                    <div className="mt-3 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Requires PIN verification
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 & 3: Registration Form */}
          {currentStep > 1 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <button
                  onClick={goBack}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentStep === 2
                    ? "Basic Information"
                    : `${selectedRole} Details`}
                </h2>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-600">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Step 2: Basic Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullname"
                          value={formData.fullname}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email address"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a password (min. 6 characters)"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phonenumber"
                          value={formData.phonenumber}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
                      >
                        Next Step
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Role-Specific Information */}
                {currentStep === 3 && (
                  <div>
                    {/* Student Fields */}
                    {selectedRole === "Student" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Roll Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="roll_no"
                              value={formData.roll_no}
                              onChange={handleChange}
                              placeholder="Enter your roll number"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Standard <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="std"
                              value={formData.std}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            >
                              <option value="">Select Standard</option>
                              {standardOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>

                          {showStreamField && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stream <span className="text-red-500">*</span>
                              </label>
                              <select
                                name="stream"
                                value={formData.stream}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                required
                              >
                                <option value="">Select Stream</option>
                                {streamOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              name="dob"
                              value={formData.dob}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Parent's Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="parents_name"
                              value={formData.parents_name}
                              onChange={handleChange}
                              placeholder="Enter parent's name"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Parent's Phone Number{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              name="parents_num"
                              value={formData.parents_num}
                              onChange={handleChange}
                              placeholder="Enter parent's phone number"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              placeholder="Enter your address"
                              rows="3"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            ></textarea>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Previous School (if applicable)
                            </label>
                            <input
                              type="text"
                              name="previous_school"
                              value={formData.previous_school}
                              onChange={handleChange}
                              placeholder="Enter previous school name"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Teacher Fields */}
                    {selectedRole === "Teacher" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subject Expertise <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="subject_expertise"
                              value={formData.subject_expertise}
                              onChange={handleChange}
                              placeholder="E.g., Mathematics, Science, English"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Years of Experience <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="experience"
                              value={formData.experience}
                              onChange={handleChange}
                              placeholder="Enter years of teaching experience"
                              min="0"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Highest Qualification{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="highest_qualification"
                              value={formData.highest_qualification}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            >
                              <option value="">Select Qualification</option>
                              {qualificationOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Teaching Level <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="teaching_level"
                              value={formData.teaching_level}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            >
                              <option value="">Select Teaching Level</option>
                              {teachingLevelOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
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
                              onChange={handleChange}
                              placeholder="Brief introduction about yourself and your teaching philosophy"
                              rows="4"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            ></textarea>
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg
                                className="h-5 w-5 text-amber-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-amber-800">
                                Teacher Registration Approval
                              </h3>
                              <div className="mt-2 text-sm text-amber-700">
                                <p>
                                  Your registration will be reviewed by a Head of
                                  Department (HOD). You'll receive an email notification
                                  once your account is approved.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* HOD Fields */}
                    {selectedRole === "HOD" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Department Expertise{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="department_expertise"
                              value={formData.department_expertise}
                              onChange={handleChange}
                              placeholder="E.g., Science Department, Mathematics Department"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Years of Experience <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="experience"
                              value={formData.experience}
                              onChange={handleChange}
                              placeholder="Enter years of experience"
                              min="0"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Highest Qualification{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="highest_qualification"
                              value={formData.highest_qualification}
                              onChange={handleChange}
                              placeholder="E.g., Ph.D. in Physics, M.Ed. in Education"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Vision for Department
                            </label>
                            <textarea
                              name="vision_department"
                              value={formData.vision_department}
                              onChange={handleChange}
                              placeholder="Share your vision and goals for the department"
                              rows="4"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Admin Fields */}
                    {selectedRole === "Admin" && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Role <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="admin_access_level"
                            value={formData.admin_access_level}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            required
                          >
                            <option value="">Select Admin Role</option>
                            {adminAccessLevels.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="mt-8">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            Complete Registration
                          </>
                        )}
                      </button>

                      <p className="mt-4 text-sm text-gray-600 text-center">
                        By registering, you agree to our{" "}
                        <a href="#" className="text-purple-600 hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-purple-600 hover:underline">
                          Privacy Policy
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Registration Success */}
          {registrationComplete && (
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Registration Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                {selectedRole === "Teacher"
                  ? "Your registration has been submitted for approval. You'll receive an email once your account is approved."
                  : "Your account has been created successfully. Please check your email to verify your account."}
              </p>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        {/* Already have an account */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-purple-600 font-medium hover:underline"
            >
              Log in
            </a>
          </p>
        </div>
      </div>

      {/* PIN Verification Modal */}
      {showPinVerification && (
        <PinVerificationModal
          role={selectedRole}
          onVerify={verifyPin}
          onCancel={cancelPinVerification}
          pinAttempts={pinAttempts}
        />
      )}
    </div>
  );
};

export default Register;
