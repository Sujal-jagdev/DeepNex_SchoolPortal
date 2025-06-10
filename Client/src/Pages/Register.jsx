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

  // Generate secure 8-digit PINs (in production, these should come from server)
  const HOD_REGISTRATION_PIN = "98765432"; // Example HOD PIN
  const ADMIN_REGISTRATION_PIN = "18324967"; // Example Admin PIN

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
        // In production, verify PIN with server
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
                  <label className="block text-sm font-medium text-gray-700">
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

  // Verify PIN for HOD/Admin
  const verifyPin = async (enteredPin) => {
    let correctPin = "";

    if (selectedRole === "HOD") {
      correctPin = HOD_REGISTRATION_PIN;
    } else if (selectedRole === "Admin") {
      correctPin = ADMIN_REGISTRATION_PIN;
    }

    if (enteredPin === correctPin) {
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

  const validateForm = () => {
    // Basic validation
    if (
      !formData.fullname ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.phonenumber ||
      !formData.gender ||
      !formData.role
    ) {
      setError("Please fill in all required fields");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    // Role-specific validation
    switch (formData.role) {
      case "Student":
        if (
          !formData.roll_no ||
          !formData.std ||
          !formData.dob ||
          !formData.parents_name ||
          !formData.parents_num ||
          !formData.address
        ) {
          setError("Please fill in all student information fields");
          return false;
        }
        break;
      case "Teacher":
        if (
          !formData.subject_expertise ||
          !formData.experience ||
          !formData.highest_qualification ||
          !formData.teaching_level
        ) {
          setError("Please fill in all teacher information fields");
          return false;
        }
        break;
      case "HOD":
        if (
          !formData.department_expertise ||
          !formData.experience ||
          !formData.highest_qualification
        ) {
          setError("Please fill in all HOD information fields");
          return false;
        }
        break;
      case "Admin":
        if (!formData.admin_access_level) {
          setError("Please select an admin role");
          return false;
        }
        break;
      default:
        setError("Please select a valid role");
        return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // First, sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullname,
            role: formData.role,
            status: formData.role === "Teacher" ? "pending" : "active", // Teachers need approval
          },
          emailRedirectTo: `${window.location.origin}/confirm-registration`,
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("User registration failed");
      }

      // Prepare common user data
      const commonUserData = {
        id: authData.user.id,
        fullname: formData.fullname,
        email: formData.email,
        phonenumber: formData.phonenumber,
        gender: formData.gender,
        created_at: new Date().toISOString(),
        role: formData.role,
        status: formData.role === "Teacher" ? "pending" : "active", // Teachers need approval
      };

      // Insert into specific role table
      let roleSpecificData = {};
      let tableName = "";

      switch (formData.role) {
        case "Student":
          tableName = "student";
          roleSpecificData = {
            roll_no: formData.roll_no,
            std: formData.std,
            stream: formData.stream || null,
            dob: formData.dob,
            parents_name: formData.parents_name,
            parents_num: formData.parents_num,
            address: formData.address,
            previous_school: formData.previous_school || null,
            status: "active",
          };
          break;

        case "Teacher":
          tableName = "teacher";
          roleSpecificData = {
            subject_expertise: formData.subject_expertise,
            experience: formData.experience,
            highest_qualification: formData.highest_qualification,
            teaching_level: formData.teaching_level,
            bio: formData.bio || null,
            status: "pending", // Requires HOD approval
            approved_by: null,
            approved_at: null,
          };

          // Notify HODs about pending approval (in production, implement this)
          await notifyHodForApproval(
            authData.user.id,
            formData.fullname,
            formData.subject_expertise,
            formData.email,
          );
          break;

        case "HOD":
          tableName = "hod";
          roleSpecificData = {
            department_expertise: formData.department_expertise,
            experience: formData.experience,
            highest_qualification: formData.highest_qualification,
            vision_department: formData.vision_department || null,
            status: "active",
          };
          break;

        case "Admin":
          tableName = "admin";
          roleSpecificData = {
            admin_access_level: formData.admin_access_level,
            status: "active",
          };
          break;
      }

      // Insert into the specific role table
      const { error: roleTableError } = await supabase
        .from(tableName)
        .insert([{ ...commonUserData, ...roleSpecificData }]);

      if (roleTableError) {
        throw roleTableError;
      }

      // If everything is successful
      setEmailSent(true);

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
        setError("This user information already exists in our system.");
      } else {
        setError(
          err.message || "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock function to notify HOD (implement properly in production)
  const notifyHodForApproval = async (teacherId, teacherName, subject, email) => {
    try {
      // In production, this would:
      // 1. Find the relevant HOD based on subject/department
      // 2. Send an email/notification
      // 3. Create an approval request record in the database

      console.log(
        `HOD notification: Teacher ${teacherName} (${subject}) needs approval`
      );

      // Example of what you might do:
      const { error } = await supabase.from("teacher_approvals").insert([
        {
          teacher_id: teacherId,
          teacher_name: teacherName,
          subject: subject,
          status: "pending",
          requested_at: new Date().toISOString(),
          teacher_email: email
        },
      ]);

      if (error) throw error;
    } catch (err) {
      console.error("Failed to notify HOD:", err);
      // Even if notification fails, the teacher registration should still proceed
    }
  };

  const roleCards = [
    {
      role: "Student",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "blue",
      description: "Register as a school student (1st to 12th standard)",
    },
    {
      role: "Teacher",
      icon: <BookOpen className="w-6 h-6" />,
      color: "green",
      description: "Register as a school teacher",
    },
    {
      role: "HOD",
      icon: <Building2 className="w-6 h-6" />,
      color: "purple",
      description: "Register as Head of Department",
    },
    {
      role: "Admin",
      icon: <UserCog className="w-6 h-6" />,
      color: "orange",
      description: "Register as school administrator",
    },
  ];

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            Registration Confirmed!
          </h2>
          <p className="mt-2 text-gray-600">
            Your account has been successfully verified. You can now login to
            access your account.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If email confirmation was sent, show instructions
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            {formData.role === "Teacher"
              ? "Registration Submitted for Approval"
              : "Check Your Email"}
          </h2>
          <p className="mt-2 text-gray-600">
            {formData.role === "Teacher" ? (
              <>
                Your registration has been submitted for HOD approval. We've
                sent a confirmation to{" "}
                <span className="font-semibold">{formData.email}</span>. You'll
                receive another email once your account is approved.
              </>
            ) : (
              <>
                We've sent a confirmation link to{" "}
                <span className="font-semibold">{formData.email}</span>. Please
                click the link in that email to complete your registration.
              </>
            )}
          </p>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setEmailSent(false)}
              className="w-full py-2 px-4 rounded-lg font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 transition-all"
            >
              Back to Registration
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2 px-4 rounded-lg font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 transition-all"
            >
              Already confirmed? Login here
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Information */}
          <div className="space-y-8">
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Join Our School Community
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg md:text-xl text-gray-600"
              >
                Become part of our school dedicated to excellence in education
              </motion.p>
            </div>

            <div className="space-y-6">
              {roleCards.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer ${selectedRole === item.role
                    ? `ring-2 ring-${item.color}-500`
                    : ""
                    }`}
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${item.color === "blue"
                        ? "bg-blue-100"
                        : item.color === "green"
                          ? "bg-green-100"
                          : item.color === "purple"
                            ? "bg-purple-100"
                            : "bg-orange-100"
                        }`}
                    >
                      {React.cloneElement(item.icon, {
                        className: `w-6 h-6 ${item.color === "blue"
                          ? "text-blue-600"
                          : item.color === "green"
                            ? "text-green-600"
                            : item.color === "purple"
                              ? "text-purple-600"
                              : "text-orange-600"
                          }`,
                      })}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.role}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${activeAccordion === index ? "transform rotate-180" : ""
                        }`}
                    />
                  </div>

                  {activeAccordion === index && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <ul className="space-y-2 text-sm text-gray-600">
                        {item.role === "Student" && (
                          <>
                            <li className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              Access to all class materials
                            </li>
                            <li className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              Submit assignments online
                            </li>
                            <li className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              View grades and feedback
                            </li>
                          </>
                        )}
                        {item.role === "Teacher" && (
                          <>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              Create and manage class content
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              Grade student submissions
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              Track student progress
                            </li>
                          </>
                        )}
                        {item.role === "HOD" && (
                          <>
                            <li className="flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              Manage department teachers
                            </li>
                            <li className="flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              Oversee curriculum development
                            </li>
                            <li className="flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              Access department analytics
                            </li>
                          </>
                        )}
                        {item.role === "Admin" && (
                          <>
                            <li className="flex items-start">
                              <span className="text-orange-500 mr-2">•</span>
                              Manage school operations
                            </li>
                            <li className="flex items-start">
                              <span className="text-orange-500 mr-2">•</span>
                              Configure school settings
                            </li>
                            <li className="flex items-start">
                              <span className="text-orange-500 mr-2">•</span>
                              Generate school reports
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentStep === 1
                  ? "Select Your Role"
                  : "Complete Your Registration"}
              </h2>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200"
              >
                <p className="text-red-600">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <p className="text-green-600">{success}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-medium text-gray-700">
                      I am registering as a:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roleCards.map(({ role, icon, color, description }) => (
                        <motion.div
                          key={role}
                          whileHover={{ y: -5 }}
                          className={`flex flex-col items-center justify-center gap-3 cursor-pointer rounded-xl p-5 text-center border-2 ${selectedRole === role
                            ? color === "blue"
                              ? "border-blue-500 bg-blue-50"
                              : color === "green"
                                ? "border-green-500 bg-green-50"
                                : color === "purple"
                                  ? "border-purple-500 bg-purple-50"
                                  : "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:bg-gray-50"
                            } transition-all`}
                          onClick={() => selectRole(role)}
                        >
                          <div
                            className={`p-3 rounded-full ${color === "blue"
                              ? "bg-blue-100"
                              : color === "green"
                                ? "bg-green-100"
                                : color === "purple"
                                  ? "bg-purple-100"
                                  : "bg-orange-100"
                              }`}
                          >
                            {React.cloneElement(icon, {
                              className: `w-6 h-6 ${color === "blue"
                                ? "text-blue-600"
                                : color === "green"
                                  ? "text-green-600"
                                  : color === "purple"
                                    ? "text-purple-600"
                                    : "text-orange-600"
                                }`,
                            })}
                          </div>
                          <h4 className="font-semibold text-gray-800">
                            {role}
                          </h4>
                          <p className="text-sm text-gray-500">{description}</p>
                          <div
                            className={`mt-2 text-sm font-medium ${color === "blue"
                              ? "text-blue-600"
                              : color === "green"
                                ? "text-green-600"
                                : color === "purple"
                                  ? "text-purple-600"
                                  : "text-orange-600"
                              } flex items-center`}
                          >
                            Select <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      <ChevronRight className="w-4 h-4 transform rotate-180 mr-1" />
                      Back to role selection
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white shadow-sm hover:shadow-md"
                            pattern="[A-Za-z ]{2,50}"
                            title="Name should only contain letters and spaces, between 2-50 characters"
                            required
                            autoComplete="name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white shadow-sm hover:shadow-md"
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                            title="Please enter a valid email address"
                            required
                            autoComplete="email"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2                         focus:ring-purple-200 outline-none transition-all"
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">
                              Prefer not to say
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            name="phonenumber"
                            value={formData.phonenumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              if (value.length <= 10) {
                                setFormData(prev => ({ ...prev, phonenumber: value }));
                              }
                            }}
                            placeholder="Enter 10-digit mobile number"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white shadow-sm hover:shadow-md"
                            pattern="[0-9]{10}"
                            title="Please enter a valid 10-digit mobile number"
                            maxLength="10"
                            required
                            autoComplete="tel"
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
                            placeholder="Create a strong password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white shadow-sm hover:shadow-md"
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                            title="Password must contain at least 8 characters, including uppercase, lowercase, numbers and special characters"
                            required
                            autoComplete="new-password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white shadow-sm hover:shadow-md"
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                            title="Passwords must match"
                            required
                            autoComplete="new-password"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role-specific fields */}
                    {formData.role === "Student" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                          Student Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Roll Number{" "}
                              <span className="text-red-500">*</span>
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
                              Standard/Class{" "}
                              <span className="text-red-500">*</span>
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
                                Stream <span className="text-red-500">*</span>
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
                              Date of Birth{" "}
                              <span className="text-red-500">*</span>
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
                              Parent's Name{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="parents_name"
                              value={formData.parents_name}
                              onChange={handleChange}
                              placeholder="Enter parent's full name"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white shadow-sm hover:shadow-md"
                              pattern="[A-Za-z ]{2,50}"
                              title="Name should only contain letters and spaces, between 2-50 characters"
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
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                if (value.length <= 10) {
                                  setFormData(prev => ({ ...prev, parents_num: value }));
                                }
                              }}
                              placeholder="Enter parent's 10-digit mobile number"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white shadow-sm hover:shadow-md"
                              pattern="[0-9]{10}"
                              title="Please enter a valid 10-digit mobile number"
                              maxLength="10"
                              required
                              autoComplete="tel"
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
                              placeholder="Enter your complete address"
                              rows="4"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white shadow-sm hover:shadow-md resize-none placeholder:ps-5"
                              minLength="10"
                              maxLength="200"
                              title="Please enter your complete address (10-200 characters)"
                              required
                              style={{ lineHeight: '1.5', fontSize: '1rem', color:"gray"  }}
                            ></textarea>
                            <p className="mt-1 text-sm text-gray-500">Enter your complete address including house number, street name, city, state and PIN code</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {formData.role === "Teacher" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                          Teacher Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subject Expertise{" "}
                              <span className="text-red-500">*</span>
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
                              Years of Experience{" "}
                              <span className="text-red-500">*</span>
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
                              Highest Qualification{" "}
                              <span className="text-red-500">*</span>
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
                              Teaching Level{" "}
                              <span className="text-red-500">*</span>
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
                      </motion.div>
                    )}

                    {formData.role === "HOD" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                          HOD Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Department Expertise{" "}
                              <span className="text-red-500">*</span>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Years of Experience{" "}
                              <span className="text-red-500">*</span>
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
                              Highest Qualification{" "}
                              <span className="text-red-500">*</span>
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
                      </motion.div>
                    )}

                    {formData.role === "Admin" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                          Admin Information
                        </h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Role <span className="text-red-500">*</span>
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
                      </motion.div>
                    )}

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-white ${formData.role === "Student"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                          : formData.role === "Teacher"
                            ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            : formData.role === "HOD"
                              ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                              : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                          } transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center`}
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          "Complete Registration"
                        )}
                      </button>
                    </div>

                    <div className="text-center text-sm text-gray-500">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Login here
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
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
