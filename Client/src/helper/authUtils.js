import { supabase } from './supabaseClient';

// Environment variables for Supabase
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Form validation functions
 */

// Common validation for all forms
export const validateCommonFields = (formData, setError) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setError("Please enter a valid email address");
    return false;
  }

  // Validate password strength (if password field exists)
  if (formData.password) {
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    // Check for password confirmation match (if confirmPassword field exists)
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
  }

  // Validate phone number format (if phoneNumber field exists)
  if (formData.phoneNumber || formData.phonenumber) {
    const phone = formData.phoneNumber || formData.phonenumber;
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
  }

  return true;
};

// Role-specific validation
export const validateRoleSpecificFields = (formData, setError) => {
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

// Complete form validation
export const validateForm = (formData, setError) => {
  // First validate common fields
  if (!validateCommonFields(formData, setError)) {
    return false;
  }

  // Then validate role-specific fields
  if (!validateRoleSpecificFields(formData, setError)) {
    return false;
  }

  return true;
};

/**
 * Authentication functions
 */

// This function was moved to the exported version below

// Check if user already exists in auth system or role tables
export const checkUserExists = async (email) => {
  try {
    // Check each role table directly
    const tables = ['student', 'teacher', 'hod', 'admin'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (data) {
        console.log(`User found in ${table} table:`, data);
        return true;
      }
    }
    
    // Also check auth table for existing users
    const { data: authData, error: authError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email', email)
      .maybeSingle();
      
    if (authData) {
      console.log('User found in auth table:', authData);
      return true;
    }
    
    // Check teacher_approvals table for pending teachers
    const { data: approvalData, error: approvalError } = await supabase
      .from('teacher_approvals')
      .select('email')
      .eq('email', email)
      .maybeSingle();
      
    if (approvalData) {
      console.log('User found in teacher_approvals table:', approvalData);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    // In case of error, we'll do a more direct check
    try {
      // Try to sign in with OTP as a fallback check
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
        },
      });
      
      // If there's no error or error is not 'user not found', user likely exists
      if (!otpError || !otpError.message.includes('user not found')) {
        return true;
      }
    } catch (innerError) {
      console.error('Error in fallback user check:', innerError);
    }
    
    return false;
  }
};

// Sign up a new user
export const signUpUser = async (formData, options = {}) => {
  try {
    // First check if user already exists
    const userExists = await checkUserExists(formData.email);
    
    if (userExists) {
      console.warn('Attempted duplicate registration for:', formData.email);
      return { 
        data: null, 
        error: { message: "User already registered" } 
      };
    }
    
    // Get the current origin for email redirect
    const origin = window.location.origin;
    const redirectUrl = options.redirectUrl || `${origin}/confirm-registration`;
    
    console.log('Using redirect URL for email verification:', redirectUrl);
    
    // Proceed with signup
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullname || formData.fullName,
          role: formData.role,
          status: formData.role === "Teacher" ? "pending" : "active",
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      return { data: null, error };
    }

    // If signup was successful but email confirmation is required
    if (data?.user && !data.user.email_confirmed_at) {
      console.log('Verification email sent to:', formData.email);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return { 
      data: null, 
      error: { message: "An unexpected error occurred during registration" } 
    };
  }
};

// Sign in a user
export const signInUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

// Sign out a user
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current session
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

// Get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

/**
 * Role checking functions
 */

// Check if user exists in a specific role table
export const checkUserInRoleTable = async (email, tableName) => {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('email', email)
    .single();

  return { exists: !!data, data, error };
};

// Get user role from database
export const getUserRole = async (email) => {
  // Check each role table in order of priority
  const tables = ['admin', 'hod', 'teacher', 'student'];
  
  for (const table of tables) {
    const { exists, data } = await checkUserInRoleTable(email, table);
    if (exists) {
      return { role: table, userData: data };
    }
  }

  // Check for pending teacher approval
  const { data: approvalData, error: approvalError } = await supabase
    .from('teacher_approvals')
    .select('status')
    .eq('teacher_email', email)
    .single();

  if (approvalData && !approvalError) {
    return { role: 'pending', approvalStatus: approvalData.status };
  }

  // User not found in any role table
  return { role: 'new' };
};

// Check if user has permission for a specific route
export const hasRoutePermission = (userRole, pathname, routeAccess) => {
  const allowedRoles = routeAccess[pathname];
  if (!allowedRoles) return true; // Route not listed means no restriction
  return allowedRoles.includes(userRole);
};

// Get redirect path based on user role
export const getRedirectPathForRole = (role) => {
  switch (role) {
    case 'student':
      return '/student-profile';
    case 'teacher':
      return '/dashboard';
    case 'hod':
      return '/dashboard';
    case 'admin':
      return '/dashboard';
    case 'new':
      return '/profile-completion';
    default:
      return '/';
  }
};

/**
 * PIN verification for HOD and Admin
 */

// Verify PIN for HOD and Admin roles
export const verifyRolePin = (role, pin) => {
  // These PINs should be stored securely in environment variables in production
  const HOD_REGISTRATION_PIN = import.meta.env.VITE_HOD_REGISTRATION_PIN || "98765432";
  const ADMIN_REGISTRATION_PIN = import.meta.env.VITE_ADMIN_REGISTRATION_PIN || "18324967";
  
  if (role === "HOD") {
    return pin === HOD_REGISTRATION_PIN;
  } else if (role === "Admin") {
    return pin === ADMIN_REGISTRATION_PIN;
  }
  
  return false;
};

// Export verifyRegistrationPin as an alias for verifyRolePin for backward compatibility
export const verifyRegistrationPin = (pin, pinType) => {
  // Convert pinType to role format expected by verifyRolePin
  const role = pinType === 'HOD' ? 'HOD' : 'Admin';
  return verifyRolePin(role, pin);
};

/**
 * Teacher approval functions
 */

// Add teacher approval record
export const addTeacherApproval = async (teacherData) => {
  const approvalData = {
    teacher_id: teacherData.id,
    teacher_name: teacherData.fullname || teacherData.fullName,
    subject: teacherData.subject_expertise,
    status: "pending",
    requested_at: new Date().toISOString(),
    teacher_email: teacherData.email
  };

  const { data, error } = await supabase
    .from("teacher_approvals")
    .insert([approvalData]);

  return { data, error };
};

// Check teacher approval status
export const checkTeacherApprovalStatus = async (email) => {
  const { data, error } = await supabase
    .from("teacher_approvals")
    .select("status")
    .eq("teacher_email", email)
    .single();

  return { status: data?.status || null, error };
};