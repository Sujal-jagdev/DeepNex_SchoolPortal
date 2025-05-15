import { supabase } from "../helper/supabaseClient";

export const verifyUserRole = async (requiredRole) => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Not authenticated');
  }

  // In a real app, you would fetch the user's role from your database
  // For this example, we'll use the email to determine role (just for demo)
  const emailDomain = user.email.split('@')[1];
  let userRole = 'student';

  if (emailDomain.includes('admin')) {
    userRole = 'admin';
  } else if (emailDomain.includes('faculty')) {
    userRole = 'teacher';
  } else if (emailDomain.includes('hod')) {
    userRole = 'hod';
  }

  if (userRole !== requiredRole) {
    throw new Error(`Unauthorized access to ${requiredRole} dashboard`);
  }

  return { user, role: userRole };
};

export const handleRoleRedirect = (role) => {
  const roleRoutes = {
    student: "/student-profile",
    teacher: "/teacher-dashboard",
    hod: "/hod-dashboard",
    admin: "/admin-panel"
  };

  return roleRoutes[role] || "/";
};