import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  UserCircle,
  ArrowRight,
  Key,
  BookOpen,
  GraduationCap,
  UserCog,
  AlertCircle,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../helper/supabaseClient";
import { MyContext } from "../AllContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [role, setRole] = useState("teacher");
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionMode, setQuestionMode] = useState(false);
  const navigate = useNavigate();
  const { role: userRole, setrole } = useContext(MyContext);

  const checkEmailExists = async (email) => {
    try {
      const tables = ['student', 'teacher', 'hod', 'admin'];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('email')
          .eq('email', email)
          .single();

        if (data) return table; // Return the table name where the email exists
        console.log(data);

        if (error && error.code !== 'PGRST116') throw error;
      }

      return false; // Email doesn't exist in any role table
    } catch (error) {
      console.error("Email check error:", error);
      throw error;
    }
  };

  // Role configurations with colors and icons
  const rolesConfig = {
    student: {
      icon: <BookOpen className="w-5 h-5" />,
      color: "indigo",
      bgGradient: "from-indigo-500 to-indigo-700",
      questions: [
        "What was the name of your first pet?",
        "What elementary school did you attend?",
        "What was your childhood nickname?",
      ],
    },
    teacher: {
      icon: <GraduationCap className="w-5 h-5" />,
      color: "blue",
      bgGradient: "from-blue-500 to-blue-700",
      questions: [
        "What subject do you teach?",
        "What year did you start teaching?",
        "What's your employee ID?",
      ],
    },
    hod: {
      icon: <UserCog className="w-5 h-5" />,
      color: "purple",
      bgGradient: "from-purple-500 to-purple-700",
      questions: [
        "What department do you head?",
        "What's your authorization code?",
        "When was your department established?",
      ],
    },
    admin: {
      icon: <Shield className="w-5 h-5" />,
      color: "red",
      bgGradient: "from-red-500 to-red-700",
      questions: [
        "What's your admin security code?",
        "Who is your direct supervisor?",
        "What's the last 4 digits of your admin ID?",
      ],
    },
  };

  // Check for lockout timer
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  // Handle role selection
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    const shuffled = [...rolesConfig[selectedRole].questions].sort(
      () => 0.5 - Math.random()
    );
    setSecurityQuestions(shuffled.slice(0, 2));
    setAnswers({});
  };

  // Handle answer input
  const handleAnswerChange = (question, value) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  // Verify security questions
  const verifyQuestions = async () => {
    for (const question of securityQuestions) {
      if (!answers[question] || answers[question].trim() === "") {
        setMessage({
          text: "Please answer all security questions",
          type: "error",
        });
        return false;
      }
    }
    return true;
  };

  // Main login handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // Handle account lockout
    if (lockoutTime > 0) {
      setMessage({
        text: `Account temporarily locked. Try again in ${lockoutTime} seconds.`,
        type: "error",
      });
      return;
    }

    // Google Auth flow with security questions
    if (googleAuthMode && questionMode) {
      try {
        setLoading(true);
        const verified = await verifyQuestions();
        if (!verified) return;

        const userTable = role.toLowerCase();

        // TEACHER APPROVAL CHECK (Regular Login)
        if (role === 'teacher') {
          // First check if teacher exists and is active
          const { data: teacherData, error: teacherError } = await supabase
            .from('teacher')
            .select('status, approved_at')
            .eq('email', email)
            .single();

          if (teacherError && teacherError.code !== 'PGRST116') throw teacherError;

          // If active teacher exists, allow login
          if (teacherData?.status === 'active') {
            // Proceed with login
          }
          // If no teacher record or not active, check approvals
          else {
            const { data: approvalData, error: approvalError } = await supabase
              .from('teacher_approvals')
              .select('status, rejection_reason, decided_at')
              .eq('teacher_email', email)
              .single();

            if (approvalError && approvalError.code !== 'PGRST116') throw approvalError;

            // Handle approval status cases
            if (approvalData) {
              switch (approvalData.status) {
                case 'rejected':
                  await supabase.auth.signOut();
                  throw new Error(
                    `Application rejected. Reason: ${approvalData.rejection_reason || 'Not specified'}`
                  );

                case 'pending':
                  await supabase.auth.signOut();
                  throw new Error('Your application is pending approval');

                case 'approved':
                  // If approved but not in teacher table, add them
                  const { error: insertError } = await supabase
                    .from('teacher')
                    .upsert({
                      email: email,
                      status: 'active',
                      approved_at: new Date().toISOString(),
                      // Add other required fields
                      fullname: data.user.user_metadata?.full_name || '',
                      avatar_url: data.user.user_metadata?.avatar_url || ''
                    });

                  if (insertError) throw insertError;
                  break;

                default:
                  await supabase.auth.signOut();
                  throw new Error('Invalid application status');
              }
            } else {
              // No record in either table
              await supabase.auth.signOut();
              throw new Error('No teacher account found for this email');
            }
          }
        }

        // Rest of your Google Auth flow...
        // [Keep existing Google Auth code here]

      } catch (error) {
        console.error("Google Auth error:", error);
        setMessage({
          text: error.message,
          type: "error",
        });
        await supabase.auth.signOut(); // Ensure user is logged out if approval fails
      } finally {
        setLoading(false);
      }
      return;
    }

    // Regular email/password login
    if (!email || (!password && !questionMode)) {
      setMessage({
        text: "Please enter all required fields.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // Security questions verification
      if (questionMode && !googleAuthMode) {
        const verified = await verifyQuestions();
        if (!verified) return;
      }

      // Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data?.user) throw new Error("Login failed. Please try again.");

      // Email confirmation check
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error("Please confirm your email before logging in.");
      }

      // TEACHER APPROVAL CHECK (Regular Login)
      if (role === 'teacher') {

        // await supabase.
        // First check teacher_approvals table
        const { data: approvalData, error: approvalError } = await supabase
          .from('teacher_approvals')
          .select('status, rejection_reason, decided_at')
          .eq('teacher_email', email)
          .single();

        if (approvalError) {
          if (approvalError.code === 'PGRST116') { // No rows found
            throw new Error('No teacher application found for this email.');
          }
          throw approvalError;
        }

        // Handle different approval states
        switch (approvalData.status) {
          case 'rejected':
            await supabase.auth.signOut();
            throw new Error(
              `Application rejected on ${new Date(approvalData.decided_at).toLocaleDateString()}. ` +
              `Reason: ${approvalData.rejection_reason || 'Not specified'}`
            );

          case 'pending':
            await supabase.auth.signOut();
            throw new Error('Your application is still under review.');

          case 'approved':
            // Additional check against teacher table
            const { data: teacherData, error: teacherError } = await supabase
              .from('teacher')
              .select('status')
              .eq('email', email)
              .single();

            if (teacherError && teacherError.code !== 'PGRST116') {
              throw teacherError;
            }

            // If teacher record exists but status isn't active
            if (teacherData && teacherData.status !== 'active') {
              // Auto-activate if approved in teacher_approvals
              const { error: updateError } = await supabase
                .from('teacher')
                .update({ status: 'active' })
                .eq('email', email);

              if (updateError) throw updateError;
            }
            break;

          default:
            await supabase.auth.signOut();
            throw new Error('Invalid application status.');
        }
      }

      // Successful login navigation
      const redirectPath = role === 'student' ? '/student-profile' : '/dashboard';
      navigate(redirectPath);
      setAttempts(0); // Reset failed attempts

    } catch (error) {
      console.error("Login error:", error);

      // Update failed attempts
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Handle account lockout
      if (newAttempts >= 5) {
        setLockoutTime(30);
        setMessage({
          text: "Too many failed attempts. Account locked for 30 seconds.",
          type: "error",
        });
      } else {
        setMessage({
          text: error.message,
          type: "error",
        });
      }

      // Trigger security questions after 3 attempts
      if (newAttempts >= 3 && !questionMode) {
        setQuestionMode(true);
        setMessage({
          text: "Please answer security questions for additional verification.",
          type: "info",
        });
      }

      // Clear password field
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  // State for Google auth flow
  const [googleAuthMode, setGoogleAuthMode] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      // Validate role selection first
      if (!role) {
        setMessage({
          text: "Please select a role before signing in with Google",
          type: "error",
        });
        return;
      }

      setGoogleLoading(true);

      // Get the current origin (handles both dev and production)
      const currentOrigin = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${currentOrigin}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      // Store the selected role in sessionStorage (more secure than localStorage)
      sessionStorage.setItem('preSelectedRole', role);

    } catch (error) {
      console.error("Google sign-in error:", error);
      setMessage({
        text: error?.message || "Google sign-in failed",
        type: "error",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // Check for Google auth redirect
  useEffect(() => {

    const checkGoogleAuth = async () => {
      try {
        // Check if we have a session after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session?.user) return;

        // Get the pre-selected role from sessionStorage
        const preSelectedRole = sessionStorage.getItem('preSelectedRole') || 'student';
        setRole(preSelectedRole);
        sessionStorage.removeItem('preSelectedRole');

        // Step 1: Check if user exists in the selected role table
        const { data: existingUserInRole, error: roleCheckError } = await supabase
          .from(preSelectedRole)
          .select('*')
          .eq('email', session.user.email)
          .single();

        // If user exists in selected role, redirect to their dashboard
        if (existingUserInRole && !roleCheckError) {
          console.log(`User exists as ${preSelectedRole}, redirecting to dashboard`);
          if (setrole) setrole(preSelectedRole);
          navigate(preSelectedRole === 'student' ? '/student-profile' : '/dashboard');
          return;
        }

        // Step 2: Special handling for teachers (approval process)
        if (preSelectedRole === 'teacher') {
          try {
            const { data: approvalData, error: approvalError } = await supabase
              .from('teacher_approvals')
              .select('status, rejection_reason, decided_at')
              .eq('teacher_email', session.user.email)
              .single();

            if (approvalError) {
              if (approvalError.code === 'PGRST116') { // No approval record found
                // New teacher sign-up via Google - redirect to profile completion
                console.log('New teacher signup, redirecting to profile completion');
                navigate('/profile-completion');
                return;
              } else {
                throw approvalError;
              }
            }

            // Handle existing approval status
            if (approvalData.status !== 'approved') {
              await supabase.auth.signOut();
              setMessage({
                text: approvalData.status === 'pending'
                  ? 'Your application is pending approval'
                  : `Application rejected. Reason: ${approvalData.rejection_reason || 'Not specified'}`,
                type: 'error'
              });
              return;
            }

            // Teacher is approved but may not have a record in teacher table
            const { data: teacherData, error: teacherError } = await supabase
              .from('teacher')
              .select('status')
              .eq('email', session.user.email)
              .single();

            if (teacherError && teacherError.code !== 'PGRST116') throw teacherError;

            // Create teacher record if approved but doesn't exist
            if (!teacherData) {
              const { error: insertError } = await supabase
                .from('teacher')
                .insert({
                  email: session.user.email,
                  fullname: session.user.user_metadata?.full_name || 'New Teacher',
                  avatar_url: session.user.user_metadata?.avatar_url || '',
                  status: 'active',
                  approved_at: new Date().toISOString()
                });

              if (insertError) throw insertError;

              // Now redirect to dashboard since we've created their account
              if (setrole) setrole('teacher');
              navigate('/dashboard');
              return;
            }

            // Existing teacher with active record
            if (setrole) setrole('teacher');
            navigate('/dashboard');
            return;
          } catch (error) {
            console.error("Teacher approval check error:", error);
            setMessage({
              text: error.message,
              type: "error"
            });
            await supabase.auth.signOut();
            return;
          }
        }

        // Step 3: Check if user exists in any role table
        const allRoles = ['student', 'teacher', 'hod', 'admin'];
        let existingRole = null;

        for (const roleType of allRoles) {
          const { data, error } = await supabase
            .from(roleType)
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (data && !error) {
            existingRole = roleType;
            break;
          }
        }

        // If user exists in any role, ask to switch or redirect
        if (existingRole) {
          if (existingRole !== preSelectedRole) {
            const switchRole = window.confirm(
              `You already have an account as ${existingRole}. Would you like to sign in as ${existingRole} instead?`
            );

            if (switchRole) {
              if (setrole) setrole(existingRole);
              navigate(existingRole === 'student' ? '/student-profile' : '/dashboard');
              return;
            } else {
              // User wants to continue with the selected role but doesn't have an account for it
              console.log('User exists with different role, redirecting to profile completion');
              navigate('/profile-completion');
              return;
            }
          } else {
            // They already exist with the selected role (shouldn't happen due to earlier check)
            if (setrole) setrole(existingRole);
            navigate(existingRole === 'student' ? '/student-profile' : '/dashboard');
            return;
          }
        }

        // Step 4: User doesn't exist in any role - redirect to profile completion
        console.log('New user, redirecting to profile completion');
        navigate('/profile-completion');
      } catch (error) {
        console.error("Google auth check error:", error);
        setMessage({
          text: error.message || "Authentication error",
          type: "error"
        });
        await supabase.auth.signOut();
      }
    };

    checkGoogleAuth();
  }, []);

  const handleResetPassword = async () => {
    if (!email) {
      setMessage({
        text: "Please enter your email to reset the password.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      setMessage({
        text: "Password reset email sent! Check your inbox.",
        type: "success",
      });
    } catch (error) {
      setMessage({
        text: error?.message || "An error occurred.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const cardHover = {
    scale: 1.03,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  };

  const cardTap = {
    scale: 0.98,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Section - Information */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to EduPortal
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                A unified platform for students, educators, and administrators.
                Sign in to access your personalized dashboard.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              {Object.entries(rolesConfig).map(([roleKey, config]) => (
                <motion.div
                  key={roleKey}
                  whileHover={cardHover}
                  whileTap={cardTap}
                  className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border-2 ${role === roleKey
                    ? `border-${config.color}-300 shadow-lg`
                    : "border-transparent"
                    } cursor-pointer group`}
                  onClick={() => handleRoleChange(roleKey)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg transition-all ${role === roleKey
                        ? `bg-${config.color}-100 text-${config.color}-600`
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                        }`}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold capitalize ${role === roleKey
                          ? `text-${config.color}-700`
                          : "text-gray-800"
                          }`}
                      >
                        {roleKey}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {roleKey === "student"
                          ? "Access learning materials and assignments"
                          : roleKey === "teacher"
                            ? "Manage courses and student progress"
                            : roleKey === "hod"
                              ? "Department oversight and analytics"
                              : "System administration and management"}
                      </p>
                    </div>
                    <ChevronRight
                      className={`ml-auto h-5 w-5 ${role === roleKey
                        ? `text-${config.color}-500`
                        : "text-gray-400 group-hover:text-gray-600"
                        }`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Section - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 backdrop-blur-sm bg-opacity-90"
          >
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`p-2 rounded-lg bg-${rolesConfig[role].color}-100 text-${rolesConfig[role].color}-600`}
              >
                <Key className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {resetMode
                  ? "Reset Password"
                  : questionMode && googleAuthMode
                    ? "Complete Your Profile"
                    : questionMode
                      ? "Security Verification"
                      : "Sign In as " + role.charAt(0).toUpperCase() + role.slice(1)}
              </h2>
            </div>

            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-6 p-4 rounded-lg border ${message.type === "error"
                    ? "bg-red-50 border-red-200 text-red-600"
                    : message.type === "success"
                      ? "bg-green-50 border-green-200 text-green-600"
                      : "bg-blue-50 border-blue-200 text-blue-600"
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="flex-shrink-0 h-5 w-5 mt-0.5" />
                    <p>{message.text}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {lockoutTime > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 flex items-center gap-3"
              >
                <Clock className="h-5 w-5" />
                <div>
                  <p className="font-medium">Account Temporarily Locked</p>
                  <p className="text-sm">
                    Please wait {lockoutTime} seconds before trying again.
                  </p>
                </div>
              </motion.div>
            )}

            <form
              onSubmit={
                resetMode
                  ? (e) => {
                    e.preventDefault();
                    handleResetPassword();
                  }
                  : handleSubmit
              }
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all hover:border-gray-400"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </motion.div>

              {!resetMode && !questionMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all hover:border-gray-400"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500 transition-colors" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="text-sm text-gray-500">
                      Attempts: {attempts}/5
                    </div>
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </motion.div>
              )}

              {questionMode && !resetMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  {googleAuthMode && googleUser && (
                    <div className={`flex items-center gap-3 p-4 rounded-lg border-2 border-${rolesConfig[role].color}-200 bg-${rolesConfig[role].color}-50 mb-4`}>
                      <div className="flex items-center gap-3">
                        {googleUser.user_metadata?.avatar_url ? (
                          <img
                            src={googleUser.user_metadata.avatar_url}
                            alt="Profile"
                            className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                          />
                        ) : (
                          <UserCircle className="w-12 h-12 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {googleUser.user_metadata?.full_name || googleUser.email}
                          </p>
                          <p className="text-xs text-gray-500">{googleUser.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <div className={`p-1 rounded-full bg-${rolesConfig[role].color}-200`}>
                              {rolesConfig[role].icon}
                            </div>
                            <span className={`text-xs font-medium text-${rolesConfig[role].color}-700 capitalize`}>{role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="font-medium text-gray-800 mb-1">
                      {googleAuthMode
                        ? `Complete Your ${role.charAt(0).toUpperCase() + role.slice(1)} Profile`
                        : "Security Verification"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {googleAuthMode
                        ? `Please answer these security questions to set up your account. These will help verify your identity in the future.`
                        : "Please answer these security questions to verify your identity:"}
                    </p>
                  </div>

                  {securityQuestions.map((question, index) => (
                    <div key={index} className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question {index + 1}: {question} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={answers[question] || ""}
                        onChange={(e) =>
                          handleAnswerChange(question, e.target.value)
                        }
                        className={`block w-full px-4 py-3 rounded-lg border ${!answers[question] ? 'border-gray-300' : `border-${rolesConfig[role].color}-300`} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all hover:border-gray-400`}
                        placeholder="Your answer..."
                        required
                      />
                    </div>
                  ))}

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-2">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> Your answers will be securely stored and used for account recovery. Please remember them.
                    </p>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-lg font-semibold text-white ${loading || lockoutTime > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : `bg-gradient-to-r ${rolesConfig[role].bgGradient} hover:opacity-90`
                    } transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                  disabled={loading || lockoutTime > 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {resetMode
                        ? "Processing..."
                        : questionMode && googleAuthMode
                          ? "Saving Profile..."
                          : questionMode
                            ? "Verifying..."
                            : "Signing in..."}
                    </>
                  ) : (
                    <>
                      {resetMode
                        ? "Send Reset Link"
                        : questionMode && googleAuthMode
                          ? "Complete Profile"
                          : questionMode
                            ? "Verify Identity"
                            : "Sign In"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>

              {!resetMode && !questionMode && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Role selection reminder */}
                    <div className={`p-3 rounded-lg border-2 border-${rolesConfig[role].color}-200 bg-${rolesConfig[role].color}-50`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-${rolesConfig[role].color}-100`}>
                          {rolesConfig[role].icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Signing in as <span className={`font-bold text-${rolesConfig[role].color}-600 capitalize`}>{role}</span></p>
                          <p className="text-xs text-gray-500">You can change your role by clicking on the options above</p>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-${rolesConfig[role].color}-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-${rolesConfig[role].color}-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${rolesConfig[role].color}-500 transition-all`}
                    >
                      {googleLoading ? (
                        <Loader2 className={`h-5 w-5 animate-spin text-${rolesConfig[role].color}-500`} />
                      ) : (
                        <>
                          <FcGoogle className="h-5 w-5" />
                          <span>Sign in with Google as <span className={`font-semibold text-${rolesConfig[role].color}-600 capitalize`}>{role}</span></span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              )}
            </form>

            {resetMode ? (
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Back to Sign In
              </button>
            ) : questionMode && googleAuthMode ? (
              <button
                type="button"
                onClick={async () => {
                  // Sign out the user if they cancel Google auth flow
                  await supabase.auth.signOut();
                  setGoogleAuthMode(false);
                  setQuestionMode(false);
                  setGoogleUser(null);
                  setMessage({ text: "", type: "" });
                }}
                className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Cancel and Sign Out
              </button>
            ) : questionMode ? (
              <button
                type="button"
                onClick={() => {
                  setQuestionMode(false);
                  setMessage({ text: "", type: "" });
                }}
                className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Back to Password Login
              </button>
            ) : (
              <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Create one now
                </a>
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add some global styles for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
