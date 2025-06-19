import { createClient } from "@supabase/supabase-js";

// Get Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with persistent session handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Authentication functions
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  // Clear localStorage auth data
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userRole");

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password",
  });
  return { data, error };
};

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

// Check if email already exists in any role table
export const checkEmailExists = async (email) => {
  const tables = ["student", "teacher", "hod", "admin"];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("email")
      .eq("email", email)
      .single();

    if (data) {
      // Email found in this table
      return { exists: true, role: table };
    }
  }

  // Email not found in any table
  return { exists: false, role: null };
};

// User data functions
export const insertUserData = async (table, userData) => {
  try {
    console.log(`Inserting data into table: ${table}`, userData);
    const { data, error } = await supabase
      .from(table)
      .insert([userData])
      .select();

    if (error) {
      console.error(`Error inserting data into ${table}:`, error);
      // Add more details to the error object to make it more informative
      error.details = {
        table,
        message: error.message || "Unknown database error",
        code: error.code,
        hint:
          error.hint ||
          "Check if the table exists and all required fields are provided",
      };
    } else {
      console.log(`Successfully inserted data into ${table}:`, data);
    }

    return { data, error };
  } catch (err) {
    console.error(`Exception when inserting data into ${table}:`, err);
    // Make the error more descriptive
    const enhancedError = {
      message: err.message || "Unknown error occurred",
      details: {
        table,
        originalError: err.toString(),
      },
    };
    return { data: null, error: enhancedError };
  }
};

export const getUserData = async (table, userId) => {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
};

// Function to check user role from all role-based tables
export const checkUserRole = async (userId) => {
  // Check each table to find the user's role
  const tables = ["student", "teacher", "hod", "admin"];
  let userRole = null;
  let userData = null;
  let foundRoles = [];
  let allRolesData = {};

  // Check all tables to find if user exists in multiple roles
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", userId)
      .single();

    if (data && !error) {
      foundRoles.push(table);
      allRolesData[table] = data;
    }
  }

  // If user has multiple roles, return with multipleRoles flag
  if (foundRoles.length > 1) {
    return {
      userRole: null,
      userData: null,
      multipleRoles: true,
      availableRoles: foundRoles,
      allRolesData: allRolesData,
    };
  }
  // If user has exactly one role, return that role
  else if (foundRoles.length === 1) {
    userRole = foundRoles[0];
    userData = allRolesData[userRole];

    // Check if the user is a teacher and verify their approval status
    if (userRole === "teacher") {
      // If teacher status is pending or rejected, don't allow login
      if (userData.status === "pending") {
        return {
          userRole: null,
          userData: null,
          multipleRoles: false,
          teacherStatus: "pending",
          statusMessage:
            "Your teacher account is pending approval from HOD. Please wait for approval.",
        };
      } else if (userData.status === "rejected") {
        return {
          userRole: null,
          userData: null,
          multipleRoles: false,
          teacherStatus: "rejected",
          statusMessage:
            "Your teacher account has been rejected. Please contact the HOD for more information.",
        };
      }
      // If status is approved or not set, allow login
    }

    return { userRole, userData, multipleRoles: false };
  }
  // If no roles found
  else {
    return { userRole: null, userData: null, multipleRoles: false };
  }
};

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    console.log(session.user.identities[0].email);
  } else {
    console.log("User is not signed in");
  }
});

export const updateUserData = async (table, userId, updates) => {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", userId);
  return { data, error };
};

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    // First, sign in with Google - this will redirect the user to Google's OAuth page
    const { data: authData, error: authError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
        },
      });

    if (authError) {
      console.error("Google sign-in error:", authError);
      throw authError;
    }

    // If we get here, the OAuth redirect has been initiated
    // We don't need to do anything else as the browser will be redirected to Google
    return { data: authData, error: null };
  } catch (error) {
    console.error("Google sign-in error:", error);
    return { data: null, error };
  }
};

// Handle auth callback after Google sign-in
export const handleAuthCallback = async () => {
  try {
    // Get the session after successful sign-in
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      throw sessionError;
    }

    if (!session) {
      console.error("No session found");
      return { error: new Error("No session found") };
    }

    const userEmail = session.user.email;
    const userId = session.user.id;
    console.log("User email:", userEmail);
    console.log("User ID:", userId);

    // Store userId in localStorage
    localStorage.setItem('userId', userId);

    // Check if user exists in any role table
    const { exists, role } = await checkEmailExists(userEmail);

    // If user exists in any role table
    if (exists) {
      console.log("User exists with role:", role);
      
      // Check user role from database tables to get complete user data
      const { userRole, userData, multipleRoles, teacherStatus, statusMessage } = await checkUserRole(userId);
      
      // Check if user has multiple roles
      if (multipleRoles) {
        console.error("User has multiple roles");
        return { 
          error: { message: `Your email is associated with multiple roles. Please contact administrator.` } 
        };
      }
      
      // Check if teacher status is pending or rejected
      if (teacherStatus === 'pending' || teacherStatus === 'rejected') {
        console.error("Teacher status issue:", statusMessage);
        return { 
          error: { message: statusMessage } 
        };
      }
      
      // Set authentication state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', role);
      
      // Determine redirect URL based on role
      const redirectUrl = `/dashboard/${role}`;
      
      // Redirect to the appropriate dashboard
      window.location.href = redirectUrl;
      
      return { success: true };
    } else {
      console.log("New user, redirecting to profile completion");
      
      // Redirect to profile completion page for new users
      window.location.href = "/profile-completion";
      
      return { success: true };
    }
  } catch (error) {
    console.error("Auth callback error:", error);
    return { error };
  }
};

// Verify security PIN (for HOD and Admin)
export const verifySecurityPin = async (role, pin) => {
  try {
    // Get the correct PIN from environment variables
    let correctPin;

    if (role === "hod") {
      correctPin = import.meta.env.VITE_HOD_SECURITY_PIN;
    } else if (role === "admin") {
      correctPin = import.meta.env.VITE_ADMIN_SECURITY_PIN;
    } else {
      return {
        data: { verified: false },
        error: { message: "Invalid role type" },
      };
    }

    // Verify the PIN
    const verified = pin === correctPin;

    return {
      data: { verified },
      error: verified ? null : { message: "Invalid security PIN" },
    };
  } catch (err) {
    console.error("Error verifying security PIN:", err);
    return { data: null, error: { message: "Error verifying PIN" } };
  }
};
